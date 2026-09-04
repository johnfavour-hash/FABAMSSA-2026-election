import React from 'react';
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
  Building2
} from 'lucide-react';

interface AccreditationStatusViewProps {
  voter?: Voter | null;
  onNavigateToDashboard: () => void;
  onNavigateToElectionDetails: () => void;
}

export const AccreditationStatusView: React.FC<AccreditationStatusViewProps> = ({
  voter,
  onNavigateToDashboard,
  onNavigateToElectionDetails,
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-2">
              <button 
                onClick={onNavigateToDashboard}
                className="bg-[#0055C2] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-[#003f93] transition-colors shadow-xs cursor-pointer active:scale-98 text-center"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={onNavigateToElectionDetails}
                className="bg-white border border-[#c2c6d5] text-[#131b2e] text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-[#f2f3ff] transition-colors shadow-xs cursor-pointer active:scale-98 text-center"
              >
                View Election Details
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
                    <h4 className="text-xs font-bold text-[#131b2e] mb-0.5">Voting Eligibility</h4>
                    <p className="text-xs text-[#424653] leading-relaxed">
                      Once approved, you will gain access to the digital ballot on election day.
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
