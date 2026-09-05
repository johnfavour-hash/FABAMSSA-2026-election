import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Candidate, ElectionPosition, Voter, AuditLog, ElectionStatus, ResultsStatus, BMSDepartment, CommissionMember } from '../types';

interface ElectionContextType {
  status: ElectionStatus;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number;
  resultsStatus: ResultsStatus;
  publishedAt: string | null;
  certifiedAt: string | null;
  publishResults: () => Promise<{ success: boolean; message?: string }>;
  adminRequest: (url: string, options?: RequestInit) => Promise<Response>;
  refreshElectionData: () => Promise<void>;
  electionStatus: ElectionStatus;
  setStatus: (status: ElectionStatus) => void;
  setElectionStatus: (status: ElectionStatus) => void;
    setElectionDuration: (durationMinutes: number) => Promise<{ success: boolean; message?: string }>;
  positions: ElectionPosition[];
  candidates: Candidate[];
  voters: Voter[];
  auditLogs: AuditLog[];
  departmentStats: Record<BMSDepartment, { eligible: number; accredited: number; voted: number }>;
  commissionMembers: CommissionMember[];
  updateCommissionMembers: (members: CommissionMember[]) => Promise<{ success: boolean; message?: string }>;
  currentVoter: Voter | null;
  isAdminLoggedIn: boolean;
  isAdminAuthenticated: boolean;
  adminName: string;
  adminEmail: string;
  adminAvatarUrl: string | null;
  updateAdminProfile: (name: string, avatarUrl: string | null) => Promise<{ success: boolean; message?: string }>;
  
  // Actions
  loginVoter: (matricNumber: string, pin: string) => Promise<{ success: boolean; message: string; voter?: Voter }>;
  logoutVoter: () => void;
  loginAdmin: (passcode: string, name?: string, email?: string) => Promise<boolean>;
  logoutAdmin: () => void;
  checkEligibility: (matricNumber: string) => Voter | null;
  registerVoter: (voterData: Omit<Voter, 'id' | 'isEligible' | 'isAccredited' | 'hasVoted' | 'voterPin'>) => Promise<Voter | null>;
  accreditVoter: (matricNumber: string) => Promise<{ success: boolean; message: string; pin?: string }>;
  rejectVoter: (matricNumber: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  castBallot: (votes: Record<string, string>) => Promise<{ success: boolean; receiptHash: string; message: string }>;
  
  // Admin Controls
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votesCount' | 'approvedByEleco'>) => Promise<void>;
  addPosition: (position: Omit<ElectionPosition, 'id' | 'order'>) => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  adjustCandidateVotes: (id: string, delta: number) => Promise<void>;
  deleteCandidate: (id: string) => Promise<{ success: boolean; message?: string }>;
  deletePosition: (id: string) => Promise<{ success: boolean; message?: string }>;
  deleteVoter: (id: string) => Promise<{ success: boolean; message?: string }>;
  resetElectionData: () => Promise<{ success: boolean; message?: string }>;
  
  // Computed
  totalEligible: number;
  totalAccredited: number;
  totalBallotsCast: number;
  turnoutPercentage: number;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

const configuredApiBase = (
  import.meta.env.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
)?.replace(/\/+$/, '');
const API_BASE = configuredApiBase
  ? (configuredApiBase.endsWith('/api')
    ? configuredApiBase
    : `${configuredApiBase.replace(/\/election$/, '')}/api`)
  : '/api';

const STORAGE_KEYS = {
  STATUS: 'bamssa_election_status_2026',
  CANDIDATES: 'bamssa_candidates_2026',
  VOTERS: 'bamssa_voters_2026',
  AUDIT_LOGS: 'bamssa_audit_logs_2026',
  CURRENT_VOTER: 'bamssa_current_voter_2026',
  ADMIN_AUTH: 'bamssa_admin_auth_2026',
  ADMIN_SESSION: 'bamssa_admin_session_2026',
  DEPT_STATS: 'bamssa_dept_stats_2026',
};

const EMPTY_DEPT_STATS = (): Record<BMSDepartment, { eligible: number; accredited: number; voted: number }> => ({
  Anatomy: { eligible: 0, accredited: 0, voted: 0 },
  Psychology: { eligible: 0, accredited: 0, voted: 0 },
});

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatusState] = useState<ElectionStatus>('STANDBY');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [resultsStatus, setResultsStatus] = useState<ResultsStatus>('DRAFT');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [certifiedAt, setCertifiedAt] = useState<string | null>(null);

