import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { User, Lock, Eye, EyeOff, Info, ArrowRight, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

interface VoterLoginViewProps {
  onSuccessNavigateToVote: () => void;
  onNavigateToRegister: () => void;
  onNavigateToEligibility: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const VoterLoginView: React.FC<VoterLoginViewProps> = ({
  onSuccessNavigateToVote,
  onNavigateToRegister,
  onNavigateToEligibility,
  onNavigateToForgotPassword,
}) => {
  const { loginVoter, status } = useElection();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Matriculation Number or UNIPORT email.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password or 4-digit voter PIN.');
      return;
    }

    setIsLoading(true);
    const res = await loginVoter(identifier, password);
    setIsLoading(false);

    if (res.success) {
      onSuccessNavigateToVote();
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickFill = (idVal: string, passVal: string) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setErrorMessage(null);
  };

  return (
    <div className="bg-[#f8fafc] text-[#131b2e] min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-3 py-6 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Authentication Card */}
      <div className="w-full max-w-[440px] bg-white rounded-xl border border-slate-200/80 shadow-xs sm:shadow-sm overflow-hidden">
        <div className="p-4 sm:p-7 flex flex-col items-center">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#eaedff] border border-slate-200 mb-3 sm:mb-4 flex items-center justify-center shadow-2xs overflow-hidden">
              <img
                alt="FABAMSSA Logo"
                className="w-full h-full object-cover"
                src="/assets/nreerety-removebg-preview.png"
              />
            </div>
            <span className="inline-flex items-center rounded-full bg-[#eaedff] px-3 py-0.5 text-[11px] font-bold text-[#001944] mb-1.5 uppercase tracking-wider">
              ELECTION 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight">
              Voter Login
            </h1>
          </div>

          {/* Election Status Banner (STANDBY / LIVE) */}
          <div className="w-full bg-[#eaedff]/60 border border-[#b0c6ff]/50 rounded-lg p-3 sm:p-4 mb-4 flex items-start gap-2.5 sm:gap-3">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#003f93] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-0.5">
                {status === 'STANDBY' ? 'Standby Status' : 'Elections Active'}
              </h3>
              <p className="text-xs text-[#424653] leading-relaxed">
                {status === 'STANDBY'
                  ? 'Voting has not officially commenced. Log in to verify your accreditation status and credentials.'
                  : 'Voting is active. Log in with your matriculation credentials to access your secure ballot.'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="w-full p-3 bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-xs font-medium rounded-lg flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 sm:gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-semibold text-[#131b2e]" htmlFor="identifier">
                Matriculation Number or UNIPORT Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#737785] pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. U2021/5570020"
                  required
                  className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-[#131b2e] placeholder:text-[#737785] focus:outline-none focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#131b2e]" htmlFor="password">
                  Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToForgotPassword) {
                      onNavigateToForgotPassword();
                    } else {
                      onNavigateToEligibility();
                    }
                  }}
                  className="text-xs font-semibold text-[#0055c2] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#737785] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-[#131b2e] placeholder:text-[#737785] focus:outline-none focus:border-[#0055c2] focus:ring-2 focus:ring-[#0055c2]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737785] hover:text-[#131b2e] focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1.5 w-full bg-[#0055c2] text-white font-bold text-sm h-11 sm:h-12 rounded-lg flex items-center justify-center gap-2 hover:bg-[#003f93] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0055c2] cursor-pointer shadow-2xs active:scale-98"
            >
              <span>{isLoading ? 'Authenticating...' : 'Log In to Voter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Registration Callout */}
        <div className="bg-[#f8fafc] border-t border-slate-100 p-3 sm:p-4 text-center">
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-xs sm:text-sm text-[#424653] hover:text-[#003f93] transition-colors group inline-flex items-center justify-center gap-1 cursor-pointer font-medium"
          >
            <span>Don't have a voter account?</span>
            <span className="font-bold text-[#0055c2] group-hover:underline">Register for Accreditation</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0055c2] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
