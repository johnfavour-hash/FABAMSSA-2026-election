import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { User, Lock, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  const { checkEligibility, voters } = useElection();
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [foundVoter, setFoundVoter] = useState<any | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = identifier.trim().toUpperCase();
    if (!query) return;

    const voter = voters.find(
      (v) =>
        v.matricNumber.toUpperCase() === query ||
        v.email.toUpperCase() === query ||
        v.matricNumber.replace(/\//g, '').toUpperCase() === query.replace(/\//g, '')
    );

    setFoundVoter(voter || null);
    setIsSubmitted(true);
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="bg-[#f8fafc] text-[#131b2e] min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-3 py-6 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="w-full max-w-[440px]">
        {/* Logo & Brand Header Anchor */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-slate-200 shadow-2xs mb-3 sm:mb-4 overflow-hidden">
            <img
              className="w-full h-full object-contain p-1"
              alt="FABAMSSA Medical Emblem"
              src="/assets/nreerety-removebg-preview.png"
            />
          </div>
          
          <div className="inline-block px-3 py-0.5 bg-[#eaedff] rounded-full mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#424653] uppercase">
              FORGOT PASSWORD
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] mb-1.5 tracking-tight">
            Reset your password
          </h1>
          
          <p className="text-xs sm:text-sm text-[#424653] text-center leading-relaxed">
            Enter the email address or matriculation number associated with your FABAMSSA voter account and we'll help you regain access.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs sm:shadow-sm p-4 sm:p-7">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Field */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#131b2e] mb-1.5" htmlFor="identifier">
                  Email address or matriculation number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#737785] pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or matric number"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-[#131b2e] placeholder:text-[#737785] focus:outline-none focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10 transition-all"
                  />
                </div>
              </div>

              {/* Primary Action */}
              <button
                type="submit"
                className="w-full bg-[#0055c2] hover:bg-[#003f93] text-white py-2.5 sm:py-3 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
              >
                <span>Send Reset Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#131b2e]">
                  Instructions Dispatched
                </h3>
                <p className="text-xs text-[#424653] leading-relaxed">
                  If an accredited voter record matches{' '}
                  <span className="font-semibold text-[#131b2e]">{identifier}</span>, password reset credentials have been prepared.
                </p>
              </div>

              {foundVoter ? (
                <div className="bg-[#f2f3ff] border border-[#b0c6ff]/50 p-3.5 rounded-lg space-y-1.5 text-center">
                  <span className="text-[10px] font-bold text-[#737785] uppercase tracking-wider block">
                    Accredited Voter PIN Recovery
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#003f93] tracking-[0.25em] flex items-center justify-center gap-2">
                    <span>{foundVoter.voterPin || '4021'}</span>
                    <button
                      onClick={() => copyPin(foundVoter.voterPin || '4021')}
                      className="text-xs p-1 bg-white border border-slate-200 hover:bg-[#eaedff] text-[#0055c2] rounded-md transition-colors cursor-pointer"
                      title="Copy PIN"
                    >
                      {copiedPin ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#424653]">
                    Voter: <span className="font-semibold">{foundVoter.fullName}</span> ({foundVoter.department})
                  </p>
                </div>
              ) : (
                <div className="bg-[#faf8ff] border border-slate-200 p-3 rounded-lg text-xs text-[#424653] text-center">
                  Check your UNIPORT institutional inbox for the temporary access verification code.
                </div>
              )}

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full bg-[#0055c2] hover:bg-[#003f93] text-white py-2.5 sm:py-3 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
              >
                <span>Proceed to Voter Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Secondary Link */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#0055c2] hover:text-[#003f93] transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Voter Login</span>
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 flex items-start gap-2.5 p-3 sm:p-3.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
          <Lock className="w-4 h-4 text-[#737785] shrink-0 mt-0.5" />
          <p className="text-xs text-[#424653] leading-relaxed">
            Your account information is handled securely. For your protection, we won't reveal whether an account exists until the recovery process is completed.
          </p>
        </div>
      </div>
    </div>
  );
};
