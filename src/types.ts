export type ElectionStatus = 'STANDBY' | 'ACCREDITATION_OPEN' | 'LIVE' | 'CLOSED' | 'CERTIFIED';
export type ResultsStatus = 'DRAFT' | 'PUBLISHED' | 'CERTIFIED';

export type BMSDepartment = 
  | 'Anatomy'
  | 'Psychology';

export type AcademicLevel = '100L' | '200L' | '300L';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Voter {
  id: string;
  matricNumber: string;
  fullName: string;
  department: BMSDepartment;
  level: AcademicLevel;
  email: string;
  phone: string;
  isEligible: boolean;
  isAccredited: boolean;
  hasVoted: boolean;
  voterPin: string; // 4-digit voter PIN
  accreditationTime?: string;
  votedTime?: string;
  ballotReceiptHash?: string;
  avatarUrl?: string;
  verificationStatus?: VerificationStatus;
  registeredAt?: string;
  rejectionReason?: string;
  idCardUrl?: string;
  registrationId?: string;
  reviewNotes?: string;
}

export interface Candidate {
  id: string;
  positionId: string;
  fullName: string;
  department: BMSDepartment;
  level: AcademicLevel;
  cgpaRange: string;
  photoUrl: string;
  tagline: string;
  manifesto: string[];
  runningMate?: {
    name: string;
    department: BMSDepartment;
    level: AcademicLevel;
  };
  votesCount: number;
  approvedByEleco: boolean;
}

export interface ElectionPosition {
  id: string;
  title: string;
  description: string;
  order: number;
  maxSelections: number;
}

export interface CommissionMember {
  id: string;
  initials: string;
  name: string;
  role: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  encryptedHash: string;
  category: 'SECURITY' | 'ACCREDITATION' | 'VOTE' | 'ADMIN' | 'SYSTEM';
  details?: string;
}

export interface BallotSubmission {
  matricNumber: string;
  votes: Record<string, string>; // positionId -> candidateId
  timestamp: string;
  verificationHash: string;
  deviceFingerprint: string;
}

export interface DepartmentTurnout {
  department: BMSDepartment;
  eligible: number;
  accredited: number;
  voted: number;
}