  const [positions, setPositions] = useState<ElectionPosition[]>([]);

  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [voters, setVoters] = useState<Voter[]>([]);
  const votersRef = useRef<Voter[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [currentVoter, setCurrentVoter] = useState<Voter | null>(() => {
    const storedVoter = localStorage.getItem(STORAGE_KEYS.CURRENT_VOTER);
    if (!storedVoter) return null;
    try {
      return JSON.parse(storedVoter) as Voter;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_VOTER);
      return null;
    }
  });
  const [voterSession, setVoterSession] = useState<string | null>(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true');
  const [adminSession, setAdminSession] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION));
  const [adminName, setAdminName] = useState('Administrator');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAvatarUrl, setAdminAvatarUrl] = useState<string | null>(null);
  const refreshRequestId = useRef(0);

  const [departmentStats, setDepartmentStats] = useState<Record<BMSDepartment, { eligible: number; accredited: number; voted: number }>>(EMPTY_DEPT_STATS);
  const [commissionMembers, setCommissionMembers] = useState<CommissionMember[]>([]);

  useEffect(() => {
    if (currentVoter) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_VOTER, JSON.stringify(currentVoter));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_VOTER);
    }
  }, [currentVoter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, String(isAdminLoggedIn));
    if (adminSession) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, adminSession);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  }, [isAdminLoggedIn, adminSession]);

  const refreshElectionData = async () => {
    const requestId = ++refreshRequestId.current;
    try {
      const response = await fetch(`${API_BASE}/election`, {
        headers: adminSession ? { 'X-Admin-Session': adminSession } : undefined,
        cache: 'no-store',
      });
      if (!response.ok) {
        setStatusState('STANDBY');
        return;
      }

      const payload = await response.json();
      if (requestId !== refreshRequestId.current) return;
      if (payload.status) {
        setStatusState(payload.status as ElectionStatus);
      }
      setStartTime(payload.start_time || null);
      setEndTime(payload.end_time || null);
      setDurationMinutes(Number(payload.duration_minutes || 120));
      setResultsStatus((payload.results_status || 'DRAFT') as ResultsStatus);
      setPublishedAt(payload.published_at || null);
      setCertifiedAt(payload.certified_at || null);
      if (payload.positions) {
        setPositions(payload.positions.map((position: any) => ({
          id: position.id,
          title: position.title,
          description: position.description,
          order: Number(position.order_index ?? position.order ?? 0),
          maxSelections: Number(position.max_selections ?? position.maxSelections ?? 1),
        })));
      }
      if (payload.candidates) {
        setCandidates(payload.candidates.map((candidate: any) => ({
          id: candidate.id,
          positionId: candidate.position_id,
          fullName: candidate.full_name,
          department: candidate.department,
          level: candidate.level,
          cgpaRange: candidate.cgpa_range || 'N/A',
          photoUrl: candidate.photo_url || '',
          tagline: candidate.tagline || '',
          manifesto: candidate.manifesto ? candidate.manifesto.split('|') : [],
          runningMate: candidate.running_mate_name ? {
            name: candidate.running_mate_name,
            department: candidate.running_mate_department,
            level: candidate.running_mate_level,
          } : undefined,
          votesCount: Number(candidate.votes_count || 0),
          approvedByEleco: Boolean(candidate.approved_by_eleco),
        })));
      }
      if (payload.voters) {
        const refreshedVoters = payload.voters.map((voter: any) => ({
          id: voter.id,
          matricNumber: voter.matric_number,
          fullName: voter.full_name,
          department: voter.department,
          level: voter.level,
          email: voter.email,
          phone: voter.phone,
          isEligible: Boolean(voter.is_eligible),
          isAccredited: Boolean(voter.is_accredited),
          hasVoted: Boolean(voter.has_voted),
          voterPin: voter.voter_pin || '',
          accreditationTime: voter.accreditation_time || undefined,
          votedTime: voter.voted_time || undefined,
          ballotReceiptHash: voter.ballot_receipt_hash || undefined,
          avatarUrl: voter.avatar_url || undefined,
          verificationStatus: voter.verification_status as any,
          registeredAt: voter.registered_at || undefined,
          rejectionReason: voter.rejection_reason || undefined,
          idCardUrl: voter.id_card_url || undefined,
          registrationId: voter.registration_id || undefined,
          reviewNotes: voter.review_notes || undefined,
        }));
        votersRef.current = refreshedVoters;
        setVoters(refreshedVoters);
      }
      if (payload.audit_logs) {
        setAuditLogs(payload.audit_logs.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          action: log.action,
          actor: log.actor,
          encryptedHash: log.encrypted_hash,
          category: log.category,
          details: log.details,
        })));
      }
      if (payload.department_stats) {
        setDepartmentStats(payload.department_stats as Record<BMSDepartment, { eligible: number; accredited: number; voted: number }>);
      }
      if (payload.commission_members) {
        setCommissionMembers(payload.commission_members);
      }
    } catch (error) {
      // Ignore transient backend sync issues; the local UI remains usable when the backend is unavailable.
    }
  };

  useEffect(() => {
    refreshElectionData();
    const interval = window.setInterval(() => {
      refreshElectionData();
    }, 4000);
    return () => window.clearInterval(interval);
  }, [adminSession]);

  const addAuditLog = (action: string, actor: string, category: AuditLog['category'], details?: string) => {
    const randomHex = Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      encryptedHash: `0x${randomHex}`,
      category,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const generateVoterPin = (matricNumber: string): string => {
    const usedPins = new Set(voters.map((voter) => voter.voterPin).filter(Boolean));
    const randomValues = new Uint32Array(1);
    for (let attempt = 0; attempt < 9000; attempt += 1) {
      window.crypto.getRandomValues(randomValues);
      const candidate = String((randomValues[0] % 9000) + 1000);
      if (!usedPins.has(candidate)) return candidate;
    }
    return '1000';
  };

  const setStatus = async (newStatus: ElectionStatus) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/set-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) return;
      setStatusState(newStatus);
      setStartTime(payload.start_time || null);
      setEndTime(payload.end_time || null);
    } catch {
      return;
    }
    addAuditLog(
      `Election Status Modified to [${newStatus}]`,
      'ELECO Electoral Officer',
      'ADMIN',
      `System transitioned state from ${status} to ${newStatus}.`
    );
  };

  const setElectionStatus = (newStatus: ElectionStatus) => {
    void setStatus(newStatus);
  };

  const setElectionDuration = async (nextDuration: number) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/set-duration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: nextDuration }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) return { success: false, message: payload.message };
      setDurationMinutes(nextDuration);
      return { success: true };
    } catch {
      return { success: false, message: 'Unable to update election duration.' };
    }
  };

  const publishResults = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/publish-results`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok || !payload.success) return { success: false, message: payload.message };
      setResultsStatus('PUBLISHED');
      setPublishedAt(payload.publishedAt || new Date().toISOString());
      return { success: true };
    } catch {
      return { success: false, message: 'Unable to publish results.' };
    }
  };

  const checkEligibility = (query: string): Voter | null => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return null;
    return (
      votersRef.current.find(
        (v) =>
          v.matricNumber?.toUpperCase() === trimmed ||
          v.email?.toUpperCase() === trimmed ||
          v.matricNumber?.replace(/\//g, '').toUpperCase() === trimmed.replace(/\//g, '')
      ) || null
    );
  };

  const loginVoter = async (identifier: string, credential?: string) => {
    const trimmed = identifier.trim().toUpperCase();
    if (!trimmed) {
      return { success: false, message: 'Please provide your Matriculation Number or UNIPORT email.' };
    }
    try {
      const response = await fetch(`${API_BASE}/voters/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: trimmed, credential: credential?.trim() || '' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.session || !payload.voter) {
        return { success: false, message: payload.message || 'Unable to authenticate voter.' };
      }
      const voterData = payload.voter;
      const voter: Voter = {
        id: voterData.id,
        matricNumber: voterData.matric_number,
        fullName: voterData.full_name,
        department: voterData.department,
        level: voterData.level,
        email: voterData.email,
        phone: voterData.phone,
        isEligible: Boolean(voterData.is_eligible),
        isAccredited: Boolean(voterData.is_accredited),
        hasVoted: Boolean(voterData.has_voted),
        voterPin: credential?.trim() || '',
        accreditationTime: voterData.accreditation_time || undefined,
        votedTime: voterData.voted_time || undefined,
        ballotReceiptHash: voterData.ballot_receipt_hash || undefined,
        avatarUrl: voterData.avatar_url || undefined,
        verificationStatus: voterData.verification_status,
      };
      setVoterSession(payload.session);
      setCurrentVoter(voter);
      return { success: true, message: 'Authentication successful. Proceed to confidential ballot.', voter };
    } catch {
      return { success: false, message: 'Unable to reach the election server.' };
    }
  };

  const logoutVoter = () => {
    setCurrentVoter(null);
    setVoterSession(null);
  };

  const loginAdmin = async (passcode: string, name?: string, email?: string): Promise<boolean> => {
    const trimmedPasscode = passcode.trim();
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmedPasscode, adminName: name?.trim() || '', email: email?.trim() || '' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.session) return false;
      setAdminSession(payload.session);
      setAdminName(payload.adminName || 'Administrator');
        setAdminEmail(payload.adminEmail || '');
      setAdminAvatarUrl(payload.adminAvatarUrl || null);
      setIsAdminLoggedIn(true);
      return true;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminSession(null);
    setAdminName('Administrator');
      setAdminEmail('');
    setAdminAvatarUrl(null);
  };

  const updateAdminProfile = async (name: string, avatarUrl: string | null) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: name, adminAvatarUrl: avatarUrl || '' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) return { success: false, message: payload.message || 'Unable to update administrator profile.' };
      setAdminName(payload.adminName);
      setAdminAvatarUrl(payload.adminAvatarUrl || null);
      return { success: true };
    } catch {
      return { success: false, message: 'Unable to reach the election server.' };
    }
  };

  const updateCommissionMembers = async (members: CommissionMember[]) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/commission-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) return { success: false, message: payload.message || 'Unable to update commission roster.' };
      setCommissionMembers(payload.commissionMembers);
      return { success: true };
    } catch {
      return { success: false, message: 'Unable to reach the election server.' };
    }
  };

  const adminFetch = (url: string, options: RequestInit = {}) => fetch(
    url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/api') ? url.slice(4) : url}`,
    {
    ...options,
    headers: { ...(options.headers || {}), 'X-Admin-Session': adminSession || '' },
    },
  );

  const accreditVoter = async (matricNumber: string) => {
    const trimmed = matricNumber.trim().toUpperCase();
    const existingVoter = voters.find((v) => v.matricNumber?.toUpperCase() === trimmed);
    if (!existingVoter) {
      return { success: false, message: 'Matriculation number not registered.' };
    }

    if (existingVoter.isAccredited) {
      return { success: true, message: 'Voter is already accredited.', pin: existingVoter.voterPin };
    }

    const generatedPin = existingVoter.voterPin || generateVoterPin(trimmed);

    try {
      const response = await adminFetch(`${API_BASE}/voters/accredit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricNumber: trimmed }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) return { success: false, message: payload.message || 'Unable to accredit voter.' };
          const finalPin = payload.pin || generatedPin;
          setVoters((prev) => prev.map((v) =>
            v.matricNumber?.toUpperCase() === trimmed
              ? {
                  ...v,
                  isAccredited: true,
                  isEligible: true,
                  verificationStatus: 'approved',
                  voterPin: finalPin,
                  accreditationTime: payload.accreditationTime || v.accreditationTime || new Date().toISOString(),
                }
              : v,
          ));
          addAuditLog(
            'Student Voter Accredited',
            `ELECO Registry (${existingVoter.department})`,
            'ACCREDITATION',
            `Voter PIN generated for Matric: ${existingVoter.matricNumber} | PIN: ${finalPin}`
          );
      return { success: true, message: 'Accreditation verified successfully! Keep your 4-digit PIN secure.', pin: finalPin };
    } catch {
      return { success: false, message: 'Unable to reach the election server.' };
    }
  };

  const rejectVoter = async (matricNumber: string, reason?: string) => {
    const trimmed = matricNumber.trim().toUpperCase();
    const existingVoter = voters.find((v) => v.matricNumber?.toUpperCase() === trimmed);
    if (!existingVoter) {
      return { success: false, message: 'Matriculation number not found.' };
    }

    try {
      const response = await adminFetch(`${API_BASE}/voters/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricNumber: trimmed, reason: reason || 'Accreditation credentials non-compliant with BMS student registry.' }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) return { success: false, message: payload.message || 'Unable to reject voter.' };
          setVoters((prev) => prev.map((v) =>
            v.matricNumber?.toUpperCase() === trimmed
              ? { ...v, isEligible: false, isAccredited: false, verificationStatus: 'rejected', rejectionReason: reason || payload.reason || 'Accreditation credentials non-compliant with BMS student registry.' }
              : v,
          ));
          addAuditLog(
            'Student Verification Rejected',
            'ELECO Accreditation Officer',
            'ACCREDITATION',
            `Matric: ${existingVoter.matricNumber} rejected. Reason: ${reason || 'Incomplete credentials'}`
          );
      return { success: true, message: 'Voter submission marked as rejected.' };
    } catch {
      return { success: false, message: 'Unable to reach the election server.' };
    }
  };

  const registerVoter = async (voterData: Omit<Voter, 'id' | 'isEligible' | 'isAccredited' | 'hasVoted' | 'voterPin'>) => {
    const payload = {
      matricNumber: voterData.matricNumber.trim().toUpperCase(),
      fullName: voterData.fullName,
      department: voterData.department,
      level: voterData.level,
      email: voterData.email,
      phone: voterData.phone,
      idCardUrl: voterData.idCardUrl,
    };

    try {
      const response = await fetch(`${API_BASE}/voters/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll voter');
      }

      const newVoter: Voter = {
        ...voterData,
        id: `voter-${Date.now()}`,
        matricNumber: payload.matricNumber,
        isEligible: false,
        isAccredited: false,
        hasVoted: false,
        voterPin: '',
        registeredAt: new Date().toISOString(),
        accreditationTime: undefined,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        verificationStatus: 'pending',
      };

      setVoters((prev) => [newVoter, ...prev]);
      setDepartmentStats((prev) => ({
        ...prev,
        [newVoter.department]: {
          ...prev[newVoter.department],
          eligible: prev[newVoter.department].eligible + 1,
        },
      }));
      addAuditLog(
        'New Student Voter Registration Submitted',
        `Registry System (${newVoter.department})`,
        'ACCREDITATION',
        `Matriculation ${newVoter.matricNumber} submitted for eligibility review.`
      );
      return newVoter;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const castBallot = async (votes: Record<string, string>) => {
    if (!currentVoter) {
      return { success: false, receiptHash: '', message: 'No voter authenticated.' };
    }

    if (currentVoter.hasVoted) {
      return { success: false, receiptHash: currentVoter.ballotReceiptHash || '', message: 'Voter has already cast a ballot. Multiple votes strictly prohibited.' };
    }

    try {
      const response = await fetch(`${API_BASE}/voters/cast-ballot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Voter-Session': voterSession || '' },
        body: JSON.stringify({ voterId: currentVoter.id, votes }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        return { success: false, receiptHash: '', message: result.message || 'Ballot submission rejected by the backend.' };
      }
      const votedTime = new Date().toISOString();
      const updatedVoter = { ...currentVoter, hasVoted: true, votedTime, ballotReceiptHash: result.receiptHash };
      setCurrentVoter(updatedVoter);
      setVoters((prev) => prev.map((v) => (v.id === currentVoter.id ? updatedVoter : v)));
      return { success: true, receiptHash: result.receiptHash, message: result.message || 'Your vote has been cast and recorded.' };
    } catch {
      return { success: false, receiptHash: '', message: 'Unable to reach the election server.' };
    }
  };

  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'votesCount' | 'approvedByEleco'>) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: candidateData.fullName,
          positionId: candidateData.positionId,
          department: candidateData.department,
          level: candidateData.level,
          photoUrl: candidateData.photoUrl,
          tagline: candidateData.tagline,
          manifesto: candidateData.manifesto,
          cgpaRange: candidateData.cgpaRange,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to create candidate');
      }

      const newCand: Candidate = {
        ...candidateData,
        id: data.candidate?.id || `cand-${Date.now()}`,
        votesCount: Number(data.candidate?.votesCount || 0),
        approvedByEleco: Boolean(data.candidate?.approvedByEleco ?? true),
      };
      setCandidates((prev) => [...prev, newCand]);
      addAuditLog(
        `New Candidate Certified: ${newCand.fullName}`,
        'ELECO Screening Committee',
        'ADMIN',
        `Position ID: ${newCand.positionId} | Department: ${newCand.department}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const addPosition = async (positionData: Omit<ElectionPosition, 'id' | 'order'>) => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: positionData.title,
          description: positionData.description,
          maxSelections: positionData.maxSelections,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to create position');
      }
      if (data.position) {
        setPositions((prev) => [...prev, {
          id: data.position.id,
          title: data.position.title,
          description: data.position.description,
          order: Number(data.position.order || prev.length + 1),
          maxSelections: Number(data.position.maxSelections || 1),
        }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog(
      `Candidate Profile Updated (#${id})`,
      'ELECO Screening Secretariat',
      'ADMIN'
    );
  };

  const adjustCandidateVotes = async (id: string, delta: number) => {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;

    const safeDelta = Number.isFinite(delta) ? delta : 0;
    const optimisticValue = Math.max(0, candidate.votesCount + safeDelta);
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, votesCount: optimisticValue } : c))
    );
    try {
      const response = await adminFetch(`${API_BASE}/admin/adjust-candidate-votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: id, delta: safeDelta }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, votesCount: candidate.votesCount } : c))
        );
        return;
      }

      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, votesCount: payload.votesCount } : c))
      );
    } catch {
      return;
    }
  };

  const deleteCandidate = async (id: string) => {
    const cand = candidates.find((c) => c.id === id);
    const response = await adminFetch(`${API_BASE}/admin/candidates/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to delete candidate.' };
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    addAuditLog(
      `Candidate Removed: ${cand?.fullName || id}`,
      'ELECO Electoral Tribunal',
      'ADMIN'
    );
    return { success: true };
  };

  const deletePosition = async (id: string) => {
    const position = positions.find((item) => item.id === id);
    const response = await adminFetch(`${API_BASE}/admin/positions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to delete position.' };
    setPositions((prev) => prev.filter((item) => item.id !== id));
    addAuditLog(`Position Removed: ${position?.title || id}`, 'ELECO Electoral Tribunal', 'ADMIN');
    return { success: true };
  };

  const deleteVoter = async (id: string) => {
    const voter = voters.find((item) => item.id === id);
    const response = await adminFetch(`${API_BASE}/admin/voters/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Unable to delete voter.' };
    setVoters((prev) => prev.filter((item) => item.id !== id));
    if (currentVoter?.id === id) setCurrentVoter(null);
    addAuditLog(`Voter Removed: ${voter?.fullName || id}`, 'ELECO Electoral Tribunal', 'ADMIN');
    return { success: true };
  };

  const resetElectionData = async () => {
    try {
      const response = await adminFetch(`${API_BASE}/admin/reset`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        return { success: false, message: payload.message || 'Unable to reset the election.' };
      }
    } catch {
      return { success: false, message: 'Unable to reach the election server.' };
    }

    setStatusState('STANDBY');
    setResultsStatus('DRAFT');
    setPublishedAt(null);
    setCertifiedAt(null);
    setPositions([]);
    setCandidates([]);
    setVoters([]);
    setAuditLogs([]);
    setCurrentVoter(null);
    setIsAdminLoggedIn(false);
    setDepartmentStats(EMPTY_DEPT_STATS());
    localStorage.removeItem(STORAGE_KEYS.STATUS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.VOTERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_VOTER);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    localStorage.removeItem(STORAGE_KEYS.DEPT_STATS);
    addAuditLog('System Reset to Initial Calibration', 'System Admin', 'SYSTEM');
    return { success: true };
  };

  // Computed metrics
  const deptValues = Object.values(departmentStats) as Array<{ eligible: number; accredited: number; voted: number }>;
  const totalEligible = deptValues.reduce((acc, curr) => acc + curr.eligible, 0);
  const totalAccredited = deptValues.reduce((acc, curr) => acc + curr.accredited, 0);
  const totalBallotsCast = deptValues.reduce((acc, curr) => acc + curr.voted, 0);
  const turnoutPercentage = totalEligible > 0 ? Math.round((totalBallotsCast / totalEligible) * 100) : 0;

  return (
    <ElectionContext.Provider
      value={{
        status,
        startTime,
        endTime,
        durationMinutes,
        resultsStatus,
        publishedAt,
        certifiedAt,
        publishResults,
        adminRequest: adminFetch,
        refreshElectionData,
        electionStatus: status,
        setStatus,
        setElectionStatus,
          setElectionDuration,
        positions,
        candidates,
        voters,
        auditLogs,
        departmentStats,
        currentVoter,
        isAdminLoggedIn,
        isAdminAuthenticated: isAdminLoggedIn,
        adminName,
          adminEmail,
          commissionMembers,
          updateCommissionMembers,
        adminAvatarUrl,
        updateAdminProfile,
        loginVoter,
        logoutVoter,
        loginAdmin,
        logoutAdmin,
        checkEligibility,
        registerVoter,
        accreditVoter,
        rejectVoter,
        castBallot,
        addCandidate,
        addPosition,
        updateCandidate,
        adjustCandidateVotes,
        deleteCandidate,
        deletePosition,
        deleteVoter,
        resetElectionData,
        totalEligible,
        totalAccredited,
        totalBallotsCast,
        turnoutPercentage,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
