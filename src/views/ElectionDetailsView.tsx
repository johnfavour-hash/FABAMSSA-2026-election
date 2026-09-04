import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  Vote, 
  BarChart3, 
  Users, 
  CheckSquare, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Award,
  ChevronRight,
  X,
  GraduationCap,
  Landmark,
  Layers,
  Lock
} from 'lucide-react';
import { BMSDepartment } from '../types';

interface ElectionDetailsViewProps {
  onCheckEligibility: () => void;
  onOpenLiveMonitor: () => void;
  onOpenVotingBooth: () => void;
  onNavigateHome: () => void;
  onNavigateResults: () => void;
}

export const ElectionDetailsView: React.FC<ElectionDetailsViewProps> = ({
  onCheckEligibility,
  onOpenLiveMonitor,
  onOpenVotingBooth,
  onNavigateHome,
  onNavigateResults,
}) => {
  const { status, totalEligible, positions, candidates } = useElection();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const getCandidatesForPosition = (positionId: string) => {
    return candidates.filter((candidate) => candidate.positionId === positionId);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600 animate-pulse',
          text: 'POLLS ACTIVE',
        };
      case 'ACCREDITATION_OPEN':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          dot: 'bg-blue-600',
          text: 'ACCREDITATION OPEN',
        };
      case 'CLOSED':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          dot: 'bg-purple-600',
          text: 'ELECTION CONCLUDED',
        };
      case 'STANDBY':
      default:
        return {
          bg: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
          dot: 'bg-[#92400E]',
          text: 'STANDBY',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="w-full bg-[#faf8ff] font-sans text-[#131b2e] min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Main Content Area */}
      <div className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
        {/* 1. Election Identity Header Card */}
        <section 
          id="election-header-card"
          className="bg-white border border-[#c2c6d5]/70 rounded-3xl p-6 md:p-10 shadow-xs relative overflow-hidden transition-all"
        >
          {/* Ambient Institutional Blue Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0055c2]/8 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

          {/* Top Label & Status Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#003f93] bg-[#eaedff] px-2.5 py-1 rounded-md tracking-wider uppercase">
                FABAMSSA UNIPORT
              </span>
              <span className="text-xs font-semibold text-[#737785] uppercase tracking-wider">
                • Election 2026
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              {statusBadge.text}
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="mb-8 relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-[#131b2e] tracking-tight mb-2 leading-tight">
              FABAMSSA UNIPORT Chapter
            </h1>
            <p className="text-base md:text-lg font-medium text-[#424653]">
              Faculty of Basic Medical Science Students Association • General Executive Elections
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-3.5 mb-8 relative z-10">
            <button
              id="election-check-eligibility-btn"
              onClick={onCheckEligibility}
              className="bg-[#0055c2] hover:bg-[#003f93] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Check Eligibility
            </button>
            <button
              id="election-live-monitor-btn"
              onClick={onOpenLiveMonitor}
              className="border border-[#737785] text-[#131b2e] hover:bg-[#eaedff]/60 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-[#003f93]" />
              Live Monitor
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#eaedff] relative z-10">
            <div>
              <p className="text-xs font-semibold text-[#737785] uppercase tracking-wider mb-1">
                Status
              </p>
              <p className="text-base md:text-lg font-bold text-[#131b2e]">
                {status === 'LIVE' ? 'ACTIVE' : status === 'ACCREDITATION_OPEN' ? 'ACCREDITATION' : status === 'CLOSED' ? 'CONCLUDED' : 'STANDBY'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737785] uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="text-base md:text-lg font-bold text-[#131b2e]">
                4 September 2026
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737785] uppercase tracking-wider mb-1">
                Voters
              </p>
              <p className="text-base md:text-lg font-bold text-[#131b2e]">
                {totalEligible.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#737785] uppercase tracking-wider mb-1">
                Hours
              </p>
              <p className="text-base md:text-lg font-bold text-[#131b2e]">
                8:00 AM – 4:00 PM WAT
              </p>
            </div>
          </div>
        </section>

        {/* 2. Overview Section */}
        <section className="max-w-3xl space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
            Overview
          </h2>
          <p className="text-base md:text-lg text-[#424653] leading-relaxed">
            The FABAMSSA UNIPORT 2026/2027 tenure elections represent a critical juncture for our student body. We are committed to an electoral process that prioritizes academic integrity, utmost security, and institutional authority. This election will employ advanced protocols to ensure absolute ballot secrecy while maintaining transparent, verifiable audit logs. Your participation shapes the future of our association.
          </p>
        </section>

        {/* 3. Election Timeline */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
            Election Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Registration */}
            <div className="bg-[#eaedff]/60 border border-[#c2c6d5]/70 rounded-xl p-5 hover:border-[#0055c2]/40 transition-colors">
              <FileText className="w-6 h-6 text-[#424653] mb-2" />
              <h3 className="text-base font-bold text-[#131b2e] mb-1">
                Registration
              </h3>
              <p className="text-sm text-[#424653]">
                Sep 4, 2026
              </p>
            </div>

            {/* 2. Accreditation */}
            <div className="bg-[#eaedff]/60 border border-[#c2c6d5]/70 rounded-xl p-5 hover:border-[#0055c2]/40 transition-colors">
              <ShieldCheck className="w-6 h-6 text-[#424653] mb-2" />
              <h3 className="text-base font-bold text-[#131b2e] mb-1">
                Accreditation
              </h3>
              <p className="text-sm text-[#424653]">
                Sep 4, 2026
              </p>
            </div>

            {/* 3. Voting Day (Active Highlight) */}
            <div className="bg-[#0055c2] text-white rounded-xl p-5 relative overflow-hidden shadow-md">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <Vote className="w-6 h-6 text-white mb-2 relative z-10" />
              <h3 className="text-base font-bold text-white mb-1 relative z-10">
                Voting Day
              </h3>
              <p className="text-sm text-white/80 relative z-10">
                Sep 4, 8 AM - 4 PM
              </p>
            </div>

            {/* 4. Results */}
            <div className="bg-[#eaedff]/60 border border-[#c2c6d5]/70 rounded-xl p-5 hover:border-[#0055c2]/40 transition-colors">
              <BarChart3 className="w-6 h-6 text-[#424653] mb-2" />
              <h3 className="text-base font-bold text-[#131b2e] mb-1">
                Results
              </h3>
              <p className="text-sm text-[#424653]">
                Sep 4, 5 PM
              </p>
            </div>
          </div>
        </section>

        {/* 4. Available Positions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e] tracking-tight">
              Available Positions
            </h2>
            <span className="text-xs font-semibold text-[#737785]">
              {positions.length} Contestable Offices
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {positions.map((position) => {
              const matchingCandidates = getCandidatesForPosition(position.id);
              const isSelected = selectedPosition === position.id;

              return (
                <button
                  key={position.id}
                  onClick={() => setSelectedPosition(isSelected ? null : position.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer select-none text-left flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#003f93] text-white border border-[#003f93] shadow-xs'
                      : 'bg-[#f2f3ff] border border-[#c2c6d5]/70 text-[#131b2e] hover:border-[#0055c2] hover:bg-[#eaedff]'
                  }`}
                >
                  <span>{position.title}</span>
                  {matchingCandidates.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#e2e7ff] text-[#003f93]'
                    }`}>
                      {matchingCandidates.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Position Detail Modal / Drawer */}
          {selectedPosition && (
            <div className="bg-white border border-[#0055c2]/30 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0055c2]" />
                  <h3 className="text-base font-bold text-[#003f93]">
                    Contest Office: {positions.find((position) => position.id === selectedPosition)?.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="text-[#737785] hover:text-[#131b2e] p-1 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {getCandidatesForPosition(selectedPosition).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getCandidatesForPosition(selectedPosition).map((cand) => (
                    <div key={cand.id} className="flex items-center gap-3 p-3 bg-[#faf8ff] rounded-xl border border-[#eaedff]">
                      <img
                        src={cand.photoUrl}
                        alt={cand.fullName}
                        className="w-12 h-12 rounded-lg object-cover border border-[#c2c6d5]"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-[#131b2e]">{cand.fullName}</h4>
                        <p className="text-xs text-[#424653]">{cand.department} • {cand.level}</p>
                        <p className="text-[11px] text-[#0055c2] italic mt-0.5 font-medium">"{cand.tagline}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#737785] py-2">
                  Certified ELECO candidates for this office will appear here. Voters will choose on their ballot during active polling hours.
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. Authentic FABAMSSA Faculty Constituency Banner */}
        <section className="bg-gradient-to-r from-[#eaedff] via-[#f2f3ff] to-[#e2e7ff] border border-[#b0c6ff]/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <img
                  alt="FABAMSSA Logo"
                  className="h-7 w-7 object-contain rounded-md"
                  src="/assets/nreerety-removebg-preview.png"
                />
                <span className="text-xs font-bold text-[#003f93] uppercase tracking-wider">
                  Faculty of Basic Medical Sciences • UNIPORT
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#131b2e]">
                Constituent Departmental Electorate
              </h3>
              <p className="text-xs md:text-sm text-[#424653] leading-relaxed">
                Eligible students across the Anatomy and Physiology departments participate in this general electoral mandate.
              </p>
            </div>

            {/* Department Badges */}
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto shrink-0">
              <div className="bg-white/80 backdrop-blur-xs border border-[#c2c6d5]/70 rounded-lg px-3 py-2 text-xs font-semibold text-[#003f93] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0055c2]" />
                <span>Anatomy</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs border border-[#c2c6d5]/70 rounded-lg px-3 py-2 text-xs font-semibold text-[#003f93] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0055c2]" />
                <span>Physiology</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Info Columns: Who Can Vote & How Voting Works */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Who Can Vote? */}
          <div className="bg-white border border-[#c2c6d5]/70 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-[#003f93]" />
              <h3 className="text-xl md:text-2xl font-bold text-[#131b2e]">
                Who Can Vote?
              </h3>
            </div>
            <ul className="space-y-4 text-sm md:text-base text-[#424653]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0055c2] shrink-0 mt-0.5" />
                <span>Active students from 100L to 300L levels.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0055c2] shrink-0 mt-0.5" />
                <span>Must possess a valid, verifiable matriculation number.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0055c2] shrink-0 mt-0.5" />
                <span>Fully accredited by the FABAMSSA Electoral Committee (ELECO).</span>
              </li>
            </ul>
          </div>

          {/* Card 2: How Voting Works */}
          <div className="bg-white border border-[#c2c6d5]/70 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <CheckSquare className="w-6 h-6 text-[#003f93]" />
              <h3 className="text-xl md:text-2xl font-bold text-[#131b2e]">
                How Voting Works
              </h3>
            </div>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#0055c2] text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 shadow-xs">
                  1
                </div>
                <div className="absolute left-4 -translate-x-1/2 top-8 bottom-[-24px] w-0.5 bg-[#eaedff]" />
                <div>
                  <h4 className="text-base font-bold text-[#131b2e]">
                    Eligibility
                  </h4>
                  <p className="text-sm text-[#424653]">
                    Verify your status via the portal.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#0055c2] text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 shadow-xs">
                  2
                </div>
                <div className="absolute left-4 -translate-x-1/2 top-8 bottom-[-24px] w-0.5 bg-[#eaedff]" />
                <div>
                  <h4 className="text-base font-bold text-[#131b2e]">
                    Login
                  </h4>
                  <p className="text-sm text-[#424653]">
                    Access the secure voting booth.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0055c2] text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 shadow-xs">
                  3
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#131b2e]">
                    Submit
                  </h4>
                  <p className="text-sm text-[#424653]">
                    Cast your confidential ballot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Electoral Guidelines & Final CTA */}
        <section className="space-y-8">
          {/* Electoral Guidelines Strip */}
          <div className="bg-[#eaedff]/70 p-6 rounded-xl border border-[#c2c6d5]/70">
            <p className="text-sm md:text-base text-[#424653] leading-relaxed">
              <strong className="text-[#131b2e]">Electoral Guidelines:</strong> Pursuant to the FABAMSSA Constitution (Article 15, §15.4), all aspirants must meet the eligibility requirements set by the Electoral Committee (ELECO). All voting records are strictly anonymous — ballots are permanently decoupled from voter identities at the point of submission.
            </p>
          </div>

          {/* Final CTA in BAMSSA Blue */}
          <div className="w-full bg-[#0055c2] rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
            {/* SVG Dot Pattern */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px',
              }}
            />

            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 relative z-10 tracking-tight">
              Ready to participate?
            </h2>

            <button
              id="election-cta-eligibility-btn"
              onClick={onCheckEligibility}
              className="bg-white text-[#003f93] hover:bg-[#f2f3ff] px-8 py-4 rounded-xl text-base font-bold transition-all shadow-sm flex items-center gap-2 relative z-10 active:scale-[0.98] cursor-pointer"
            >
              <span>Live Monitor</span>
              <ArrowRight className="w-5 h-5 text-[#003f93]" />
            </button>
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-[#faf8ff] px-2 py-3 border-t border-[#c2c6d5] shadow-lg rounded-t-2xl">
        <button
          onClick={onNavigateHome}
          className="flex flex-col items-center justify-center text-[#424653] hover:text-[#003f93] transition-colors"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center text-[#003f93] font-bold"
        >
          <Vote className="w-5 h-5 text-[#0055c2]" />
          <span className="text-[11px] font-bold mt-0.5">Elections</span>
        </button>

        <button
          onClick={onOpenVotingBooth}
          className="flex flex-col items-center justify-center text-[#424653] hover:text-[#003f93] transition-colors"
        >
          <Vote className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-0.5">Vote</span>
        </button>

        <button
          onClick={onNavigateResults}
          className="flex flex-col items-center justify-center text-[#424653] hover:text-[#003f93] transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-0.5">Results</span>
        </button>
      </nav>
    </div>
  );
};
