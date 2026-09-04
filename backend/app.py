import base64
import hashlib
import os
import secrets
import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)


DB_PATH = os.environ.get('BAMSSA_DB_PATH', os.path.join(BASE_DIR, 'election_demo.db'))
DATABASE_URL = os.environ.get('DATABASE_URL')
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
ADMIN_PASSCODE = os.environ.get('BAMSSA_ADMIN_PASSCODE')
ADMIN_NAME = os.environ.get('BAMSSA_ADMIN_NAME', 'Administrator').strip() or 'Administrator'
ADMIN_EMAILS = {email.strip().lower() for email in os.environ.get('BAMSSA_ADMIN_EMAILS', '').split(',') if email.strip()}
CORS_ORIGINS = [origin.strip() for origin in os.environ.get(
    'BAMSSA_CORS_ORIGINS',
    'http://localhost:3000,https://bamssa-uniport-elections-2026.vercel.app,https://*.vercel.app',
).split(',') if origin.strip()]

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})
ADMIN_SESSIONS: dict[str, str] = {}
VOTER_SESSIONS: dict[str, str] = {}


@app.after_request
def disable_api_caching(response: Any) -> Any:
    if request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'no-store, max-age=0'
    return response

DEFAULT_ELECTION_DURATION_MINUTES = 120
ALLOWED_DEPARTMENTS = {'Anatomy', 'Psychology'}
ALLOWED_LEVELS = {'100L', '200L', '300L'}

class DatabaseRow(dict):
    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, int):
            return list(self.values())[key]
        return super().__getitem__(key)


# ---------------------------------------------------------------------------
# Connection pool (Postgres / Supabase only)
# Lazily created on first use so SQLite local-dev is completely unaffected.
# A single shared pool means each Gunicorn thread borrows and returns the
# same set of live TCP connections rather than opening a new one per request.
# ---------------------------------------------------------------------------
_pg_pool: Any = None  # psycopg_pool.ConnectionPool | None


def _get_pg_pool() -> Any:
    """Return (and lazily create) the shared Postgres connection pool."""
    global _pg_pool
    if _pg_pool is None:
        from psycopg_pool import ConnectionPool  # type: ignore[import]

        def _configure(conn: Any) -> None:
            """Apply the row_factory to every connection handed out by the pool."""
            def row_factory(cursor: Any) -> Any:
                if cursor.description is None:
                    return lambda values: values
                columns = [column.name for column in cursor.description]
                return lambda values: DatabaseRow(zip(columns, values))
            conn.row_factory = row_factory

        # min_size=1  keeps at least one warm connection alive at all times,
        # which eliminates the per-request TCP + TLS handshake to Supabase.
        # max_size is set conservatively for Render's free/starter tier.
        _pg_pool = ConnectionPool(
            DATABASE_URL,
            min_size=1,
            max_size=5,
            configure=_configure,
            open=True,
        )
    return _pg_pool


class DatabaseConnection:
    def __init__(self, connection: Any, postgres: bool = False, pooled: bool = False) -> None:
        self._connection = connection
        self.postgres = postgres
        self._pooled = pooled  # True when borrowed from _pg_pool

    def execute(self, query: str, parameters: Any = ()) -> Any:
        if self.postgres:
            query = query.replace('BEGIN IMMEDIATE', 'BEGIN')
            query = query.replace('MAX(0, eligible - ?', 'GREATEST(0, eligible - %s')
            query = query.replace('MAX(0, accredited - ?', 'GREATEST(0, accredited - %s')
            query = query.replace('MAX(0, voted - ?', 'GREATEST(0, voted - %s')
            query = query.replace('?', '%s')
        return self._connection.execute(query, parameters)

    def executemany(self, query: str, parameters: Any) -> Any:
        if self.postgres:
            query = query.replace('?', '%s')
        return self._connection.executemany(query, parameters)

    def commit(self) -> None:
        self._connection.commit()

    def rollback(self) -> None:
        self._connection.rollback()

    def close(self) -> None:
        if self._pooled:
            # Return the connection to the pool instead of closing it.
            # This is the key change: the underlying TCP socket stays alive
            # and is immediately available for the next request.
            _get_pg_pool().putconn(self._connection)
        else:
            self._connection.close()


