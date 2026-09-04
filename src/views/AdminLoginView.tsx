import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  MapPin, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onNavigateToVoterPortal: () => void;
  onNavigateToGuidelines?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onSuccess,
  onNavigateToVoterPortal,
  onNavigateToGuidelines,
}) => {
  const { loginAdmin } = useElection();
  
  const [email, setEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(async () => {
        const isSuccess = await loginAdmin(password, adminName, email);

      if (isSuccess) {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid ELECO credentials. Please enter the authorized master passcode.');
      }
    }, 400);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] min-h-[calc(100vh-4rem)] w-full antialiased font-sans bg-[#faf8ff] text-[#131b2e]">
      
      {/* Left Panel: Brand Anchor (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0055c2] text-white relative overflow-hidden p-12 select-none">
        
        {/* Abstract Geometric Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Brand Content */}
        <div className="z-10 flex flex-col items-start max-w-lg mt-8">
          {/* Logo */}
          <div className="w-32 h-32 mb-8 bg-white rounded-full p-2 flex items-center justify-center shadow-lg border-4 border-[#0055c2]/40 shrink-0">
            <img 
              src="/assets/nreerety-removebg-preview.png"
              alt="BAMSSA Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            BAMSSA<br />ELECTIONS
          </h1>
          <h2 className="text-xl xl:text-2xl font-bold text-[#c2d2ff] mb-6 tracking-wide uppercase">
            ELECO Admin Portal
          </h2>

          <p className="text-base text-blue-100 max-w-md leading-relaxed border-l-4 border-blue-300 pl-4 font-normal">
            Administrative control center for the BAMSSA 2026 General Elections. Secure, transparent, and authoritative management of the electoral process.
          </p>
        </div>

        {/* Bottom Indicator */}
        <div className="z-10 flex items-center justify-between w-full border-t border-blue-400/30 pt-6 mt-12">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-200" />
            <span className="text-xs font-semibold text-blue-100 tracking-widest uppercase">
              UNIPORT Chapter
            </span>
          </div>
          <div className="text-sm font-bold text-white tracking-wider opacity-90">
            ELECTION 2026
          </div>
        </div>
      </div>

      {/* Right Panel: Login Interface */}
      <div className="flex flex-col justify-center items-center bg-[#faf8ff] p-4 sm:p-6 lg:p-12 relative overflow-y-auto min-h-[calc(100vh-4rem)]">
        
        <div className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#c2c6d5] shadow-xs relative z-10 my-auto">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#e2e7ff] text-[#003f93] px-3 py-1.5 rounded-full mb-6 border border-[#c2c6d5]/60">
            <ShieldCheck className="w-4 h-4 text-[#003f93]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              ELECO Administration
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mb-2 tracking-tight">
            Admin Login
          </h2>
          <p className="text-sm text-[#424653] mb-6">
            Sign in to access the BAMSSA election control center.
          </p>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-[#ffdad6] border border-[#ffdad6] rounded-xl flex items-start gap-2.5 text-[#93000a] text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="mb-4">
              <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider" htmlFor="admin-name">
                Administrator Name
              </label>
              <input
                id="admin-name"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. John C. Doe"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0055c2]"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider" htmlFor="admin-email">
                Admin Email
              </label>
              <div className="relative rounded-xl border border-[#c2c6d5] bg-white transition-all duration-200 flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-[#0055c2]/20 focus-within:border-[#0055c2]">
                <Mail className="w-5 h-5 text-[#737785] absolute left-3.5 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bamssauniport.org"
                  className="w-full pl-11 pr-4 py-3 bg-transparent border-none text-sm text-[#131b2e] placeholder:text-[#c2c6d5] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#131b2e] block uppercase tracking-wider" htmlFor="admin-password">
                  Password
                </label>
                <span className="text-xs font-semibold text-[#737785]">Authorized access only</span>
              </div>

              <div className="relative rounded-xl border border-[#c2c6d5] bg-white transition-all duration-200 flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-[#0055c2]/20 focus-within:border-[#0055c2]">
                <Lock className="w-5 h-5 text-[#737785] absolute left-3.5 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-transparent border-none text-sm text-[#131b2e] placeholder:text-[#c2c6d5] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#737785] hover:text-[#131b2e] transition-colors cursor-pointer focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-[#c2c6d5] text-[#003f93] focus:ring-[#0055c2]/20 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-[#424653] group-hover:text-[#131b2e] transition-colors">
                  Remember this device
                </span>
              </label>

              <span className="text-[11px] font-semibold text-[#737785]">Restricted ELECO access</span>
            </div>

            {/* Authorized ELECO Personnel Security Alert */}
            <div className="bg-[#eaedff] flex items-start space-x-3 p-3.5 rounded-xl border border-[#c2c6d5]/50">
              <ShieldCheck className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
              <p className="text-xs text-[#424653] leading-snug">
                Authorized ELECO personnel only. All access attempts are logged and monitored.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0055c2] hover:bg-[#003f93] text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-75"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Voter Portal Redirect */}
          <div className="mt-8 pt-6 border-t border-[#c2c6d5]/60 text-center">
            <p className="text-xs sm:text-sm text-[#424653]">
              Are you a voter?{' '}
              <button
                type="button"
                onClick={onNavigateToVoterPortal}
                className="font-bold text-[#003f93] hover:underline ml-1 cursor-pointer"
              >
                Return to Voter Portal →
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center px-4 mt-8 pb-4">
          <p className="text-xs text-[#424653] mb-1.5">
            © 2026 BAMSSA Electoral Commission
          </p>
          <div className="flex items-center justify-center space-x-3 text-xs text-[#737785]">
            <button
              type="button"
              onClick={onNavigateToGuidelines}
              className="hover:text-[#003f93] transition-colors cursor-pointer"
            >
              Guidelines
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onNavigateToGuidelines}
              className="hover:text-[#003f93] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onNavigateToGuidelines}
              className="hover:text-[#003f93] transition-colors cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
