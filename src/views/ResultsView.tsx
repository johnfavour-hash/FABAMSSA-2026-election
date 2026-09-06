import React, { useEffect, useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import {
  Calendar,
  CheckCircle2,
  Info,
  ShieldCheck,
  Star,
} from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { status, resultsStatus, publishedAt, positions, candidates, commissionMembers, totalEligible, totalBallotsCast, turnoutPercentage } = useElection();
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('ALL');
    const [selectedCandidate, setSelectedCandidate] = useState<typeof candidates[number] | null>(null);
  const isResultsPublished = resultsStatus === 'PUBLISHED' || resultsStatus === 'CERTIFIED';
  const isResultsCertified = resultsStatus === 'CERTIFIED';

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

  const renderPositionResults = () => {
    if (!isResultsPublished) {
      return (
        <div className="rounded-xl border border-[#c2c6d5] bg-white p-8 text-center text-[#424653]">
          Results have not yet been published by the Electoral Committee.
        </div>
      );
    }

    if (!selectedPosition) {
      return (
        <div className="rounded-xl border border-[#c2c6d5] bg-white p-8 text-center text-[#424653]">
          Final results will appear once the election has been certified.
        </div>
      );
    }

    if (displayedCandidates.length === 0) {
      return (
        <div className="rounded-xl border border-[#c2c6d5] bg-white p-8 text-center text-[#424653]">
          No final results are available for {selectedPosition.title} yet.
        </div>
      );
    }

    const isSingleCandidate = displayedCandidates.length === 1;
    const winnerPercent = totalPositionVotes > 0 ? (winner!.votesCount / totalPositionVotes) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-[#c2c6d5] bg-white">
          <div className="flex items-center justify-between border-b border-[#dfe7ff] bg-[#f1f5f9] px-4 py-3 sm:px-5">
            <h2 className="text-lg font-bold text-[#131b2e]">{selectedPosition.title}</h2>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653]">
              Total Votes: {totalPositionVotes.toLocaleString()}
            </span>
          </div>

          <div className="relative border-b border-[#dfe7ff] p-4 sm:p-5">
            {winner && (
              <>
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#003b82] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  {isResultsCertified ? 'Winner' : 'Unofficial Result'}
                </div>

                <button type="button" onClick={() => setSelectedCandidate(winner)} className="flex w-full cursor-pointer flex-col items-center gap-5 text-left md:flex-row md:items-start">
                  <img
                    src={winner.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={winner.fullName}
                    className="h-28 w-28 rounded-full border-4 border-[#eaeefc] object-cover shadow-sm md:h-32 md:w-32"
                  />

                  <div className="w-full flex-1">
                    <h3 className="mb-1 text-center text-2xl font-bold text-[#131b2e] md:text-left">{winner.fullName}</h3>
                    <p className="mb-5 text-center text-sm text-[#424653] md:text-left">Department of {winner.department}</p>

                    <div className="mb-2 flex items-end justify-between gap-3">
                      <span className="text-2xl font-bold text-[#131b2e]">{winner.votesCount} Votes</span>
                      <span className="text-2xl font-extrabold text-[#003f93]">{winnerPercent.toFixed(1)}%</span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#e2e7ff]">
                      <div
                        className="h-full rounded-full bg-[#0055c2]"
                        style={{ width: `${Math.min(winnerPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="sr-only">View {winner.fullName}'s profile</span>
                </button>
              </>
            )}
          </div>

          <div className="bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#dfe7ff] bg-[#f1f5f9]">
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653]">Candidate</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653]">Votes</th>
                  <th className="w-24 px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653]">%</th>
                </tr>
              </thead>
              <tbody>
                {displayedCandidates.map((candidate, index) => {
                  const candidateShare = totalPositionVotes > 0 ? (candidate.votesCount / totalPositionVotes) * 100 : 0;
                  return (
                    <tr
                      key={candidate.id}
                      className={index === displayedCandidates.length - 1 ? 'hover:bg-[#f8faff]' : 'border-b border-[#eef2ff] hover:bg-[#f8faff]'}
                    >
                      <td className="flex items-center gap-3 px-4 py-3 text-sm text-[#131b2e]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaeefc] text-[10px] font-bold text-[#424653]">
                          {getInitials(candidate.fullName)}
                        </div>
                        {candidate.fullName}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[#131b2e]">{candidate.votesCount}</td>
                      <td className="px-4 py-3 text-right text-sm text-[#424653]">{candidateShare.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!isSingleCandidate && (
          <div className="overflow-hidden rounded-xl border border-[#c2c6d5] bg-white">
            <div className="border-b border-[#dfe7ff] bg-[#f1f5f9] px-4 py-3">
              <h3 className="text-lg font-bold text-[#131b2e]">{selectedPosition.title}</h3>
            </div>

            <div className="p-4">
              {displayedCandidates.slice(1, 3).map((candidate) => {
                const candidateShare = totalPositionVotes > 0 ? (candidate.votesCount / totalPositionVotes) * 100 : 0;
                return (
                  <div key={candidate.id} className="flex items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaeefc] text-[10px] font-bold text-[#424653]">
                        {getInitials(candidate.fullName)}
                      </div>
                      <div>
                        <div className="font-bold text-[#131b2e]">{candidate.fullName}</div>
                        <div className="text-[11px] text-[#424653]">Department of {candidate.department}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-[#131b2e]">{candidate.votesCount} Votes</div>
                      <div className="text-[11px] text-[#424653]">{candidateShare.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#faf8ff] text-[#131b2e] antialiased">
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-6 border-b border-[#dfe7ff] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold tracking-[-0.03em] text-[#131b2e] sm:text-4xl">General Elections 2026</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${isResultsCertified ? 'bg-[#003b82] text-white' : 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]'}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isResultsCertified ? 'Certified Results' : isResultsPublished ? 'Unofficial Results' : 'Results Not Yet Published'}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-[#424653]">
                  <Calendar className="h-4 w-4" />
                  {isResultsCertified ? `Certified ${publishedAt ? new Date(publishedAt).toLocaleString() : ''}` : isResultsPublished ? 'Published and awaiting certification' : 'Results are not yet public'}
                </span>
              </div>
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
            <div key={stat.label} className="rounded-xl border border-[#c2c6d5] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#424653]">{stat.label}</div>
              <div className="text-2xl font-bold tracking-[-0.03em] text-[#131b2e] sm:text-3xl">{stat.value}</div>
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
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
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

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2.2fr_0.8fr]">
          <div className="space-y-6">{renderPositionResults()}</div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-[#c2c6d5] bg-[#f8faff] p-4 sm:p-5">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#131b2e]">
                <ShieldCheck className="h-5 w-5 text-[#0055c2]" />
                Results Integrity
              </h3>

              <p className="mb-4 text-sm leading-relaxed text-[#424653]">
                These results have been recorded and certified by the FABAMSSA Electoral Committee (ELECO) following the election tally process. Ballot records are retained in the official audit log for review.
              </p>

              <ul className="space-y-3 text-sm text-[#131b2e]">
                {[
                  'No anomalies detected during voting period.',
                  'All candidates met minimum CGPA requirements.',
                  'Voter identities verified via Student Portal SSO.',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0055c2]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#c2c6d5] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-4 text-xl font-bold text-[#131b2e]">Electoral Commission</h3>

              <div className="space-y-4">
                {commissionMembers.map((person) => (
                  <div key={person.name} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaeefc] text-[11px] font-bold text-[#424653]">
                      {person.initials}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#131b2e]">{person.name}</div>
                      <div className="text-xs text-[#424653]">{person.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <CandidateDetailModal
        candidate={selectedCandidate}
        position={selectedPosition}
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
      />

    </div>
  );
};
