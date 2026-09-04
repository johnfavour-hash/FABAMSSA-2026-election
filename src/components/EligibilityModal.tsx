import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { Voter } from '../types';
import { Search, CheckCircle, XCircle, KeyRound, ShieldAlert, ArrowRight, X, UserCheck, Copy, Check } from 'lucide-react';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToVote: (voter: Voter) => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({
  isOpen,
  onClose,
  onProceedToVote,
}) => {
  const { checkEligibility } = useElection();
  const [matricInput, setMatricInput] = useState('');
  const [searchedVoter, setSearchedVoter] = useState<Voter | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!matricInput.trim()) return;

    const result = checkEligibility(matricInput);
    setSearchedVoter(result);
    setHasSearched(true);
    setMessage(null);
  };

  const copyVoterPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#c2c6d5] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f2f3ff] border-b border-[#c2c6d5] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0055c2] text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e] leading-tight">
                Voter Eligibility &amp; Accreditation Check
              </h3>
              <p className="text-xs text-[#424653]">
                Verify your 2026/2027 Basic Medical Science electoral status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737785] hover:text-[#131b2e] hover:bg-[#e2e7ff] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-[#131b2e] uppercase tracking-wider">
              Enter Matriculation Number:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#737785] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. U2022/5570012"
                  value={matricInput}
                  onChange={(e) => setMatricInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8ff] border border-[#c2c6d5] rounded-xl text-sm font-medium focus:outline-hidden focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
                />
              </div>
              <button
                type="submit"
                className="bg-[#0055c2] hover:bg-[#003f93] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </div>
          </form>

          {/* Success Message Banner */}
          {message && (
            <div className="p-3 bg-[#dcfce7] border border-[#86efac] text-[#15803d] text-xs font-semibold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Result Card */}
          {hasSearched && (
            <div>
              {searchedVoter ? (
                <div className="bg-[#faf8ff] border border-[#c2c6d5] rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-[#131b2e]">
                          {searchedVoter.fullName}
                        </h4>
                        <span className="bg-[#e2e7ff] text-[#003f93] text-[11px] font-bold px-2 py-0.5 rounded">
                          {searchedVoter.level}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0055c2]">
                        Dept. of {searchedVoter.department}
                      </p>
                      <p className="text-xs text-[#737785] font-mono mt-0.5">
                        Matric: {searchedVoter.matricNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      {searchedVoter.hasVoted ? (
                        <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-xs font-bold px-2.5 py-1 rounded-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Voted
                        </span>
                      ) : searchedVoter.isAccredited ? (
                        <span className="inline-flex items-center gap-1 bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe] text-xs font-bold px-2.5 py-1 rounded-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accredited
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-xs font-bold px-2.5 py-1 rounded-md">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Pending Accreditation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PIN & Accreditation Area */}
                  <div className="p-3.5 bg-white border border-[#c2c6d5] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                    {searchedVoter.isAccredited ? (
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-9 h-9 rounded-lg bg-[#eaedff] text-[#0055c2] flex items-center justify-center shrink-0">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[11px] text-[#737785] font-medium">Your 4-Digit Voter PIN:</div>
                          <div className="text-lg font-mono font-bold text-[#003f93] tracking-widest flex items-center gap-2">
                            <span>{searchedVoter.voterPin}</span>
                            <button
                              onClick={() => copyVoterPin(searchedVoter.voterPin)}
                              className="text-[#737785] hover:text-[#0055c2] text-xs transition-colors p-1"
                              title="Copy PIN"
                            >
                              {copiedPin ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-[#424653] font-medium">
                          Your record is awaiting ELECO accreditation. Your voting PIN will be issued after approval.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2">
                    {!searchedVoter.hasVoted && searchedVoter.isAccredited && (
                      <button
                        onClick={() => {
                          onClose();
                          onProceedToVote(searchedVoter);
                        }}
                        className="w-full sm:w-auto bg-[#2563eb] hover:bg-[#003f93] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Proceed to Ballot Booth</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#fff5f5] border border-[#ffdad6] rounded-xl p-5 text-center">
                  <XCircle className="w-8 h-8 text-[#ba1a1a] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#ba1a1a]">Matriculation Number Not Found</h4>
                  <p className="text-xs text-[#424653] mt-1 max-w-sm mx-auto">
                    The number <span className="font-mono font-bold text-[#131b2e]">{matricInput}</span> is not listed in the certified 2026 electoral register.
                  </p>
                  <p className="text-xs text-[#737785] mt-2">
                    If you are a registered BMS student, you can complete self-accreditation on the Registration tab.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f2f3ff] border-t border-[#c2c6d5] px-6 py-3.5 flex justify-between items-center text-xs text-[#737785]">
          <span>Electoral integrity guaranteed by ELECO</span>
          <button
            onClick={onClose}
            className="text-[#424653] hover:text-[#131b2e] font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
