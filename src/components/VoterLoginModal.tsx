import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { KeyRound, ShieldCheck, UserCheck, X, AlertCircle, ArrowRight } from 'lucide-react';

interface VoterLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCheckEligibility: () => void;
}

export const VoterLoginModal: React.FC<VoterLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenCheckEligibility,
}) => {
  const { loginVoter } = useElection();
  const [matricNumber, setMatricNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!matricNumber.trim()) {
      setError('Please enter your matriculation number.');
      return;
    }

    if (!pin.trim()) {
      setError('Please enter your 4-digit voter PIN.');
      return;
    }

    setLoading(true);
    const res = await loginVoter(matricNumber, pin);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f8fafc] border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0055c2] text-white flex items-center justify-center font-bold shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#131b2e] leading-tight">
                Voter Portal Login
              </h3>
              <p className="text-[11px] sm:text-xs text-[#424653]">
                Enter your credentials to access the confidential voting booth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737785] hover:text-[#131b2e] hover:bg-[#e2e7ff] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-2.5 sm:p-3 bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-xs font-medium rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                Matriculation Number
              </label>
              <input
                type="text"
                placeholder="e.g. U2022/5570012"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                  4-Digit Voter PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCheckEligibility();
                  }}
                  className="text-xs text-[#0055c2] hover:underline font-semibold cursor-pointer"
                >
                  Forgot or look up PIN?
                </button>
              </div>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-mono text-center tracking-[0.5em] focus:outline-none focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0055c2] hover:bg-[#003f93] text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Authenticate & Enter Ballot'}</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-[#f2f3ff] border-t border-[#c2c6d5] px-6 py-3 text-center text-xs text-[#737785]">
          100% Confidential &amp; Verified Voter Authentication
        </div>
      </div>
    </div>
  );
};
