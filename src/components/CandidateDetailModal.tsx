import React from 'react';
import { Candidate, ElectionPosition } from '../types';
import { Award, BookOpen, CheckCircle2, X, Users } from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  position: ElectionPosition | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate?: (candidateId: string) => void;
  isSelected?: boolean;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  position,
  isOpen,
  onClose,
  onSelectCandidate,
  isSelected,
}) => {
  if (!isOpen || !candidate || !position) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#c2c6d5] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Candidate Banner */}
        <div className="relative bg-[#001944] text-white p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={candidate.photoUrl}
              alt={candidate.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/30 shadow-md"
            />
            <div className="text-center sm:text-left">
              <span className="inline-block bg-[#0055c2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Candidate for {position.title}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {candidate.fullName}
              </h3>
              <p className="text-sm text-[#8ab0fe] font-medium">
                Dept. of {candidate.department} • {candidate.level}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tagline / Motto */}
          <div className="p-4 bg-[#f2f3ff] border-l-4 border-[#0055c2] rounded-r-xl">
            <p className="text-sm italic font-semibold text-[#003f93]">
              {candidate.tagline}
            </p>
          </div>

          {/* Running Mate if President */}
          {candidate.runningMate && (
            <div className="p-4 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eaedff] text-[#0055c2] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737785]">
                  Vice Presidential Running Mate
                </span>
                <h5 className="text-sm font-bold text-[#131b2e]">
                  {candidate.runningMate.name}
                </h5>
                <p className="text-xs text-[#424653]">
                  Dept. of {candidate.runningMate.department} ({candidate.runningMate.level})
                </p>
              </div>
            </div>
          )}

          {/* Core Manifesto Points */}
          <div>
            <h4 className="text-sm font-bold text-[#131b2e] uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0055c2]" />
              <span>Key Policy Pillars &amp; Manifesto</span>
            </h4>
            <div className="space-y-3">
              {candidate.manifesto.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white border border-[#c2c6d5]/70 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-[#eaedff] text-[#0055c2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-[#131b2e] leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Badge */}
          <div className="p-3 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl flex items-center justify-between text-xs text-[#424653]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
              <span className="font-semibold text-[#131b2e]">Screened &amp; Certified by ELECO</span>
            </div>
            <span className="text-[11px] text-[#737785]">FABAMSSA Constitution 2026/2027</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f2f3ff] border-t border-[#c2c6d5] p-4 px-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#424653] hover:text-[#131b2e] px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          {onSelectCandidate && (
            <button
              onClick={() => {
                onSelectCandidate(candidate.id);
                onClose();
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                  : 'bg-[#2563eb] text-white hover:bg-[#003f93]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSelected ? 'Selected on Ballot' : `Vote for ${candidate.fullName.split(' ')[0]}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
