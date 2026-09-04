import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { ShieldCheck, Lock, X, AlertCircle, Key } from 'lucide-react';

interface ElecoAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ElecoAdminModal: React.FC<ElecoAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin } = useElection();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = loginAdmin(passcode);
    if (success) {
      onSuccess();
      onClose();
    } else {
      setError('Invalid ELECO Administrative Master Passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#001944] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0055c2] text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#8ab0fe]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                ELECO Commission Console
              </h3>
              <p className="text-[11px] sm:text-xs text-white/70">
                Official Electoral Board Restricted Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-[#eaedff]/60 border border-[#b0c6ff]/50 p-3 rounded-lg flex items-start gap-2.5">
            <Key className="w-4 h-4 text-[#003f93] shrink-0 mt-0.5" />
            <div className="text-xs text-[#131b2e]">
              <span className="font-bold">Electoral Officer Passcode:</span> Enter your authorized clearance PIN.
            </div>
          </div>

          {error && (
            <div className="p-2.5 sm:p-3 bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-xs font-medium rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-1">
                Master Security Key / Passcode
              </label>
              <input
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#003f93] hover:bg-[#001944] text-white font-semibold py-2.5 rounded-lg transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-98"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize Login</span>
            </button>
          </form>
        </div>

        <div className="bg-[#f8fafc] border-t border-slate-100 px-4 sm:px-6 py-2.5 text-center text-[11px] text-[#737785]">
          All administrative operations are securely recorded in the official audit log.
        </div>
      </div>
    </div>
  );
};