def get_db_connection() -> DatabaseConnection:
    if DATABASE_URL:
        # Borrow a live connection from the pool (no TCP handshake needed).
        conn = _get_pg_pool().getconn()
        return DatabaseConnection(conn, postgres=True, pooled=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return DatabaseConnection(conn)


@app.before_request
def require_admin_session() -> Any:
    if request.method == 'OPTIONS':
        return None
    protected_paths = {
        '/api/voters/accredit',
        '/api/voters/reject',
    }
    if (request.path.startswith('/api/admin/') and request.path != '/api/admin/login') or request.path in protected_paths:
        token = request.headers.get('X-Admin-Session', '')
        if token not in ADMIN_SESSIONS:
            return jsonify({'success': False, 'message': 'Administrator login required.'}), 401
    return None


def get_default_department_stats() -> Dict[str, Dict[str, int]]:
    return {
        'Anatomy': {'eligible': 0, 'accredited': 0, 'voted': 0},
        'Psychology': {'eligible': 0, 'accredited': 0, 'voted': 0},
    }


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def validate_data_url_image(data_url: str, max_bytes: int = 2_000_000) -> bool:
    if not isinstance(data_url, str):
        return False

    image_data = data_url.strip()
    if not image_data:
        return True

    if not image_data.startswith(('data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,')):
        return False

    _, encoded = image_data.split(',', 1)
    try:
        decoded = base64.b64decode(encoded, validate=True)
    except (ValueError, TypeError):
        return False

    return len(decoded) <= max_bytes


def init_db() -> None:
    conn = get_db_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS election_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            status TEXT NOT NULL,
            start_time TEXT,
            end_time TEXT,
            duration_minutes INTEGER NOT NULL DEFAULT 120,
            results_status TEXT NOT NULL DEFAULT 'DRAFT',
            published_at TEXT,
            published_by TEXT,
            certified_at TEXT,
            certified_by TEXT,
            admin_passcode TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )

    if conn.postgres:
        columns = {
            row['column_name']
            for row in conn.execute(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'election_state'"
            ).fetchall()
        }
    else:
        columns = {row['name'] for row in conn.execute("PRAGMA table_info(election_state)").fetchall()}
    if 'duration_minutes' not in columns:
        conn.execute("ALTER TABLE election_state ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 120")
    for column, definition in {
        'results_status': "TEXT NOT NULL DEFAULT 'DRAFT'",
        'published_at': 'TEXT',
        'published_by': 'TEXT',
        'certified_at': 'TEXT',
        'certified_by': 'TEXT',
        'admin_name': "TEXT NOT NULL DEFAULT 'Administrator'",
        'admin_avatar_url': 'TEXT',
    }.items():
        if column not in columns:
            conn.execute(f"ALTER TABLE election_state ADD COLUMN {column} {definition}")

    if ADMIN_PASSCODE:
        conn.execute("UPDATE election_state SET admin_passcode = ? WHERE id = 1", (ADMIN_PASSCODE,))
    if ADMIN_NAME:
        conn.execute("UPDATE election_state SET admin_name = ? WHERE id = 1 AND (admin_name IS NULL OR admin_name = 'Administrator')", (ADMIN_NAME,))

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS positions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            order_index INTEGER NOT NULL,
            max_selections INTEGER NOT NULL
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS candidates (
            id TEXT PRIMARY KEY,
            position_id TEXT NOT NULL,
            full_name TEXT NOT NULL,
            department TEXT NOT NULL,
            level TEXT NOT NULL,
            cgpa_range TEXT,
            photo_url TEXT,
            tagline TEXT,
            manifesto TEXT,
            running_mate_name TEXT,
            running_mate_department TEXT,
            running_mate_level TEXT,
            votes_count INTEGER NOT NULL DEFAULT 0,
            approved_by_eleco INTEGER NOT NULL DEFAULT 1
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS voters (
            id TEXT PRIMARY KEY,
            matric_number TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            department TEXT NOT NULL,
            level TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            is_eligible INTEGER NOT NULL DEFAULT 1,
            is_accredited INTEGER NOT NULL DEFAULT 0,
            has_voted INTEGER NOT NULL DEFAULT 0,
            voter_pin TEXT,
            accreditation_time TEXT,
            voted_time TEXT,
            ballot_receipt_hash TEXT,
            avatar_url TEXT,
            verification_status TEXT,
            registered_at TEXT,
            rejection_reason TEXT,
            id_card_url TEXT,
            registration_id TEXT,
            review_notes TEXT
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            encrypted_hash TEXT NOT NULL,
            category TEXT NOT NULL,
            details TEXT
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_profiles (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            avatar_url TEXT,
            role TEXT NOT NULL DEFAULT 'Election Administrator',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS commission_members (
            id TEXT PRIMARY KEY,
            initials TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    conn.execute("INSERT INTO commission_members (id, initials, name, role, order_index) VALUES ('ec', 'EC', 'Dr. Samuel Ojo', 'Chief Electoral Officer', 1) ON CONFLICT (id) DO NOTHING")
    conn.execute("INSERT INTO commission_members (id, initials, name, role, order_index) VALUES ('ro', 'RO', 'Prof. Grace Nnamdi', 'Returning Officer', 2) ON CONFLICT (id) DO NOTHING")

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS department_stats (
            department TEXT PRIMARY KEY,
            eligible INTEGER NOT NULL,
            accredited INTEGER NOT NULL,
            voted INTEGER NOT NULL
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS position_reviews (
            position_id TEXT PRIMARY KEY,
            reviewed_at TEXT,
            reviewed_by TEXT
        )
        """
    )

    conn.execute(
        """
        INSERT INTO election_state (id, status, start_time, end_time, duration_minutes, admin_passcode, updated_at)
        VALUES (1, 'STANDBY', NULL, NULL, 120, ?, ?)
        ON CONFLICT (id) DO NOTHING
        """,
        (ADMIN_PASSCODE or secrets.token_urlsafe(24), utc_now_iso()),
    )

    for department, stats in get_default_department_stats().items():
        conn.execute(
            "INSERT INTO department_stats (department, eligible, accredited, voted) VALUES (?, ?, ?, ?) ON CONFLICT (department) DO NOTHING",
            (department, stats['eligible'], stats['accredited'], stats['voted']),
        )

    conn.commit()
    conn.close()


def seed_demo_data() -> None:
    conn = get_db_connection()

    if conn.execute("SELECT COUNT(*) FROM candidates").fetchone()[0] > 0:
        conn.close()
        return

    from backend.demo_seed import (
        INITIAL_CANDIDATES,
        INITIAL_VOTERS,
        INITIAL_AUDIT_LOGS,
        DEPARTMENT_STATS,
        INITIAL_POSITIONS,
    )

    for position in INITIAL_POSITIONS:
        conn.execute(
            "INSERT INTO positions (id, title, description, order_index, max_selections) VALUES (?, ?, ?, ?, ?)",
            (
                position['id'],
                position['title'],
                position['description'],
                position['order'],
                position['maxSelections'],
            ),
        )

    for candidate in INITIAL_CANDIDATES:
        conn.execute(
            """
            INSERT INTO candidates (
                id, position_id, full_name, department, level, cgpa_range, photo_url,
                tagline, manifesto, running_mate_name, running_mate_department,
                running_mate_level, votes_count, approved_by_eleco
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                candidate['id'],
                candidate['positionId'],
                candidate['fullName'],
                candidate['department'],
                candidate['level'],
                candidate['cgpaRange'],
                candidate['photoUrl'],
                candidate['tagline'],
                '|'.join(candidate['manifesto']),
                candidate.get('runningMate', {}).get('name'),
                candidate.get('runningMate', {}).get('department'),
                candidate.get('runningMate', {}).get('level'),
                candidate['votesCount'],
                1 if candidate['approvedByEleco'] else 0,
            ),
        )

    for voter in INITIAL_VOTERS:
        conn.execute(
            """
            INSERT INTO voters (
                id, matric_number, full_name, department, level, email, phone,
                is_eligible, is_accredited, has_voted, voter_pin, accreditation_time,
                voted_time, ballot_receipt_hash, avatar_url, verification_status,
                registered_at, rejection_reason, id_card_url, registration_id, review_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                voter['id'],
                voter['matricNumber'],
                voter['fullName'],
                voter['department'],
                voter['level'],
                voter['email'],
                voter['phone'],
                1 if voter['isEligible'] else 0,
                1 if voter['isAccredited'] else 0,
                1 if voter['hasVoted'] else 0,
                voter['voterPin'],
                voter.get('accreditationTime'),
                voter.get('votedTime'),
                voter.get('ballotReceiptHash'),
                voter.get('avatarUrl'),
                voter.get('verificationStatus'),
                voter.get('registeredAt'),
                voter.get('rejectionReason'),
                voter.get('idCardUrl'),
                voter.get('registrationId'),
                voter.get('reviewNotes'),
            ),
        )

    for log in INITIAL_AUDIT_LOGS:
        conn.execute(
            """
            INSERT INTO audit_logs (id, timestamp, action, actor, encrypted_hash, category, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log['id'],
                log['timestamp'],
                log['action'],
                log['actor'],
                log['encryptedHash'],
                log['category'],
                log.get('details'),
            ),
        )

    for department, stats in DEPARTMENT_STATS.items():
        conn.execute(
            "INSERT INTO department_stats (department, eligible, accredited, voted) VALUES (?, ?, ?, ?)",
            (department, stats['eligible'], stats['accredited'], stats['voted']),
        )

    conn.commit()
    conn.close()


def get_status_payload() -> Dict[str, Any]:
    conn = get_db_connection()
    state = conn.execute(
        "SELECT status, start_time, end_time, updated_at FROM election_state WHERE id = 1"
    ).fetchone()
    if state is None:
        conn.close()
        return {'status': 'STANDBY', 'start_time': None, 'end_time': None}

    result = dict(state)
    conn.close()
    return result


def now_seconds() -> float:
    return datetime.now(timezone.utc).timestamp()


def election_time_status() -> Dict[str, Any]:
    state = get_status_payload()
    status = state['status']
    start_time = state['start_time']
    end_time = state['end_time']

    now = datetime.now(timezone.utc)

    if status == 'LIVE' and end_time:
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        remaining = max(0, int((end_dt - now).total_seconds()))
        return {
            'status': 'LIVE',
            'remaining_seconds': remaining,
            'ended': remaining <= 0,
        }

    return {'status': status, 'remaining_seconds': 0, 'ended': False}


def generate_voter_pin(conn: sqlite3.Connection) -> str:
    for _ in range(9000):
        candidate = str(secrets.randbelow(9000) + 1000)
        existing = conn.execute(
            'SELECT 1 FROM voters WHERE voter_pin = ? LIMIT 1',
            (candidate,),
        ).fetchone()
        if existing is None:
            return candidate
    raise RuntimeError('No unused voter PINs remain.')


def add_audit_log(action: str, actor: str, category: str, details: str = '') -> None:
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO audit_logs (id, timestamp, action, actor, encrypted_hash, category, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            f'log-{int(datetime.now(timezone.utc).timestamp() * 1000)}',
            utc_now_iso(),
            action,
            actor,
            '0x' + os.urandom(14).hex().upper(),
            category,
            details,
        ),
    )
    conn.commit()
    conn.close()


def ensure_live_election_window() -> None:
    state = get_status_payload()
    if state['status'] == 'LIVE' and state['end_time']:
        end_dt = datetime.fromisoformat(state['end_time'].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) >= end_dt:
            conn = get_db_connection()
            conn.execute("UPDATE election_state SET status = 'CLOSED', updated_at = ? WHERE id = 1", (utc_now_iso(),))
            conn.commit()
            conn.close()
            add_audit_log('Election closed automatically after 2 hours', 'System Scheduler', 'SYSTEM', 'Voting window ended automatically.')


@app.before_request
def before_request() -> None:
    ensure_live_election_window()


@app.get('/api/health')
def health() -> Any:
    return jsonify({
        'ok': True,
        'time': utc_now_iso(),
        'storage': 'postgresql' if DATABASE_URL else 'sqlite',
    })


@app.get('/favicon.svg')
def favicon_svg() -> Any:
    return send_from_directory(os.path.join(BASE_DIR, 'public'), 'favicon.svg', mimetype='image/svg+xml')


@app.get('/favicon.ico')
def favicon_ico() -> Any:
    return send_from_directory(os.path.join(BASE_DIR, 'public'), 'favicon.svg', mimetype='image/svg+xml')


@app.get('/api/election')
def get_election_state() -> Any:
    conn = get_db_connection()

    state = conn.execute(
        "SELECT status, start_time, end_time, duration_minutes, results_status, published_at, published_by, certified_at, certified_by, updated_at FROM election_state WHERE id = 1"
    ).fetchone()

    if state is None:
        conn.close()
        return jsonify({'error': 'Election state not found'}), 404

    if state['status'] == 'LIVE' and state['end_time']:
        if datetime.now(timezone.utc) >= datetime.fromisoformat(state['end_time'].replace('Z', '+00:00')):
            now = utc_now_iso()
            conn.execute("UPDATE election_state SET status = 'CLOSED', updated_at = ? WHERE id = 1", (now,))
            conn.commit()
            state = conn.execute(
                "SELECT status, start_time, end_time, duration_minutes, results_status, published_at, published_by, certified_at, certified_by, updated_at FROM election_state WHERE id = 1"
            ).fetchone()
            add_audit_log('Election closed automatically after time limit', 'System Scheduler', 'SYSTEM', 'Voting window ended automatically.')

    candidates = conn.execute(
        "SELECT * FROM candidates ORDER BY id"
    ).fetchall()
    positions = []
    for row in conn.execute("SELECT id, title, description, order_index, max_selections FROM positions").fetchall():
        positions.append(dict(row))

    commission_members = conn.execute("SELECT id, initials, name, role FROM commission_members ORDER BY order_index, name").fetchall()
    is_admin = request.headers.get('X-Admin-Session', '') in ADMIN_SESSIONS
    if is_admin:
        voters = conn.execute("SELECT * FROM voters ORDER BY full_name").fetchall()
        audit_logs = conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100").fetchall()
    else:
        voters = conn.execute(
            "SELECT id, matric_number, full_name, department, level, is_eligible, is_accredited, has_voted, voter_pin, verification_status, registered_at FROM voters ORDER BY full_name"
        ).fetchall()
        audit_logs = []
    department_stats = conn.execute("SELECT * FROM department_stats ORDER BY department").fetchall()

    conn.close()

    payload = {
        'status': dict(state)['status'],
        'start_time': dict(state)['start_time'],
        'end_time': dict(state)['end_time'],
        'duration_minutes': dict(state)['duration_minutes'],
        'results_status': dict(state)['results_status'],
        'published_at': dict(state)['published_at'],
        'published_by': dict(state)['published_by'],
        'certified_at': dict(state)['certified_at'],
        'certified_by': dict(state)['certified_by'],
        'updated_at': dict(state)['updated_at'],
        'candidates': [dict(row) for row in candidates],
        'positions': positions,
        'voters': [dict(row) for row in voters],
        'audit_logs': [dict(row) for row in audit_logs],
        'department_stats': {row['department']: {'eligible': row['eligible'], 'accredited': row['accredited'], 'voted': row['voted']} for row in department_stats},
        'commission_members': [dict(row) for row in commission_members],
    }

    return jsonify(payload)


@app.post('/api/admin/login')
def admin_login() -> Any:
    payload = request.get_json(silent=True) or {}
    passcode = str(payload.get('passcode', '')).strip()
    submitted_name = str(payload.get('adminName', '')).strip()
    email = str(payload.get('email', '')).strip().lower()
    conn = get_db_connection()
    row = conn.execute("SELECT admin_passcode FROM election_state WHERE id = 1").fetchone()
    conn.close()

    if row and passcode == row['admin_passcode'] and email and '@' in email and (not ADMIN_EMAILS or email in ADMIN_EMAILS):
        now = utc_now_iso()
        conn = get_db_connection()
        profile = conn.execute("SELECT * FROM admin_profiles WHERE email = ?", (email,)).fetchone()
        if profile is None:
            profile_id = f'admin-{secrets.token_urlsafe(12)}'
            conn.execute("INSERT INTO admin_profiles (id, email, full_name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", (profile_id, email, submitted_name or 'Administrator', None, now, now))
            profile = conn.execute("SELECT * FROM admin_profiles WHERE id = ?", (profile_id,)).fetchone()
        elif submitted_name and submitted_name != profile['full_name']:
            conn.execute("UPDATE admin_profiles SET full_name = ?, updated_at = ? WHERE id = ?", (submitted_name, now, profile['id']))
            profile = conn.execute("SELECT * FROM admin_profiles WHERE id = ?", (profile['id'],)).fetchone()
        conn.commit()
        conn.close()
        token = secrets.token_urlsafe(32)
        ADMIN_SESSIONS[token] = profile['id']
        add_audit_log('Administrator access granted', profile['full_name'], 'ADMIN', f'Admin login succeeded for {email}.')
        return jsonify({'success': True, 'message': 'Admin authorized.', 'session': token, 'adminName': profile['full_name'], 'adminEmail': profile['email'], 'adminAvatarUrl': profile['avatar_url']})
    add_audit_log('Administrator access denied', submitted_name or 'Unknown administrator', 'ADMIN', f'Admin login attempt for {email or "unknown email"}.')
    return jsonify({'success': False, 'message': 'Invalid administrative credentials.'}), 401


@app.post('/api/admin/profile')
def update_admin_profile() -> Any:
    payload = request.get_json(silent=True) or {}
    name = str(payload.get('adminName', '')).strip()
    avatar_url = str(payload.get('adminAvatarUrl', '')).strip()
    if not name:
        return jsonify({'success': False, 'message': 'Administrator name is required.'}), 400
    if not validate_data_url_image(avatar_url):
        return jsonify({'success': False, 'message': 'Profile picture must be a valid JPG, PNG, or WebP image under 2 MB.'}), 400
    profile_id = ADMIN_SESSIONS.get(request.headers.get('X-Admin-Session', ''))
    conn = get_db_connection()
    conn.execute("UPDATE admin_profiles SET full_name = ?, avatar_url = ?, updated_at = ? WHERE id = ?", (name, avatar_url or None, utc_now_iso(), profile_id))
    conn.commit()
    conn.close()
    add_audit_log('Administrator profile updated', name, 'ADMIN', 'Administrator updated their own profile.')
    return jsonify({'success': True, 'adminName': name, 'adminAvatarUrl': avatar_url or None})


@app.post('/api/admin/commission-members')
def update_commission_members() -> Any:
    members = (request.get_json(silent=True) or {}).get('members', [])
    if not isinstance(members, list) or not members:
        return jsonify({'success': False, 'message': 'At least one commission member is required.'}), 400
    normalized = []
    for index, member in enumerate(members):
        if not isinstance(member, dict) or not all(str(member.get(field, '')).strip() for field in ('initials', 'name', 'role')):
            return jsonify({'success': False, 'message': 'Each member needs initials, name, and role.'}), 400
        normalized.append((str(member.get('id') or f'member-{secrets.token_urlsafe(8)}'), str(member['initials']).strip()[:5], str(member['name']).strip(), str(member['role']).strip(), index))
    conn = get_db_connection()
    conn.execute('DELETE FROM commission_members')
    conn.executemany('INSERT INTO commission_members (id, initials, name, role, order_index) VALUES (?, ?, ?, ?, ?)', normalized)
    conn.commit()
    conn.close()
    add_audit_log('Electoral Commission roster updated', 'ELECO Administrator', 'ADMIN', f'{len(normalized)} commission members configured.')
    return jsonify({'success': True, 'commissionMembers': [{'id': row[0], 'initials': row[1], 'name': row[2], 'role': row[3]} for row in normalized]})


@app.post('/api/admin/set-status')
def set_status_route() -> Any:
    payload = request.get_json(silent=True) or {}
    requested = str(payload.get('status', '')).strip().upper()
    allowed = {'STANDBY', 'ACCREDITATION_OPEN', 'LIVE', 'CLOSED', 'CERTIFIED'}

    if requested not in allowed:
        return jsonify({'success': False, 'message': 'Invalid election status.'}), 400

    conn = get_db_connection()
    now = utc_now_iso()

    if requested == 'LIVE':
        start_time = now
        duration = int(conn.execute("SELECT duration_minutes FROM election_state WHERE id = 1").fetchone()['duration_minutes'])
        end_time = (datetime.now(timezone.utc) + timedelta(minutes=duration)).strftime('%Y-%m-%dT%H:%M:%SZ')
        conn.execute(
            "UPDATE election_state SET status = ?, start_time = ?, end_time = ?, updated_at = ? WHERE id = 1",
            (requested, start_time, end_time, now),
        )
    elif requested == 'CLOSED':
        conn.execute(
            "UPDATE election_state SET status = ?, end_time = ?, updated_at = ? WHERE id = 1",
            (requested, now, now),
        )
    elif requested == 'CERTIFIED':
        conn.execute(
            "UPDATE election_state SET status = ?, updated_at = ? WHERE id = 1",
            (requested, now),
        )
    else:
        conn.execute(
            "UPDATE election_state SET status = ?, start_time = NULL, end_time = NULL, updated_at = ? WHERE id = 1",
            (requested, now),
        )

    conn.commit()
    conn.close()

    add_audit_log(f'Election status set to {requested}', 'ELECO Administrator', 'ADMIN', f'Admin changed election state to {requested}.')
    current = get_status_payload()
    return jsonify({'success': True, 'status': requested, 'start_time': current.get('start_time'), 'end_time': current.get('end_time'), 'updated_at': now})


@app.post('/api/admin/positions')
def create_position() -> Any:
    payload = request.get_json(silent=True) or {}
    title = str(payload.get('title', '')).strip()
    description = str(payload.get('description', '')).strip()
    max_selections = int(payload.get('maxSelections', 1) or 1)

    if not title:
        return jsonify({'success': False, 'message': 'Position title is required.'}), 400

    conn = get_db_connection()
    position_id = f"pos-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    order_index = conn.execute("SELECT COALESCE(MAX(order_index), 0) + 1 FROM positions").fetchone()[0]
    conn.execute(
        "INSERT INTO positions (id, title, description, order_index, max_selections) VALUES (?, ?, ?, ?, ?)",
        (position_id, title, description or f"{title} office.", order_index, max_selections),
    )
    conn.commit()
    conn.close()
    add_audit_log('Position created', 'ELECO Administrator', 'ADMIN', f"New election office created: {title}.")
    return jsonify({'success': True, 'position': {'id': position_id, 'title': title, 'description': description or f'{title} office.', 'order': order_index, 'maxSelections': max_selections}})


@app.post('/api/admin/candidates')
def create_candidate() -> Any:
    payload = request.get_json(silent=True) or {}
    required = ['fullName', 'positionId', 'department', 'level']
    if not all(payload.get(field) for field in required):
        return jsonify({'success': False, 'message': 'Candidate name, position, department and level are required.'}), 400

    photo_url = str(payload.get('photoUrl', '')).strip()
    if photo_url and not validate_data_url_image(photo_url):
        return jsonify({'success': False, 'message': 'Candidate photo must be a valid JPEG, PNG, or WebP image under 2 MB.'}), 400

    candidate_id = f"cand-{int(datetime.now(timezone.utc).timestamp() * 1000)}"
    conn = get_db_connection()
    position = conn.execute("SELECT id FROM positions WHERE id = ?", (payload['positionId'],)).fetchone()
    if position is None:
        conn.close()
        return jsonify({'success': False, 'message': 'The selected election position no longer exists. Refresh and choose a valid position.'}), 400
    conn.execute(
        """
        INSERT INTO candidates (
            id, position_id, full_name, department, level, cgpa_range, photo_url,
            tagline, manifesto, running_mate_name, running_mate_department,
            running_mate_level, votes_count, approved_by_eleco
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            candidate_id,
            payload['positionId'],
            payload['fullName'],
            payload['department'],
            payload['level'],
            payload.get('cgpaRange', 'N/A'),
            photo_url or 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            payload.get('tagline', ''),
            '|'.join(payload.get('manifesto', []) or ['Campaigning for student welfare and excellence.']),
            payload.get('runningMate', {}).get('name') if isinstance(payload.get('runningMate'), dict) else None,
            payload.get('runningMate', {}).get('department') if isinstance(payload.get('runningMate'), dict) else None,
            payload.get('runningMate', {}).get('level') if isinstance(payload.get('runningMate'), dict) else None,
            0,
            1,
        ),
    )
    conn.commit()
    conn.close()
    add_audit_log('Candidate created', 'ELECO Administrator', 'ADMIN', f"Candidate registered: {payload['fullName']} for {payload['positionId']}.")
    return jsonify({'success': True, 'candidate': {'id': candidate_id, 'positionId': payload['positionId'], 'fullName': payload['fullName'], 'votesCount': 0, 'approvedByEleco': True}})


@app.delete('/api/admin/candidates/<candidate_id>')
def delete_candidate(candidate_id: str) -> Any:
    conn = get_db_connection()
    candidate = conn.execute("SELECT full_name FROM candidates WHERE id = ?", (candidate_id,)).fetchone()
    if candidate is None:
        conn.close()
        return jsonify({'success': False, 'message': 'Candidate not found.'}), 404

    conn.execute("DELETE FROM candidates WHERE id = ?", (candidate_id,))
    conn.commit()
    conn.close()
    add_audit_log('Candidate deleted', 'ELECO Administrator', 'ADMIN', f"Candidate removed: {candidate['full_name']}.")
    return jsonify({'success': True, 'candidateId': candidate_id})


@app.delete('/api/admin/positions/<position_id>')
def delete_position(position_id: str) -> Any:
    conn = get_db_connection()
    position = conn.execute("SELECT title FROM positions WHERE id = ?", (position_id,)).fetchone()
    if position is None:
        conn.close()
        return jsonify({'success': False, 'message': 'Position not found.'}), 404

    candidate_count = conn.execute("SELECT COUNT(*) FROM candidates WHERE position_id = ?", (position_id,)).fetchone()[0]
    if candidate_count:
        conn.close()
        return jsonify({'success': False, 'message': 'Remove all candidates from this position before deleting it.'}), 409

    conn.execute("DELETE FROM positions WHERE id = ?", (position_id,))
    conn.commit()
    conn.close()
    add_audit_log('Position deleted', 'ELECO Administrator', 'ADMIN', f"Election office removed: {position['title']}.")
    return jsonify({'success': True, 'positionId': position_id})


@app.delete('/api/admin/voters/<voter_id>')
def delete_voter(voter_id: str) -> Any:
    conn = get_db_connection()
    voter = conn.execute("SELECT full_name, matric_number, department, is_eligible, is_accredited, has_voted FROM voters WHERE id = ?", (voter_id,)).fetchone()
    if voter is None:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter not found.'}), 404

    conn.execute("DELETE FROM voters WHERE id = ?", (voter_id,))
    conn.execute(
        "UPDATE department_stats SET eligible = MAX(0, eligible - ?), accredited = MAX(0, accredited - ?), voted = MAX(0, voted - ?) WHERE department = ?",
        (int(voter['is_eligible']), int(voter['is_accredited']), int(voter['has_voted']), voter['department']),
    )
    conn.commit()
    conn.close()
    add_audit_log('Voter deleted', 'ELECO Administrator', 'ADMIN', f"Voter removed: {voter['full_name']} ({voter['matric_number']}).")
    return jsonify({'success': True, 'voterId': voter_id})


@app.post('/api/admin/reset')
def admin_reset() -> Any:
    conn = get_db_connection()
    conn.execute("DELETE FROM candidates")
    conn.execute("DELETE FROM voters")
    conn.execute("DELETE FROM positions")
    conn.execute("DELETE FROM audit_logs")
    conn.execute("DELETE FROM department_stats")
    for department, stats in get_default_department_stats().items():
        conn.execute(
            "INSERT INTO department_stats (department, eligible, accredited, voted) VALUES (?, ?, ?, ?)",
            (department, stats['eligible'], stats['accredited'], stats['voted']),
        )
    conn.execute(
        "UPDATE election_state SET status = 'STANDBY', start_time = NULL, end_time = NULL, results_status = 'DRAFT', published_at = NULL, published_by = NULL, certified_at = NULL, certified_by = NULL, updated_at = ? WHERE id = 1",
        (utc_now_iso(),),
    )
    conn.commit()
    conn.close()
    add_audit_log('Election reset to clean state', 'System Admin', 'SYSTEM', 'All demo records removed; election is ready for fresh configuration.')
    return jsonify({'success': True, 'message': 'Election reset successfully to a clean state.'})


@app.post('/api/admin/start-election')
def start_election() -> Any:
    now = datetime.now(timezone.utc)
    conn = get_db_connection()
    duration = int(conn.execute("SELECT duration_minutes FROM election_state WHERE id = 1").fetchone()['duration_minutes'])
    end_time = (now + timedelta(minutes=duration)).strftime('%Y-%m-%dT%H:%M:%SZ')
    conn.execute(
        "UPDATE election_state SET status = 'LIVE', start_time = ?, end_time = ?, updated_at = ? WHERE id = 1",
        (now.strftime('%Y-%m-%dT%H:%M:%SZ'), end_time, utc_now_iso()),
    )
    conn.commit()
    conn.close()
    add_audit_log('Election started', 'ELECO Administrator', 'ADMIN', 'Voting window opened for 2 hours.')
    return jsonify({'success': True, 'status': 'LIVE', 'end_time': end_time})


@app.post('/api/admin/set-duration')
def set_duration() -> Any:
    payload = request.get_json(silent=True) or {}
    duration = int(payload.get('durationMinutes', 0))
    if duration not in (120, 150):
        return jsonify({'success': False, 'message': 'Duration must be 120 or 150 minutes.'}), 400
    conn = get_db_connection()
    state = conn.execute("SELECT status FROM election_state WHERE id = 1").fetchone()
    if state['status'] == 'LIVE':
        conn.close()
        return jsonify({'success': False, 'message': 'Stop the election before changing its duration.'}), 409
    conn.execute("UPDATE election_state SET duration_minutes = ?, updated_at = ? WHERE id = 1", (duration, utc_now_iso()))
    conn.commit()
    conn.close()
    add_audit_log('Election duration changed', 'ELECO Administrator', 'ADMIN', f'Election duration set to {duration} minutes.')
    return jsonify({'success': True, 'durationMinutes': duration})


@app.post('/api/admin/close-election')
def close_election() -> Any:
    conn = get_db_connection()
    conn.execute("UPDATE election_state SET status = 'CLOSED', end_time = ?, updated_at = ? WHERE id = 1", (utc_now_iso(), utc_now_iso()))
    conn.commit()
    conn.close()
    add_audit_log('Election closed by administrator', 'ELECO Administrator', 'ADMIN', 'Voting disabled and results locked.')
    return jsonify({'success': True, 'status': 'CLOSED'})


@app.post('/api/admin/approve-results')
def approve_results() -> Any:
    conn = get_db_connection()
    state = conn.execute("SELECT status FROM election_state WHERE id = 1").fetchone()
    total_positions = conn.execute("SELECT COUNT(*) FROM positions").fetchone()[0]
    reviewed_positions = conn.execute("SELECT COUNT(*) FROM position_reviews WHERE reviewed_at IS NOT NULL").fetchone()[0]
    if state is None or state['status'] not in ('CLOSED', 'CERTIFIED'):
        conn.close()
        return jsonify({'success': False, 'message': 'The election must be closed before certification.'}), 409
    if reviewed_positions < total_positions:
        conn.close()
        return jsonify({'success': False, 'message': 'Review every position before certification.'}), 409
    now = utc_now_iso()
    conn.execute("UPDATE election_state SET status = 'CERTIFIED', results_status = 'CERTIFIED', certified_at = ?, certified_by = ?, updated_at = ? WHERE id = 1", (now, 'ELECO Administrator', now))
    conn.commit()
    conn.close()
    add_audit_log('Results approved and certified', 'ELECO Administrator', 'ADMIN', 'Official results sent to all stakeholders.')
    return jsonify({'success': True, 'status': 'CERTIFIED'})


@app.post('/api/admin/publish-results')
def publish_results() -> Any:
    conn = get_db_connection()
    state = conn.execute("SELECT status, results_status FROM election_state WHERE id = 1").fetchone()
    total_positions = conn.execute("SELECT COUNT(*) FROM positions").fetchone()[0]
    positions_with_candidates = conn.execute("SELECT COUNT(DISTINCT position_id) FROM candidates").fetchone()[0]
    if state is None or state['status'] == 'LIVE':
        conn.close()
        return jsonify({'success': False, 'message': 'Results cannot be published while voting is live.'}), 409
    if state['results_status'] in ('PUBLISHED', 'CERTIFIED'):
        conn.close()
        return jsonify({'success': False, 'message': 'Results have already been published.'}), 409
    if total_positions == 0 or positions_with_candidates < total_positions:
        conn.close()
        return jsonify({'success': False, 'message': 'Every position must have results before publishing.'}), 409
    now = utc_now_iso()
    conn.execute("UPDATE election_state SET results_status = 'PUBLISHED', published_at = ?, published_by = ?, updated_at = ? WHERE id = 1", (now, 'ELECO Administrator', now))
    conn.commit()
    conn.close()
    add_audit_log('Results published', 'ELECO Administrator', 'ADMIN', 'Aggregated results are now visible to students.')
    return jsonify({'success': True, 'resultsStatus': 'PUBLISHED', 'publishedAt': now})


@app.post('/api/admin/adjust-candidate-votes')
def adjust_candidate_votes() -> Any:
    payload = request.get_json(silent=True) or {}
    candidate_id = payload.get('candidateId')
    delta = int(payload.get('delta', 0))
    if not candidate_id:
        return jsonify({'success': False, 'message': 'Candidate ID required.'}), 400

    conn = get_db_connection()
    state = conn.execute("SELECT status FROM election_state WHERE id = 1").fetchone()
    if state is None or state['status'] == 'CERTIFIED':
        conn.close()
        return jsonify({'success': False, 'message': 'Certified results cannot be adjusted.'}), 409
    existing = conn.execute("SELECT votes_count, full_name FROM candidates WHERE id = ?", (candidate_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({'success': False, 'message': 'Candidate not found.'}), 404

    next_value = max(0, int(existing['votes_count']) + delta)
    conn.execute("UPDATE candidates SET votes_count = ? WHERE id = ?", (next_value, candidate_id))
    conn.commit()
    conn.close()
    add_audit_log('Candidate vote count adjusted', 'ELECO Administrator', 'ADMIN', f"{existing['full_name']} changed by {delta}. New total: {next_value}.")
    return jsonify({'success': True, 'candidateId': candidate_id, 'votesCount': next_value})


@app.post('/api/voters/register')
def register_voter() -> Any:
    payload = request.get_json(silent=True) or {}
    required = ['matricNumber', 'fullName', 'department', 'level', 'email', 'phone']
    if not all(payload.get(field) for field in required):
        return jsonify({'success': False, 'message': 'Missing voter registration data.'}), 400
    if payload['department'] not in ALLOWED_DEPARTMENTS or payload['level'] not in ALLOWED_LEVELS:
        return jsonify({'success': False, 'message': 'Only Anatomy and Psychology students from 100L to 300L may register.'}), 400

    id_card_url = str(payload.get('idCardUrl', '')).strip()
    if not id_card_url.startswith(('data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,')):
        return jsonify({'success': False, 'message': 'A clear image of your UNIPORT Student ID or recent Course Form is required.'}), 400
    if len(id_card_url) > 7_000_000:
        return jsonify({'success': False, 'message': 'The uploaded document must be 5 MB or smaller.'}), 413

    matric_number = str(payload['matricNumber']).strip().upper()
    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM voters WHERE matric_number = ?", (matric_number,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter already exists.'}), 409

    now = utc_now_iso()
    insert_cursor = conn.execute(
        """
        INSERT INTO voters (
            id, matric_number, full_name, department, level, email, phone,
            is_eligible, is_accredited, has_voted, voter_pin, accreditation_time,
            voted_time, ballot_receipt_hash, avatar_url, verification_status,
            registered_at, rejection_reason, id_card_url, registration_id, review_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (matric_number) DO NOTHING
        """,
        (
            f"voter-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
            matric_number,
            payload['fullName'],
            payload['department'],
            payload['level'],
            payload['email'],
            payload['phone'],
            0,
            0,
            0,
            None,
            None,
            None,
            None,
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            'pending',
            now,
            None,
            id_card_url,
            None,
            None,
        ),
    )
    if insert_cursor.rowcount == 0:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter already exists.'}), 409
    conn.execute(
            "INSERT INTO department_stats (department, eligible, accredited, voted) VALUES (?, ?, ?, ?) ON CONFLICT(department) DO UPDATE SET eligible = department_stats.eligible + 1",
        (payload['department'], 1, 0, 0),
    )
    conn.commit()
    conn.close()
    add_audit_log('New student voter registration submitted', 'Registry System', 'ACCREDITATION', f'Matriculation {matric_number} submitted for eligibility review.')
    return jsonify({'success': True, 'message': 'Voter registration submitted successfully. Awaiting admin approval.'})


@app.post('/api/voters/accredit')
def accredit_voter() -> Any:
    payload = request.get_json(silent=True) or {}
    matric_number = str(payload.get('matricNumber', '')).strip().upper()
    if not matric_number:
        return jsonify({'success': False, 'message': 'Matriculation number is required.'}), 400

    conn = get_db_connection()
    conn.execute('BEGIN IMMEDIATE')
    voter_query = "SELECT * FROM voters WHERE UPPER(matric_number) = ?"
    if conn.postgres:
        voter_query += " FOR UPDATE"
    voter = conn.execute(voter_query, (matric_number,)).fetchone()
    if voter is None:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter not found.'}), 404

    if int(voter['is_accredited']) == 1:
        conn.close()
        return jsonify({'success': True, 'message': 'Voter already accredited.', 'pin': voter['voter_pin'], 'accreditationTime': voter['accreditation_time']})

    try:
        generated_pin = generate_voter_pin(conn)
    except RuntimeError:
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'message': 'No unused voter PINs remain.'}), 503
    now = utc_now_iso()
    conn.execute(
        "UPDATE voters SET is_eligible = 1, is_accredited = 1, voter_pin = ?, accreditation_time = ?, verification_status = 'approved' WHERE id = ?",
        (generated_pin, now, voter['id']),
    )
    conn.execute(
        "INSERT INTO department_stats (department, eligible, accredited, voted) VALUES (?, ?, ?, ?) ON CONFLICT(department) DO UPDATE SET eligible = department_stats.eligible + 1, accredited = department_stats.accredited + 1",
        (voter['department'], 1, 1, 0),
    )
    conn.commit()
    conn.close()
    add_audit_log('Student Voter Accredited', 'ELECO Registry', 'ACCREDITATION', f'Biometric PIN generated for Matric: {matric_number}')
    return jsonify({'success': True, 'message': 'Accreditation verified successfully.', 'pin': generated_pin, 'accreditationTime': now})


@app.post('/api/voters/reject')
def reject_voter() -> Any:
    payload = request.get_json(silent=True) or {}
    matric_number = str(payload.get('matricNumber', '')).strip().upper()
    reason = str(payload.get('reason', 'Accreditation credentials non-compliant with BMS student registry.')).strip()

    if not matric_number:
        return jsonify({'success': False, 'message': 'Matriculation number is required.'}), 400

    conn = get_db_connection()
    voter = conn.execute("SELECT * FROM voters WHERE UPPER(matric_number) = ?", (matric_number,)).fetchone()
    if voter is None:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter not found.'}), 404

    conn.execute(
        "UPDATE voters SET is_eligible = 0, is_accredited = 0, verification_status = 'rejected', rejection_reason = ? WHERE id = ?",
        (reason, voter['id']),
    )
    conn.commit()
    conn.close()
    add_audit_log('Student Verification Rejected', 'ELECO Accreditation Officer', 'ACCREDITATION', f'Matric: {matric_number} rejected. Reason: {reason}')
    return jsonify({'success': True, 'message': 'Voter submission marked as rejected.', 'reason': reason})


@app.post('/api/voters/login')
def voter_login() -> Any:
    payload = request.get_json(silent=True) or {}
    identifier = str(payload.get('identifier', '')).strip().upper()
    credential = str(payload.get('credential', '')).strip()

    conn = get_db_connection()
    voter = conn.execute(
        "SELECT * FROM voters WHERE UPPER(matric_number) = ? OR UPPER(email) = ?",
        (identifier, identifier),
    ).fetchone()
    conn.close()

    if voter is None:
        return jsonify({'success': False, 'message': 'Student record not found.'}), 404

    if int(voter['is_eligible']) == 0:
        return jsonify({'success': False, 'message': 'Student record flagged as ineligible.'}), 403

    if int(voter['has_voted']) == 1:
        return jsonify({'success': False, 'message': 'This voter has already cast a ballot and cannot vote again.'}), 403

    if int(voter['is_accredited']) != 1 or not voter['voter_pin']:
        return jsonify({'success': False, 'message': 'Voter accreditation is required before login.'}), 403

    if not credential or credential != voter['voter_pin']:
        return jsonify({'success': False, 'message': 'Invalid voter PIN.'}), 401

    session = secrets.token_urlsafe(32)
    VOTER_SESSIONS[session] = voter['id']
    voter_payload = dict(voter)
    voter_payload.pop('id_card_url', None)
    voter_payload.pop('review_notes', None)
    return jsonify({'success': True, 'session': session, 'voter': voter_payload})


@app.post('/api/voters/cast-ballot')
def cast_ballot() -> Any:
    payload = request.get_json(silent=True) or {}
    voter_id = payload.get('voterId')
    votes = payload.get('votes', {})

    if not voter_id:
        return jsonify({'success': False, 'message': 'Voter required.'}), 400

    voter_session = request.headers.get('X-Voter-Session', '')
    if VOTER_SESSIONS.get(voter_session) != voter_id:
        return jsonify({'success': False, 'message': 'Voter session is missing or expired.'}), 401

    if not isinstance(votes, dict):
        return jsonify({'success': False, 'message': 'Ballot selections are invalid.'}), 400

    conn = get_db_connection()
    voter_query = "SELECT * FROM voters WHERE id = ?"
    if conn.postgres:
        voter_query += " FOR UPDATE"
    voter = conn.execute(voter_query, (voter_id,)).fetchone()
    if voter is None:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter not found.'}), 404

    positions = conn.execute("SELECT id, max_selections FROM positions").fetchall()
    position_limits = {row['id']: int(row['max_selections']) for row in positions}
    for position_id, candidate_id in votes.items():
        if position_id not in position_limits or not isinstance(candidate_id, str):
            conn.close()
            return jsonify({'success': False, 'message': 'Ballot contains an invalid selection.'}), 400
        candidate = conn.execute(
            "SELECT id FROM candidates WHERE id = ? AND position_id = ? AND approved_by_eleco = 1",
            (candidate_id, position_id),
        ).fetchone()
        if candidate is None or position_limits[position_id] != 1:
            conn.close()
            return jsonify({'success': False, 'message': 'Ballot contains an invalid selection.'}), 400

    if int(voter['has_voted']) == 1:
        conn.close()
        return jsonify({'success': False, 'message': 'Voter has already cast a ballot.'})

    election_state = conn.execute("SELECT status, end_time FROM election_state WHERE id = 1").fetchone()
    if election_state['status'] == 'LIVE' and election_state['end_time'] and datetime.now(timezone.utc) >= datetime.fromisoformat(election_state['end_time'].replace('Z', '+00:00')):
        conn.execute("UPDATE election_state SET status = 'CLOSED', updated_at = ? WHERE id = 1", (utc_now_iso(),))
        conn.commit()
        add_audit_log('Election closed automatically after time limit', 'System Scheduler', 'SYSTEM', 'Voting window ended automatically.')
        election_state = {'status': 'CLOSED'}
    if election_state['status'] != 'LIVE':
        conn.close()
        return jsonify({'success': False, 'message': 'Voting is not currently open.'}), 403

    receipt = '0x' + os.urandom(14).hex().upper()
    for candidate_id in votes.values():
        conn.execute(
            "UPDATE candidates SET votes_count = votes_count + 1 WHERE id = ?",
            (candidate_id,),
        )

    conn.execute(
        "UPDATE voters SET has_voted = 1, voted_time = ?, ballot_receipt_hash = ? WHERE id = ?",
        (utc_now_iso(), receipt, voter_id),
    )
    conn.execute(
        "UPDATE department_stats SET voted = voted + 1 WHERE department = ?",
        (voter['department'],),
    )
    conn.commit()
    conn.close()
    add_audit_log('Confidential Ballot Cast & Verified', f"Anonymous Session #{voter['voter_pin']}", 'VOTE', f"Receipt Token: {receipt[:14]}... | 1-Student-1-Ballot confirmed.")
    return jsonify({'success': True, 'receiptHash': receipt, 'message': 'Vote cast successfully.'})


@app.post('/api/admin/result-summary')
def result_summary() -> Any:
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT position_id, full_name, votes_count FROM candidates ORDER BY position_id, votes_count DESC"
    ).fetchall()
    conn.close()
    return jsonify({'results': [dict(row) for row in rows]})


@app.get('/api/admin/certification-readiness')
def certification_readiness() -> Any:
    conn = get_db_connection()
    state = conn.execute("SELECT status FROM election_state WHERE id = 1").fetchone()
    total_ballots = conn.execute("SELECT COUNT(*) FROM voters WHERE has_voted = 1").fetchone()[0]
    total_positions = conn.execute("SELECT COUNT(*) FROM positions").fetchone()[0]
    reviewed_positions = conn.execute("SELECT COUNT(*) FROM position_reviews WHERE reviewed_at IS NOT NULL").fetchone()[0]
    all_positions = conn.execute("SELECT id FROM positions").fetchall()
    candidate_count = conn.execute("SELECT COUNT(*) FROM candidates").fetchone()[0]
    invalid_vote_counts = conn.execute("SELECT COUNT(*) FROM candidates WHERE votes_count < 0 OR votes_count IS NULL").fetchone()[0]
    
    position_results = []
    for pos_row in all_positions:
        pos_id = pos_row['id']
        pos_candidates = conn.execute("SELECT full_name, votes_count FROM candidates WHERE position_id = ? ORDER BY votes_count DESC", (pos_id,)).fetchall()
        is_reviewed = conn.execute("SELECT 1 FROM position_reviews WHERE position_id = ? AND reviewed_at IS NOT NULL", (pos_id,)).fetchone() is not None
        position_results.append({
            'positionId': pos_id,
            'candidates': [dict(c) for c in pos_candidates],
            'isReviewed': bool(is_reviewed)
        })
    
    conn.close()
    return jsonify({
        'status': state['status'],
        'ballotsCast': total_ballots,
        'totalPositions': total_positions,
        'reviewedPositions': reviewed_positions,
        'ballotsProcessed': state['status'] in ('CLOSED', 'CERTIFIED'),
        'resultsCalculated': total_positions > 0 and candidate_count > 0 and invalid_vote_counts == 0,
        'positionResults': position_results
    })


@app.post('/api/admin/review-position')
def review_position() -> Any:
    payload = request.get_json(silent=True) or {}
    position_id = payload.get('positionId')
    if not position_id:
        return jsonify({'success': False, 'message': 'Position ID required.'}), 400
    
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO position_reviews (position_id, reviewed_at, reviewed_by) VALUES (?, ?, ?) ON CONFLICT (position_id) DO UPDATE SET reviewed_at = EXCLUDED.reviewed_at, reviewed_by = EXCLUDED.reviewed_by",
        (position_id, utc_now_iso(), 'ELECO Administrator')
    )
    conn.commit()
    conn.close()
    add_audit_log('Position results reviewed', 'ELECO Administrator', 'ADMIN', f'Position {position_id} marked as reviewed.')
    return jsonify({'success': True, 'positionId': position_id})


init_db()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.environ.get('FLASK_DEBUG') == '1', threaded=True)
