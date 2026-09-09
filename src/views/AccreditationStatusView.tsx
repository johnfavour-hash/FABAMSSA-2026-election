import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { Voter } from '../types';
import { 
  Clock, 
  Calendar, 
  Eye, 
  Check, 
  MoreHorizontal, 
  ArrowLeft,
  FileBadge,
  ShieldCheck,
  Building2,
  LayoutDashboard,
  Vote,
  Search,
  LogIn,
  Key,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface AccreditationStatusViewProps {
  voter?: Voter | null;
  onNavigateToDashboard: () => void;
  onNavigateToElectionDetails: () => void;
  onNavigateToEligibility: () => void;
  onNavigateToVoterLogin: () => void;
}

export const AccreditationStatusView: React.FC<AccreditationStatusViewProps> = ({
  voter,
  onNavigateToDashboard,
  onNavigateToElectionDetails,
  onNavigateToEligibility,
  onNavigateToVoterLogin,
}) => {
  const { currentVoter, voters } = useElection();
  const trackedVoter = voter || currentVoter;
  const liveVoter = trackedVoter ? voters.find((item) => item.id === trackedVoter.id || item.matricNumber === trackedVoter.matricNumber) || trackedVoter : null;
  const isRejected = liveVoter?.verificationStatus === 'rejected';
  const isAccredited = Boolean(liveVoter?.isAccredited);

  if (!liveVoter) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] px-4 py-12 text-center text-[#424653]">
        No registration is selected. Submit a registration or sign in to view its accreditation status.
      </div>
    );
  }

  const voterName = liveVoter.fullName;
  const matricNo = liveVoter.matricNumber;
  const level = liveVoter.level;
  const voterPin = liveVoter.voterPin || '';
  const hasPin = Boolean(voterPin);
  const [copiedPin, setCopiedPin] = useState(false);
  const submittedOn = liveVoter.registeredAt
    ? new Date(liveVoter.registeredAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recently submitted';
  const documentLabel = liveVoter.idCardUrl ? 'Uploaded student document' : 'Student document';
  const statusLabel = isRejected ? 'Rejected' : isAccredited ? 'Approved' : 'Submitted';
  const statusHeading = isRejected ? 'ACCREDITATION REJECTED' : isAccredited ? 'ACCREDITATION APPROVED' : 'ACCREDITATION PENDING';
  const statusMessage = isRejected
    ? liveVoter?.rejectionReason || 'Your accreditation request was not approved. Please contact the Electoral Commission.'
    : isAccredited
    ? 'Your accreditation has been approved. Your voting PIN is ready and you are eligible to vote.'
    : 'Your accreditation is being reviewed. Our team is currently verifying your submitted documents against institutional records.';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] text-[#131b2e] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-6 sm:gap-8">
        
        {/* Header */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-[#424653] uppercase tracking-wider block mb-1">
            VOTER ACCREDITATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight">
            Accreditation status
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Main Status Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Student Info Compact */}
            <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-12 gap-y-3">
                <div>
                  <span className="text-xs font-semibold text-[#424653] block mb-0.5">Name</span>
                  <span className="text-base sm:text-lg font-semibold text-[#131b2e]">{voterName}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#424653] block mb-0.5">Matric No.</span>
                  <span className="text-base sm:text-lg font-semibold text-[#131b2e]">{matricNo}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#424653] block mb-0.5">Level</span>
                  <span className="text-base sm:text-lg font-semibold text-[#131b2e]">{level}</span>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f3ff] text-[#424653] text-xs font-semibold border border-[#d2d9f4]">
                  Status: {statusLabel}
                </span>
              </div>
            </div>

            {/* Primary Status Area */}
            <div className="bg-white border border-[#c2c6d5] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs">
              <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-5 ${isRejected ? 'bg-[#ffdad6]' : isAccredited ? 'bg-[#dcfce7]' : 'bg-[#FEF3C7]'}`}>
                {isRejected ? <ShieldCheck className="w-10 h-10 text-[#93000a]" /> : isAccredited ? <Check className="w-10 h-10 text-[#166534]" /> : <Clock className="w-10 h-10 text-[#92400E]" />}
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 flex items-center justify-center gap-2 ${isRejected ? 'text-[#93000a]' : isAccredited ? 'text-[#166534]' : 'text-[#92400E]'}`}>
                <span>●</span> {statusHeading}
              </h2>
              <p className="text-sm sm:text-base text-[#424653] max-w-lg leading-relaxed">{statusMessage}</p>

              {/* VOTING PIN CARD — shown only when approved & pin available */}
              {isAccredited && hasPin && (
                <div className="mt-8 w-full max-w-md mx-auto bg-gradient-to-br from-[#003f93] to-[#0055c2] rounded-2xl p-6 sm:p-7 text-white shadow-[0_16px_40px_rgba(0,63,147,0.22)] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#ffd966]" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                        Your Official Voting PIN
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-[#dcfce7]/15 text-[#dcfce7] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#dcfce7]/30">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 mb-3">
                    <div className="text-4xl sm:text-5xl font-black tracking-[0.45em] text-center text-white font-mono select-all">
                      {voterPin}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed text-center sm:text-left">
                      Use this 4-digit PIN together with your <strong>Matric No.</strong> to sign in to the Ballot Booth on Election Day.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(voterPin);
                        setCopiedPin(true);
                        window.setTimeout(() => setCopiedPin(false), 1800);
                      }}
                      className="shrink-0 inline-flex items-center gap-1.5 bg-white text-[#003f93] hover:bg-[#ffd966] hover:text-[#001944] transition-colors px-3.5 py-2 rounded-lg text-[11px] font-bold shadow-sm cursor-pointer"
                    >
                      {copiedPin ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy PIN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* INFO CALLOUT: How to retrieve PIN when approved */}
              {!isAccredited && !isRejected && (
                <div className="mt-6 w-full max-w-lg mx-auto p-4 bg-[#FFF8E1] border border-[#FFE082] rounded-xl flex items-start gap-3 text-left">
                  <Search className="w-5 h-5 text-[#B26A00] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#7A4600]">
                      When your accreditation is approved, a 4-digit voting PIN will be generated for you.
                    </p>
                    <p className="text-[11px] text-[#7A4600]/90 leading-relaxed">
                      Return here to view or copy it, or at any time tap the <strong>Check Eligibility</strong> button, enter your Matric No., and your PIN will be displayed instantly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Accreditation Journey */}
            <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base sm:text-lg font-bold text-[#131b2e] mb-6">
                Accreditation Journey
              </h3>
              
              <div className="relative flex justify-between items-center my-4 px-2">
                {/* Background Connecting Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#eaedff] z-0 rounded-full"></div>
                {/* Active Progress Line (Stage 1 to 2) */}
                <div className="absolute left-6 w-[33%] top-1/2 -translate-y-1/2 h-1 bg-[#003f93] z-0 rounded-full"></div>

                {/* Stage 1 */}
                <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
                  <div className="w-8 h-8 rounded-full bg-[#003f93] flex items-center justify-center text-white shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-center text-[#131b2e]">
                    Registration Submitted
                  </span>
                </div>

                {/* Stage 2 */}
                <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white shadow-xs ${isRejected || isAccredited ? 'bg-[#003f93] border-[#003f93]' : 'bg-[#003f93] border-[#003f93]'}`}>
                    {isAccredited || isRejected ? <Check className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-center text-[#003f93]">
                    Documents Reviewed
                  </span>
                </div>

                {/* Stage 3 */}
                <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isAccredited ? 'bg-[#003f93] border-[#003f93] text-white' : 'bg-white border-[#c2c6d5] text-[#737785]'}`}>
                    {isAccredited ? <Check className="w-4 h-4" /> : <span className="w-2.5 h-2.5 rounded-full bg-transparent"></span>}
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-center text-[#737785]">
                    Accreditation Approved
                  </span>
                </div>

                {/* Stage 4 */}
                <div className="relative z-10 flex flex-col items-center gap-2 w-1/4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isAccredited ? 'bg-[#003f93] border-[#003f93] text-white' : 'bg-white border-[#c2c6d5] text-[#737785]'}`}>
                    {isAccredited ? <Check className="w-4 h-4" /> : <span className="w-2.5 h-2.5 rounded-full bg-transparent"></span>}
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-center text-[#737785]">
                    Eligible to Vote
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
              <button 
                onClick={onNavigateToDashboard}
                className="bg-[#0055C2] text-white text-sm font-bold px-5 py-3.5 rounded-xl hover:bg-[#003f93] transition-colors shadow-sm cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 border border-[#003f93]/30"
              >
                <LayoutDashboard className="w-4 h-4" />
                Back to Dashboard
              </button>
              <button 
                onClick={onNavigateToElectionDetails}
                className="bg-white border border-[#c2c6d5] text-[#131b2e] text-sm font-semibold px-5 py-3.5 rounded-xl hover:bg-[#f2f3ff] hover:border-[#003f93]/30 transition-colors shadow-sm cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Vote className="w-4 h-4 text-[#003f93]" />
                View Election Details
              </button>
              <button 
                onClick={onNavigateToEligibility}
                className="bg-[#003f93]/10 border border-[#003f93]/20 text-[#003f93] text-sm font-semibold px-5 py-3.5 rounded-xl hover:bg-[#003f93]/15 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Check Eligibility
              </button>
              <button 
                onClick={onNavigateToVoterLogin}
                className="bg-[#003f93] text-white text-sm font-bold px-5 py-3.5 rounded-xl hover:bg-[#002f70] transition-colors shadow-sm cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 border border-[#003f93]/30"
              >
                <LogIn className="w-4 h-4" />
                Voter's Login
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar Details */}
          <div className="flex flex-col gap-6">
            {/* Registration Details */}
            <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#131b2e] mb-4 pb-2 border-b border-[#eaedff]">
                Registration Details
              </h3>
              <ul className="space-y-4">
                <li>
                  <span className="text-xs font-semibold text-[#424653] block mb-1">
                    Submitted On
                  </span>
                  <span className="text-sm font-medium text-[#131b2e] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#737785]" />
                    {submittedOn}
                  </span>
                </li>
                <li>
                  <span className="text-xs font-semibold text-[#424653] block mb-1">
                    Document Provided
                  </span>
                  <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#c2c6d5]">
                    <div className="flex items-center gap-2.5">
                      <FileBadge className="w-4 h-4 text-[#003f93]" />
                      <span className="text-sm font-medium text-[#131b2e]">{documentLabel}</span>
                    </div>
                    <Eye className="w-4 h-4 text-[#737785]" />
                  </div>
                </li>
                <li>
                  <span className="text-xs font-semibold text-[#424653] block mb-1">
                    Voting PIN
                  </span>
                  {isAccredited && hasPin ? (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#003f93] to-[#0055c2] rounded-lg border border-[#003f93]/30 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#ffd966]" />
                        <span className="text-lg font-black tracking-[0.4em] text-white font-mono">{voterPin}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(voterPin);
                          setCopiedPin(true);
                          window.setTimeout(() => setCopiedPin(false), 1800);
                        }}
                        className="shrink-0 inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors text-[10px] font-bold cursor-pointer"
                        aria-label="Copy voting PIN"
                      >
                        {copiedPin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-[#f2f3ff] rounded-lg border border-dashed border-[#d2d9f4]">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#737785]" />
                        <span className="text-xs font-medium text-[#737785]">
                          {isRejected ? 'PIN unavailable (rejected)' : 'Awaiting accreditation'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateToEligibility}
                        className="shrink-0 inline-flex items-center gap-1 text-[#003f93] hover:text-[#002f70] transition-colors text-[10px] font-bold cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Check Eligibility
                      </button>
                    </div>
                  )}
                </li>
              </ul>
            </div>

            {/* What Happens Next */}
            <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#131b2e] mb-4 pb-2 border-b border-[#eaedff]">
                What Happens Next?
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#eaedff] text-[#003f93] flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#131b2e] mb-0.5">Verification</h4>
                    <p className="text-xs text-[#424653] leading-relaxed">
                      Electoral officers will verify your student ID against the current academic registry.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#eaedff] text-[#003f93] flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#131b2e] mb-0.5">Status Updates</h4>
                    <p className="text-xs text-[#424653] leading-relaxed">
                      Return to this page to check for approval or any further action needed on your submission.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#eaedff] text-[#003f93] flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#131b2e] mb-0.5">Voting Eligibility &amp; PIN</h4>
                    <p className="text-xs text-[#424653] leading-relaxed">
                      Once approved, a unique 4-digit voting PIN will be generated for you. Open <strong>Check Eligibility</strong> and enter your Matric No. to view or copy your PIN, then sign in to the digital ballot on election day.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
