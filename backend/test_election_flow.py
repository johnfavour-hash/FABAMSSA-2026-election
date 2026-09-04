import os
import tempfile

import backend.app as app_module
from backend.app import app, init_db


def test_empty_demo_state_on_boot():
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)

    old_db_path = app_module.DB_PATH
    app_module.DB_PATH = db_path

    try:
        with app.app_context():
            init_db()

        client = app.test_client()
        response = client.get('/api/election')
        assert response.status_code == 200
        payload = response.get_json()
        assert payload['positions'] == []
        assert payload['candidates'] == []
        assert payload['voters'] == []
        assert payload['audit_logs'] == []
    finally:
        app_module.DB_PATH = old_db_path
        if os.path.exists(db_path):
            os.remove(db_path)


def test_student_registration_requires_admin_approval():
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)

    old_db_path = app_module.DB_PATH
    app_module.DB_PATH = db_path

    try:
        with app.app_context():
            init_db()

        client = app.test_client()
        register_response = client.post(
            '/api/voters/register',
            json={
                'matricNumber': 'U2026/9988001',
                'fullName': 'Ada Jones',
                'department': 'Anatomy',
                'level': '300L',
                'email': 'ada.jones@uniport.edu.ng',
                'phone': '08000000000',
                'idCardUrl': 'data:image/png;base64,AA==',
            },
        )

        assert register_response.status_code == 200, register_response.get_data(as_text=True)
        payload = register_response.get_json()
        assert payload['success'] is True
        assert payload.get('pin') is None

        election = client.get('/api/election').get_json()
        voter = election['voters'][0]
        assert voter['verification_status'] == 'pending'
        assert voter['is_accredited'] == 0
        assert voter['is_eligible'] == 0
    finally:
        app_module.DB_PATH = old_db_path
        if os.path.exists(db_path):
            os.remove(db_path)


def test_accreditation_assigns_unique_pins(monkeypatch):
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.close(db_fd)

    old_db_path = app_module.DB_PATH
    app_module.DB_PATH = db_path

    try:
        with app.app_context():
            init_db()

        conn = app_module.get_db_connection()
        voters = [
            ('voter-one', 'U2026/1000001', 'One Student'),
            ('voter-two', 'U2026/1000002', 'Two Student'),
        ]
        for voter_id, matric_number, full_name in voters:
            conn.execute(
                """
                INSERT INTO voters (
                    id, matric_number, full_name, department, level, email, phone,
                    is_eligible, is_accredited, has_voted, verification_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'pending')
                """,
                (voter_id, matric_number, full_name, 'Anatomy', '300L', f'{voter_id}@uniport.edu.ng', '08000000000'),
            )
        conn.commit()
        conn.close()

        candidates = iter([0, 0, 1])
        monkeypatch.setattr(app_module.secrets, 'randbelow', lambda _: next(candidates))
        app_module.ADMIN_SESSIONS['test-admin-session'] = 'test-admin'
        client = app.test_client()
        admin_headers = {'X-Admin-Session': 'test-admin-session'}

        first_response = client.post('/api/voters/accredit', json={'matricNumber': 'U2026/1000001'}, headers=admin_headers)
        second_response = client.post('/api/voters/accredit', json={'matricNumber': 'U2026/1000002'}, headers=admin_headers)
        repeat_response = client.post('/api/voters/accredit', json={'matricNumber': 'U2026/1000001'}, headers=admin_headers)

        assert first_response.get_json()['pin'] == '1000'
        assert second_response.get_json()['pin'] == '1001'
        assert repeat_response.get_json()['pin'] == '1000'
    finally:
        app_module.DB_PATH = old_db_path
        if os.path.exists(db_path):
            os.remove(db_path)
