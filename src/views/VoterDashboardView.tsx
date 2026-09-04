import React from 'react';
import { useElection } from '../context/ElectionContext';
import { 
  Calendar, 
  Clock, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Check, 
  Circle, 
  Zap, 
  FileText, 
  Activity, 
  BookOpen, 
  ChevronRight, 
  Lock,
  Vote,
  ShieldCheck
} from 'lucide-react';

interface VoterDashboardViewProps {
  onNavigateToElections: () => void;
  onNavigateToLiveMonitor: () => void;
  onNavigateToGuidelines: () => void;
  onNavigateToVote: () => void;
}

export const VoterDashboardView: React.FC<VoterDashboardViewProps> = ({
  onNavigateToElections,
  onNavigateToLiveMonitor,
  onNavigateToGuidelines,
  onNavigateToVote,
}) => {
  const { currentVoter, status } = useElection();

  // Fallback voter data if accessing demo view
  const voter = currentVoter || {
    matricNumber: 'U2021/5530001',
    fullName: 'John Doe',
    department: 'Anatomy',
    level: '300L',
    email: 'student@uniport.edu.ng',
    phone: '+234 802 334 9901',
    isEligible: true,
    isAccredited: true,
    hasVoted: false,
    voterPin: '4021',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWlMIrte2-MY7oXEDW1oStZ78EmWlv4m3sSYLK3jxk6iviAh2APlIjBtH6qRbIpEZuT48yc96koIrkawgTaEmX4tiYmwYAE1WFNKaPiAmfJlEQ9_QZhqehvPio0EWIPvVU6wpj7NW74lSnOieXvHoj4ngQ8y-kwhUZyHs5XAVoLHIY8-8YRw0w5zo3nZcknPHLHndesYlIWEIbhAkh9jcbjgXiTvEtCkKcmt7bZ7kLtalKhKgajSBR',
  };

  const firstName = voter.fullName.split(' ')[0] || 'John';

  const getStatusBadge = () => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold tracking-wider uppercase border border-[#a7f3d0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mr-1.5 animate-pulse"></span>
            LIVE
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#fef2f2] text-[#991b1b] text-[10px] font-bold tracking-wider uppercase border border-[#fecaca]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] mr-1.5"></span>
            CLOSED
          </span>
        );
      case 'CERTIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#e0e7ff] text-[#3730a3] text-[10px] font-bold tracking-wider uppercase border border-[#c7d2fe]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mr-1.5"></span>
            RESULTS CERTIFIED
          </span>
        );
      case 'ACCREDITATION_OPEN':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#fffbeb] text-[#92400e] text-[10px] font-bold tracking-wider uppercase border border-[#fde68a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] mr-1.5"></span>
            ACCREDITATION OPEN
          </span>
        );
      case 'STANDBY':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#fffbeb] text-[#92400e] text-[10px] font-bold tracking-wider uppercase border border-[#fde68a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] mr-1.5"></span>
            STANDBY
          </span>
        );
    }
  };

  const getStatusMessage = () => {
    if (voter.hasVoted) {
      return 'Your official ballot has been cast and securely recorded.';
    }
    if (status === 'LIVE') {
      return 'Voting is currently active. You may now cast your official ballot.';
    }
    if (status === 'CLOSED' || status === 'CERTIFIED') {
      return 'The voting window has closed. You can view live certified results.';
    }
    return 'Voting has not started yet.';
  };

  // Determine active step in journey (1: Reg, 2: Accreditation, 3: Voting, 4: Results)
  const isVotingStepCompleted = voter.hasVoted;
  const isResultsStepCompleted = status === 'CERTIFIED';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] text-[#131b2e] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-[1140px] mx-auto flex flex-col gap-6 sm:gap-8">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1.5 tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="text-sm sm:text-base text-[#424653] max-w-2xl leading-relaxed">
              Welcome back. Here's the current status of your FABAMSSA election participation.
            </p>
          </div>
        </section>

        {/* Main Election Status Card */}
        <section className="bg-white border border-[#c2c6d5]/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
            <div className="flex-1 w-full">
              {/* Header with Title & Badge */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#003f93] tracking-tight">
                  FABAMSSA GENERAL ELECTIONS 2026
                </h2>
                {getStatusBadge()}
              </div>

              {/* Grid with Election Day & Voting Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <p className="text-xs text-[#737785] font-semibold uppercase tracking-wider mb-1">
                    Election Day
                  </p>
                  <p className="text-base sm:text-lg text-[#131b2e] font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#737785]" />
                    4 Sept 2026
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#737785] font-semibold uppercase tracking-wider mb-1">
                    Voting Period
                  </p>
                  <p className="text-base sm:text-lg text-[#131b2e] font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#737785]" />
                    8:00 AM – 4:00 PM
                  </p>
                </div>
              </div>

              {/* Callout box */}
              <div className="p-3.5 sm:p-4 bg-[#f2f3ff] rounded-lg border border-[#c2c6d5]/70 inline-flex items-center gap-2.5 text-xs sm:text-sm text-[#424653]">
                <Info className="w-4 h-4 text-[#737785] shrink-0" />
                <span>{getStatusMessage()}</span>
              </div>
            </div>

            {/* Action button */}
            <div className="shrink-0 w-full lg:w-auto flex items-end">
              {status === 'LIVE' && !voter.hasVoted ? (
                <button
                  onClick={onNavigateToVote}
                  className="w-full lg:w-auto bg-[#0055c2] text-white px-7 py-3.5 rounded-lg text-sm font-bold hover:bg-[#003f93] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <Vote className="w-4 h-4" />
                  <span>Cast Your Ballot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onNavigateToElections}
                  className="w-full lg:w-auto bg-[#0055c2] text-white px-7 py-3.5 rounded-lg text-sm font-bold hover:bg-[#003f93] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <span>View Election Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Voter Status Grid & Election Journey */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Voter Status Grid (Left 7 cols) */}
          <section className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Accreditation */}
            <div className="bg-white border border-[#c2c6d5]/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-[#737785] font-semibold uppercase tracking-wider mb-2">
                Accreditation
              </p>
              <div className="flex items-center gap-2 text-[#16a34a]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-base sm:text-lg font-bold">
                  {voter.isAccredited ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Voting Status */}
            <div className="bg-white border border-[#c2c6d5]/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-[#737785] font-semibold uppercase tracking-wider mb-2">
                Voting Status
              </p>
              <div className="flex items-center gap-2">
                {voter.hasVoted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-[#16a34a]">Voted</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-[#737785] shrink-0" />
                    <span className="text-base sm:text-lg font-medium text-[#424653]">Not Yet Voted</span>
                  </>
                )}
              </div>
            </div>

            {/* Voter Identity */}
            <div className="bg-white border border-[#c2c6d5]/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-[#737785] font-semibold uppercase tracking-wider mb-2">
                Voter Identity
              </p>
              <div className="flex items-center gap-2 text-[#003B82]">
                <UserCheck className="w-5 h-5 shrink-0" />
                <span className="text-base sm:text-lg font-bold">
                  {voter.isEligible ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </section>

          {/* Election Journey (Right 5 cols) */}
          <section className="lg:col-span-5 bg-white border border-[#c2c6d5]/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <p className="text-xs text-[#737785] font-semibold uppercase tracking-wider mb-6">
              Your Election Journey
            </p>
            
            <div className="relative flex justify-between items-center px-2 py-2">
              {/* Background Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-[#c2c6d5] -z-0 -translate-y-1/2"></div>
              
              {/* Active Connecting Line */}
              <div 
                className={`absolute top-1/2 left-4 h-[2px] bg-[#003B82] -z-0 -translate-y-1/2 transition-all ${
                  isVotingStepCompleted ? 'w-2/3' : 'w-1/3'
                }`}
              ></div>

              {/* Step 1: Registration */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-1">
                <div className="w-8 h-8 rounded-full bg-[#003B82] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#131b2e] text-center">
                  Registration
                </span>
              </div>

              {/* Step 2: Accreditation */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-1">
                <div className="w-8 h-8 rounded-full bg-[#003B82] text-white flex items-center justify-center shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#131b2e] text-center">
                  Accreditation
                </span>
              </div>

              {/* Step 3: Voting */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-1">
                {isVotingStepCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-[#003B82] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#c2c6d5] bg-white text-[#737785] flex items-center justify-center">
                    <Circle className="w-3.5 h-3.5 text-transparent" />
                  </div>
                )}
                <span className={`text-[10px] sm:text-[11px] text-center ${
                  isVotingStepCompleted ? 'font-bold text-[#131b2e]' : 'font-medium text-[#737785]'
                }`}>
                  Voting
                </span>
              </div>

              {/* Step 4: Results */}
              <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-1">
                {isResultsStepCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-[#003B82] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[#c2c6d5] bg-white text-[#737785] flex items-center justify-center">
                    <Circle className="w-3.5 h-3.5 text-transparent" />
                  </div>
                )}
                <span className={`text-[10px] sm:text-[11px] text-center ${
                  isResultsStepCompleted ? 'font-bold text-[#131b2e]' : 'font-medium text-[#737785]'
                }`}>
                  Results
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Grid: Important Dates & Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Important Dates */}
          <section className="bg-white border border-[#c2c6d5]/80 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#003f93]" />
              <h3 className="text-base sm:text-lg font-bold text-[#131b2e]">
                Important Dates
              </h3>
            </div>
            
            <ul className="space-y-1">
              <li className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-xs sm:text-sm text-[#424653]">Voter Registration</span>
                <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">4 Sep</span>
              </li>
              <li className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-xs sm:text-sm text-[#424653]">Accreditation</span>
                <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">4 Sep</span>
              </li>
              <li className="flex justify-between items-center py-2.5 border-b border-slate-100 bg-[#F1F5F9] -mx-2 px-3 rounded-lg">
                <span className="text-xs sm:text-sm text-[#003f93] font-bold">Election Day</span>
                <span className="text-xs sm:text-sm font-bold text-[#003f93]">4 Sep</span>
              </li>
              <li className="flex justify-between items-center py-2.5">
                <span className="text-xs sm:text-sm text-[#424653]">Results Declaration</span>
                <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">4 Sep</span>
              </li>
            </ul>
          </section>

          {/* Quick Access */}
          <section className="bg-white border border-[#c2c6d5]/80 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#003f93]" />
              <h3 className="text-base sm:text-lg font-bold text-[#131b2e]">
                Quick Access
              </h3>
            </div>

            <div className="grid gap-2.5 sm:gap-3">
              {/* Election Details Link */}
              <button
                onClick={onNavigateToElections}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-[#f8fafc] hover:border-[#003f93]/30 transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#003f93] group-hover:bg-white group-hover:shadow-2xs transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                    Election Details
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#737785] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onNavigateToLiveMonitor}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-[#f8fafc] hover:border-[#003f93]/30 transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#003f93] group-hover:bg-white group-hover:shadow-2xs transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                    Live Monitor
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#737785] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => window.location.assign('/results')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-[#f8fafc] hover:border-[#003f93]/30 transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#003f93] group-hover:bg-white group-hover:shadow-2xs transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                    Final Results
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#737785] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Guidelines Link */}
              <button
                onClick={onNavigateToGuidelines}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-[#f8fafc] hover:border-[#003f93]/30 transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#003f93] group-hover:bg-white group-hover:shadow-2xs transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                    Guidelines
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#737785] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </section>
        </div>

        {/* Trust Note */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-full bg-indigo-50/70 border border-indigo-100 text-left">
          <Lock className="w-4 h-4 text-[#737785] shrink-0 mt-0.5" />
          <p className="text-xs text-[#424653] leading-relaxed">
            Your vote is private. Your accreditation confirms your eligibility to participate. Your ballot selections are handled separately from your voter identity to ensure absolute secrecy.
          </p>
        </div>

      </div>
    </div>
  );
};
