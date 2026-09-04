import React, { useState, useRef } from 'react';
import { useElection } from '../context/ElectionContext';
import { BMSDepartment, AcademicLevel, Voter } from '../types';
import { 
  User, 
  GraduationCap, 
  Lock, 
  Eye, 
  EyeOff, 
  Upload, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileCheck, 
  UserCheck,
  IdCard,
  FileText,
  X,
  Clock
} from 'lucide-react';

interface RegistrationViewProps {
  onSuccessNavigateToVote: () => void;
  onOpenEligibility?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToAccreditationStatus?: (voter: Voter) => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  onSuccessNavigateToVote,
  onOpenEligibility,
  onNavigateToLogin,
  onNavigateToAccreditationStatus,
}) => {
  const { registerVoter, checkEligibility } = useElection();

  const [fullName, setFullName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<AcademicLevel>('300L');
  const [department, setDepartment] = useState<BMSDepartment>('Anatomy');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Result state
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [registeredVoter, setRegisteredVoter] = useState<Voter | null>(null);
  const [registeredPin, setRegisteredPin] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('Please upload a JPG, PNG, or WebP image of your Student ID or Course Form.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('The uploaded document must be 5 MB or smaller.');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('Please upload a JPG, PNG, or WebP image of your Student ID or Course Form.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('The uploaded document must be 5 MB or smaller.');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your security password.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please confirm that the information provided is accurate.');
      return;
    }

    if (!selectedFile || !filePreview) {
      setErrorMessage('Please upload a clear photo of your UNIPORT Student ID or recent Course Form.');
      return;
    }

    const trimmedMatric = matricNumber.trim().toUpperCase();
    const existing = checkEligibility(trimmedMatric);
    if (existing) {
      if (existing.isAccredited) {
        setErrorMessage(`Matriculation ${trimmedMatric} is already registered & accredited with PIN: ${existing.voterPin}`);
        setRegisteredPin(existing.voterPin);
        setRegistrationSubmitted(true);
        return;
      }
      if (existing.verificationStatus === 'pending') {
        setErrorMessage(`Matriculation ${trimmedMatric} is already submitted and awaiting ELECO approval.`);
        setRegistrationSubmitted(true);
        return;
      }
    }

    const created = await registerVoter({
      fullName: fullName.trim(),
      matricNumber: trimmedMatric,
      department,
      level,
      email: email.trim() || `${trimmedMatric.toLowerCase().replace('/', '')}@uniport.edu.ng`,
      phone: '+234 800 000 0000',
      idCardUrl: filePreview,
    });

    if (created) {
      setRegisteredVoter(created);
      setRegistrationSubmitted(true);
      setRegisteredPin(null);
    }
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-[calc(100vh-4rem)] flex flex-col font-sans">
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-6 max-w-2xl">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0055c2]/10 text-[#003f93] mb-2.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase">ELECTION 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight mb-2">
            Voter Registration
          </h1>
          <p className="text-sm text-[#424653] leading-relaxed">
            Submit your official UNIPORT student details to get accredited for the FABAMSSA 2026 elections.
          </p>
        </div>

        {/* Success Confirmation Card */}
        {registrationSubmitted ? (
          <div className="bg-white border-2 border-[#fde68a] rounded-3xl p-6 sm:p-10 shadow-lg text-center max-w-2xl mx-auto space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10" />
            </div>

            <div>
              <span className="bg-[#fef3c7] text-[#b45309] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Awaiting Admin Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#131b2e] mt-3 tracking-tight">
                Registration Submitted Successfully
              </h2>
              <p className="text-sm text-[#424653] mt-1.5 max-w-md mx-auto">
                Your details have been received. ELECO must approve your eligibility before your student PIN is generated and you can log in to vote.
              </p>
            </div>

            {registeredPin && (
              <div className="bg-[#f2f3ff] border border-[#c2c6d5] p-6 rounded-2xl space-y-2.5 max-w-md mx-auto">
                <span className="text-xs font-bold text-[#737785] uppercase tracking-wider block">
                  Your 4-Digit Voter PIN
                </span>
                <div className="text-4xl font-extrabold text-[#003f93] tracking-[0.3em] flex items-center justify-center gap-3">
                  <span>{registeredPin}</span>
                  <button
                    onClick={() => copyPin(registeredPin)}
                    className="text-xs p-2 bg-white border border-[#c2c6d5] hover:bg-[#eaedff] text-[#0055c2] rounded-xl transition-colors shadow-2xs cursor-pointer"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-[#15803d]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[#ba1a1a] font-medium">
                  Keep this PIN confidential. You will need it to cast your ballot in the booth.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              {onNavigateToAccreditationStatus && (
                <button
                  onClick={() => registeredVoter && onNavigateToAccreditationStatus(registeredVoter)}
                  disabled={!registeredVoter}
                  className="flex-1 bg-white border border-[#c2c6d5] hover:bg-[#eaedff] text-[#003f93] font-bold py-3.5 px-5 rounded-xl text-sm sm:text-base transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Check Status</span>
                </button>
              )}
              {onOpenEligibility && (
                <button
                  onClick={onOpenEligibility}
                  className="flex-1 bg-[#003f93] hover:bg-[#002f70] text-white font-bold py-3.5 px-5 rounded-xl text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Eligibility Page</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Main Layout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Registration Form (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#c2c6d5] p-6 sm:p-8 md:p-10 shadow-xs">
              {errorMessage && (
                <div className="p-4 bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] text-sm font-medium rounded-2xl flex items-start gap-2.5 mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8" id="registrationForm">
                {/* Section 1: Personal Details */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#c2c6d5]/60 pb-3">
                    <User className="w-5 h-5 text-[#003f93]" />
                    <h2 className="text-lg font-bold text-[#131b2e]">Personal Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#424653] uppercase tracking-wider block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full h-12 px-4 rounded-xl border border-[#c2c6d5] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all text-sm text-[#131b2e] bg-[#faf8ff] placeholder:text-[#737785]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#424653] uppercase tracking-wider block">
                        Matriculation Number
                      </label>
                      <input
                        type="text"
                        placeholder="U20XX/XXXXXXX"
                        value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value)}
                        required
                        className="w-full h-12 px-4 rounded-xl border border-[#c2c6d5] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all text-sm text-[#131b2e] bg-[#faf8ff] placeholder:text-[#737785]"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-[#424653] uppercase tracking-wider block">
                        UNIPORT Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="student@uniport.edu.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-12 px-4 rounded-xl border border-[#c2c6d5] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all text-sm text-[#131b2e] bg-[#faf8ff] placeholder:text-[#737785]"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label htmlFor="registration_department" className="text-xs font-bold text-[#424653] uppercase tracking-wider block">
                        Department
                      </label>
                      <select
                        id="registration_department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as BMSDepartment)}
                        required
                        className="w-full h-12 px-4 rounded-xl border border-[#c2c6d5] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all text-sm text-[#131b2e] bg-[#faf8ff]"
                      >
                        <option value="Anatomy">Anatomy</option>
                        <option value="Psychology">Psychology</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Section 2: Academic Level */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#c2c6d5]/60 pb-3">
                    <GraduationCap className="w-5 h-5 text-[#003f93]" />
                    <h2 className="text-lg font-bold text-[#131b2e]">Academic Level</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {(['100L', '200L', '300L'] as AcademicLevel[]).map((lvl) => {
                      const isSelected = level === lvl;
                      return (
                        <label key={lvl} className="cursor-pointer">
                          <input
                            type="radio"
                            name="academicLevel"
                            value={lvl}
                            checked={isSelected}
                            onChange={() => setLevel(lvl)}
                            className="sr-only peer"
                          />
                          <div
                            className={`h-12 flex items-center justify-center rounded-xl border transition-all text-sm font-bold ${
                              isSelected
                                ? 'border-[#003f93] bg-[#0055c2]/10 text-[#003f93] shadow-2xs'
                                : 'border-[#c2c6d5] text-[#424653] hover:bg-[#f2f3ff]'
                            }`}
                          >
                            {lvl}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>

                {/* Section 3: Account Security */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#c2c6d5]/60 pb-3">
                    <Lock className="w-5 h-5 text-[#003f93]" />
                    <h2 className="text-lg font-bold text-[#131b2e]">Account Security</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-[#424653] uppercase tracking-wider block">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full h-12 px-4 rounded-xl border border-[#c2c6d5] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all text-sm text-[#131b2e] bg-[#faf8ff] pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737785] hover:text-[#003f93] p-1 transition-colors"
                        >
                          {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-[#424653] uppercase tracking-wider block">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full h-12 px-4 rounded-xl border border-[#c2c6d5] focus:border-[#003f93] focus:ring-2 focus:ring-[#003f93]/10 transition-all text-sm text-[#131b2e] bg-[#faf8ff] pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737785] hover:text-[#003f93] p-1 transition-colors"
                        >
                          {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4: Identity Verification */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#c2c6d5]/60 pb-3">
                    <IdCard className="w-5 h-5 text-[#003f93]" />
                    <h2 className="text-lg font-bold text-[#131b2e]">Identity Verification</h2>
                  </div>

                  <p className="text-sm text-[#424653]">
                    Upload a clear photo of your UNIPORT Student ID or recent Course Form.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group bg-[#faf8ff] ${
                      isDragging
                        ? 'border-[#003f93] bg-[#f2f3ff]'
                        : 'border-[#c2c6d5] hover:border-[#003f93] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    {selectedFile ? (
                      <div className="space-y-2 flex flex-col items-center">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Uploaded preview"
                            className="w-24 h-24 object-cover rounded-xl border border-[#c2c6d5] shadow-xs mb-2"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center mb-2">
                            <FileCheck className="w-8 h-8" />
                          </div>
                        )}
                        <p className="text-sm font-bold text-[#131b2e]">{selectedFile.name}</p>
                        <p className="text-xs text-[#737785]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-[#0055c2]/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform text-[#003f93]">
                          <Upload className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-[#131b2e] mb-1">
                          Click to upload or drag and drop
                        </h3>
                        <p className="text-xs text-[#737785]">
                          PNG, JPG or WebP (Max. 5MB)
                        </p>
                      </>
                    )}
                  </div>

                  <div className="bg-[#f2f3ff] p-4 rounded-xl flex gap-3 items-start border border-[#d2d9f4]">
                    <ShieldCheck className="w-5 h-5 text-[#003f93] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#131b2e] mb-0.5">Secure Verification</h4>
                      <p className="text-xs text-[#424653] leading-relaxed">
                        Your document is used by ELECO for electoral accreditation review.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Form Actions & Disclaimer */}
                <div className="pt-4 border-t border-[#c2c6d5]/60 space-y-5">
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      className="w-5 h-5 rounded border-[#c2c6d5] text-[#003f93] focus:ring-[#003f93] mt-0.5"
                    />
                    <span className="text-xs sm:text-sm text-[#424653] leading-snug">
                      I confirm that all provided information is accurate and belongs to me. I understand that false information will lead to disqualification.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full h-14 bg-[#003f93] hover:bg-[#002f70] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Submit for Accreditation</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Sidebar (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* How Accreditation Works Timeline Card */}
              <div className="bg-white rounded-3xl border border-[#c2c6d5] p-6 sm:p-8 shadow-xs">
                <h3 className="text-xl font-bold text-[#131b2e] mb-6">How Accreditation Works</h3>
                
                <div className="relative space-y-7">
                  {/* Connecting Line precisely centered through the 24px circles (left-3 = 12px) */}
                  <div className="absolute left-3 top-3 bottom-3 w-0.5 -translate-x-1/2 bg-[#c2c6d5]"></div>

                  {/* Step 1 */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-[#003f93] shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#003f93]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#131b2e] mb-1">Submit Details</h4>
                      <p className="text-xs text-[#424653] leading-relaxed">
                        Fill the registration form and provide necessary academic proof.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-[#c2c6d5] shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#131b2e] mb-1">ELECO Review</h4>
                      <p className="text-xs text-[#424653] leading-relaxed">
                        The electoral committee verifies your UNIPORT student status.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start gap-4">
                    <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-[#c2c6d5] shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#131b2e] mb-1">Get Approved</h4>
                      <p className="text-xs text-[#424653] leading-relaxed">
                        Once approved, you can log in to cast your vote securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Already Registered Callout Card */}
              <div className="bg-[#f2f3ff] rounded-3xl border border-[#d2d9f4] p-6 sm:p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto border border-[#c2c6d5] shadow-2xs text-[#003f93]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e]">Already registered?</h3>
                <p className="text-xs text-[#424653] leading-relaxed">
                  If you have completed accreditation, you can proceed to login.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToLogin) {
                      onNavigateToLogin();
                    } else if (onOpenEligibility) {
                      onOpenEligibility();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-[#003f93] font-bold text-sm hover:underline pt-1 cursor-pointer"
                >
                  <span>Proceed to Voter Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
