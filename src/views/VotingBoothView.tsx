import React, { useState, useEffect } from 'react';
import { useElection } from '../context/ElectionContext';
import { Candidate, ElectionPosition } from '../types';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import confetti from 'canvas-confetti';
import { 
  Vote, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  Printer,
  RefreshCw,
  FileCheck,
  UserCheck,
  Ban,
  User,
  ExternalLink,
  Circle,
  Radio
} from 'lucide-react';

interface VotingBoothViewProps {
  onBackToHome: () => void;
  onOpenLiveMonitor: () => void;
  onOpenEligibility: () => void;
}

export const VotingBoothView: React.FC<VotingBoothViewProps> = ({
  onBackToHome,
  onOpenLiveMonitor,
  onOpenEligibility,
}) => {
  const { 
    status, 
    currentVoter, 
    positions, 
    candidates, 
    castBallot,
    loginVoter
  } = useElection();

  // Voter Auth form state (if not authenticated yet)
  const [matricInput, setMatricInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Position pagination state
  const [activePositionIndex, setActivePositionIndex] = useState(0);

  // Voting Step: 'VOTE_SELECTION' | 'CONFIRMATION' | 'RECEIPT'
  const [boothStep, setBoothStep] = useState<'VOTE_SELECTION' | 'CONFIRMATION' | 'RECEIPT'>('VOTE_SELECTION');
  
  // Selected candidate per position: { [positionId]: candidateId } ('ABSTAIN' for abstain)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  
  // Candidate detail modal state
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [viewingPosition, setViewingPosition] = useState<ElectionPosition | null>(null);
  
  // Receipt state
  const [receiptHash, setReceiptHash] = useState<string>('');
  const [submissionTime, setSubmissionTime] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Modal state for Submit Confirmation Dialog
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);

  // If current voter already voted, show receipt directly
  useEffect(() => {
    if (currentVoter?.hasVoted && currentVoter.ballotReceiptHash) {
      setReceiptHash(currentVoter.ballotReceiptHash);
      setSubmissionTime(currentVoter.votedTime || new Date().toISOString());
      setBoothStep('RECEIPT');
    }
  }, [currentVoter]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await loginVoter(matricInput, pinInput);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  const handleSelectCandidate = (posId: string, candId: string) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [posId]: candId,
    }));
  };

  const handleOpenManifesto = (candidate: Candidate, position: ElectionPosition) => {
    setViewingCandidate(candidate);
    setViewingPosition(position);
  };

  const completedCount = Object.keys(selectedVotes).length;
  const totalPositions = positions.length;
  const currentPos = positions[activePositionIndex] || positions[0];
  const posCandidates = currentPos ? candidates.filter((c) => c.positionId === currentPos.id) : [];
  const currentSelection = currentPos ? selectedVotes[currentPos.id] : undefined;

  const handlePreviousPosition = () => {
    if (activePositionIndex > 0) {
      setActivePositionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPosition = () => {
    if (activePositionIndex < totalPositions - 1) {
      setActivePositionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setBoothStep('CONFIRMATION');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitBallot = async () => {
    setSubmitting(true);
    const res = await castBallot(selectedVotes);
    setSubmitting(false);
    if (res.success) {
      setReceiptHash(res.receiptHash);
      setSubmissionTime(new Date().toISOString());
      setBoothStep('RECEIPT');
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0055c2', '#2563eb', '#8ab0fe', '#15803d', '#f59e0b']
      });
    } else {
      setAuthError(res.message);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // If not logged in, show Auth Gate
  if (!currentVoter) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#faf8ff] min-h-[75vh] flex items-center justify-center font-sans">
        <div className="bg-white border border-[#c2c6d5] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#001944] text-white p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0055c2] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Vote className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              FABAMSSA 2026 Ballot Booth
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Confidential Electronic Voting Authentication
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-6">
            {status !== 'LIVE' && status !== 'STANDBY' && (
              <div className="p-3.5 bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Electoral Note:</span> The election status is currently set to{' '}
                  <span className="font-bold uppercase">[{status}]</span>. Ballots can still be submitted in demonstration preview.
                </div>
              </div>
            )}

            {authError && (
              <div className="p-3.5 bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-xs font-medium rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1.5">
                  Matriculation Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. U2022/5570012"
                  value={matricInput}
                  onChange={(e) => setMatricInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl text-sm font-medium focus:outline-hidden focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                    4-Digit Voter PIN
                  </label>
                  <button
                    type="button"
                    onClick={onOpenEligibility}
                    className="text-xs text-[#0055c2] hover:underline font-semibold cursor-pointer"
                  >
                    Look up my PIN
                  </button>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl text-sm font-mono text-center tracking-[0.5em] focus:outline-hidden focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0055c2] hover:bg-[#003f93] border border-[#BFDBFE] text-white font-semibold py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Verify Credentials &amp; Unlock Ballot</span>
              </button>
            </form>


          </div>

          <div className="bg-[#f2f3ff] border-t border-[#c2c6d5] px-6 py-3 text-center text-xs text-[#737785]">
            <Lock className="w-3.5 h-3.5 inline mr-1 text-[#0055c2]" />
            Your votes are completely decoupled from your identity.
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: BALLOT RECEIPT (After casting)
  if (boothStep === 'RECEIPT') {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#faf8ff] min-h-[80vh] flex items-center justify-center font-sans">
        <div className="bg-white border-2 border-[#b0c6ff] rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden print:border-none print:shadow-none">
          {/* Header Banner */}
          <div className="bg-[#001944] text-white p-6 text-center relative">
            <div className="w-14 h-14 rounded-full bg-[#15803d] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="bg-[#dcfce7] text-[#15803d] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
              Official Ballot Receipt
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              FABAMSSA 2026 Ballot Receipt
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Faculty of Basic Medical Science Students Association (FABAMSSA) • University of Port Harcourt
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Confirmation Note */}
            <div className="p-4 bg-[#f2f3ff] border border-[#c2c6d5] rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0055c2] shrink-0 mt-0.5" />
              <div className="text-xs text-[#131b2e] leading-relaxed">
                <p className="font-bold text-sm text-[#003f93] mb-0.5">
                  1-Student-1-Ballot Confirmed &amp; Recorded
                </p>
                <p className="text-[#424653]">
                  Your ballot has been accepted into the live ELECO tally record. In accordance with Article IV of the FABAMSSA Electoral Guidelines, ballot choices are decoupled from voter identities in the official result process.
                </p>
              </div>
            </div>

            {/* Voter & Security Hash Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl">
                <span className="text-[#737785] font-semibold block mb-1">Accredited Student:</span>
                <span className="font-bold text-[#131b2e] text-sm block">{currentVoter.fullName}</span>
                <span className="text-[#0055c2] font-mono">{currentVoter.matricNumber}</span>
                <span className="block text-[#424653] mt-0.5">{currentVoter.department} • {currentVoter.level}</span>
              </div>

              <div className="p-3.5 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl">
                <span className="text-[#737785] font-semibold block mb-1">Audit Timestamp:</span>
                <span className="font-mono font-bold text-[#131b2e] block">
                  {new Date(submissionTime || Date.now()).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>
                <span className="text-[#15803d] font-semibold block mt-1">Status: Recorded in Election Log</span>
              </div>
            </div>

            {/* Official Receipt Reference */}
            <div className="p-4 bg-[#f2f3ff] border border-[#c2c6d5] rounded-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#003f93] uppercase tracking-wider">
                  Official Receipt Reference
                </span>
                <span className="bg-[#dcfce7] text-[#15803d] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recorded
                </span>
              </div>
              <div className="mt-2 font-mono text-sm sm:text-base text-[#003f93] break-all bg-white p-3 rounded-lg border border-[#c2c6d5] select-all">
                {receiptHash}
              </div>
              <p className="mt-2 text-[11px] text-[#424653]">
                Keep this reference for your personal confirmation record.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-white hover:bg-[#f2f3ff] text-[#131b2e] border border-[#c2c6d5] font-semibold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#0055c2]" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={onOpenLiveMonitor}
                className="flex-1 bg-[#0055c2] hover:bg-[#003f93] text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Vote className="w-4 h-4" />
                <span>View Live Election Monitor</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // STEP 2: REVIEW & CONFIRMATION
  if (boothStep === 'CONFIRMATION') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#faf8ff] text-[#131b2e] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-[1280px] mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight uppercase mb-1">
                  Ballot Review
                </h1>
                <p className="text-sm sm:text-base text-[#424653]">
                  Review your ballot carefully before submitting.
                </p>
              </div>

              {/* Not Yet Submitted Badge */}
              <div className="inline-flex items-center gap-2 bg-[#f2f3ff] border border-[#c2c6d5] rounded-full px-4 py-1.5 self-start sm:self-auto shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                <span className="text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                  Not Yet Submitted
                </span>
              </div>
            </div>

            {/* Banner Card */}
            <div className="bg-[#f2f3ff] p-4 sm:p-5 rounded-2xl border border-[#c2c6d5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#131b2e] mb-0.5">
                  FABAMSSA General Elections 2026
                </h2>
                <p className="text-xs sm:text-sm text-[#424653]">
                  Verify your selections for all positions.
                </p>
              </div>
              <div className="bg-[#0055c2] text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-2xs">
                {completedCount} of {totalPositions} Positions Completed
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            
            {/* Left Sidebar (Navigator) */}
            <aside className="w-full lg:w-1/3 xl:w-1/4 shrink-0">
              <div className="bg-white border border-[#c2c6d5] rounded-2xl p-5 sticky top-24 shadow-xs">
                <h3 className="text-base font-bold text-[#131b2e] mb-4 pb-2.5 border-b border-[#eaedff]">
                  Your Ballot
                </h3>
                <ul className="space-y-2.5">
                  {positions.map((pos, idx) => {
                    const isFilled = selectedVotes[pos.id] !== undefined;
                    const posNum = String(idx + 1).padStart(2, '0');

                    return (
                      <li key={pos.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setActivePositionIndex(idx);
                            setBoothStep('VOTE_SELECTION');
                          }}
                          className="w-full text-left flex items-center gap-2.5 text-[#003f93] hover:bg-[#f2f3ff] p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5 text-[#003f93] shrink-0 fill-[#003f93]/10" />
                          <span className="text-sm font-bold truncate">
                            {posNum} {pos.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>

            {/* Main Content (Ballot Review Cards) */}
            <div className="w-full lg:w-2/3 xl:w-3/4 space-y-4">
              {positions.map((pos, idx) => {
                const chosenCandId = selectedVotes[pos.id];
                const chosenCand = candidates.find((c) => c.id === chosenCandId);
                const isAbstain = chosenCandId === 'ABSTAIN';
                const posNum = String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={pos.id}
                    className="bg-white border border-[#c2c6d5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#f2f3ff]/60 shadow-xs"
                  >
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-[#424653] uppercase tracking-wider mb-2">
                        {posNum} {pos.title}
                      </p>

                      {isAbstain ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border border-[#c2c6d5] flex items-center justify-center bg-[#f2f3ff] shrink-0">
                            <Ban className="w-5 h-5 text-[#737785]" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-[#131b2e]">
                              Abstain
                            </h4>
                            <p className="text-xs text-[#737785]">
                              Chose not to vote for this position
                            </p>
                          </div>
                        </div>
                      ) : chosenCand ? (
                        <div className="flex items-center gap-3">
                          <img
                            alt={chosenCand.fullName}
                            src={chosenCand.photoUrl}
                            className="w-12 h-12 rounded-full object-cover border border-[#c2c6d5] shrink-0 bg-[#eaedff]"
                          />
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg font-bold text-[#131b2e] truncate">
                              {chosenCand.fullName}
                            </h4>
                            <p className="text-xs text-[#003f93] font-medium">
                              Selected Candidate
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#ba1a1a]">
                          <AlertCircle className="w-4 h-4" />
                          <span>No candidate selected</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePositionIndex(idx);
                        setBoothStep('VOTE_SELECTION');
                      }}
                      className="text-xs font-bold text-[#003f93] hover:text-[#002f70] uppercase tracking-wider py-2 px-5 border border-[#c2c6d5] rounded-xl bg-[#faf8ff] hover:bg-[#dae2fd] transition-colors cursor-pointer shrink-0 self-end sm:self-center active:scale-98 shadow-2xs"
                    >
                      Change
                    </button>
                  </div>
                );
              })}

              {/* Ready to Submit? Section */}
              <div className="mt-8 pt-4">
                <div className="bg-[#f2f3ff] rounded-2xl p-6 sm:p-8 border border-[#c2c6d5] text-center shadow-xs">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#131b2e] mb-2">
                    Ready to Submit?
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-[#ba1a1a] mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-xs sm:text-sm font-semibold">
                      Warning: Your selections cannot be changed after submission.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setBoothStep('VOTE_SELECTION')}
                      className="w-full sm:w-auto text-xs font-bold text-[#131b2e] uppercase tracking-wider border border-[#c2c6d5] bg-white hover:bg-[#faf8ff] py-3.5 px-6 rounded-xl transition-colors cursor-pointer shadow-2xs active:scale-98"
                    >
                      Return to Voting
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full sm:w-auto text-xs font-bold text-white uppercase tracking-wider bg-[#0055C2] hover:bg-[#003f93] py-3.5 px-8 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Submit Ballot</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Confirmation Dialog Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-[#131b2e]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#c2c6d5] shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4 text-[#003f93]">
                <div className="w-10 h-10 rounded-full bg-[#f2f3ff] border border-[#c2c6d5] flex items-center justify-center text-[#003f93]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#131b2e]">
                  Submit your ballot?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#424653] leading-relaxed mb-5">
                By submitting this ballot, you confirm that your selections are final. This action is irreversible and tamper-proof recorded into the official ELECO tally.
              </p>

              <label className="flex items-start gap-3 mb-6 cursor-pointer bg-[#faf8ff] p-3 rounded-xl border border-[#c2c6d5]">
                <input
                  type="checkbox"
                  checked={confirmedAccuracy}
                  onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#c2c6d5] text-[#0055c2] focus:ring-[#0055c2]"
                />
                <span className="text-xs font-semibold text-[#131b2e] leading-snug">
                  I have reviewed my selections and confirm they are accurate.
                </span>
              </label>

              <div className="flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="text-xs font-bold text-[#424653] uppercase tracking-wider border border-[#c2c6d5] bg-white hover:bg-[#f2f3ff] py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!confirmedAccuracy || submitting}
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmitBallot();
                  }}
                  className={`text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                    confirmedAccuracy && !submitting
                      ? 'bg-[#0055C2] hover:bg-[#003f93] text-white active:scale-98'
                      : 'bg-[#c2c6d5] text-[#737785] cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Ballot</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // STEP 1: POSITION-BY-POSITION VOTING BOOTH (Matching Design)
  const progressPercentage = totalPositions > 0 
    ? ((activePositionIndex + 1) / totalPositions) * 100 
    : 0;

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-[calc(100vh-4rem)] flex flex-col font-sans">
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar: Your Ballot */}
        <aside className="w-full md:w-1/4 shrink-0">
          <div className="sticky top-24 bg-[#f2f3ff] rounded-xl p-5 border border-[#c2c6d5] shadow-xs">
            <h2 className="text-xs font-bold text-[#424653] mb-1 uppercase tracking-wider">
              Your Ballot
            </h2>
            <p className="text-sm text-[#737785] mb-6">
              {completedCount} of {totalPositions} positions complete
            </p>

            <nav className="space-y-1.5">
              {positions.map((pos, idx) => {
                const isCurrent = idx === activePositionIndex;
                const isFilled = selectedVotes[pos.id] !== undefined;
                const posNum = String(idx + 1).padStart(2, '0');

                if (isCurrent) {
                  return (
                    <button
                      key={pos.id}
                      onClick={() => setActivePositionIndex(idx)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg border-2 border-[#003f93] text-[#003f93] bg-[#dae2fd] font-bold text-sm transition-all cursor-pointer shadow-xs"
                    >
                      <span className="truncate">{posNum} {pos.title}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  );
                }

                if (isFilled) {
                  return (
                    <button
                      key={pos.id}
                      onClick={() => setActivePositionIndex(idx)}
                      className="w-full text-left flex items-center justify-between p-3 rounded-lg bg-[#003f93] text-white text-sm font-semibold hover:bg-[#002f70] transition-colors cursor-pointer"
                    >
                      <span className="truncate">{posNum} {pos.title}</span>
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                    </button>
                  );
                }

                return (
                  <button
                    key={pos.id}
                    onClick={() => setActivePositionIndex(idx)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg text-[#424653] hover:bg-white/60 text-sm transition-colors cursor-pointer opacity-70 hover:opacity-100"
                  >
                    <span className="truncate">{posNum} {pos.title}</span>
                    <Circle className="w-4 h-4 shrink-0 text-[#c2c6d5]" />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Content */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            {/* Election Header & Progress */}
            <div className="mb-8 border-b border-[#c2c6d5] pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#131b2e] flex items-center gap-2.5 flex-wrap">
                  FABAMSSA GENERAL ELECTIONS 2026
                  <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#1E40AF] px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]"></span>
                    VOTING IS LIVE
                  </span>
                </h1>
                <p className="text-sm text-[#424653]">4 September 2026</p>
              </div>

              {/* Progress Bar Header */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#424653]">
                    Position {activePositionIndex + 1} of {totalPositions}
                  </span>
                  <span className="text-xs font-bold text-[#003f93]">
                    {currentPos?.title}
                  </span>
                </div>
                <div className="w-full bg-[#eaedff] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#003f93] h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Position Heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#131b2e] mb-2 tracking-tight uppercase">
                POSITION {String(activePositionIndex + 1).padStart(2, '0')}: {currentPos?.title}
              </h2>
              <p className="text-sm sm:text-base text-[#424653] flex items-center justify-center gap-1.5">
                <Info className="w-4 h-4 text-[#737785]" />
                <span>Select one candidate.</span>
              </p>
            </div>

            {/* Candidate List (Radio Group) */}
            <div className="space-y-4 mb-8" role="radiogroup">
              {posCandidates.map((cand) => {
                const isSelected = currentSelection === cand.id;

                return (
                  <div
                    key={cand.id}
                    onClick={() => handleSelectCandidate(currentPos.id, cand.id)}
                    className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#DBEAFE] border-2 border-[#003f93] shadow-xs'
                        : 'bg-white border border-[#c2c6d5] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    {/* Radio Indicator */}
                    <div className="shrink-0 flex items-center justify-center">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#003f93] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#003f93]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#c2c6d5]" />
                      )}
                    </div>

                    {/* Candidate Photo */}
                    <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full overflow-hidden shrink-0 border border-[#c2c6d5] bg-[#eaedff]">
                      {cand.photoUrl ? (
                        <img 
                          src={cand.photoUrl} 
                          alt={cand.fullName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#737785]">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-[#131b2e] truncate">
                        {cand.fullName}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#424653] italic truncate">
                        "{cand.tagline || 'Excellence in Leadership'}"
                      </p>
                    </div>

                    {/* View Profile Link */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenManifesto(cand, currentPos);
                      }}
                      className="flex items-center gap-1 text-[#003f93] hover:text-[#002f70] text-xs sm:text-sm font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* Abstain Option */}
              <div
                onClick={() => handleSelectCandidate(currentPos.id, 'ABSTAIN')}
                className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
                  currentSelection === 'ABSTAIN'
                    ? 'bg-[#DBEAFE] border-2 border-[#003f93] shadow-xs'
                    : 'bg-white border border-[#c2c6d5] hover:bg-[#f2f3ff]'
                }`}
              >
                {/* Radio Indicator */}
                <div className="shrink-0 flex items-center justify-center">
                  {currentSelection === 'ABSTAIN' ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#003f93] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#003f93]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#c2c6d5]" />
                  )}
                </div>

                {/* Abstain Icon Avatar */}
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full overflow-hidden shrink-0 border border-[#c2c6d5] flex items-center justify-center bg-[#f2f3ff]">
                  <Ban className="w-6 h-6 text-[#737785]" />
                </div>

                {/* Abstain Text */}
                <div className="flex-grow min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-[#131b2e]">
                    Abstain
                  </h3>
                  <p className="text-xs sm:text-sm text-[#424653]">
                    Choose not to vote for this position
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Notice Card */}
            <div className="bg-[#f2f3ff] border border-[#c2c6d5] rounded-xl p-4 flex items-start gap-3 mb-8">
              <Lock className="w-4 h-4 text-[#737785] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#424653] leading-relaxed">
                <strong>Your ballot is private.</strong> Your selections are secured and kept entirely separate from your voter identity to ensure absolute anonymity.
              </p>
            </div>
          </div>

          {/* Action Buttons: Previous & Continue */}
          <div className="flex justify-between items-center pt-6 border-t border-[#c2c6d5] gap-4">
            <button
              onClick={handlePreviousPosition}
              disabled={activePositionIndex === 0}
              className={`px-6 py-3 rounded-xl border border-[#c2c6d5] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activePositionIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-transparent text-[#737785]'
                  : 'text-[#131b2e] hover:bg-[#f2f3ff] active:scale-98'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNextPosition}
              className="px-6 py-3 rounded-xl bg-[#0055C2] hover:bg-[#003f93] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <span>
                {activePositionIndex === totalPositions - 1
                  ? 'Review & Cast Ballot'
                  : 'Continue to Next Position'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Candidate Details Modal */}
      <CandidateDetailModal
        candidate={viewingCandidate}
        position={viewingPosition}
        isOpen={Boolean(viewingCandidate)}
        onClose={() => setViewingCandidate(null)}
        onSelectCandidate={(candId) => {
          if (viewingPosition) {
            handleSelectCandidate(viewingPosition.id, candId);
          }
        }}
        isSelected={viewingPosition ? selectedVotes[viewingPosition.id] === viewingCandidate?.id : false}
      />
    </div>
  );
};
