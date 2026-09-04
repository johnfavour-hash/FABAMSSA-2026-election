import React, { useState } from 'react';
import { useElection } from '../context/ElectionContext';
import { Voter } from '../types';
import { 
  Search, 
  CheckCircle, 
  Lock, 
  ArrowRight, 
  Info, 
  Fingerprint, 
  EyeOff, 
  Clock, 
  UserCheck, 
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

interface EligibilityViewProps {
  onNavigateToLogin: (voter?: Voter) => void;
  onNavigateToRegister: () => void;
}

export const EligibilityView: React.FC<EligibilityViewProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  const { checkEligibility, refreshElectionData } = useElection();
  const [queryInput, setQueryInput] = useState('');
  const [searchedVoter, setSearchedVoter] = useState<Voter | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const maskName = (name: string) => {
    const parts = name.split(' ');
    return parts
      .map((part) => {
        if (part.length <= 2) return part.toUpperCase();
        return `${part.substring(0, 2).toUpperCase()}***`;
      })
      .join(' ');
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorStatus(null);

    const input = queryInput.trim();
    if (!input) {
      setErrorStatus('Please enter your Matriculation Number or student email address.');
      setSearchedVoter(null);
      setHasSearched(true);
      return;
    }

    await refreshElectionData();
    const found = checkEligibility(input);
    if (found) {
      setSearchedVoter(found);
      setErrorStatus(null);
    } else {
      setSearchedVoter(null);
      setErrorStatus(`No electoral record found for "${input}". Please check for typos or register as a new voter.`);
    }
    setHasSearched(true);
  };

  const handleQuickDemo = async (val: string) => {
    setQueryInput(val);
    setErrorStatus(null);
    await refreshElectionData();
    const found = checkEligibility(val);
    setSearchedVoter(found);
    setHasSearched(true);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-[calc(100vh-4rem)] flex flex-col font-sans">
      <main className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-10 max-w-2xl">
          <span className="inline-block bg-blue-100 text-[#2563eb] px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
            ELECTION 2026
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Check Your Eligibility
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Confirm that you're registered and eligible to participate in the FABAMSSA 2026 General Executive Council Elections.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form & Results Column (Left Column, 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6 border-b border-slate-100 pb-5">
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">Enter Your Student Details</h3>
                <p className="text-sm text-slate-600">Use the information associated with your FABAMSSA/student record.</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="identifier">
                    Matriculation Number or Email Address
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="e.g. U2021/5530001 or student@uniport.edu.ng"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all font-medium"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#2563eb] text-white px-6 py-4 rounded-xl text-base font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Search className="w-5 h-5" />
                    Check Eligibility
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <p className="text-xs">Your information is used only to verify your electoral eligibility.</p>
              </div>
            </div>

            {/* Results Area (Inside Left Column) */}
            {hasSearched && searchedVoter && (
              <div className={`${searchedVoter.isAccredited ? 'bg-green-50 border-green-200' : searchedVoter.verificationStatus === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'} border rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className="flex items-center gap-3 mb-6">
                  {searchedVoter.isAccredited ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : searchedVoter.verificationStatus === 'rejected' ? (
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  ) : (
                    <Clock className="w-8 h-8 text-amber-600" />
                  )}
                  <h4 className={`text-xl font-bold ${searchedVoter.isAccredited ? 'text-green-900' : searchedVoter.verificationStatus === 'rejected' ? 'text-red-900' : 'text-amber-900'}`}>
                    {searchedVoter.isAccredited ? 'Approved & Ready to Vote' : searchedVoter.verificationStatus === 'rejected' ? 'Registration Rejected' : 'Awaiting Admin Approval'}
                  </h4>
                </div>

                <div className="bg-white rounded-xl p-5 border border-green-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Name</p>
                    <p className="text-base font-bold text-slate-900">{maskName(searchedVoter.fullName)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Level</p>
                    <p className="text-base font-bold text-slate-900">{searchedVoter.level || '300L'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Status</p>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold w-fit ${searchedVoter.isAccredited ? 'bg-green-100 text-green-800' : searchedVoter.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                      <span className={`w-2 h-2 rounded-full ${searchedVoter.isAccredited ? 'bg-green-500' : searchedVoter.verificationStatus === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                      {searchedVoter.isAccredited ? 'Approved' : searchedVoter.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                    </div>
                  </div>
                </div>

                {searchedVoter.isAccredited && searchedVoter.voterPin && (
                  <div className="bg-white rounded-xl p-4 border border-green-200 mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Official 4-Digit PIN</p>
                    <div className="text-3xl font-black tracking-[0.35em] text-[#003f93]">{searchedVoter.voterPin}</div>
                  </div>
                )}

                {searchedVoter.verificationStatus === 'rejected' && searchedVoter.rejectionReason && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <span className="font-bold">Reason:</span> {searchedVoter.rejectionReason}
                  </div>
                )}

                {searchedVoter.isAccredited ? (
                  <button
                    type="button"
                    onClick={() => onNavigateToLogin(searchedVoter)}
                    className="w-full bg-green-600 text-white px-6 py-4 rounded-xl text-base font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    Proceed to Login
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-700 px-6 py-4 rounded-xl text-base font-semibold text-center">
                    {searchedVoter.verificationStatus === 'rejected' ? 'Please contact ELECO for re-submission.' : 'Your approval is pending. Please wait for the admin to verify your record.'}
                  </div>
                )}
              </div>
            )}

            {/* Error / Not Found State */}
            {hasSearched && !searchedVoter && errorStatus && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-lg font-bold text-amber-900 mb-1">Voter Record Not Found</h4>
                    <p className="text-sm text-amber-800 leading-relaxed mb-4">{errorStatus}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="bg-[#2563eb] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    Register as a Voter
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Information Column (Right Column, 1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Info Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#2563eb]" />
                About Eligibility
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
                  <span>Active student status.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
                  <span>Valid UNIPORT matriculation.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
                  <span>ELECO accreditation.</span>
                </li>
              </ul>
            </div>

            {/* Alternative Action Panel */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-2">Not registered yet?</h4>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                If you are not yet registered, submit your details before the deadline.
              </p>
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="inline-flex items-center gap-2 text-[#2563eb] font-bold text-sm hover:underline cursor-pointer"
              >
                Register as a Voter
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust & Security Features Footer Pillars */}
        <div className="w-full mt-16 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <Fingerprint className="w-8 h-8 text-[#2563eb] mb-3" />
              <h5 className="text-base font-bold mb-1 text-slate-900">1-Student-1-Ballot</h5>
              <p className="text-sm text-slate-600">Secure digital voting process.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <EyeOff className="w-8 h-8 text-[#2563eb] mb-3" />
              <h5 className="text-base font-bold mb-1 text-slate-900">100% Ballot Secrecy</h5>
              <p className="text-sm text-slate-600">Your choice remains completely anonymous.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <Clock className="w-8 h-8 text-[#2563eb] mb-3" />
              <h5 className="text-base font-bold mb-1 text-slate-900">Scheduled Hours</h5>
              <p className="text-sm text-slate-600">Regulated and time-stamped participation.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
