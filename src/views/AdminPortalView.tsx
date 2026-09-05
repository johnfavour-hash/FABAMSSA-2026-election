import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useElection } from '../context/ElectionContext';
import { ElectionStatus, BMSDepartment, AcademicLevel, Candidate, ElectionPosition, Voter } from '../types';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Vote, 
  Lock, 
  FileSpreadsheet, 
  Plus, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  LogOut,
  PlayCircle,
  Download,
  Trash2,
  LayoutDashboard,
  UserCheck,
  ListOrdered,
  UserPlus,
  BarChart3,
  Award,
  History,
  Bell,
  HelpCircle,
  Calendar,
  Clock,
  ArrowRight,
  Check,
  FileCheck2,
  XCircle,
  Eye,
  Sliders,
  Sparkles,
  Printer,
  ChevronRight,
  Filter,
  CheckCircle,
  X,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Edit3,
  User,
  CheckSquare,
  GripVertical,
  MoreVertical,
  ChevronLeft,
  Info
} from 'lucide-react';

interface AdminPortalViewProps {
  onLogout: () => void;
  onOpenGuide: () => void;
}

type AdminTab = 
  | 'dashboard'
  | 'verification'
  | 'voters'
  | 'positions'
  | 'candidates'
  | 'monitoring'
  | 'results'
  | 'certification'
  | 'audit'
  | 'settings';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onLogout, onOpenGuide }) => {
  const {
    status,
    adminName,
    adminEmail,
    adminAvatarUrl,
    updateAdminProfile,
    commissionMembers,
    updateCommissionMembers,
    endTime,
    durationMinutes,
    resultsStatus,
    publishResults,
    adminRequest,
    setElectionStatus,
    setElectionDuration,
    voters,
    candidates,
    positions,
    auditLogs,
    departmentStats,
    totalEligible,
    totalBallotsCast,
    turnoutPercentage,
    addCandidate,
    addPosition,
    registerVoter,
    accreditVoter,
    rejectVoter,
    adjustCandidateVotes,
    deleteVoter,
    deletePosition,
    deleteCandidate,
    resetElectionData,
  } = useElection();

  const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');
  const API_BASE = configuredApiBase
    ? (configuredApiBase.endsWith('/api')
      ? configuredApiBase
      : `${configuredApiBase.replace(/\/election$/, '')}/api`)
    : '/api';
  const [activeTab, setActiveTab] = useState<AdminTab>('verification');
  const [voterSearch, setVoterSearch] = useState('');
  const [voterDeptFilter, setVoterDeptFilter] = useState<string>('ALL');
  const [showAddVoter, setShowAddVoter] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [newPositionDescription, setNewPositionDescription] = useState('');
  const [newPositionMaxSelections, setNewPositionMaxSelections] = useState(1);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [resultSearch, setResultSearch] = useState('');
  const [resultPositionFilter, setResultPositionFilter] = useState('ALL');
  const [profileName, setProfileName] = useState(adminName);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(adminAvatarUrl);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editableCommissionMembers, setEditableCommissionMembers] = useState(commissionMembers);
  const [savingCommissionMembers, setSavingCommissionMembers] = useState(false);
  const [commissionMembersDirty, setCommissionMembersDirty] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  useEffect(() => {
    setProfileName(adminName);
    setProfileAvatar(adminAvatarUrl);
    setIsEditingProfile(false);
  }, [adminName, adminAvatarUrl]);

  useEffect(() => {
    if (!commissionMembersDirty) {
      setEditableCommissionMembers(commissionMembers);
    }
  }, [commissionMembers, commissionMembersDirty]);

  const handleProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Choose a JPG, PNG, or WebP image.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        setProfileAvatar(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    const result = await updateAdminProfile(profileName, profileAvatar);
    setSavingProfile(false);
    showToast(result.success ? 'Administrator profile updated.' : result.message || 'Unable to update profile.', result.success ? 'success' : 'error');
  };

  const saveCommissionMembers = async () => {
    setSavingCommissionMembers(true);
    const result = await updateCommissionMembers(editableCommissionMembers);
    setSavingCommissionMembers(false);
    if (result.success) setCommissionMembersDirty(false);
    showToast(result.success ? 'Electoral Commission roster updated.' : result.message || 'Unable to update roster.', result.success ? 'success' : 'error');
  };

  // Voter Verification Specific State
  const [verifActiveTab, setVerifActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [verifSearch, setVerifSearch] = useState('');
  const [verifLevelFilter, setVerifLevelFilter] = useState<string>('ALL');
  const [verifDateFilter, setVerifDateFilter] = useState<string>('ALL');
  const [selectedReviewVoter, setSelectedReviewVoter] = useState<Voter | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Non-matching departmental registration record');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Review Voter Detail View State
  const [reviewChecklist, setReviewChecklist] = useState({
    nameMatches: true,
    matricMatches: true,
    docAuthentic: true,
    photoMatches: true,
    eligibilityMet: true,
  });
  const [viewerZoom, setViewerZoom] = useState(1);
  const [viewerRotation, setViewerRotation] = useState(0);
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Settings State
  const [adminReviewCompleted, setAdminReviewCompleted] = useState(false);
  // New Candidate Form State
  const [newCandName, setNewCandName] = useState('');
  const [newCandPosId, setNewCandPosId] = useState('');
  const [newCandDept, setNewCandDept] = useState<BMSDepartment>('Anatomy');
  const [newCandLevel, setNewCandLevel] = useState<AcademicLevel>('300L');
  const [newCandTagline, setNewCandTagline] = useState('');
  const [newCandPhoto, setNewCandPhoto] = useState('');
  const [newCandManifesto, setNewCandManifesto] = useState('');

  useEffect(() => {
    if (positions.length > 0 && !positions.some((position) => position.id === newCandPosId)) {
      setNewCandPosId(positions[0].id);
    }
  }, [positions, newCandPosId]);

  // New Voter Form State
  const [newVoterName, setNewVoterName] = useState('');
  const [newVoterMatric, setNewVoterMatric] = useState('');
  const [newVoterDept, setNewVoterDept] = useState<BMSDepartment>('Anatomy');
  const [newVoterLevel, setNewVoterLevel] = useState<AcademicLevel>('300L');
  const [newVoterIdCard, setNewVoterIdCard] = useState('');
  const [isCreatingVoter, setIsCreatingVoter] = useState(false);
  const [liveAuditLogs, setLiveAuditLogs] = useState(auditLogs);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditDateFilter, setAuditDateFilter] = useState('Any Date');
  const [auditAdminFilter, setAuditAdminFilter] = useState('All Admins');
  const [auditActionFilter, setAuditActionFilter] = useState('All Actions');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('All Severities');

  const auditSeverity = (category: string) => category === 'SECURITY' ? 'Critical' : category === 'SYSTEM' ? 'Warning' : 'Information';

  // Certification state
  const [certificationData, setCertificationData] = useState<any>(null);
  const [certifyConfirmCheckbox, setCertifyConfirmCheckbox] = useState(false);
  const [isCertifying, setIsCertifying] = useState(false);
  const [certificationLoading, setCertificationLoading] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [showManualResults, setShowManualResults] = useState(false);
  const [importRows, setImportRows] = useState<Array<{ position: string; candidate: string; votes: number | null; error?: string }>>([]);
  const [importFileName, setImportFileName] = useState('');
  const [manualPositionId, setManualPositionId] = useState(positions[0]?.id || '');
  const [manualVotes, setManualVotes] = useState<Record<string, string>>({});
  const [clockNow, setClockNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remainingSeconds = status === 'LIVE' && endTime
    ? Math.max(0, Math.floor((new Date(endTime).getTime() - clockNow) / 1000))
    : 0;
  const remainingTime = `${String(Math.floor(remainingSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  // Stats calculation
  const approvedVotersCount = voters.filter(v => v.isAccredited && v.verificationStatus !== 'rejected').length;
  const pendingVotersCount = voters.filter(v => (!v.isAccredited && v.verificationStatus !== 'rejected') || v.verificationStatus === 'pending').length;
  const rejectedVotersCount = voters.filter(v => v.verificationStatus === 'rejected').length;
  const totalSubmissionsCount = voters.length;

  const displayPendingCount = pendingVotersCount;
  const displayApprovedCount = approvedVotersCount;
  const displayRejectedCount = rejectedVotersCount;
  const displayTotalCount = totalSubmissionsCount;
  const totalRegisteredCount = totalSubmissionsCount;

  const approvedPct = totalSubmissionsCount > 0 ? Math.round((approvedVotersCount / totalSubmissionsCount) * 100) : 0;
  const pendingPct = totalSubmissionsCount > 0 ? Math.round((pendingVotersCount / totalSubmissionsCount) * 100) : 0;
  const rejectedPct = totalSubmissionsCount > 0 ? Math.max(0, 100 - approvedPct - pendingPct) : 0;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  const handleApproveVoter = async (voter: Voter) => {
    const res = await accreditVoter(voter.matricNumber);
    if (res.success) {
      showToast(`Accreditation approved for ${voter.fullName}. Official 4-digit voting PIN issued.`, 'success');
      setSelectedReviewVoter((prev) => prev ? { ...prev, isAccredited: true, verificationStatus: 'approved', voterPin: res.pin || '4021' } : null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRejectVoter = async (voter: Voter) => {
    const res = await rejectVoter(voter.matricNumber, rejectionReasonInput);
    if (res.success) {
      showToast(`Accreditation submission for ${voter.fullName} has been rejected.`, 'info');
      setShowRejectionModal(false);
      setSelectedReviewVoter((prev) => prev ? { ...prev, isAccredited: false, verificationStatus: 'rejected', rejectionReason: rejectionReasonInput } : null);
    }
  };

  const handleDeleteVoter = async (voter: Voter) => {
    if (!window.confirm(`Delete voter ${voter.fullName}? This removes the voter from the registry.`)) return;
    const result = await deleteVoter(voter.id);
    showToast(result.success ? `Voter ${voter.fullName} deleted.` : result.message || 'Unable to delete voter.', result.success ? 'success' : 'error');
  };

  const handleDeletePosition = async (position: ElectionPosition) => {
    if (!window.confirm(`Delete position ${position.title}? Positions with candidates cannot be deleted.`)) return;
    const result = await deletePosition(position.id);
    showToast(result.success ? `Position ${position.title} deleted.` : result.message || 'Unable to delete position.', result.success ? 'success' : 'error');
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    if (!window.confirm(`Delete candidate ${candidate.fullName}? This action cannot be undone.`)) return;
    const result = await deleteCandidate(candidate.id);
    showToast(result.success ? `Candidate ${candidate.fullName} deleted.` : result.message || 'Unable to delete candidate.', result.success ? 'success' : 'error');
  };

  // Certification handlers
  const fetchCertificationData = async () => {
    setCertificationLoading(true);
    try {
      const response = await adminRequest(`${API_BASE}/admin/certification-readiness`);
      if (response.ok) {
        const data = await response.json();
        setCertificationData(data);
      }
    } catch (error) {
      console.error('Error fetching certification data:', error);
    }
    setCertificationLoading(false);
  };

  const handleReviewPosition = async (positionId: string) => {
    try {
      const response = await adminRequest(`${API_BASE}/admin/review-position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId })
      });
      if (response.ok) {
        showToast(`Position reviewed successfully.`, 'success');
        await fetchCertificationData();
      }
    } catch (error) {
      console.error('Error reviewing position:', error);
      showToast('Error reviewing position.', 'error');
    }
  };

  const handleCertifyElection = async () => {
    if (!certifyConfirmCheckbox) return;
    setIsCertifying(true);
    try {
      const response = await adminRequest(`${API_BASE}/admin/approve-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        showToast('Election certified successfully. Results now published.', 'success');
        setElectionStatus('CERTIFIED');
        await fetchCertificationData();
        setCertifyConfirmCheckbox(false);
      } else {
        showToast('Error certifying election.', 'error');
      }
    } catch (error) {
      console.error('Error certifying election:', error);
      showToast('Error certifying election.', 'error');
    }
    setIsCertifying(false);
  };

  // Fetch certification data when tab changes
  useEffect(() => {
    if (activeTab !== 'certification') return;
    fetchCertificationData();
    const interval = window.setInterval(fetchCertificationData, 5000);
    return () => window.clearInterval(interval);
  }, [activeTab]);

  const filteredAuditLogs = liveAuditLogs.filter((log) => {
    const query = auditSearch.trim().toLowerCase();
    const matchesSearch = !query || [log.id, log.actor, log.action, log.category, log.details || ''].some((value) => value.toLowerCase().includes(query));
    const matchesAdmin = auditAdminFilter === 'All Admins' || log.actor === auditAdminFilter;
    const matchesAction = auditActionFilter === 'All Actions' || log.action === auditActionFilter;
    const matchesSeverity = auditSeverityFilter === 'All Severities' || auditSeverity(log.category) === auditSeverityFilter;
    const timestamp = new Date(log.timestamp).getTime();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const matchesDate = auditDateFilter === 'Any Date'
      || (auditDateFilter === 'Today' && timestamp >= startOfToday)
      || (auditDateFilter === 'Last 7 Days' && timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000);
    return matchesSearch && matchesAdmin && matchesAction && matchesSeverity && matchesDate;
  });

  const auditAdmins = Array.from(new Set(liveAuditLogs.map((log) => log.actor)));
  const auditActions = Array.from(new Set(liveAuditLogs.map((log) => log.action)));
  const readinessStatus = certificationData?.status || status;
  const totalCertificationPositions = certificationData?.totalPositions || 0;
  const reviewedCertificationPositions = certificationData?.reviewedPositions || 0;
  const allPositionsReviewed = totalCertificationPositions > 0 && reviewedCertificationPositions === totalCertificationPositions;
  const electionClosedForCertification = readinessStatus === 'CLOSED' || readinessStatus === 'CERTIFIED';
  const certificationUnlocked = electionClosedForCertification && allPositionsReviewed && certifyConfirmCheckbox && readinessStatus !== 'CERTIFIED';

  // Filtered Verification Table List
  const filteredVerificationVoters = voters.filter((v) => {
    // Tab filter
    if (verifActiveTab === 'pending') {
      const isPending = (!v.isAccredited && v.verificationStatus !== 'rejected') || v.verificationStatus === 'pending';
      if (!isPending) return false;
    } else if (verifActiveTab === 'approved') {
      const isApproved = v.isAccredited && v.verificationStatus !== 'rejected';
      if (!isApproved) return false;
    } else if (verifActiveTab === 'rejected') {
      if (v.verificationStatus !== 'rejected') return false;
    }

    // Search query
    const query = verifSearch.trim().toLowerCase();
    if (query) {
      const matches =
        v.fullName.toLowerCase().includes(query) ||
        v.matricNumber.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query) ||
        v.department.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Level filter
    if (verifLevelFilter !== 'ALL' && v.level !== verifLevelFilter) {
      return false;
    }

    return true;
  });

  const exportVotersCSV = () => {
    const headers = 'Matric Number,Full Name,Email,Department,Level,Phone,Registration Date,Status\n';
    const rows = voters
      .map((v) => {
        const statusText = v.verificationStatus === 'rejected'
          ? 'Rejected'
          : v.isAccredited
          ? 'Approved'
          : 'Pending Review';
        return `"${v.matricNumber}","${v.fullName}","${v.email || ''}","${v.department}","${v.level}","${v.phone || ''}","${v.registeredAt || 'Oct 12, 2026'}","${statusText}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BAMSSA_Voter_Verification_Records_${Date.now()}.csv`;
    a.click();
    showToast('Voter verification database exported to CSV successfully.', 'success');
  };

  const filteredVoters = voters.filter((v) => {
    const matchesSearch = 
      v.fullName.toLowerCase().includes(voterSearch.toLowerCase()) ||
      v.matricNumber.toLowerCase().includes(voterSearch.toLowerCase()) ||
      v.department.toLowerCase().includes(voterSearch.toLowerCase());
    const matchesDept = voterDeptFilter === 'ALL' || v.department === voterDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleStatusChange = (newStatus: ElectionStatus) => {
    setElectionStatus(newStatus);
  };

  const handleResultsFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('The results file must be 10 MB or smaller.', 'error');
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const parsed = rows.map((row) => {
        const position = String(row.Position || row.position || '').trim();
        const candidate = String(row.Candidate || row.candidate || '').trim();
        const rawVotes = row.Votes ?? row.votes;
        const votes = rawVotes === '' || rawVotes === undefined ? null : Number(rawVotes);
        const positionExists = positions.some((item) => item.title.toLowerCase() === position.toLowerCase());
        const candidateExists = candidates.some((item) => item.fullName.toLowerCase() === candidate.toLowerCase() && positions.find((positionItem) => positionItem.id === item.positionId)?.title.toLowerCase() === position.toLowerCase());
        let error = !positionExists ? 'Position does not exist.' : !candidateExists ? 'Candidate does not belong to this position.' : votes === null || !Number.isInteger(votes) || votes < 0 ? 'Vote count must be a non-negative whole number.' : undefined;
        return { position, candidate, votes: Number.isNaN(votes as number) ? null : votes, error };
      });
      setImportFileName(file.name);
      setImportRows(parsed);
      setShowImportResults(true);
    } catch {
      showToast('Unable to read this results file.', 'error');
    }
    event.target.value = '';
  };

  const commitImportedResults = async () => {
    if (!importRows.length || importRows.some((row) => row.error)) return;
    for (const row of importRows) {
      const position = positions.find((item) => item.title.toLowerCase() === row.position.toLowerCase());
      const candidate = candidates.find((item) => item.fullName.toLowerCase() === row.candidate.toLowerCase() && item.positionId === position?.id);
      if (candidate && row.votes !== null) await adjustCandidateVotes(candidate.id, row.votes - candidate.votesCount);
    }
    setShowImportResults(false);
    showToast('Valid results imported successfully.', 'success');
  };

  const openManualResults = () => {
    const position = positions.find((item) => item.id === manualPositionId) || positions[0];
    if (position) {
      setManualPositionId(position.id);
      setManualVotes(Object.fromEntries(candidates.filter((candidate) => candidate.positionId === position.id).map((candidate) => [candidate.id, String(candidate.votesCount)])));
    }
    setShowManualResults(true);
  };

  const saveManualResults = async () => {
    for (const candidate of candidates.filter((item) => item.positionId === manualPositionId)) {
      const nextValue = Math.max(0, Number(manualVotes[candidate.id] || 0));
      await adjustCandidateVotes(candidate.id, nextValue - candidate.votesCount);
    }
    setShowManualResults(false);
    showToast('Position results saved successfully.', 'success');
  };

  const handlePublishResults = async () => {
    const result = await publishResults();
    showToast(result.success ? 'Results are now visible to students.' : result.message || 'Unable to publish results.', result.success ? 'success' : 'error');
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionTitle.trim()) return;

    await addPosition({
      title: newPositionTitle.trim(),
      description: newPositionDescription.trim() || 'New contested office for the BAMSSA election.',
      maxSelections: Number(newPositionMaxSelections) || 1,
    });

    setNewPositionTitle('');
    setNewPositionDescription('');
    setNewPositionMaxSelections(1);
    setShowAddPosition(false);
  };

  const handleCandidatePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file for the candidate photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setNewCandPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim() || !newCandPosId) {
      showToast('Enter a candidate name and choose a valid position.', 'error');
      return;
    }

    await addCandidate({
      fullName: newCandName,
      positionId: newCandPosId,
      department: newCandDept,
      level: newCandLevel,
      tagline: newCandTagline || 'Dedicated to student welfare and academic excellence.',
      photoUrl: newCandPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      manifesto: newCandManifesto ? newCandManifesto.split('\n').filter(Boolean) : ['Promote academic conferences and research workshops.'],
      cgpaRange: '4.50 – 5.00 First Class',
    });

    setNewCandName('');
    setNewCandTagline('');
    setNewCandPhoto('');
    setNewCandManifesto('');
    setShowAddCandidate(false);
    showToast(`${newCandName} was added to ${positions.find((position) => position.id === newCandPosId)?.title || 'the selected position'}.`, 'success');
  };

  const handleCreateVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoterName.trim() || !newVoterMatric.trim() || !newVoterIdCard) {
      showToast('Enter the voter details and upload a student ID or course form.', 'error');
      return;
    }

    setIsCreatingVoter(true);
    const voter = await registerVoter({
      fullName: newVoterName,
      matricNumber: newVoterMatric,
      department: newVoterDept,
      level: newVoterLevel,
      email: `${newVoterMatric.toLowerCase().replace('/', '')}@uniport.edu.ng`,
      phone: '+234 800 000 0000',
      idCardUrl: newVoterIdCard,
    });
    setIsCreatingVoter(false);
    if (!voter) {
      showToast('Voter registration was rejected by the backend.', 'error');
      return;
    }

    setNewVoterName('');
    setNewVoterMatric('');
    setNewVoterIdCard('');
    setShowAddVoter(false);
    showToast(`${newVoterName} was enrolled and is awaiting approval.`, 'success');
  };

  const handleVoterIdCard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showToast('Choose a JPG, PNG, or WebP image under 5 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewVoterIdCard(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const exportAuditCSV = () => {
    const headers = 'ID,Timestamp,Actor,Action,Category,ReceiptHash,Details\n';
    const rows = liveAuditLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actor}","${l.action}","${l.category}","${l.encryptedHash}","${l.details || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BAMSSA_ELECO_Audit_Log_${Date.now()}.csv`;
    a.click();
  };

  useEffect(() => {
    setLiveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    if (activeTab !== 'audit') return;

    let cancelled = false;
    const refreshAuditLogs = async () => {
      try {
        const response = await adminRequest('/api/election');
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setLiveAuditLogs((data.audit_logs || []).map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp,
            action: log.action,
            actor: log.actor,
            encryptedHash: log.encrypted_hash || '',
            category: log.category,
            details: log.details,
          })));
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    };

    refreshAuditLogs();
    const interval = window.setInterval(refreshAuditLogs, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeTab]);

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'verification', label: 'Voter Verification', icon: UserCheck },
    { id: 'voters', label: 'Voters', icon: Users },
    { id: 'positions', label: 'Positions', icon: ListOrdered },
    { id: 'candidates', label: 'Candidates', icon: UserPlus },
    { id: 'monitoring', label: 'Monitoring', icon: BarChart3 },
    { id: 'results', label: 'Results Management', icon: Vote },
    { id: 'certification', label: 'Certification', icon: Award },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen text-[#131b2e] antialiased font-sans">
      
      {/* SideNavBar (Desktop & Mobile Drawer) */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-[80px]' : 'w-[270px]'} bg-[#faf8ff] border-r border-[#c2c6d5] flex flex-col py-5 px-3 fixed left-0 top-0 h-screen z-50 transition-all duration-300 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className={`mb-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-3'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#c2c6d5] flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <img
                src="/assets/nreerety-removebg-preview.png"
                alt="BAMSSA logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-base font-extrabold text-[#003f93] tracking-tight leading-tight whitespace-nowrap">
                  FABAMSSA ELECO
                </h1>
                <p className="text-[11px] font-semibold text-[#424653] uppercase tracking-wider whitespace-nowrap">
                  Administrative Portal
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items List */}
        <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'} rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#d9e2ff] text-[#003f93] shadow-xs'
                      : 'text-[#424653] hover:bg-[#eaedff] hover:text-[#131b2e]'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#003f93]' : 'text-[#737785]'}`} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Bottom Menu Items */}
        <div className={`mt-auto border-t border-[#c2c6d5] pt-3 space-y-2 ${isSidebarCollapsed ? 'px-0' : ''}`}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setMobileNavOpen(false);
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#d9e2ff] text-[#003f93]'
                : 'text-[#424653] hover:bg-[#eaedff]'
            }`}
            title={isSidebarCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 text-[#737785]" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors text-left cursor-pointer`}
            title={isSidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full hidden lg:flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-3.5 py-2'} rounded-xl text-xs font-bold text-[#424653] hover:bg-[#eaedff] transition-colors text-left cursor-pointer mt-2`}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileNavOpen && (
        <div 
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[270px]'}`}>
        
        {/* TopAppBar */}
        <header className="bg-white border-b border-[#c2c6d5] sticky top-0 z-30 flex justify-between items-center px-4 sm:px-6 py-3 shadow-2xs">
          
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-[#424653] hover:bg-[#f2f3ff]"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            
            {activeTab === 'verification' ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#424653]">
                <h2 className="text-base sm:text-lg font-bold text-[#003f93] hidden lg:block mr-2">
                  Administrative Portal
                </h2>
                <div className="h-4 w-px bg-[#c2c6d5] mx-1 hidden lg:block"></div>
                <button
                  type="button"
                  onClick={() => setSelectedReviewVoter(null)}
                  className="hover:text-[#003f93] transition-colors cursor-pointer"
                >
                  Voters
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#737785]" />
                <button
                  type="button"
                  onClick={() => setSelectedReviewVoter(null)}
                  className={`hover:text-[#003f93] transition-colors cursor-pointer ${
                    !selectedReviewVoter ? 'text-[#003f93] font-bold' : ''
                  }`}
                >
                  Verification
                </button>
                {selectedReviewVoter && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-[#737785]" />
                    <span className="text-[#131b2e] font-bold">Review Voter</span>
                  </>
                )}
              </div>
            ) : (
              <h2 className="text-base sm:text-lg font-bold text-[#003f93]">
                FABAMSSA Administrative Portal
              </h2>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Status Pill Badge */}
            <div className="flex items-center bg-[#F1F5F9] rounded-full px-3 py-1 border border-[#E2E8F0] select-none">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                status === 'LIVE' ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#475569]'
              }`}></span>
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                {status === 'LIVE' ? 'LIVE' : status}
              </span>
            </div>

            {/* Icons */}
            <div className="hidden sm:flex items-center gap-2 text-[#424653]">
              <button 
                type="button"
                className="p-1.5 rounded-full hover:bg-[#f2f3ff] hover:text-[#003f93] transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button 
                type="button"
                className="p-1.5 rounded-full hover:bg-[#f2f3ff] hover:text-[#003f93] transition-colors cursor-pointer"
                  title="Open admin guide"
                  onClick={onOpenGuide}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Profile Area */}
            <div className="flex items-center gap-2.5 border-l border-[#c2c6d5] pl-3 sm:pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#003f93]">{adminName}</p>
                <p className="text-[10px] text-[#424653] font-semibold">ELECO Admin</p>
              </div>
              <img
                src={adminAvatarUrl || '/assets/nreerety-removebg-preview.png'}
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full border border-[#c2c6d5] object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] w-full mx-auto space-y-6">

          {/* TAB 1: DASHBOARD (Matching the User Design Screenshot Exactly) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Welcome Area */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                  Good morning, {adminName}.
                </h1>
                <p className="text-sm sm:text-base text-[#424653] mt-1">
                  Here's the current overview of the FABAMSSA 2026 election.
                </p>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Left Column (8 of 12 cols on desktop) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Primary Election Status Card */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border border-[#E2E8F0] shadow-xs">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#d9e2ff] opacity-25 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 relative z-10">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#131b2e] mb-1.5">
                          FABAMSSA General Elections 2026
                        </h2>
                        <p className="text-xs sm:text-sm text-[#424653] flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-[#737785]" />
                            <span>4 September 2026</span>
                          </span>
                          <span className="text-[#c2c6d5]">|</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-[#737785]" />
                            <span>8:00 AM — 4:00 PM</span>
                          </span>
                        </p>
                      </div>

                      <div className="bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] px-3 py-1 rounded-full flex items-center gap-1.5 self-start select-none">
                        <span className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-[#ba1a1a] animate-pulse' : 'bg-[#475569]'}`}></span>
                        <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                      <div>
                        <p className="text-xs font-bold text-[#737785] uppercase tracking-wider mb-1">
                          Time Remaining
                        </p>
                        <p className="text-4xl sm:text-5xl font-extrabold text-[#003f93] tracking-tight">
                          {status === 'LIVE' ? remainingTime : status === 'CLOSED' ? 'Voting closed' : 'Not started'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('settings')}
                          className="bg-[#0055c2] hover:bg-[#003f93] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Election Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metric Grid (Bento Style) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    
                    {/* Card 1: Eligible Voters */}
                    <div className="bg-white/95 rounded-xl p-4 sm:p-5 flex flex-col border border-[#E2E8F0] shadow-xs">
                      <Users className="w-5 h-5 text-[#003f93] mb-3" />
                      <p className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
                        {totalEligible.toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-[#424653] mt-1">Eligible Voters</p>
                      <p className="text-[10px] text-[#737785] mt-auto pt-2">(Approved accounts)</p>
                    </div>

                    {/* Card 2: Pending Verification */}
                    <div className="bg-white/95 rounded-xl p-4 sm:p-5 flex flex-col border border-[#E2E8F0] border-l-4 border-l-[#F59E0B] shadow-xs">
                      <Clock className="w-5 h-5 text-[#F59E0B] mb-3" />
                      <p className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
                        {pendingVotersCount}
                      </p>
                      <p className="text-xs font-bold text-[#424653] mt-1">Pending Verification</p>
                      <p className="text-[10px] text-[#92400E] font-medium mt-auto pt-2">Awaiting review</p>
                    </div>

                    {/* Card 3: Candidates */}
                    <div className="bg-white/95 rounded-xl p-4 sm:p-5 flex flex-col border border-[#E2E8F0] shadow-xs">
                      <Vote className="w-5 h-5 text-[#003f93] mb-3" />
                      <p className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
                        {candidates.length}
                      </p>
                      <p className="text-xs font-bold text-[#424653] mt-1">Candidates</p>
                      <p className="text-[10px] text-[#737785] mt-auto pt-2">(Approved)</p>
                    </div>

                    {/* Card 4: Positions */}
                    <div className="bg-white/95 rounded-xl p-4 sm:p-5 flex flex-col border border-[#E2E8F0] shadow-xs">
                      <ListOrdered className="w-5 h-5 text-[#003f93] mb-3" />
                      <p className="text-2xl sm:text-3xl font-extrabold text-[#131b2e]">
                        {positions.length}
                      </p>
                      <p className="text-xs font-bold text-[#424653] mt-1">Positions</p>
                      <p className="text-[10px] text-[#737785] mt-auto pt-2">(Configured)</p>
                    </div>

                  </div>

                  {/* Voter Accreditation Summary */}
                  <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base sm:text-lg font-bold text-[#131b2e]">
                        Voter Accreditation
                      </h3>
                      <button 
                        type="button"
                        onClick={() => setActiveTab('verification')}
                        className="text-[#003f93] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stats summary legend */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-[#003f93]" />
                        <span>Approved: <strong>{approvedVotersCount.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-[#FEF3C7] border border-[#F59E0B]" />
                        <span>Pending: <strong>{pendingVotersCount.toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-xs bg-[#DC2626]" />
                        <span>Rejected: <strong>{rejectedVotersCount}</strong></span>
                      </div>
                    </div>

                    {/* Segmented Multi-Color Progress Bar */}
                    <div className="w-full h-3.5 bg-[#e2e7ff] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#003f93] transition-all duration-700" style={{ width: `${approvedPct}%` }} />
                      <div className="h-full bg-[#F59E0B] transition-all duration-700" style={{ width: `${pendingPct}%` }} />
                      <div className="h-full bg-[#DC2626] transition-all duration-700" style={{ width: `${rejectedPct}%` }} />
                    </div>

                    <p className="text-xs text-right text-[#737785]">
                      Total Registered: {totalRegisteredCount.toLocaleString()}
                    </p>
                  </div>

                </div>

                {/* Right Column (4 of 12 cols on desktop) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Quick Actions */}
                  <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                    <h3 className="text-base font-bold text-[#131b2e]">
                      Quick Actions
                    </h3>
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('verification')}
                        className="w-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#131b2e] font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                      >
                        <UserCheck className="w-4 h-4 text-[#003f93]" />
                        <span>Review Voters</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('candidates')}
                        className="w-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#131b2e] font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                      >
                        <UserPlus className="w-4 h-4 text-[#003f93]" />
                        <span>Manage Candidates</span>
                      </button>
                    </div>
                  </div>

                  {/* Readiness Checklist */}
                  <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                    <h3 className="text-base font-bold text-[#131b2e] border-b border-[#c2c6d5]/50 pb-2.5">
                      Readiness Checklist
                    </h3>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#131b2e]">Election Details</p>
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#131b2e]">Positions Configured</p>
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#131b2e]">Candidates Approved</p>
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#131b2e]">Window Scheduling</p>
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5 cursor-pointer" onClick={() => setAdminReviewCompleted(!adminReviewCompleted)}>
                        {adminReviewCompleted ? (
                          <CheckCircle className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#475569] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#131b2e]">Final Admin Review</p>
                          <p className="text-[11px] text-[#475569]">
                            {adminReviewCompleted ? 'Completed' : 'Pending completion'}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Election Turnout Card */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] text-center border-2 border-dashed border-[#c2c6d5] space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#131b2e]">
                      Election Turnout
                    </h3>
                    <p className="text-4xl sm:text-5xl font-extrabold text-[#003f93] leading-none">
                      {status === 'LIVE' ? `${turnoutPercentage}%` : '—'}
                    </p>
                    <p className="text-xs text-[#737785]">
                      {status === 'LIVE' 
                        ? `${totalBallotsCast} ballots cast so far` 
                        : 'Data will appear when voting begins.'}
                    </p>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: VOTER VERIFICATION QUEUE & REVIEW DETAIL */}
          {activeTab === 'verification' && (
            <div className="space-y-6">

              {/* ─── REVIEW VOTER DETAIL VIEW ─── */}
              {selectedReviewVoter ? (
                <div className="space-y-6">

                  {/* Page Header */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReviewVoter(null);
                        setReviewNotes('');
                        setReviewChecklist({ nameMatches: true, matricMatches: true, docAuthentic: true, photoMatches: true, eligibilityMet: true });
                        setViewerZoom(1);
                        setViewerRotation(0);
                      }}
                      className="inline-flex items-center gap-1.5 text-[#0055c2] text-xs font-bold hover:underline mb-3 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Verification Queue
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">Review Voter</h2>
                        {selectedReviewVoter.verificationStatus === 'rejected' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#93000a] border border-[#ffb4ab] uppercase tracking-wider">Rejected</span>
                        ) : selectedReviewVoter.isAccredited ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d9e2ff] text-[#003f93] border border-[#adc6ff] uppercase tracking-wider">Approved</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] uppercase tracking-wider">Pending Review</span>
                        )}
                      </div>
                      <div className="text-[#737785] text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted: {selectedReviewVoter.registeredAt || 'Oct 24, 2026, 14:30 WAT'}
                      </div>
                    </div>
                  </div>

                  {/* Workspace Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-5 space-y-5">

                      {/* Voter Information Card */}
                      <section className="bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-[#131b2e] border-b border-[#eaedff] pb-3 mb-4 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#0055c2]" />
                          Voter Information
                        </h3>
                        <dl className="space-y-4 text-sm">
                          <div>
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#737785] mb-0.5">Full Name</dt>
                            <dd className="font-bold text-[#131b2e]">{selectedReviewVoter.fullName}</dd>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#737785] mb-0.5">Matric No</dt>
                              <dd className="font-bold font-mono text-[#131b2e]">{selectedReviewVoter.matricNumber}</dd>
                            </div>
                            <div>
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#737785] mb-0.5">Level</dt>
                              <dd className="font-bold text-[#131b2e]">{selectedReviewVoter.level}</dd>
                            </div>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#737785] mb-0.5">Email</dt>
                            <dd className="text-[#424653]">{selectedReviewVoter.email || `${selectedReviewVoter.matricNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@uniport.edu.ng`}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#737785] mb-0.5">Department</dt>
                            <dd className="text-[#424653]">{selectedReviewVoter.department}</dd>
                          </div>
                        </dl>
                      </section>

                      {/* Approved PIN Badge (if applicable) */}
                      {selectedReviewVoter.isAccredited && (
                        <div className="p-4 bg-[#d9e2ff]/50 border border-[#adc6ff] rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#003f93] block">Official 4-Digit Voting PIN</span>
                            <span className="text-2xl font-mono font-extrabold text-[#003f93] tracking-widest mt-0.5 block">{selectedReviewVoter.voterPin || '4021'}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-[#0055c2] text-white px-3 py-1.5 rounded-lg">Accredited</span>
                        </div>
                      )}

                      {/* Rejection notice */}
                      {selectedReviewVoter.verificationStatus === 'rejected' && (
                        <div className="p-4 bg-[#ffdad6]/40 border border-[#ffdad6] rounded-xl text-xs space-y-1">
                          <span className="font-bold text-[#93000a] block">Rejection Reason:</span>
                          <p className="text-[#424653]">{selectedReviewVoter.rejectionReason || 'Non-matching departmental registration record'}</p>
                        </div>
                      )}

                      {/* Verification Checklist */}
                      <section className="bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-xs">
                        <h3 className="text-sm font-bold text-[#131b2e] border-b border-[#eaedff] pb-3 mb-4 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-[#0055c2]" />
                          Verification Checklist
                        </h3>
                        <fieldset className="space-y-3 text-xs">
                          {([
                            { key: 'nameMatches' as const, label: 'Name on ID matches registration' },
                            { key: 'matricMatches' as const, label: 'Matric No. on ID matches registration' },
                            { key: 'docAuthentic' as const, label: 'Identification document appears valid/authentic' },
                            { key: 'photoMatches' as const, label: 'Photo matches student profile' },
                            { key: 'eligibilityMet' as const, label: 'Student meets eligibility criteria for FABAMSSA' },
                          ]).map(({ key, label }) => (
                            <label key={key} className="flex items-start gap-2.5 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={reviewChecklist[key]}
                                onChange={(e) => setReviewChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="mt-0.5 h-4 w-4 rounded border-[#c2c6d5] text-[#0055c2] focus:ring-[#003f93] cursor-pointer"
                              />
                              <span className="text-[#424653] group-hover:text-[#131b2e] transition-colors leading-snug">{label}</span>
                            </label>
                          ))}
                        </fieldset>
                      </section>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-7 space-y-5 flex flex-col">

                      {/* Document Viewer */}
                      <section className="bg-white border border-[#c2c6d5] rounded-xl flex-1 flex flex-col shadow-xs overflow-hidden">
                        {/* Viewer Toolbar */}
                        <div className="bg-[#f2f3ff] border-b border-[#c2c6d5] px-4 py-2.5 flex justify-between items-center">
                          <div className="text-xs font-bold text-[#131b2e] flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-[#0055c2]" />
                            Student ID Card
                          </div>
                          <div className="flex items-center gap-1 text-[#424653]">
                            <button
                              type="button"
                              onClick={() => setViewerZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                              className="p-1.5 hover:bg-[#eaedff] rounded-md transition-colors cursor-pointer"
                              title="Zoom Out"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-[#737785] w-8 text-center">{Math.round(viewerZoom * 100)}%</span>
                            <button
                              type="button"
                              onClick={() => setViewerZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
                              className="p-1.5 hover:bg-[#eaedff] rounded-md transition-colors cursor-pointer"
                              title="Zoom In"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-[#c2c6d5] mx-1" />
                            <button
                              type="button"
                              onClick={() => setViewerRotation(r => (r + 90) % 360)}
                              className="p-1.5 hover:bg-[#eaedff] rounded-md transition-colors cursor-pointer"
                              title="Rotate"
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsViewerFullscreen(v => !v)}
                              className="p-1.5 hover:bg-[#eaedff] rounded-md transition-colors cursor-pointer"
                              title="Expand"
                            >
                              {isViewerFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Image Container */}
                        <div className={`bg-[#dae2fd]/40 flex items-center justify-center relative overflow-hidden transition-all ${
                          isViewerFullscreen ? 'fixed inset-0 z-60 bg-black/80' : 'min-h-[320px] flex-1'
                        }`}>
                          {isViewerFullscreen && (
                            <button
                              type="button"
                              onClick={() => setIsViewerFullscreen(false)}
                              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors z-10"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                          {/* Quality Badge */}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur border border-[#c2c6d5] rounded-md px-2 py-1 flex items-center gap-1 text-[10px] font-bold text-[#1E40AF]">
                            <CheckCircle className="w-3 h-3" />
                            High Quality Scan
                          </div>
                          {selectedReviewVoter.idCardUrl ? (
                            <img
                              src={selectedReviewVoter.idCardUrl}
                              alt={`${selectedReviewVoter.fullName} Student ID`}
                              className="max-w-full object-contain rounded-lg shadow border border-[#c2c6d5] bg-white transition-transform duration-200"
                              style={{
                                transform: `scale(${viewerZoom}) rotate(${viewerRotation}deg)`,
                                maxHeight: isViewerFullscreen ? '90vh' : '440px',
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 gap-3">
                              <div className="w-16 h-16 rounded-2xl bg-[#eaedff] flex items-center justify-center">
                                <FileCheck2 className="w-8 h-8 text-[#0055c2]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#131b2e]">No ID Card Uploaded</p>
                                <p className="text-xs text-[#737785] mt-0.5">The student did not submit an ID card document with this registration.</p>
                              </div>
                              {/* Demo placeholder card */}
                              <div className="mt-2 bg-white rounded-xl border-2 border-[#c2c6d5] p-5 shadow text-left max-w-xs w-full">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-14 h-14 rounded-lg bg-[#0055c2] text-white font-extrabold text-xl flex items-center justify-center shrink-0">
                                    {getInitials(selectedReviewVoter.fullName)}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-[#737785] uppercase tracking-wider">University of Port Harcourt</p>
                                    <p className="font-extrabold text-[#131b2e] text-sm leading-tight">{selectedReviewVoter.fullName}</p>
                                  </div>
                                </div>
                                <div className="space-y-1 text-[11px]">
                                  <div><span className="text-[#737785]">Matric No: </span><span className="font-bold font-mono text-[#003f93]">{selectedReviewVoter.matricNumber}</span></div>
                                  <div><span className="text-[#737785]">Level: </span><span className="font-bold">{selectedReviewVoter.level}</span></div>
                                  <div><span className="text-[#737785]">Department: </span><span className="font-bold">{selectedReviewVoter.department}</span></div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-[#eaedff]">
                                  <p className="text-[9px] font-bold text-[#737785] uppercase tracking-wider">Student ID Card · Generated Profile</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Review Notes */}
                      <section className="bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-xs">
                        <label htmlFor="review_notes_field" className="text-sm font-bold text-[#131b2e] mb-2 flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-[#0055c2]" />
                          Review Notes <span className="text-[10px] font-normal text-[#737785]">(Optional)</span>
                        </label>
                        <textarea
                          id="review_notes_field"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={3}
                          placeholder="Add any internal notes regarding this verification decision..."
                          className="w-full rounded-lg border border-[#c2c6d5] bg-[#faf8ff] p-3 text-xs text-[#131b2e] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all resize-none placeholder:text-[#737785] outline-none"
                        />
                      </section>

                      {/* Decision Buttons */}
                      <div className="bg-white border border-[#c2c6d5] rounded-xl p-4 shadow-xs flex items-center justify-end gap-3">
                        {selectedReviewVoter.verificationStatus !== 'approved' && !selectedReviewVoter.isAccredited && (
                          <button
                            type="button"
                            onClick={() => setShowRejectionModal(true)}
                            className="px-5 py-2.5 rounded-lg border border-[#c2c6d5] text-[#131b2e] text-xs font-bold hover:bg-[#ffdad6]/30 hover:border-[#ffdad6] hover:text-[#ba1a1a] transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Submission
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleApproveVoter(selectedReviewVoter)}
                          className="px-5 py-2.5 rounded-lg bg-[#0055c2] hover:bg-[#003f93] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          {selectedReviewVoter.isAccredited ? 'Re-Issue PIN' : 'Approve Voter'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audit Footer */}
                  <div className="border-t border-[#eaedff] pt-3 text-center">
                    <p className="text-[10px] text-[#737785]">
                      Registration ID: <span className="font-mono">{selectedReviewVoter.registrationId || `REG-2026-${selectedReviewVoter.id.slice(-4).toUpperCase()}`}</span> •{' '}
                      Action will be recorded in audit logs.
                    </p>
                  </div>

                </div>
              ) : (

              /* ─── VERIFICATION QUEUE (default view) ─── */
              <div className="space-y-6">
              
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                    Voter Verification
                  </h2>
                  <p className="text-xs sm:text-sm text-[#424653] mt-1 max-w-2xl">
                    Review registration submissions and accredit eligible students for the FABAMSSA General Elections 2026.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportVotersCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c2c6d5] rounded-lg text-[#131b2e] text-xs font-bold hover:bg-[#f2f3ff] transition-colors shadow-2xs w-fit cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#003f93]" />
                  <span>Export Records</span>
                </button>
              </div>

              {/* Summary Cards (4 Cards Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                
                {/* Pending Review */}
                <div className="bg-white p-5 rounded-xl border border-[#c2c6d5] shadow-xs flex flex-col justify-between min-h-[110px]">
                  <span className="text-xs font-semibold text-[#424653]">
                    Pending Review
                  </span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#92400E] leading-none mt-2">
                    {displayPendingCount.toLocaleString()}
                  </span>
                </div>

                {/* Approved */}
                <div className="bg-white p-5 rounded-xl border border-[#c2c6d5] shadow-xs flex flex-col justify-between min-h-[110px]">
                  <span className="text-xs font-semibold text-[#424653]">
                    Approved
                  </span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#003f93] leading-none mt-2">
                    {displayApprovedCount.toLocaleString()}
                  </span>
                </div>

                {/* Rejected */}
                <div className="bg-white p-5 rounded-xl border border-[#c2c6d5] shadow-xs flex flex-col justify-between min-h-[110px]">
                  <span className="text-xs font-semibold text-[#424653]">
                    Rejected
                  </span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#ba1a1a] leading-none mt-2">
                    {displayRejectedCount.toLocaleString()}
                  </span>
                </div>

                {/* Total Submissions */}
                <div className="bg-white p-5 rounded-xl border border-[#c2c6d5] shadow-xs flex flex-col justify-between min-h-[110px]">
                  <span className="text-xs font-semibold text-[#424653]">
                    Total Submissions
                  </span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#131b2e] leading-none mt-2">
                    {displayTotalCount.toLocaleString()}
                  </span>
                </div>

              </div>

              {/* Data Canvas Container */}
              <div className="bg-white rounded-xl border border-[#c2c6d5] shadow-xs overflow-hidden">
                
                {/* Tabs */}
                <div className="flex border-b border-[#c2c6d5] px-4 sm:px-6 pt-2 bg-white overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setVerifActiveTab('all')}
                    className={`px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      verifActiveTab === 'all'
                        ? 'text-[#003f93] border-b-2 border-[#003f93]'
                        : 'text-[#424653] hover:text-[#003f93]'
                    }`}
                  >
                    All ({displayTotalCount.toLocaleString()})
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifActiveTab('pending')}
                    className={`px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      verifActiveTab === 'pending'
                        ? 'text-[#003f93] border-b-2 border-[#003f93]'
                        : 'text-[#424653] hover:text-[#003f93]'
                    }`}
                  >
                    Pending ({displayPendingCount.toLocaleString()})
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifActiveTab('approved')}
                    className={`px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      verifActiveTab === 'approved'
                        ? 'text-[#003f93] border-b-2 border-[#003f93]'
                        : 'text-[#424653] hover:text-[#003f93]'
                    }`}
                  >
                    Approved ({displayApprovedCount.toLocaleString()})
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifActiveTab('rejected')}
                    className={`px-4 py-3 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      verifActiveTab === 'rejected'
                        ? 'text-[#003f93] border-b-2 border-[#003f93]'
                        : 'text-[#424653] hover:text-[#003f93]'
                    }`}
                  >
                    Rejected ({displayRejectedCount.toLocaleString()})
                  </button>
                </div>

                {/* Filters */}
                <div className="p-4 flex flex-wrap items-center gap-3 bg-[#eaedff]/30 border-b border-[#c2c6d5]">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737785]" />
                    <input
                      type="text"
                      value={verifSearch}
                      onChange={(e) => setVerifSearch(e.target.value)}
                      placeholder="Search by name, matric number or email..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#c2c6d5] rounded-lg text-xs font-medium text-[#131b2e] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all outline-hidden"
                    />
                  </div>

                  <select
                    value={verifLevelFilter}
                    onChange={(e) => setVerifLevelFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#c2c6d5] rounded-lg text-xs font-medium text-[#131b2e] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all cursor-pointer outline-hidden"
                  >
                    <option value="ALL">Level (All)</option>
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                  </select>

                  <select
                    value={verifDateFilter}
                    onChange={(e) => setVerifDateFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-[#c2c6d5] rounded-lg text-xs font-medium text-[#131b2e] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all cursor-pointer outline-hidden"
                  >
                    <option value="ALL">Registration Date</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                  </select>

                  {(verifSearch || verifLevelFilter !== 'ALL' || verifDateFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setVerifSearch('');
                        setVerifLevelFilter('ALL');
                        setVerifDateFilter('ALL');
                      }}
                      className="text-[#003f93] text-xs font-bold hover:underline px-2 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F1F5F9] border-b border-[#c2c6d5]">
                      <tr>
                        <th className="p-3.5 text-[11px] font-bold text-[#424653] uppercase tracking-wider">
                          VOTER
                        </th>
                        <th className="p-3.5 text-[11px] font-bold text-[#424653] uppercase tracking-wider">
                          MATRIC NUMBER
                        </th>
                        <th className="p-3.5 text-[11px] font-bold text-[#424653] uppercase tracking-wider">
                          LEVEL
                        </th>
                        <th className="p-3.5 text-[11px] font-bold text-[#424653] uppercase tracking-wider">
                          REGISTERED
                        </th>
                        <th className="p-3.5 text-[11px] font-bold text-[#424653] uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="p-3.5 text-[11px] font-bold text-[#424653] uppercase tracking-wider text-right">
                          ACTION
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#c2c6d5]/50">
                      {filteredVerificationVoters.map((voter) => {
                        const isPending = (!voter.isAccredited && voter.verificationStatus !== 'rejected') || voter.verificationStatus === 'pending';
                        const isRejected = voter.verificationStatus === 'rejected';
                        const isApproved = voter.isAccredited && !isRejected;

                        return (
                          <tr key={voter.id} className="hover:bg-[#faf8ff] transition-colors">
                            
                            {/* Voter */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#eaedff] flex items-center justify-center text-[#003f93] font-bold text-xs shrink-0">
                                  {getInitials(voter.fullName)}
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-[#131b2e] leading-tight">
                                    {voter.fullName}
                                  </p>
                                  <p className="text-[11px] text-[#424653]">
                                    {voter.email || `${voter.matricNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@bamssa.edu`}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Matric Number */}
                            <td className="p-3.5 text-xs font-semibold text-[#131b2e]">
                              {voter.matricNumber}
                            </td>

                            {/* Level */}
                            <td className="p-3.5 text-xs text-[#131b2e]">
                              {voter.level}
                            </td>

                            {/* Registered */}
                            <td className="p-3.5 text-xs text-[#424653]">
                              {voter.registeredAt || 'Oct 12, 10:42 AM'}
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              {isPending && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-[10px] uppercase tracking-wider">
                                  Pending Review
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#d9e2ff] text-[#003f93] font-bold text-[10px] uppercase tracking-wider">
                                  Approved
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] font-bold text-[10px] uppercase tracking-wider">
                                  Rejected
                                </span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedReviewVoter(voter)}
                                className="px-3.5 py-1.5 bg-[#0055c2] hover:bg-[#003f93] text-white rounded-md font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                              >
                                Review
                              </button>
                            </td>

                          </tr>
                        );
                      })}

                      {filteredVerificationVoters.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-[#737785]">
                            <CheckCircle2 className="w-10 h-10 text-[#0055c2] mx-auto opacity-70 mb-2" />
                            <p className="font-bold text-sm text-[#131b2e]">No Records Found</p>
                            <p className="text-xs mt-1">No student records match the active filter criteria.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-3.5 border-t border-[#c2c6d5] flex items-center justify-between bg-white">
                  <span className="text-xs text-[#424653]">
                    Showing 1–{filteredVerificationVoters.length} of {
                      verifActiveTab === 'pending'
                        ? `${displayPendingCount} pending voters`
                        : verifActiveTab === 'approved'
                        ? `${displayApprovedCount} approved voters`
                        : verifActiveTab === 'rejected'
                        ? `${displayRejectedCount} rejected voters`
                        : `${displayTotalCount} total voters`
                    }
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="p-1.5 rounded-md border border-[#c2c6d5] text-[#737785] opacity-50 cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-md border border-[#c2c6d5] text-[#131b2e] hover:bg-[#eaedff] cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
            )}
            </div>
          )}

          {/* TAB 3: VOTERS ROSTER */}
          {activeTab === 'voters' && (
            <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#131b2e]">
                    Voter Registry &amp; Accreditation
                  </h3>
                  <p className="text-xs text-[#737785]">
                    Authorized student voter database for Faculty of Basic Medical Sciences
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddVoter(!showAddVoter)}
                  className="bg-[#0055c2] hover:bg-[#003f93] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll New Student Voter</span>
                </button>
              </div>

              {/* Add Voter Form Accordion */}
              {showAddVoter && (
                <form onSubmit={handleCreateVoter} className="p-5 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl space-y-4">
                  <h4 className="text-sm font-bold text-[#131b2e]">Enroll Single Student Voter</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={newVoterName}
                        onChange={(e) => setNewVoterName(e.target.value)}
                        placeholder="e.g. John C. Doe"
                        className="w-full mt-1 px-3 py-2 text-xs border border-[#c2c6d5] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Matriculation Number</label>
                      <input
                        type="text"
                        required
                        value={newVoterMatric}
                        onChange={(e) => setNewVoterMatric(e.target.value)}
                        placeholder="e.g. U2021/5530999"
                        className="w-full mt-1 px-3 py-2 text-xs border border-[#c2c6d5] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Department</label>
                      <select
                        value={newVoterDept}
                        onChange={(e) => setNewVoterDept(e.target.value as BMSDepartment)}
                        className="w-full mt-1 px-3 py-2 text-xs border border-[#c2c6d5] rounded-lg bg-white"
                      >
                        <option value="Anatomy">Anatomy</option>
                        <option value="Psychology">Psychology</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Academic Level</label>
                      <select
                        value={newVoterLevel}
                        onChange={(e) => setNewVoterLevel(e.target.value as AcademicLevel)}
                        className="w-full mt-1 px-3 py-2 text-xs border border-[#c2c6d5] rounded-lg bg-white"
                      >
                        <option value="100L">100L</option>
                        <option value="200L">200L</option>
                        <option value="300L">300L</option>
                      </select>
                    </div>
                  </div>

                  <label className="block text-xs font-semibold text-[#424653]">
                    Student ID Card or Course Form
                    <input
                      type="file"
                      required
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleVoterIdCard}
                      className="w-full mt-1 px-3 py-2 text-xs border border-[#c2c6d5] rounded-lg bg-white"
                    />
                    <span className="mt-1 block text-[11px] font-normal text-[#737785]">JPG, PNG, or WebP up to 5 MB.</span>
                  </label>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVoter(false)}
                      className="px-3.5 py-1.5 text-xs text-[#424653] font-semibold hover:bg-white rounded-lg border border-[#c2c6d5]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingVoter}
                      className="px-4 py-1.5 text-xs bg-[#003f93] text-white font-bold rounded-lg shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCreatingVoter ? 'Enrolling...' : 'Save & Enroll'}
                    </button>
                  </div>
                </form>
              )}

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#737785] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={voterSearch}
                    onChange={(e) => setVoterSearch(e.target.value)}
                    placeholder="Search by student name, matric number, or department..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-[#c2c6d5] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0055c2]/20"
                  />
                </div>

                <select
                  value={voterDeptFilter}
                  onChange={(e) => setVoterDeptFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-[#c2c6d5] rounded-xl bg-white font-semibold text-[#424653]"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Anatomy">Anatomy</option>
                  <option value="Psychology">Psychology</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-[#c2c6d5] rounded-xl">
                <table className="w-full text-left text-xs text-[#131b2e]">
                  <thead className="bg-[#f2f3ff] border-b border-[#c2c6d5] font-bold text-[#424653] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Matric No.</th>
                      <th className="px-4 py-3">Department &amp; Level</th>
                      <th className="px-4 py-3">Accreditation</th>
                      <th className="px-4 py-3">Ballot Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaedff]">
                    {filteredVoters.map((voter) => (
                      <tr key={voter.id} className="hover:bg-[#faf8ff] transition-colors">
                        <td className="px-4 py-3 font-bold">{voter.fullName}</td>
                        <td className="px-4 py-3 font-mono text-[#003f93]">{voter.matricNumber}</td>
                        <td className="px-4 py-3 text-[#424653]">{voter.department} ({voter.level})</td>
                        <td className="px-4 py-3">
                          {voter.isAccredited ? (
                            <span className="bg-[#eaedff] text-[#003f93] px-2 py-0.5 rounded-full font-bold text-[10px]">
                              ACCREDITED
                            </span>
                          ) : (
                            <span className="bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full font-bold text-[10px]">
                              UNVERIFIED
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {voter.hasVoted ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              VOTED
                            </span>
                          ) : (
                            <span className="text-[#737785] text-[11px]">NOT YET CAST</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {!voter.isAccredited && (
                              <button
                                type="button"
                                onClick={() => accreditVoter(voter.matricNumber)}
                                className="text-[#0055c2] font-bold hover:underline text-[11px] cursor-pointer"
                              >
                                Accredit
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeleteVoter(voter)} title="Delete voter" aria-label={`Delete ${voter.fullName}`} className="text-[#93000a] hover:text-[#ba1a1a] p-1 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: POSITIONS */}
          {activeTab === 'positions' && (
            <div className="space-y-6 max-w-[1280px] mx-auto pb-24">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#131b2e]">Positions</h2>
                  <p className="text-sm text-[#424653] mt-1 max-w-[600px]">Manage the offices contested in the FABAMSSA UNIPORT Chapter General Election 2026.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPosition(!showAddPosition)}
                  className="bg-[#0055c2] hover:bg-[#00429a] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-[18px] h-[18px]" />
                  Add Position
                </button>
              </div>

              {showAddPosition && (
                <form onSubmit={handleCreatePosition} className="p-6 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl shadow-xs space-y-4">
                  <h4 className="text-sm font-bold text-[#131b2e]">Create New Position</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Position Title</label>
                      <input
                        type="text"
                        required
                        value={newPositionTitle}
                        onChange={(e) => setNewPositionTitle(e.target.value)}
                        placeholder="e.g. Assistant Welfare"
                        className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Max Selections</label>
                      <input
                        type="number"
                        min={1}
                        value={newPositionMaxSelections}
                        onChange={(e) => setNewPositionMaxSelections(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[#424653]">Description</label>
                      <textarea
                        value={newPositionDescription}
                        onChange={(e) => setNewPositionDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe the office and the responsibilities attached to it."
                        className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddPosition(false)} className="px-5 py-2 text-sm text-[#131b2e] border border-[#c2c6d5] font-semibold hover:bg-[#f2f3ff] rounded-lg cursor-pointer">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm bg-[#0055c2] hover:bg-[#003f93] text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer">Save Position</button>
                  </div>
                </form>
              )}

              {/* Context Bar */}
              <div className="bg-[#faf8ff] border border-[#c2c6d5] rounded-lg p-3 flex flex-wrap gap-8 mb-8 shadow-xs">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#737785]" />
                  <span className="text-sm text-[#424653]">Election: <strong className="text-[#131b2e]">FABAMSSA UNIPORT Chapter General Election 2026</strong></span>
                </div>
                <div className="w-[1px] h-[20px] bg-[#c2c6d5] hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#737785]" />
                  <span className="text-sm text-[#424653]">Status: </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    status === 'LIVE' ? 'bg-[#d9e2ff] text-[#003f93]' : 
                    status === 'CLOSED' ? 'bg-[#e2e7ff] text-[#424653]' : 
                    'bg-[#f1f5f9] text-[#475569]'
                  }`}>{status}</span>
                </div>
                <div className="w-[1px] h-[20px] bg-[#c2c6d5] hidden md:block"></div>
                <div className="flex items-center gap-3">
                  <ListOrdered className="w-5 h-5 text-[#737785]" />
                  <span className="text-sm text-[#424653]">Configured Positions: <strong className="text-[#131b2e]">{positions.length}</strong></span>
                </div>
              </div>

              {/* Warning Note */}
              <div className="flex items-center gap-3 mb-5 px-2 text-[#424653]">
                <AlertCircle className="w-[18px] h-[18px]" />
                <span className="text-xs font-bold uppercase tracking-wide">Position order determines the order in which offices appear on the ballot. Drag to reorder.</span>
              </div>

              {/* Data Table Container */}
              <div className="bg-[#faf8ff] border border-[#c2c6d5] rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-[#f1f5f9] border-b border-[#c2c6d5]">
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653] w-[80px]">Order</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653]">Position</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653] hidden lg:table-cell">Description</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653]">Election Type</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653]">Candidates</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653]">Status</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wide text-[#424653] text-right w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c2c6d5]">
                      {positions.map((pos, idx) => {
                        const posCands = candidates.filter(c => c.positionId === pos.id);
                        return (
                          <tr key={pos.id} className="hover:bg-[#f8fafc] transition-colors group">
                            <td className="p-5 align-middle">
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-5 h-5 text-[#c2c6d5] cursor-grab active:cursor-grabbing" />
                                <span className="text-sm font-medium text-[#131b2e]">0{idx + 1}</span>
                              </div>
                            </td>
                            <td className="p-5 align-middle text-lg font-semibold text-[#131b2e]">{pos.title}</td>
                            <td className="p-5 align-middle text-sm text-[#424653] hidden lg:table-cell truncate max-w-[250px]" title={pos.description}>
                              {pos.description}
                            </td>
                            <td className="p-5 align-middle">
                              <span className="bg-[#dbeafe] text-[#1e40af] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border border-[#bfdbfe]">
                                Contested
                              </span>
                            </td>
                            <td className="p-5 align-middle text-sm text-[#424653]">
                              {posCands.length === 0 ? (
                                <span className="text-[#93000a] font-bold">0 candidates</span>
                              ) : (
                                <span>{posCands.length} candidate{posCands.length !== 1 ? 's' : ''}</span>
                              )}
                            </td>
                            <td className="p-5 align-middle">
                              {posCands.length === 0 ? (
                                <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border border-[#fde68a]">
                                  Draft
                                </span>
                              ) : (
                                <span className="bg-[#003b82] text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border border-[#003b82]">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="p-5 align-middle text-right">
                              <button type="button" onClick={() => handleDeletePosition(pos)} title="Delete position" aria-label={`Delete ${pos.title}`} className="text-[#93000a] hover:text-[#ba1a1a] transition-colors p-2 rounded-full hover:bg-[#ffdad6] cursor-pointer">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-[#424653]">
                  Position changes are recorded in the Audit Log. <button type="button" onClick={() => setActiveTab('audit')} className="text-[#003f93] hover:underline cursor-pointer">View Audit Log</button>
                </p>
              </div>

              {/* Sticky Bottom Action Bar (Simulated Unsaved Changes State) */}
              <div className={`fixed bottom-0 left-0 ${isSidebarCollapsed ? 'lg:left-[80px]' : 'lg:left-[270px]'} right-0 bg-[#faf8ff] border-t border-[#c2c6d5] p-3 flex justify-between items-center shadow-[0px_-4px_6px_-1px_rgba(15,23,42,0.03)] z-30 transition-all duration-300 translate-y-0`}>
                <div className="flex items-center gap-3 ml-5">
                  <AlertTriangle className="w-5 h-5 text-[#92400e]" />
                  <span className="text-sm text-[#131b2e]">Unsaved ordering changes detected.</span>
                </div>
                <div className="flex gap-5 mr-5">
                  <button className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide border border-[#c2c6d5] text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer">Discard</button>
                  <button className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-[#0055c2] text-white hover:bg-[#00429a] transition-colors shadow-sm cursor-pointer" onClick={() => showToast('Position order saved successfully.', 'success')}>Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CANDIDATES */}
          {activeTab === 'candidates' && (
            <div className="space-y-6 max-w-[1280px] mx-auto pb-24">
              
              {/* Page Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl md:text-3xl lg:text-[32px] text-[#131b2e] font-bold tracking-tight">Candidate Management</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-bold border border-[#fcd34d]">
                        STATUS: {status}
                    </span>
                  </div>
                  <p className="text-base text-[#424653] max-w-2xl">Review, manage and organize candidates participating in the FABAMSSA 2026 General Elections.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <button className="flex-1 md:flex-none border border-[#c2c6d5] bg-transparent text-[#131b2e] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#f2f3ff] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Download className="w-5 h-5" />
                    Export Candidates
                  </button>
                  <button 
                    onClick={() => setShowAddCandidate(!showAddCandidate)}
                    className="flex-1 md:flex-none bg-[#0055c2] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#003f93] transition-colors flex items-center justify-center gap-2 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)] cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Add Candidate
                  </button>
                </div>
              </div>

              {/* Add Candidate Form (kept existing logic) */}
              {showAddCandidate && (
                <form onSubmit={handleCreateCandidate} className="p-6 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl shadow-xs space-y-4">
                  <h4 className="text-sm font-bold text-[#131b2e]">Register New Candidate</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Candidate Full Name</label>
                      <input type="text" required value={newCandName} onChange={(e) => setNewCandName(e.target.value)} placeholder="e.g. David O. Adeyemi" className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white outline-hidden focus:border-[#0055c2]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Position</label>
                      <select value={newCandPosId} onChange={(e) => setNewCandPosId(e.target.value)} className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white outline-hidden focus:border-[#0055c2]">
                        {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Department</label>
                      <select value={newCandDept} onChange={(e) => setNewCandDept(e.target.value as BMSDepartment)} className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white outline-hidden focus:border-[#0055c2]">
                        <option value="Anatomy">Anatomy</option>
                        <option value="Psychology">Psychology</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[#424653]">Campaign Tagline / Slogan</label>
                      <input type="text" value={newCandTagline} onChange={(e) => setNewCandTagline(e.target.value)} placeholder="e.g. Advancing Academic Excellence & Welfare" className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white outline-hidden focus:border-[#0055c2]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#424653]">Candidate Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCandidatePhotoUpload}
                        className="w-full mt-1.5 px-3 py-2 text-sm border border-[#c2c6d5] rounded-lg bg-white outline-hidden focus:border-[#0055c2] file:mr-3 file:rounded-md file:border-0 file:bg-[#eaf1ff] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#003f93]"
                      />
                      <p className="mt-2 text-[11px] text-[#424653]">Upload a clear portrait. It will be displayed alongside the candidate’s name.</p>
                      {newCandPhoto && (
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#c2c6d5] bg-white p-2">
                          <img src={newCandPhoto} alt="Candidate preview" className="w-12 h-12 rounded-full object-cover border border-[#c2c6d5]" />
                          <span className="text-xs font-medium text-[#131b2e]">Preview ready</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddCandidate(false)} className="px-5 py-2 text-sm text-[#131b2e] border border-[#c2c6d5] font-semibold hover:bg-[#f2f3ff] rounded-lg cursor-pointer">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm bg-[#0055c2] hover:bg-[#003f93] text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer">Save Candidate</button>
                  </div>
                </form>
              )}

              {/* Summary Stats Bento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 flex flex-col gap-2 shadow-xs">
                  <span className="text-xs font-bold text-[#424653] uppercase tracking-wider">Total Candidates</span>
                  <div className="text-[32px] leading-tight text-[#131b2e] font-bold">{candidates.length}</div>
                </div>
                <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 flex flex-col gap-2 shadow-xs border-l-4 border-l-[#003b82]">
                  <span className="text-xs font-bold text-[#424653] uppercase tracking-wider">Approved</span>
                  <div className="text-[32px] leading-tight text-[#131b2e] font-bold">{candidates.filter(c => c.approvedByEleco).length}</div>
                </div>
                <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 flex flex-col gap-2 shadow-xs border-l-4 border-l-[#92400e]">
                  <span className="text-xs font-bold text-[#424653] uppercase tracking-wider">Pending Review</span>
                  <div className="text-[32px] leading-tight text-[#131b2e] font-bold">{candidates.filter(c => !c.approvedByEleco).length}</div>
                </div>
                <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 flex flex-col gap-2 shadow-xs">
                  <span className="text-xs font-bold text-[#424653] uppercase tracking-wider">Positions With Candidates</span>
                  <div className="flex items-end gap-3">
                    <span className="text-[32px] leading-tight text-[#131b2e] font-bold">{new Set(candidates.map(c => c.positionId)).size}/{positions.length}</span>
                  </div>
                </div>
              </div>

              {/* Main Interactive Area */}
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left/Main Column: Table & Filters */}
                <div className="flex-1 flex flex-col gap-5">
                  {/* Toolbar Card */}
                  <div className="bg-white border border-[#c2c6d5] rounded-xl p-3 md:p-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)] flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3 items-center w-full">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737785] w-5 h-5 pointer-events-none" />
                        <input className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#c2c6d5] bg-[#faf8ff] focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10 transition-all text-sm outline-hidden placeholder:text-[#737785]" placeholder="Search candidate name or department" type="text"/>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        <select className="border border-[#c2c6d5] rounded-lg py-2 px-3 bg-[#faf8ff] text-sm focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10 whitespace-nowrap min-w-[120px] outline-hidden">
                          <option>All Positions</option>
                          {positions.map(p => <option key={p.id}>{p.title}</option>)}
                        </select>
                        <select className="border border-[#c2c6d5] rounded-lg py-2 px-3 bg-[#faf8ff] text-sm focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10 whitespace-nowrap min-w-[120px] outline-hidden">
                          <option>Status</option>
                          <option>Pending</option>
                          <option>Approved</option>
                        </select>
                        <button className="text-[#003f93] font-bold text-xs whitespace-nowrap hover:underline px-2 cursor-pointer">Clear Filters</button>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Table/Card View */}
                  <div className="bg-white border border-[#c2c6d5] rounded-xl shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)] overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f1f5f9] border-b border-[#c2c6d5]">
                          <tr>
                            <th className="py-3 px-5 text-xs font-bold text-[#424653] uppercase tracking-wider">Candidate</th>
                            <th className="py-3 px-5 text-xs font-bold text-[#424653] uppercase tracking-wider">Position</th>
                            <th className="py-3 px-5 text-xs font-bold text-[#424653] uppercase tracking-wider">ID Ref</th>
                            <th className="py-3 px-5 text-xs font-bold text-[#424653] uppercase tracking-wider">Status</th>
                            <th className="py-3 px-5 text-xs font-bold text-[#424653] uppercase tracking-wider">Type</th>
                            <th className="py-3 px-5 text-xs font-bold text-[#424653] uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c2c6d5]">
                          {candidates.map((c) => {
                            const pos = positions.find(p => p.id === c.positionId);
                            const candCountForPos = candidates.filter(can => can.positionId === c.positionId).length;
                            const isUnopposed = candCountForPos === 1;
                            return (
                              <tr key={c.id} className="hover:bg-[#f8fafc] transition-colors group">
                                <td className="py-3 px-5">
                                  <div className="flex items-center gap-3">
                                    {c.photoUrl ? (
                                      <img src={c.photoUrl} alt={c.fullName} className="w-8 h-8 rounded-full object-cover border border-[#c2c6d5]" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-[#e2e7ff] flex items-center justify-center border border-[#c2c6d5] text-[#003f93] font-bold text-xs">
                                        {getInitials(c.fullName)}
                                      </div>
                                    )}
                                    <span className="text-sm font-semibold text-[#131b2e]">{c.fullName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-5 text-sm">{pos?.title || 'Unknown'}</td>
                                <td className="py-3 px-5 text-sm text-[#424653] font-mono">BAM/24/{c.id.replace('cand-','').padStart(3, '0')}</td>
                                <td className="py-3 px-5">
                                  {c.approvedByEleco ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#003b82] text-white tracking-wide">APPROVED</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] tracking-wide">PENDING</span>
                                  )}
                                </td>
                                <td className="py-3 px-5 text-sm text-[#424653]">{isUnopposed ? 'Unopposed' : 'Contested'}</td>
                                <td className="py-3 px-5 text-right">
                                  <button type="button" onClick={() => handleDeleteCandidate(c)} title="Delete candidate" aria-label={`Delete ${c.fullName}`} className="text-[#93000a] hover:text-[#ba1a1a] transition-colors p-2 rounded-full hover:bg-[#ffdad6] cursor-pointer">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden flex flex-col divide-y divide-[#c2c6d5]">
                      {candidates.map((c) => {
                        const pos = positions.find(p => p.id === c.positionId);
                        const candCountForPos = candidates.filter(can => can.positionId === c.positionId).length;
                        const isUnopposed = candCountForPos === 1;
                        return (
                          <div key={c.id} className="p-5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                {c.photoUrl ? (
                                  <img src={c.photoUrl} alt={c.fullName} className="w-10 h-10 rounded-full object-cover border border-[#c2c6d5]" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#e2e7ff] flex items-center justify-center border border-[#c2c6d5] text-[#003f93] font-bold text-sm">
                                    {getInitials(c.fullName)}
                                  </div>
                                )}
                                <div>
                                  <div className="text-base font-semibold text-[#131b2e]">{c.fullName}</div>
                                  <div className="text-xs text-[#424653] font-mono">BAM/24/{c.id.replace('cand-','').padStart(3, '0')}</div>
                                </div>
                              </div>
                              <button type="button" onClick={() => handleDeleteCandidate(c)} title="Delete candidate" aria-label={`Delete ${c.fullName}`} className="text-[#93000a] p-1 cursor-pointer hover:bg-[#ffdad6] rounded-full"><Trash2 className="w-5 h-5" /></button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#e2e7ff] text-[#131b2e] border border-[#c2c6d5]/50">{pos?.title}</span>
                              {c.approvedByEleco ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-[#003b82] text-white tracking-wide">APPROVED</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] tracking-wide">PENDING</span>
                              )}
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#faf8ff] text-[#424653] border border-[#c2c6d5]/50">{isUnopposed ? 'Unopposed' : 'Contested'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Sidebar Info */}
                <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
                  {/* Position Overview */}
                  <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-bold text-[#131b2e]">Position Overview</h3>
                    </div>
                    <div className="flex flex-col gap-2 divide-y divide-[#c2c6d5]">
                      {positions.map(p => {
                        const candCount = candidates.filter(can => can.positionId === p.id).length;
                        return (
                          <div key={p.id} className="py-2 flex justify-between items-center">
                            <div>
                              <div className="text-sm font-semibold">{p.title}</div>
                              <div className="text-xs text-[#424653]">{candCount} Candidate{candCount !== 1 ? 's' : ''}</div>
                            </div>
                            <span className={`text-xs ${candCount > 1 ? 'text-[#0055c2] font-medium' : candCount === 1 ? 'text-[#424653] italic' : 'text-[#93000a]'}`}>
                              {candCount > 1 ? 'Contested' : candCount === 1 ? 'Unopposed' : 'Empty'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" onClick={() => setActiveTab('positions')} className="mt-4 text-[#0055c2] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer">
                      Manage Positions <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Administrative Notice */}
                  <div className="bg-[#f1f5f9] border border-[#c2c6d5] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-[#335da5] w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#131b2e] mb-1">Administrative Notice</h4>
                        <p className="text-xs text-[#424653] leading-relaxed">
                          Candidate changes are administrative actions. Adding, modifying, or disqualifying candidates after registration closes requires secondary authorization. All actions are securely recorded in the activity history logs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: MONITORING */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6 max-w-[1280px] mx-auto pb-24">
              {/* Page Header */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl md:text-3xl lg:text-[32px] text-[#131b2e] font-bold tracking-tight mb-1">Election Monitoring</h2>
                  <p className="text-base text-[#424653]">Monitor election activity, voter participation, and operational status in real time.</p>
                </div>
                <div className="flex items-center gap-3 text-[#424653] text-sm">
                  <span>Last updated: Just now</span>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Banner */}
                <div className="col-span-12 bg-white border border-[#c2c6d5] rounded-xl p-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                  <div>
                    <h3 className="text-lg font-semibold text-[#131b2e] mb-2">BAMSSA 2026 GENERAL ELECTIONS</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-[#424653]">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> 4 September 2026</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 8:00 AM – 4:00 PM</span>
                    </div>
                  </div>
                  <div className="bg-[#f2f3ff] p-3 rounded-lg border border-[#c2c6d5] text-center md:text-left w-full md:w-auto">
                    <p className="text-sm text-[#424653]">
                      {status === 'STANDBY'
                        ? 'Voting has not started. Live participation data will appear when voting begins.' 
                        : status === 'LIVE'
                          ? 'Voting is live. Ballots are being recorded securely.'
                          : 'Voting has concluded. Final results are being tabulated.'}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="col-span-12 md:col-span-3 bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                  <h4 className="text-xs font-bold text-[#424653] uppercase tracking-wider mb-3">Eligible Voters</h4>
                  <p className="text-4xl lg:text-[48px] font-bold text-[#131b2e] leading-tight">{totalEligible.toLocaleString()}</p>
                </div>
                <div className="col-span-12 md:col-span-3 bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                  <h4 className="text-xs font-bold text-[#424653] uppercase tracking-wider mb-3">Accredited</h4>
                  {status === 'STANDBY' ? (
                    <>
                      <p className="text-4xl lg:text-[48px] font-bold text-[#c2c6d5] leading-tight">—</p>
                      <p className="text-sm text-[#737785] mt-2">Not started</p>
                    </>
                  ) : (
                    <p className="text-4xl lg:text-[48px] font-bold text-[#131b2e] leading-tight">{totalBallotsCast.toLocaleString()}</p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-3 bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                  <h4 className="text-xs font-bold text-[#424653] uppercase tracking-wider mb-3">Ballots Cast</h4>
                  {status === 'STANDBY' ? (
                    <>
                      <p className="text-4xl lg:text-[48px] font-bold text-[#c2c6d5] leading-tight">—</p>
                      <p className="text-sm text-[#737785] mt-2">Not started</p>
                    </>
                  ) : (
                    <p className="text-4xl lg:text-[48px] font-bold text-[#131b2e] leading-tight">{totalBallotsCast.toLocaleString()}</p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-3 bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                  <h4 className="text-xs font-bold text-[#424653] uppercase tracking-wider mb-3">Turnout</h4>
                  {status === 'STANDBY' ? (
                    <>
                      <p className="text-4xl lg:text-[48px] font-bold text-[#c2c6d5] leading-tight">—</p>
                      <p className="text-sm text-[#737785] mt-2">Not started</p>
                    </>
                  ) : (
                    <p className="text-4xl lg:text-[48px] font-bold text-[#003f93] leading-tight">{turnoutPercentage}%</p>
                  )}
                </div>

                {/* Main Activity Area (Conditional) */}
                {status === 'STANDBY' ? (
                  <>
                    {/* Empty State Card (Voting Activity) */}
                    <div className="col-span-12 md:col-span-6 bg-white border border-[#c2c6d5] rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                      <BarChart3 className="w-12 h-12 text-[#c2c6d5] mb-5" />
                      <h4 className="text-lg font-semibold text-[#131b2e] mb-2">Voting Activity</h4>
                      <p className="text-sm text-[#424653] max-w-md">Voting has not started. No ballots have been submitted yet. A live time-series chart will appear here once the election is LIVE.</p>
                    </div>
                    {/* Empty State Card (Turnout) */}
                    <div className="col-span-12 md:col-span-6 bg-white border border-[#c2c6d5] rounded-xl p-8 flex flex-col justify-center min-h-[300px] shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                      <h4 className="text-lg font-semibold text-[#131b2e] mb-5">Turnout Overview</h4>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center py-3 border-b border-[#c2c6d5]">
                          <span className="text-sm text-[#424653]">Current Turnout</span>
                          <span className="text-xs font-bold text-[#737785]">—</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-[#c2c6d5]">
                          <span className="text-sm text-[#424653]">Target</span>
                          <span className="text-xs font-bold text-[#737785]">Not configured</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-12 md:col-span-6 bg-white border border-[#c2c6d5] rounded-xl p-8 flex flex-col justify-center min-h-[300px] shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                       <h4 className="text-lg font-semibold text-[#131b2e] mb-5">Departmental Turnout Progress</h4>
                       <div className="space-y-4">
                         {(Object.keys(departmentStats) as BMSDepartment[]).map(dept => {
                           const stats = departmentStats[dept];
                           const pct = stats.eligible > 0 ? Math.round((stats.voted / stats.eligible) * 100) : 0;
                           return (
                             <div key={dept} className="space-y-2">
                               <div className="flex justify-between text-xs font-bold">
                                 <span className="text-[#131b2e]">{dept}</span>
                                 <span className="text-[#003f93]">{pct}% ({stats.voted}/{stats.eligible})</span>
                               </div>
                               <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                                 <div className="bg-[#003f93] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                               </div>
                             </div>
                           );
                         })}
                       </div>
                    </div>

                    <div className="col-span-12 md:col-span-6 bg-white border border-[#c2c6d5] rounded-xl p-8 flex flex-col justify-center min-h-[300px] shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.03),0px_2px_4px_-2px_rgba(15,23,42,0.02)]">
                      <h4 className="text-lg font-semibold text-[#131b2e] mb-5">Turnout Overview</h4>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center py-3 border-b border-[#c2c6d5]">
                          <span className="text-sm text-[#424653]">Current Turnout</span>
                          <span className="text-sm font-bold text-[#003f93]">{turnoutPercentage}%</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-[#c2c6d5]">
                          <span className="text-sm text-[#424653]">Target</span>
                          <span className="text-sm font-bold text-[#737785]">75%</span>
                        </div>
                        <div className="pt-4">
                           <div className="flex justify-between text-xs font-bold mb-2">
                             <span className="text-[#131b2e]">Progress to Target</span>
                             <span className="text-[#003f93]">{Math.min(100, Math.round((turnoutPercentage / 75) * 100))}%</span>
                           </div>
                           <div className="w-full bg-[#e2e7ff] h-2 rounded-full overflow-hidden">
                             <div className="bg-[#0c59c6] h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round((turnoutPercentage / 75) * 100))}%` }} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: RESULTS MANAGEMENT */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] tracking-tight">Results Management</h2>
                  <span className="bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider border border-[#E2E8F0]">{status}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#424653]">
                  <span className="font-bold text-[#003f93]">Results: {resultsStatus}</span>
                  <span>Last updated: Just now</span>
                  <button
                    type="button"
                    className="bg-white border border-[#c2c6d5] rounded-lg p-2 text-[#424653] hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                    title="Refresh"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#c2c6d5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#131b2e]">{resultsStatus === 'PUBLISHED' || resultsStatus === 'CERTIFIED' ? `Results ${resultsStatus.toLowerCase()}` : 'Results ready for publication'}</h3>

              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" onClick={openManualResults} disabled={resultsStatus === 'CERTIFIED'} className="inline-flex items-center gap-2 rounded-lg border border-[#c2c6d5] bg-white px-4 py-2.5 text-sm font-bold text-[#131b2e] hover:bg-[#f2f3ff] disabled:cursor-not-allowed disabled:opacity-50">
                  <Edit3 className="h-4 w-4" />
                  Enter Results Manually
                </button>
              </div>
                  <p className="text-sm text-[#424653] mt-1">{resultsStatus === 'DRAFT' ? `${positions.length} positions configured. Publish only after reviewing the recorded totals.` : 'Students can view the published results on the public Results page.'}</p>
                </div>
                <button type="button" onClick={handlePublishResults} disabled={status === 'LIVE' || resultsStatus !== 'DRAFT'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0055c2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#003f93] disabled:cursor-not-allowed disabled:opacity-50">
                  {resultsStatus === 'DRAFT' ? 'Publish Results to Student Portal' : 'Results Published'}
                </button>
              </div>

              <div className="bg-[#f2f3ff] border border-[#c2c6d5] rounded-lg p-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-[#003f93] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#003f93]">Administrative Notice</h4>
                  <p className="text-sm text-[#424653] mt-1 leading-relaxed">
                    You can increase or reduce each candidate’s vote total directly from this table. Every manual change is recorded in the audit log so the election remains under your control.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#c2c6d5] rounded-lg p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#424653] mb-1">Positions</p>
                  <p className="text-4xl font-extrabold text-[#131b2e]">{positions.length}</p>
                </div>
                <div className="bg-white border border-[#c2c6d5] rounded-lg p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#424653] mb-1">Candidates</p>
                  <p className="text-4xl font-extrabold text-[#131b2e]">{candidates.length}</p>
                </div>
                <div className="bg-white border border-[#c2c6d5] rounded-lg p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#424653] mb-1">Ballots Recorded</p>
                  <p className="text-4xl font-extrabold text-[#131b2e]">{totalBallotsCast}</p>
                  <p className="text-[11px] text-[#424653] mt-1">Live ballots</p>
                </div>
                <div className="bg-white border border-[#c2c6d5] rounded-lg p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#424653] mb-1">Admin Adjustments</p>
                  <p className="text-4xl font-extrabold text-[#131b2e]">{auditLogs.filter((log) => log.action.toLowerCase().includes('vote count adjusted')).length}</p>
                  <p className="text-[11px] text-[#424653] mt-1">Logged actions</p>
                </div>
              </div>

              <div className="bg-white border border-[#c2c6d5] rounded-lg shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#eaedff] bg-white">
                  <h3 className="text-2xl font-bold text-[#131b2e]">Election Results</h3>
                  <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737785]" />
                      <input
                        type="text"
                        value={resultSearch}
                        onChange={(e) => setResultSearch(e.target.value)}
                        placeholder="Search candidates..."
                        className="w-full pl-10 pr-4 py-2 border border-[#c2c6d5] rounded-xl bg-[#f8fafc] text-[#131b2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#d9e2ff] focus:border-[#0055c2]"
                      />
                    </div>
                    <div className="flex gap-4">
                      <select
                        value={resultPositionFilter}
                        onChange={(e) => setResultPositionFilter(e.target.value)}
                        className="min-w-[160px] border border-[#c2c6d5] rounded-xl bg-[#f8fafc] px-4 py-2 text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#d9e2ff] focus:border-[#0055c2]"
                      >
                        <option value="ALL">All Positions</option>
                        {positions.map((position) => (
                          <option key={position.id} value={position.id}>{position.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f2f3ff] border-b border-[#c2c6d5]">
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#424653] text-left">Position</th>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#424653] text-left">{resultsStatus === 'CERTIFIED' ? 'Winner' : 'Result'}</th>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#424653] text-right">Recorded Votes</th>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#424653] text-center">Admin Control</th>
                        <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#424653] text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaedff]">
                      {positions
                        .map((position) => {
                          const posCandidates = candidates
                            .filter((candidate) => candidate.positionId === position.id)
                            .sort((a, b) => b.votesCount - a.votesCount);

                          return posCandidates.map((candidate) => {
                            const matchedSearch = `${candidate.fullName} ${position.title}`
                              .toLowerCase()
                              .includes(resultSearch.toLowerCase());
                            const matchesFilter = resultPositionFilter === 'ALL' || candidate.positionId === resultPositionFilter;

                            if (!matchedSearch || !matchesFilter) return null;

                            const totalVotesInPosition = posCandidates.reduce((sum, item) => sum + item.votesCount, 0);
                            const percentage = totalVotesInPosition > 0 ? Math.round((candidate.votesCount / totalVotesInPosition) * 100) : 0;

                            return (
                              <tr key={candidate.id} className="hover:bg-[#faf8ff] transition-colors">
                                <td className="px-5 py-4 text-sm font-medium text-[#131b2e]">{position.title}</td>
                                <td className="px-5 py-4 text-sm text-[#131b2e]">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold">{candidate.fullName}</span>
                                    {candidate.votesCount === Math.max(...posCandidates.map((item) => item.votesCount)) && candidate.votesCount > 0 && (
                                      <span className="bg-[#d9e2ff] text-[#003f93] text-[10px] font-bold px-1.5 py-0.5 rounded">{resultsStatus === 'CERTIFIED' ? 'WINNER' : 'UNOFFICIAL RESULT'}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-right text-sm font-semibold text-[#003f93]">
                                  <div>{candidate.votesCount}</div>
                                  <div className="text-[10px] text-[#424653]">{percentage}% of position</div>
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => adjustCandidateVotes(candidate.id, -1)}
                                      disabled={status === 'CERTIFIED'}
                                      className="w-8 h-8 rounded-lg border border-[#c2c6d5] bg-[#f8fafc] text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                      aria-label={`Decrease votes for ${candidate.fullName}`}
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      value={candidate.votesCount}
                                        disabled={status === 'CERTIFIED'}
                                      onChange={(e) => {
                                        const nextValue = Number(e.target.value);
                                        if (Number.isNaN(nextValue)) return;
                                        adjustCandidateVotes(candidate.id, Math.max(0, nextValue) - candidate.votesCount);
                                      }}
                                      className="w-20 border border-[#c2c6d5] rounded-lg px-2 py-1.5 text-center text-sm font-semibold text-[#131b2e] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#d9e2ff] focus:border-[#0055c2] disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => adjustCandidateVotes(candidate.id, 1)}
                                      disabled={status === 'CERTIFIED'}
                                      className="w-8 h-8 rounded-lg border border-[#c2c6d5] bg-[#f8fafc] text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                      aria-label={`Increase votes for ${candidate.fullName}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <span className="inline-flex items-center justify-center rounded-full bg-[#f2f3ff] border border-[#c2c6d5] px-2.5 py-1 text-[11px] font-bold text-[#424653]">
                                    {candidate.votesCount > 0 ? 'ACTIVE' : 'ZERO'}
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                        })
                        .flat()
                        .filter(Boolean)}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-[#eaedff] bg-white flex justify-between items-center text-sm text-[#424653]">
                  <span>
                    Showing {positions.flatMap((position) => candidates.filter((candidate) => candidate.positionId === position.id)).filter((candidate) => {
                      return `${candidate.fullName} ${positions.find((position) => position.id === candidate.positionId)?.title || ''}`
                        .toLowerCase()
                        .includes(resultSearch.toLowerCase()) && (resultPositionFilter === 'ALL' || candidate.positionId === resultPositionFilter);
                    }).length} candidate(s)
                  </span>
                  <div className="flex gap-1">
                    <button type="button" className="px-3 py-1 border border-[#c2c6d5] rounded bg-[#f8fafc] text-[#424653] opacity-50 cursor-not-allowed">Previous</button>
                    <button type="button" className="px-3 py-1 border border-[#0055c2] rounded bg-[#0055c2] text-white">1</button>
                    <button type="button" className="px-3 py-1 border border-[#c2c6d5] rounded bg-[#f8fafc] text-[#424653] hover:bg-[#f2f3ff]">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CERTIFICATION */}
          {activeTab === 'certification' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">Results Certification</h2>
                  <p className="text-sm text-[#424653] mt-1">Review, verify, and formally certify election outcomes.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#f2f3ff] text-[#003f93] border border-[#c2c6d5] rounded-xl text-xs font-bold shadow-xs hover:bg-[#eaedff] transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  View Audit Logs
                </button>
              </div>

              <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffdad6] opacity-10 rounded-bl-full" />

                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-6 pb-4 border-b border-[#eaedff]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#131b2e] mb-1">{readinessStatus === 'CERTIFIED' ? 'CERTIFIED RESULTS' : certificationUnlocked ? 'READY FOR CERTIFICATION' : 'NOT READY FOR CERTIFICATION'}</h3>
                      <p className="text-sm text-[#424653] max-w-xl">
                        {readinessStatus === 'CERTIFIED' ? 'These results have been certified and are available to the public.' : `Election status: ${readinessStatus}. Close the election and review every position before certification.`}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#f2f3ff] px-4 py-2 rounded-lg border border-[#c2c6d5] flex items-center gap-2 text-xs font-bold text-[#424653]">
                    {certificationUnlocked ? <CheckCircle2 className="w-4 h-4 text-[#003f93]" /> : <Lock className="w-4 h-4 text-[#737785]" />}
                    {readinessStatus === 'CERTIFIED' ? 'Certification Complete' : certificationUnlocked ? 'Certification Unlocked' : 'Certification Locked'}
                  </div>
                </div>

                <div className="relative mt-6 mb-4">
                  <div className="absolute top-4 left-4 right-4 h-1 bg-[#dae2fd] rounded-full" />
                  <div className="absolute top-4 left-4 h-1 bg-[#0055c2] rounded-full" style={{ width: readinessStatus === 'CERTIFIED' ? '100%' : readinessStatus === 'CLOSED' ? '75%' : readinessStatus === 'LIVE' ? '50%' : '25%' }} />

                  <div className="flex justify-between relative z-10 px-1">
                    {[
                      { label: 'Standby', complete: ['ACCREDITATION_OPEN', 'LIVE', 'CLOSED', 'CERTIFIED'].includes(readinessStatus), active: readinessStatus === 'STANDBY' },
                      { label: 'Live', complete: ['CLOSED', 'CERTIFIED'].includes(readinessStatus), active: readinessStatus === 'LIVE' },
                      { label: 'Closed', complete: ['CLOSED', 'CERTIFIED'].includes(readinessStatus), active: readinessStatus === 'CLOSED' },
                      { label: 'Certified', complete: readinessStatus === 'CERTIFIED', active: readinessStatus === 'CERTIFIED' },
                    ].map((step) => (
                      <div key={step.label} className="flex flex-col items-center gap-2 w-24">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            step.complete
                              ? 'bg-[#0055c2] border-[#0055c2] text-white'
                              : step.active
                                ? 'bg-white border-[#0055c2] text-[#0055c2]'
                                : 'bg-[#f2f3ff] border-[#c2c6d5] text-[#737785]'
                          }`}
                        >
                          {step.complete ? <Check className="w-4 h-4" /> : <span className="w-2.5 h-2.5 rounded-full bg-current" />}
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-wider text-center font-bold ${
                            step.complete || step.active ? 'text-[#003f93]' : 'text-[#737785]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-lg font-bold text-[#131b2e] px-1">Election Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Positions', value: String(totalCertificationPositions), icon: ListOrdered },
                      { label: 'Candidates', value: String(candidates.length), icon: UserPlus },
                      { label: 'Ballots Recorded', value: String(certificationData?.ballotsCast || 0), icon: Vote },
                      { label: 'Reviewed', value: `${reviewedCertificationPositions}/${totalCertificationPositions}`, icon: CheckCircle2, accent: allPositionsReviewed ? 'text-[#003f93]' : 'text-[#93000a]' },
                      { label: 'Adjustments', value: String(liveAuditLogs.filter((log) => log.action.toLowerCase().includes('adjust')).length), icon: Sliders },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="bg-white border border-[#c2c6d5] rounded-xl p-4 shadow-xs flex flex-col justify-between h-24">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[#424653] uppercase tracking-wider">
                            <Icon className={`w-4 h-4 ${item.accent || 'text-[#003f93]'}`} />
                            <span>{item.label}</span>
                          </div>
                          <div className="text-3xl font-extrabold text-[#131b2e]">
                            {item.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-[#c2c6d5] rounded-2xl p-5 shadow-xs">
                  <div className="flex justify-between items-center pb-3 mb-3 border-b border-[#eaedff]">
                    <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-[#003f93]" />
                      Certification Readiness
                    </h3>
                    <span className="text-[11px] font-bold text-[#424653] bg-[#f2f3ff] border border-[#c2c6d5] rounded-full px-2.5 py-1">{allPositionsReviewed ? `${totalCertificationPositions} / ${totalCertificationPositions}` : `${reviewedCertificationPositions} / ${totalCertificationPositions}`} Complete</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Voting period officially closed', state: electionClosedForCertification ? 'Verified' : 'Pending' },
                      { label: 'All cast ballots successfully processed', state: certificationData?.ballotsProcessed ? 'Verified' : 'Pending' },
                      { label: 'Results calculated and tabulated', state: certificationData?.resultsCalculated ? 'Verified' : 'Pending' },
                      { label: 'Candidate and position structure verified', state: candidates.length > 0 && totalCertificationPositions > 0 ? 'Verified' : 'Pending' },
                      { label: 'Administrative adjustments audited', state: 'Verified' },
                      { label: 'Any result discrepancies resolved', state: 'Pending' },
                      { label: `Individual position results reviewed (${reviewedCertificationPositions}/${totalCertificationPositions})`, state: allPositionsReviewed ? 'Verified' : 'Not Ready' },
                    ].map((item, idx) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#c2c6d5] bg-[#faf8ff]">
                        <div className="flex items-center gap-3 text-left">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full ${
                            item.state === 'Verified'
                              ? 'bg-[#d9e2ff] text-[#003f93]'
                              : item.state === 'Not Ready'
                                ? 'bg-[#ffdad6] text-[#93000a]'
                                : 'bg-[#f2f3ff] text-[#737785]'
                          }`}>
                            {item.state === 'Verified' ? <Check className="w-3.5 h-3.5" /> : item.state === 'Not Ready' ? <X className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-current" />}
                          </span>
                          <span className="text-sm text-[#131b2e]">{item.label}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 border ${
                            item.state === 'Verified'
                              ? 'bg-[#d9e2ff] text-[#003f93] border-[#adc6ff]'
                              : item.state === 'Not Ready'
                                ? 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]'
                                : 'bg-[#f2f3ff] text-[#737785] border-[#c2c6d5]'
                          }`}
                        >
                          {item.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#c2c6d5] rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#eaedff] bg-[#faf8ff] flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[#131b2e]">Position Results Review</h3>
                    <p className="text-sm text-[#424653]">All positions must be individually reviewed before final certification.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#c2c6d5] bg-white px-3 py-2 text-xs font-bold text-[#424653] hover:bg-[#eaedff] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Results Management
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f2f3ff] text-[11px] font-bold uppercase tracking-wider text-[#424653]">
                        <th className="px-4 py-3">Position</th>
                        <th className="px-4 py-3">Candidates</th>
                        <th className="px-4 py-3">Total Votes</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(certificationData?.positionResults || positions.map((position) => ({ positionId: position.id, candidates: [], isReviewed: false }))).map((item: any) => {
                        const position = positions.find((candidatePosition) => candidatePosition.id === item.positionId);
                        const totalVotes = item.candidates.reduce((total: number, candidate: any) => total + (candidate.votes_count || 0), 0);
                        return (
                        <tr key={item.positionId} className="border-t border-[#eaedff] bg-white text-sm">
                          <td className="px-4 py-4 font-bold text-[#131b2e]">{position?.title || item.positionId}</td>
                          <td className="px-4 py-4 text-[#424653]">{item.candidates.length}</td>
                          <td className="px-4 py-4 text-[#424653]">{totalVotes}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 rounded border text-[10px] font-bold px-2 py-1 uppercase tracking-wider ${item.isReviewed ? 'border-[#adc6ff] bg-[#d9e2ff] text-[#003f93]' : 'border-[#c2c6d5] bg-[#f2f3ff] text-[#424653]'}`}>
                              {item.isReviewed ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {item.isReviewed ? 'Reviewed' : 'Pending Review'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleReviewPosition(item.positionId)}
                              disabled={item.isReviewed || readinessStatus === 'CERTIFIED'}
                              className={`inline-flex items-center gap-1 text-xs font-bold ${item.isReviewed || readinessStatus === 'CERTIFIED' ? 'text-[#737785] cursor-not-allowed' : 'text-[#0055c2] hover:text-[#003f93] cursor-pointer'}`}
                            >
                              {item.isReviewed ? 'Reviewed' : 'Review'}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#c2c6d5] rounded-2xl p-5 shadow-xs">
                  <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2 border-b border-[#eaedff] pb-3 mb-4">
                    <Users className="w-4 h-4 text-[#003f93]" />
                    Electoral Commission Members
                  </h3>
                  <p className="mb-4 text-sm text-[#424653]">These names and roles appear on the public Results screen after you save them.</p>
                  <div className="space-y-3">
                    {editableCommissionMembers.map((member, index) => (
                      <div key={member.id} className="grid grid-cols-[64px_1fr_1fr_auto] gap-2 items-end">
                        <label className="text-[10px] font-bold uppercase tracking-wide text-[#424653]">
                          Initials
                          <input value={member.initials} maxLength={5} onChange={(event) => { setCommissionMembersDirty(true); setEditableCommissionMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, initials: event.target.value.toUpperCase() } : item)); }} className="mt-1 w-full rounded-lg border border-[#c2c6d5] px-2 py-2 text-sm text-[#131b2e]" />
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-[#424653]">
                          Name
                          <input value={member.name} onChange={(event) => { setCommissionMembersDirty(true); setEditableCommissionMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item)); }} className="mt-1 w-full rounded-lg border border-[#c2c6d5] px-2 py-2 text-sm text-[#131b2e]" />
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-wide text-[#424653]">
                          Role
                          <input value={member.role} onChange={(event) => { setCommissionMembersDirty(true); setEditableCommissionMembers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item)); }} className="mt-1 w-full rounded-lg border border-[#c2c6d5] px-2 py-2 text-sm text-[#131b2e]" />
                        </label>
                        <button type="button" onClick={() => { setCommissionMembersDirty(true); setEditableCommissionMembers((current) => current.filter((_, itemIndex) => itemIndex !== index)); }} disabled={editableCommissionMembers.length === 1} title="Remove commission member" className="mb-0.5 rounded-lg p-2 text-[#93000a] hover:bg-[#ffdad6] disabled:cursor-not-allowed disabled:opacity-40">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-between gap-3">
                    <button type="button" onClick={() => { setCommissionMembersDirty(true); setEditableCommissionMembers((current) => [...current, { id: `member-${Date.now()}`, initials: 'EC', name: '', role: '' }]); }} className="inline-flex items-center gap-2 rounded-lg border border-[#c2c6d5] px-3 py-2 text-xs font-bold text-[#131b2e] hover:bg-[#f2f3ff]">
                      <Plus className="h-4 w-4" /> Add Member
                    </button>
                    <button type="button" onClick={() => void saveCommissionMembers()} disabled={savingCommissionMembers || editableCommissionMembers.some((member) => !member.initials.trim() || !member.name.trim() || !member.role.trim())} className="inline-flex items-center gap-2 rounded-lg bg-[#0055c2] px-3 py-2 text-xs font-bold text-white hover:bg-[#003f93] disabled:cursor-not-allowed disabled:opacity-50">
                      {savingCommissionMembers ? 'Saving...' : 'Save Members'}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-[#c2c6d5] rounded-2xl p-5 shadow-xs">
                  <h3 className="text-lg font-bold text-[#131b2e] flex items-center gap-2 border-b border-[#eaedff] pb-3 mb-4">
                    <ShieldCheck className="w-4 h-4 text-[#003f93]" />
                    Certification Authority
                  </h3>
                  <div className="flex items-center gap-3 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl p-3">
                    <div className="w-12 h-12 rounded-full bg-[#d9e2ff] text-[#003f93] flex items-center justify-center text-lg font-extrabold">EA</div>
                    <div>
                      <div className="text-sm font-bold text-[#131b2e]">ELECO Administrator (You)</div>
                      <div className="text-xs text-[#424653] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#003f93]" />
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 bg-[#f2f3ff] border border-[#c2c6d5] rounded-xl p-3 text-xs text-[#424653]">
                    <ShieldCheck className="w-4 h-4 text-[#003f93] mt-0.5 shrink-0" />
                    <p>Actions performed here are permanently recorded for accountability and review.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-[#c2c6d5] rounded-2xl p-6 shadow-xs text-center">
                <div className="w-16 h-16 rounded-full bg-[#f2f3ff] border border-[#c2c6d5] text-[#737785] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#131b2e]">Formal Election Certification</h2>
                <p className="max-w-2xl mx-auto mt-4 text-sm text-[#424653] italic border-l-4 border-[#c2c6d5] bg-[#faf8ff] p-3 rounded-r text-left">
                  “I confirm that I have reviewed all position results and authorize these results as official.”
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#424653]">
                  <input type="checkbox" checked={certifyConfirmCheckbox} onChange={(event) => setCertifyConfirmCheckbox(event.target.checked)} disabled={readinessStatus === 'CERTIFIED'} className="h-4 w-4 rounded border-[#c2c6d5] text-[#0055c2]" />
                  <label>I confirm that I have reviewed the election results and authorize certification.</label>
                </div>
                <button
                  type="button"
                  onClick={handleCertifyElection}
                  disabled={!certificationUnlocked || isCertifying}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold border ${certificationUnlocked ? 'bg-[#0055c2] text-white border-[#0055c2] hover:bg-[#003f93] cursor-pointer' : 'bg-[#f2f3ff] text-[#737785] border-[#c2c6d5] cursor-not-allowed'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCertifying ? 'Certifying...' : readinessStatus === 'CERTIFIED' ? 'Results Certified' : 'Certify Election Results'}
                </button>
                <p className="mt-3 text-[11px] text-[#93000a] flex items-center justify-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {readinessStatus === 'CERTIFIED' ? 'Certified results are now available to students.' : !electionClosedForCertification ? 'Close the election before certification.' : !allPositionsReviewed ? 'Review every position before certification.' : 'Confirm the declaration to unlock certification.'}
                </p>
              </div>

              <div className="flex justify-end">
                <div className="bg-white border border-[#c2c6d5] rounded-xl p-3 flex items-center gap-3 shadow-xs opacity-70">
                  <div className="text-right text-xs">
                    <div className="font-bold text-[#131b2e]">Post-Certification Publication</div>
                    <div className="text-[#737785] uppercase tracking-wider">Status: Not Published</div>
                  </div>
                  <div className="w-px h-10 bg-[#c2c6d5]" />
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#c2c6d5] bg-[#f2f3ff] text-[#737785] text-xs font-bold cursor-not-allowed"
                  >
                    <Award className="w-4 h-4" />
                    Publish Certified Results
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6 max-w-[1280px] mx-auto pb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-[#131b2e] tracking-tight">Audit Logs</h1>
                  <p className="mt-2 text-base text-[#424653] max-w-2xl">
                    Review administrative and system activity recorded throughout the election. All events are time-stamped and permanently recorded.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportAuditCSV}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c2c6d5] rounded-lg text-[#131b2e] font-bold text-sm hover:bg-[#f2f3ff] transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export Audit Logs
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Total Events', value: liveAuditLogs.length.toLocaleString(), icon: ListOrdered, iconColor: 'text-[#003f93]' },
                  { label: 'Today', value: liveAuditLogs.filter((log) => new Date(log.timestamp).toDateString() === new Date().toDateString()).length.toLocaleString(), icon: Calendar, iconColor: 'text-[#335da5]' },
                  { label: 'Admin Actions', value: liveAuditLogs.filter((log) => log.category === 'ADMIN').length.toLocaleString(), icon: UserCheck, iconColor: 'text-[#003ba1]' },
                  { label: 'Security Events', value: liveAuditLogs.filter((log) => log.category === 'SECURITY').length.toLocaleString(), icon: ShieldCheck, iconColor: 'text-[#93000a]' },
                ].map(({ label, value, icon: Icon, iconColor }) => (
                  <div key={label} className="bg-white border border-[#c2c6d5] rounded-xl p-4 flex items-center justify-between shadow-[0_2px_6px_rgba(15,23,42,0.03)]">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] mb-2">{label}</p>
                      <p className="text-[28px] font-extrabold text-[#131b2e] leading-none">{value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#f2f3ff] border border-[#dfe5ff] flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#c2c6d5] rounded-xl overflow-hidden shadow-[0_2px_6px_rgba(15,23,42,0.03)]">
                <div className="p-4 border-b border-[#eaedff] bg-white flex flex-col xl:flex-row gap-4 xl:items-center">
                  <div className="relative flex-1 w-full xl:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737785]" />
                    <input
                      type="text"
                      placeholder="Search activity, administrator, candidate, or reference ID"
                      value={auditSearch}
                      onChange={(event) => setAuditSearch(event.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#c2c6d5] rounded-lg bg-[#fafbff] text-[#131b2e] text-sm focus:outline-none focus:ring-2 focus:ring-[#d9e2ff] focus:border-[#0055c2]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {[auditDateFilter, auditAdminFilter, auditActionFilter, auditSeverityFilter].map((option, idx) => (
                      <select
                        key={option}
                        value={option}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (idx === 0) setAuditDateFilter(value);
                          if (idx === 1) setAuditAdminFilter(value);
                          if (idx === 2) setAuditActionFilter(value);
                          if (idx === 3) setAuditSeverityFilter(value);
                        }}
                        className="min-w-[140px] px-3 py-2 border border-[#c2c6d5] rounded-lg bg-[#fafbff] text-[#131b2e] text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#d9e2ff] focus:border-[#0055c2]"
                        defaultValue={option}
                      >
                        <option>{option}</option>
                        {idx === 0 && <option>Today</option>}
                        {idx === 0 && <option>Last 7 Days</option>}
                        {idx === 1 && auditAdmins.map((admin) => <option key={admin}>{admin}</option>)}
                        {idx === 2 && auditActions.map((action) => <option key={action}>{action}</option>)}
                        {idx === 3 && <option>Information</option>}
                        {idx === 3 && <option>Warning</option>}
                        {idx === 3 && <option>Critical</option>}
                      </select>
                    ))}
                    <button type="button" onClick={() => { setAuditSearch(''); setAuditDateFilter('Any Date'); setAuditAdminFilter('All Admins'); setAuditActionFilter('All Actions'); setAuditSeverityFilter('All Severities'); }} className="px-4 py-2 text-[#424653] hover:text-[#131b2e] text-sm font-bold transition-colors cursor-pointer">
                      Clear Filters
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f2f3ff] border-b border-[#c2c6d5]">
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] whitespace-nowrap">Timestamp</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] whitespace-nowrap">Administrator</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] whitespace-nowrap">Action</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] whitespace-nowrap">Target</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] hidden md:table-cell">Details</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] whitespace-nowrap">Severity</th>
                        <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653] whitespace-nowrap">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaedff]">
                      {filteredAuditLogs.map((row) => (
                        <tr key={row.id} className="hover:bg-[#faf8ff] transition-colors">
                          <td className="px-4 py-3 text-sm text-[#424653] whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-medium text-[#131b2e] whitespace-nowrap">{row.actor}</td>
                          <td className="px-4 py-3 text-sm text-[#131b2e] whitespace-nowrap">{row.action}</td>
                          <td className="px-4 py-3 text-sm text-[#131b2e] whitespace-nowrap">{row.category}</td>
                          <td className="px-4 py-3 text-sm text-[#424653] hidden md:table-cell max-w-[220px] truncate">{row.details || 'No additional details'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]">
                              {auditSeverity(row.category)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono text-[13px] text-[#737785]">{row.id}</span>
                              <button type="button" className="p-1.5 rounded text-[#737785] hover:bg-[#f2f3ff] hover:text-[#003f93] transition-colors cursor-pointer" aria-label="View audit details">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-[#eaedff] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-[12px] text-[#424653]">
                    Showing <span className="font-bold text-[#131b2e]">{filteredAuditLogs.length ? `1-${filteredAuditLogs.length}` : '0'}</span> of <span className="font-bold text-[#131b2e]">{liveAuditLogs.length.toLocaleString()}</span> events
                  </p>

                  <span className="text-[12px] text-[#737785]">Updates automatically every 5 seconds</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border border-[#c2c6d5] rounded-xl">
                <Info className="w-5 h-5 text-[#737785] mt-0.5 shrink-0" />
                <p className="text-base text-[#424653] leading-relaxed">
                  Audit logs provide a chronological record of important election-system activity. Records are retained for accountability and review.
                </p>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS / ELECTION SETUP */}
          {activeTab === 'settings' && (
            <div className="w-full max-w-[1280px] mx-auto pb-10">
              <header className="flex items-center justify-between py-4 px-2 border-b border-[#c9d2ef] bg-transparent">
                <div className="text-[#1f3f7a] text-3xl sm:text-4xl font-extrabold tracking-tight">Admin Settings</div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 bg-[#eef2ff] border border-[#c7d4f7] rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d4f68]">
                    <span className="w-2 h-2 rounded-full bg-[#5d6f8d] inline-block" />
                    Standby
                  </div>
                  <button type="button" className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-[#3d4f68] hover:bg-[#eef2ff] transition-colors cursor-pointer" aria-label="Notifications">
                    <Bell className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={onOpenGuide} className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-[#3d4f68] hover:bg-[#eef2ff] transition-colors cursor-pointer" aria-label="Open admin guide">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c7d4f7] bg-[#dfe8ff]">
                    <img
                      src={adminAvatarUrl || '/assets/nreerety-removebg-preview.png'}
                      alt="Admin profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </header>

              <div className="mt-8 bg-[#dfe6ff] rounded-[22px] border border-[#c7d4f7] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] p-5 sm:p-6">
                <div className="mb-8">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1b2d4d] tracking-tight">Admin Settings</h2>
                  <p className="mt-2 text-lg text-[#4a5a73]">Manage your administrator account, preferences, notifications, and access settings.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                  <aside className="w-full lg:w-[260px] flex-shrink-0">
                    <nav className="flex flex-col gap-2 pt-1">
                      {[
                        { label: 'Profile', icon: User, active: true },
                        { label: 'Security', icon: ShieldCheck },
                        { label: 'Notifications', icon: Bell },
                        { label: 'Admin Preferences', icon: Settings },
                        { label: 'System Information', icon: Info }
                      ].map(({ label, icon: Icon, active }) => (
                        <button
                          key={label}
                          type="button"
                          className={`group flex items-center justify-between w-full rounded-xl border px-4 py-3 text-left transition-all ${
                            active
                              ? 'bg-white border-[#c9d2ef] text-[#1b2d4d] shadow-sm'
                              : 'border-transparent text-[#46576f] hover:bg-white hover:border-[#c9d2ef]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${active ? 'text-[#0b59c6]' : 'text-[#445872]'}`} />
                            <span className="text-base font-medium">{label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-opacity ${active ? 'opacity-100 text-[#0b59c6]' : 'opacity-0 group-hover:opacity-100 text-[#445872]'}`} />
                        </button>
                      ))}
                    </nav>
                  </aside>

                  <section className="flex-1 bg-white rounded-[20px] border border-[#d5dcee] shadow-sm p-5 sm:p-6">
                    <h3 className="text-[22px] font-bold text-[#1c2945] pb-4 border-b border-[#e7ebf7]">Profile Information</h3>

                    <div className="mt-6 rounded-xl border border-[#d5dcee] bg-[#f7f9ff] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h4 className="text-base font-bold text-[#1c2945]">Election Controls</h4>
                          <p className="mt-1 text-sm text-[#4a5a73]">Choose the voting time, then start or stop the election.</p>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                          <label className="text-xs font-bold text-[#4a5a73]">
                            Voting time
                            <select value={durationMinutes} disabled={status === 'LIVE'} onChange={async (event) => {
                              const result = await setElectionDuration(Number(event.target.value));
                              if (!result.success) showToast(result.message || 'Unable to change voting time.', 'error');
                            }} className="mt-1 block rounded-lg border border-[#c2c6d5] bg-white px-3 py-2 text-sm text-[#131b2e] disabled:cursor-not-allowed disabled:opacity-50">
                              <option value={120}>2 hours</option>
                              <option value={150}>2 hours 30 minutes</option>
                            </select>
                          </label>
                          <button type="button" onClick={() => handleStatusChange(status === 'LIVE' ? 'CLOSED' : 'LIVE')} disabled={status === 'CERTIFIED'} className={`rounded-lg px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${status === 'LIVE' ? 'bg-[#ba1a1a] hover:bg-[#93000a]' : 'bg-[#0055c2] hover:bg-[#003f93]'}`}>
                            {status === 'LIVE' ? 'Stop Election' : 'Start Election'}
                          </button>
                        </div>
                      </div>
                      {status === 'LIVE' && <p className="mt-3 text-sm font-semibold text-[#93000a]">Time left: {remainingTime}</p>}
                    </div>

                    <div className="mt-6 rounded-xl border border-[#fecaca] bg-[#fff7f7] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-base font-bold text-[#991b1b]">Danger Zone</h4>
                          <p className="mt-1 text-sm text-[#7f1d1d]">Reset the election only when you are ready to remove all election records.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirmation(true)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#dc2626] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#b91c1c]"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Reset Election
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-8 md:items-start">
                      <div className="flex justify-center md:justify-start">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-[3px] border-[#dfe8ff] bg-[#e7ebff]">
                          <img
                            src={profileAvatar || '/assets/nreerety-removebg-preview.png'}
                            alt="Admin profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5a73] mb-2">Full Name</label>
                            <div className="rounded-xl border border-[#d5dcee] bg-[#f8faff] px-4 py-3 text-base font-medium text-[#1c2945] min-h-[48px] flex items-center">
                              {adminName}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5a73] mb-2">Email Address</label>
                            <div className="rounded-xl border border-[#d5dcee] bg-[#f8faff] px-4 py-3 text-base font-medium text-[#1c2945] min-h-[48px] flex items-center">
                              {adminEmail || 'Managed by the Electoral Commission'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5a73] mb-2">Role</label>
                            <div className="rounded-xl border border-[#d5dcee] bg-[#eef2ff] px-4 py-3 text-base font-medium text-[#1c2945] min-h-[48px] flex items-center justify-between gap-3 opacity-90">
                              <span>Election Administrator</span>
                              <Lock className="w-4 h-4 text-[#5d6f8d]" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5a73] mb-2">Status</label>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe] px-3 py-1 text-[12px] font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#1e40af]" />
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5a73]">
                            Display Name
                            <input value={profileName} disabled={!isEditingProfile} onChange={(event) => setProfileName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5dcee] bg-white px-4 py-3 text-base font-medium normal-case tracking-normal text-[#1c2945] outline-none focus:border-[#0b59c6] disabled:bg-[#f8faff] disabled:cursor-not-allowed" />
                          </label>
                          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4a5a73]">
                            Profile Picture
                            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={!isEditingProfile} onChange={handleProfileImage} className="mt-2 block w-full rounded-xl border border-[#d5dcee] bg-white px-3 py-2 text-xs normal-case tracking-normal text-[#1c2945] disabled:bg-[#f8faff] disabled:cursor-not-allowed" />
                          </label>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#d5dcee] bg-[#f7f9ff] px-4 py-3 text-[#4a5a73]">
                          <Info className="w-5 h-5 mt-0.5 text-[#0b59c6] shrink-0" />
                          <p className="text-sm leading-relaxed">Your name and picture are shown only in the administrator portal.</p>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingProfile) {
                                void saveProfile();
                              } else {
                                setIsEditingProfile(true);
                              }
                            }}
                            disabled={savingProfile || (isEditingProfile && !profileName.trim())}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0b59c6] hover:bg-[#0a4ea8] text-white px-5 py-3 text-sm font-bold shadow-sm transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                            {savingProfile ? 'Saving...' : isEditingProfile ? 'Save Profile' : 'Edit Profile'}
                          </button>
                          {isEditingProfile && !savingProfile && (
                            <button type="button" onClick={() => { setProfileName(adminName); setProfileAvatar(adminAvatarUrl); setIsEditingProfile(false); }} className="inline-flex items-center gap-2 rounded-xl border border-[#c2c6d5] bg-white px-5 py-3 text-sm font-bold text-[#1c2945] shadow-sm transition-colors hover:bg-[#f8faff]">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>



      {showResetConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div role="alertdialog" aria-modal="true" aria-labelledby="reset-election-title" className="w-full max-w-md rounded-2xl border border-[#fecaca] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fee2e2] text-[#b91c1c]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 id="reset-election-title" className="text-xl font-bold text-[#7f1d1d]">Reset entire election?</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#424653]">This will permanently remove candidates, positions, voters, votes, statistics, results, and audit records. This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowResetConfirmation(false)} className="rounded-lg border border-[#c2c6d5] px-4 py-2.5 text-sm font-bold text-[#131b2e] hover:bg-[#f8fafc]">Cancel</button>
              <button type="button" onClick={() => { setShowResetConfirmation(false); void resetElectionData().then((result) => showToast(result.success ? 'Election system reset successfully.' : (result.message || 'Unable to reset the election.'), result.success ? 'info' : 'error')); }} className="rounded-lg bg-[#dc2626] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#b91c1c]">Yes, Reset Election</button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON CONFIRMATION MODAL */}
      {showImportResults && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-[#c2c6d5] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-bold text-[#131b2e]">Review Imported Results</h2><p className="mt-1 text-sm text-[#424653]">File: {importFileName}. Check all rows before importing.</p></div>
              <button type="button" onClick={() => setShowImportResults(false)} aria-label="Close import preview" className="p-2 text-[#737785] hover:bg-[#f2f3ff]"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 flex gap-4 text-sm text-[#424653]"><span>Rows detected: <strong>{importRows.length}</strong></span><span>Errors: <strong className={importRows.some((row) => row.error) ? 'text-[#ba1a1a]' : 'text-[#003f93]'}>{importRows.filter((row) => row.error).length}</strong></span></div>
            <div className="mt-4 max-h-80 overflow-auto border border-[#e2e8f0]">
              <table className="w-full text-left text-sm"><thead className="bg-[#f2f3ff] text-xs uppercase text-[#424653]"><tr><th className="p-3">Position</th><th className="p-3">Candidate</th><th className="p-3">Votes</th><th className="p-3">Status</th></tr></thead><tbody>{importRows.map((row, index) => <tr key={`${row.position}-${row.candidate}-${index}`} className="border-t border-[#e2e8f0]"><td className="p-3">{row.position || 'Missing'}</td><td className="p-3">{row.candidate || 'Missing'}</td><td className="p-3">{row.votes ?? '—'}</td><td className={`p-3 font-semibold ${row.error ? 'text-[#ba1a1a]' : 'text-[#003f93]'}`}>{row.error || 'Valid'}</td></tr>)}</tbody></table>
            </div>
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowImportResults(false)} className="rounded-lg border border-[#c2c6d5] px-4 py-2 text-sm font-bold text-[#131b2e]">Cancel</button><button type="button" onClick={commitImportedResults} disabled={!importRows.length || importRows.some((row) => row.error)} className="rounded-lg bg-[#0055c2] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Import Valid Results</button></div>
          </div>
        </div>
      )}

      {showManualResults && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#c2c6d5] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-[#131b2e]">Enter Election Results</h2><p className="mt-1 text-sm text-[#424653]">Enter vote counts for the selected position.</p></div><button type="button" onClick={() => setShowManualResults(false)} aria-label="Close manual results" className="p-2 text-[#737785] hover:bg-[#f2f3ff]"><X className="h-5 w-5" /></button></div>
            {positions.length > 0 ? <>
              <label className="mt-5 block text-sm font-bold text-[#424653]">Position<select value={manualPositionId} onChange={(event) => { const next = event.target.value; setManualPositionId(next); setManualVotes(Object.fromEntries(candidates.filter((candidate) => candidate.positionId === next).map((candidate) => [candidate.id, String(candidate.votesCount)]))); }} className="mt-1 block w-full rounded-lg border border-[#c2c6d5] bg-white px-3 py-2 font-normal text-[#131b2e]">{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
              <div className="mt-5 space-y-3">{candidates.filter((candidate) => candidate.positionId === manualPositionId).map((candidate) => <label key={candidate.id} className="flex items-center justify-between gap-4 text-sm font-semibold text-[#131b2e]">{candidate.fullName}<input type="number" min="0" value={manualVotes[candidate.id] ?? '0'} onChange={(event) => setManualVotes((current) => ({ ...current, [candidate.id]: event.target.value }))} className="w-28 rounded-lg border border-[#c2c6d5] px-3 py-2 text-right" /></label>)}</div>
            </> : <p className="mt-5 rounded-lg border border-[#c2c6d5] bg-[#f8fafc] p-4 text-sm text-[#424653]">No election positions are configured yet. Add a position before entering results.</p>}
            <div className="mt-5 border-t border-[#e2e8f0] pt-4 text-sm text-[#424653]">Total votes: <strong>{Object.values(manualVotes).reduce((sum, value) => sum + (Number(value) || 0), 0).toLocaleString()}</strong></div>
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowManualResults(false)} className="rounded-lg border border-[#c2c6d5] px-4 py-2 text-sm font-bold text-[#131b2e]">Cancel</button><button type="button" onClick={saveManualResults} disabled={!positions.length} className="rounded-lg bg-[#0055c2] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Save Position Result</button></div>
          </div>
        </div>
      )}

      {showRejectionModal && selectedReviewVoter && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#c2c6d5] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div>
              <h4 className="text-base font-bold text-[#ba1a1a]">
                Reject Accreditation Request
              </h4>
              <p className="text-xs text-[#424653] mt-1">
                Select or provide the reason why {selectedReviewVoter.fullName} is ineligible for accreditation.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#131b2e] block mb-1">
                Reason for Rejection
              </label>
              <select
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#c2c6d5] rounded-lg bg-white text-[#131b2e] outline-hidden mb-2"
              >
                <option value="Non-matching departmental registration record">Non-matching departmental registration record</option>
                <option value="Invalid matriculation number format">Invalid matriculation number format</option>
                <option value="Unregistered faculty dues clearance">Unregistered faculty dues clearance</option>
                <option value="Duplicate accreditation submission detected">Duplicate accreditation submission detected</option>
                <option value="Other administrative discrepancy">Other administrative discrepancy</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-xs font-bold text-[#424653] hover:text-[#131b2e] rounded-lg border border-[#c2c6d5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectVoter(selectedReviewVoter)}
                className="px-4 py-2 text-xs font-bold bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {feedbackToast && (
        <div className={`fixed bottom-5 right-5 z-70 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 ${
          feedbackToast.type === 'success'
            ? 'bg-[#d9e2ff] text-[#003f93] border-[#adc6ff]'
            : feedbackToast.type === 'error'
            ? 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab]'
            : 'bg-[#faf8ff] text-[#131b2e] border-[#c2c6d5]'
        }`}>
          {feedbackToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#0055c2]" />}
          {feedbackToast.type === 'error' && <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />}
          <span>{feedbackToast.message}</span>
        </div>
      )}

    </div>
  );
};
