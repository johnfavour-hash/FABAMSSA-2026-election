import React, { useState, useEffect } from 'react';
import { useElection } from '../context/ElectionContext';
import { BMSDepartment } from '../types';
import { 
  Users, 
  Vote, 
  TrendingUp, 
  Calendar, 
  Clock, 
  RotateCw, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Info,
  Activity,
  Printer,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

interface LiveMonitorViewProps {
  onBackToHome: () => void;
  onOpenVotingBooth: () => void;
}

export const LiveMonitorView: React.FC<LiveMonitorViewProps> = ({
  onBackToHome,
  onOpenVotingBooth,
}) => {
  const {
    status,
    endTime,
    positions,
    candidates,
    commissionMembers,
    totalEligible,
    totalBallotsCast,
    turnoutPercentage,
  } = useElection();
  const isResultsCertified = status === 'CERTIFIED';
  const isElectionLive = status === 'LIVE';
  const [clockNow, setClockNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = status === 'LIVE' && endTime
    ? Math.max(0, Math.floor((new Date(endTime).getTime() - clockNow) / 1000))
    : 0;
  const remainingTime = `${String(Math.floor(remainingSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('ALL');

  useEffect(() => {
    if (positions.length > 0 && selectedPositionFilter === 'ALL') {
      setSelectedPositionFilter(positions[0].id);
    }
  }, [positions, selectedPositionFilter]);

  const selectedPosition = positions.find((pos) => pos.id === selectedPositionFilter) ?? positions[0] ?? null;
  const displayedCandidates = selectedPosition
    ? [...candidates.filter((candidate) => candidate.positionId === selectedPosition.id)].sort((a, b) => b.votesCount - a.votesCount)
    : [];

  const totalPositionVotes = displayedCandidates.reduce((sum, candidate) => sum + candidate.votesCount, 0);
  const winner = displayedCandidates[0] ?? null;
  const overallHasData = totalEligible > 0 || totalBallotsCast > 0 || turnoutPercentage > 0;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderPositionResultBlock = () => {
    if (!isElectionLive && !isResultsCertified) {
      return (
        <div className="bg-white border border-[#c2c6d5] rounded-xl p-8 text-center text-[#424653]">
          Official winner and certified results will appear here only after ELECO certification is approved.
        </div>
      );
    }

    if (!selectedPosition) {
      return (
        <div className="bg-white border border-[#c2c6d5] rounded-xl p-8 text-center text-[#424653]">
          Results will appear here once the election is configured and voting begins.
        </div>
      );
    }

    if (displayedCandidates.length === 0) {
      return (
        <div className="bg-white border border-[#c2c6d5] rounded-xl p-8 text-center text-[#424653]">
          No certified candidates are available for {selectedPosition.title} yet.
        </div>
      );
    }

    const isSingleCandidate = displayedCandidates.length === 1;
    const winnerPercent = totalPositionVotes > 0 ? (winner!.votesCount / totalPositionVotes) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="bg-white border border-[#c2c6d5] rounded-xl overflow-hidden">
          <div className="bg-[#f1f5f9] px-6 py-3 border-b border-[#c2c6d5] flex justify-between items-center gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#131b2e]">{selectedPosition.title}</h2>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#424653]">
              Total Votes: {totalPositionVotes.toLocaleString()}
            </span>
          </div>

          <div className="p-5 md:p-6 border-b border-[#c2c6d5] relative">
            {winner && (
              <>
                <div className="absolute top-4 right-4 bg-[#003B82] text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                  {isElectionLive ? 'Currently Leading' : 'Winner'}
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <img
                    src={winner.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={winner.fullName}
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#eaeefc] shadow-sm"
                  />

                  <div className="flex-grow w-full">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#131b2e] text-center md:text-left mb-1">
                      {winner.fullName}
                    </h3>
                    <p className="text-[#424653] text-sm text-center md:text-left mb-5">
                      Department of {winner.department}
                    </p>

                    <div className="flex justify-between items-end mb-2 gap-3">
                      <span className="text-2xl sm:text-3xl font-bold text-[#131b2e]">{winner.votesCount} Votes</span>
                      <span className="text-2xl font-extrabold text-[#003f93]">
                        {totalPositionVotes > 0 ? `${Math.round((winner.votesCount / totalPositionVotes) * 1000) / 10}%` : '0%'}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-[#e2e7ff] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0055c2] rounded-full"
                        style={{ width: `${Math.min(totalPositionVotes > 0 ? (winner.votesCount / totalPositionVotes) * 100 : 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f1f5f9] border-b border-[#c2c6d5]">
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wide text-[#424653]">Candidate</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wide text-[#424653] text-right">Votes</th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wide text-[#424653] text-right w-28">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {displayedCandidates.map((candidate, index) => {
                  const candidatePercent = totalPositionVotes > 0 ? (candidate.votesCount / totalPositionVotes) * 100 : 0;
                  const isWinner = index === 0;
                  return (
                    <tr key={candidate.id} className={index === displayedCandidates.length - 1 ? 'hover:bg-[#f8faff]' : 'border-b border-[#e8ebf8] hover:bg-[#f8faff]'}>
                      <td className="py-3 px-4 text-sm text-[#131b2e] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eaeefc] text-[#424653] text-[10px] font-bold flex items-center justify-center">
                          {getInitials(candidate.fullName)}
                        </div>
                        {candidate.fullName}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-[#131b2e]">{candidate.votesCount}</td>
                      <td className="py-3 px-4 text-sm text-right text-[#424653]">{Math.round(candidatePercent * 10) / 10}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!isSingleCandidate && (
          <div className="bg-white border border-[#c2c6d5] rounded-xl overflow-hidden">
            <div className="bg-[#f1f5f9] px-5 py-3 border-b border-[#c2c6d5] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#131b2e]">{selectedPosition.title}</h3>
            </div>
            <div className="p-5">
              {displayedCandidates.slice(1, 3).map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#eaeefc] text-[#424653] text-[10px] font-bold flex items-center justify-center">
                      {getInitials(candidate.fullName)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#131b2e]">{candidate.fullName}</div>
                      <div className="text-[11px] text-[#424653]">Department of {candidate.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#131b2e]">{candidate.votesCount} Votes</div>
                    <div className="text-[11px] text-[#424653]">{totalPositionVotes > 0 ? Math.round((candidate.votesCount / totalPositionVotes) * 1000) / 10 : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafc] text-[#0f172a] antialiased font-sans">
      <main className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {status === 'LIVE' && <div className="mb-8 overflow-hidden rounded-2xl border border-[#bfdbfe] bg-white shadow-sm"><div className="flex flex-col gap-5 bg-[#003b82] px-5 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#bfdbfe]"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#60a5fa]" />Live election monitor</div><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Voting is in progress</h2><p className="mt-1 text-sm text-white/75">Current figures update automatically as ballots are submitted.</p></div><div className="sm:text-right"><div className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Time remaining</div><div className="mt-1 font-mono text-4xl font-extrabold tracking-tight sm:text-5xl">{remainingTime}</div></div></div><div className="grid grid-cols-3 divide-x divide-[#e2e8f0] px-2 py-3 text-center sm:px-6"><div><div className="text-xl font-extrabold text-[#0f172a]">{totalBallotsCast.toLocaleString()}</div><div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Ballots cast</div></div><div><div className="text-xl font-extrabold text-[#0f172a]">{turnoutPercentage}%</div><div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Turnout</div></div><div><div className="text-xl font-extrabold text-[#0f172a]">{positions.length}</div><div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Positions</div></div></div></div>}
        <header className="mb-6 border-b border-[#dfe7ff] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#131b2e] mb-2">Live Election Monitor</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${isResultsCertified ? 'bg-[#003b82] text-white' : 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'}`}>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {isElectionLive ? 'Live Results' : isResultsCertified ? 'Certified Results' : 'Monitoring Offline'}
                </span>
                <span className="text-sm text-[#424653] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">history</span>
                  {isElectionLive ? 'Vote totals are not final' : isResultsCertified ? 'Official final results' : 'The election is not currently live'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-[#c2c6d5] bg-white px-4 py-2 text-sm font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download Results
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-lg border border-[#c2c6d5] bg-white px-4 py-2 text-sm font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Results
              </button>
            </div>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Eligible Voters', value: overallHasData ? totalEligible.toLocaleString() : '—' },
            { label: 'Ballots Cast', value: overallHasData ? totalBallotsCast.toLocaleString() : '—' },
            { label: 'Turnout', value: overallHasData ? `${turnoutPercentage}%` : '—' },
            { label: 'Positions', value: positions.length ? String(positions.length) : '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#c2c6d5] rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#424653] mb-1">{stat.label}</div>
              <div className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#131b2e]">{stat.value}</div>
            </div>
          ))}
        </section>

        <nav className="mb-8 overflow-x-auto pb-3">
          <div className="flex min-w-max gap-2">
            {positions.map((position) => {
              const isActive = selectedPositionFilter === position.id;
              return (
                <button
                  key={position.id}
                  type="button"
                  onClick={() => setSelectedPositionFilter(position.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#003f93] text-white shadow-sm'
                      : 'border border-[#c2c6d5] bg-white text-[#424653] hover:bg-[#f2f3ff]'
                  }`}
                >
                  {position.title}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2.1fr_0.9fr]">
          <div className="space-y-6">
            {renderPositionResultBlock()}
          </div>

          <aside className="space-y-6">
            <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#131b2e]">
                <span className="material-symbols-outlined text-[#0055c2]">shield</span>
                Live Election Status
              </h3>

              <p className="mb-4 text-sm leading-relaxed text-[#424653]">
                This page shows the current aggregated vote count while the election is running. These figures can change until voting closes and results are reviewed.
              </p>

              <ul className="space-y-3 text-sm text-[#131b2e]">
                {[
                  'Ballots are counted as they are submitted.',
                  'Voter identities are not shown here.',
                  'Final winners appear after certification.',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0055c2]">check</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#c2c6d5] rounded-xl p-5 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-[#131b2e]">Electoral Commission</h3>
              <div className="space-y-4">
                {commissionMembers.map((person) => (
                  <div key={person.name} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaeefc] text-[11px] font-bold text-[#424653]">
                      {person.initials}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wide text-[#131b2e]">{person.name}</div>
                      <div className="text-xs text-[#424653]">{person.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
};
