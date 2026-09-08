import React from 'react';
import { Shield, Lock, CheckCircle2, Clock, ExternalLink, HelpCircle, FileText } from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  onOpenEligibility: () => void;
  onOpenElecoModal: () => void;
  onOpenVoterModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setCurrentView,
  onOpenEligibility,
  onOpenElecoModal,
  onOpenVoterModal,
}) => {
  return (
    <footer id="bamssa-main-footer" className="bg-[#003f93] border-t border-[#0055c2] py-16 px-4 sm:px-6 lg:px-8 mt-auto w-full">
      <div className="container mx-auto max-w-[1280px]">
        {/* Top 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-12">
          {/* Column 1: Brand & Tagline */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                alt="FABAMSSA Logo"
                className="h-11 w-11 object-contain rounded-md"
                src="/assets/nreerety-removebg-preview.png"
              />
              <div>
                <h2 className="text-xl font-bold text-white leading-none">FABAMSSA UNIPORT</h2>
                <span className="inline-block mt-1 bg-[#0055c2] text-white text-[10px] px-2 py-0.5 rounded-none font-bold ring-1 ring-white/20">
                  2026
                </span>
              </div>
            </div>
            <p className="text-sm text-white/85 leading-relaxed">
              Official democratic voting portal for the Faculty of Basic Medical Science Students Association (FABAMSSA), University of Port Harcourt Chapter. Built for zero-compromise ballot secrecy and live transparency.
            </p>
            <div className="text-xs text-white/70 pt-1 space-y-1">
              <p className="italic font-medium text-[#ffd966]">Motto: Structural &amp; Functional Pathway to Modern Medicine</p>
              <p>Faculty of Basic Medical Sciences • College of Health Sciences</p>
              <p className="text-[11px] text-white/60">Secretariat: East-West Road, P.O. Box 5353, Choba, Port Harcourt, Rivers State</p>
            </div>
          </div>

          {/* Column 2: Security & Trust */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Security &amp; Trust Pillars
            </h3>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5 text-white/85 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#ffd966]" />
                <span className="font-medium">1-Student-1-Ballot Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/85 text-sm">
                <Lock className="w-4 h-4 text-[#ffd966]" />
                <span className="font-medium">100% Anonymous Ballot Secrecy</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/85 text-sm">
                <Clock className="w-4 h-4 text-[#ffd966]" />
                <span className="font-medium">Strict Scheduled Polling Hours</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/85 text-sm">
                <Shield className="w-4 h-4 text-[#ffd966]" />
                <span className="font-medium">Independent Auditing by ELECO</span>
              </div>
            </div>
          </div>

          {/* Column 3: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Navigation Links
            </h3>
            <nav className="flex flex-col gap-2.5 text-sm">
              <button
                onClick={onOpenEligibility}
                className="text-left text-white/85 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Check Voter Eligibility
              </button>
              <button
                onClick={() => setCurrentView('live-monitor')}
                className="text-left text-white/85 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Live Results Monitor
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="text-left text-white/85 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Student Voter Registration
              </button>
              <button
                onClick={onOpenVoterModal}
                className="text-left text-white/85 hover:text-white transition-colors font-medium cursor-pointer"
              >
                Voter Portal Login
              </button>
              <button
                onClick={onOpenElecoModal}
                className="text-left text-white/85 hover:text-white transition-colors font-medium cursor-pointer"
              >
                ELECO Admin Access
              </button>
            </nav>
          </div>
        </div>

        {/* Faculty Leadership Strip */}
        <div className="border-t border-white/20 pt-8 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4">Faculty Leadership & Patrons</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <p className="font-bold text-white">PROF. O. ADIENBO</p>
              <p className="text-white/70">Dean, Faculty of Basic Medical Sciences</p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">Patrons</p>
              <ul className="text-white/80 space-y-0.5">
                <li>Prof. D. V. Dapper (Physiology)</li>
                <li>Dr. Bob-Manuel I.F (Anatomy)</li>
                <li>Dr. Bruno Chinko (Physiology)</li>
                <li>Dr. Sunny O. (Anatomy)</li>
                <li>Dr. Josiah S. Hart (Anatomy)</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white">Staff Adviser</p>
              <p className="text-white/80">Dr. Iyke Weleh</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col lg:flex-row justify-between items-center gap-4 text-center lg:text-left">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-white">
              © 2026 FABAMSSA Electoral Committee (ELECO).
            </p>
            <p className="text-[11px] text-white/70">
              Official Electoral Platform • University of Port Harcourt Chapter
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <button
              onClick={() => setCurrentView('guidelines')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Election Guidelines
            </button>
            <button
              onClick={() => setCurrentView('guidelines')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Privacy &amp; Ballot Policy
            </button>
            <button
              onClick={() => setCurrentView('guidelines')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Technical Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
