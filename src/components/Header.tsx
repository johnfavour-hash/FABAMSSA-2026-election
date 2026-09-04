import React from 'react';
import { useElection } from '../context/ElectionContext';
import { ShieldCheck, LogOut, Vote, KeyRound, Menu, X, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenEligibility: () => void;
  onOpenElecoModal: () => void;
  onOpenVoterModal: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenEligibility,
  onOpenElecoModal,
  onOpenVoterModal,
  onOpenGuide,
}) => {
  const { currentVoter, logoutVoter, isAdminLoggedIn, logoutAdmin } = useElection();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    ...(currentVoter ? [{ id: 'dashboard', label: 'Dashboard', action: () => setCurrentView('dashboard') }] : []),
    { id: 'elections', label: 'Elections', action: () => setCurrentView('elections') },
    { id: 'eligibility', label: 'Eligibility', action: () => setCurrentView('eligibility') },
    { id: 'live-monitor', label: 'Live Monitor', action: () => setCurrentView('live-monitor') },
    { id: 'results', label: 'Results', action: () => setCurrentView('results') },
    { id: 'guide', label: 'Guide', action: onOpenGuide },
    { 
      id: 'about', 
      label: 'About', 
      action: () => {
        if (currentView !== 'home') {
          setCurrentView('home');
          setTimeout(() => {
            document.getElementById('bamssa-about-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          document.getElementById('bamssa-about-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      } 
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe7ff] bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-18 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div 
          id="bamssa-brand-logo"
          className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
          onClick={() => {
            if (currentVoter) {
              setCurrentView('dashboard');
            } else {
              setCurrentView('home');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            alt="FABAMSSA Logo"
            className="h-9 w-9 rounded-lg object-contain ring-2 ring-[#dfe7ff] sm:h-10 sm:w-10"
            src="/assets/nreerety-removebg-preview.png"
          />
          <span className="truncate text-sm font-extrabold tracking-[-0.02em] text-[#003f93] sm:text-base lg:text-lg">
            FABAMSSA ELECTIONS
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav id="header-desktop-nav" className="hidden items-center gap-1 rounded-full border border-[#e5ebff] bg-[#f8faff] p-1 md:flex">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => {
                  if (link.action) {
                    link.action();
                  } else {
                    setCurrentView(link.id);
                  }
                }}
                className={`rounded-full px-3 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#003f93] text-white shadow-sm'
                    : 'text-[#424653] hover:bg-white hover:text-[#003f93]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls / Auth */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {/* Authenticated Voter Profile Block */}
          {currentVoter ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center gap-2.5 text-left cursor-pointer"
                title="View your voter dashboard"
              >
                <div className="hidden text-right sm:block">
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold text-[#131b2e] transition-colors group-hover:text-[#003f93] sm:text-xs">
                    <span>{currentVoter.fullName}</span>
                    <span className="text-[#424653] font-normal">•</span>
                    <span>Accredited</span>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#16a34a] fill-[#16a34a]/15" />
                  </p>
                  <p className="text-[10px] text-[#424653] sm:text-[11px]">Voter</p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#c2c6d5] bg-[#eaedff] shadow-sm ring-2 ring-white transition-colors group-hover:border-[#003f93] sm:h-10 sm:w-10">
                  <img
                    alt="Student Profile Avatar"
                    className="h-full w-full object-cover"
                    src={
                      currentVoter.avatarUrl ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWlMIrte2-MY7oXEDW1oStZ78EmWlv4m3sSYLK3jxk6iviAh2APlIjBtH6qRbIpEZuT48yc96koIrkawgTaEmX4tiYmwYAE1WFNKaPiAmfJlEQ9_QZhqehvPio0EWIPvVU6wpj7NW74lSnOieXvHoj4ngQ8y-kwhUZyHs5XAVoLHIY8-8YRw0w5zo3nZcknPHLHndesYlIWEIbhAkh9jcbjgXiTvEtCkKmt7bZ7kLtalKhKgajSBR'
                    }
                  />
                </div>
              </button>

              <button
                id="header-voter-logout-btn"
                onClick={logoutVoter}
                title="Sign out of voter session"
                className="rounded-lg p-1.5 text-[#737785] transition-colors hover:bg-[#ffdad6]/40 hover:text-[#ba1a1a] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="header-voter-login-btn"
              onClick={() => {
                setCurrentView('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hidden items-center gap-1.5 rounded-xl border border-[#dfe7ff] bg-[#f8faff] px-3 py-2 text-[11px] font-semibold text-[#003f93] transition-all hover:border-[#003f93]/30 hover:bg-[#edf4ff] sm:flex"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#0055c2]" />
              <span>Voter Login</span>
            </button>
          )}

          {/* ELECO Admin Button */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                id="header-admin-active-btn"
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-1.5 rounded-xl bg-[#003f93] px-2.5 py-2 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-[#001944] sm:px-3 sm:text-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#8ab0fe]" />
                <span className="hidden sm:inline">ELECO Console</span>
                <span className="sm:hidden">ELECO</span>
              </button>
              <button
                id="header-admin-logout-btn"
                onClick={logoutAdmin}
                title="Lock ELECO console"
                className="rounded-lg p-1.5 text-[#737785] transition-colors hover:bg-[#ffdad6]/40 hover:text-[#ba1a1a]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="header-eleco-login-btn"
              onClick={onOpenElecoModal}
              className="hidden rounded-xl bg-[#003f93] px-2.5 py-2 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-[#001944] sm:flex sm:items-center sm:gap-1.5 sm:px-3 sm:text-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#8ab0fe]" />
              <span>ELECO Login</span>
            </button>
          )}

          {/* Mobile Hamburger */}
          <button
            id="header-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex rounded-xl border border-[#dfe7ff] bg-[#f8faff] p-2 text-[#424653] transition-colors hover:bg-[#edf4ff] hover:text-[#003f93] md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="header-mobile-drawer" className="border-t border-[#dfe7ff] bg-white shadow-lg md:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 p-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.action) {
                    link.action();
                  } else {
                    setCurrentView(link.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                  currentView === link.id
                    ? 'bg-[#eaedff] text-[#003f93]'
                    : 'text-[#424653] hover:bg-[#f2f3ff]'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="mt-1 border-t border-[#eaedff] pt-2">
              {!currentVoter ? (
                <button
                  onClick={() => {
                    setCurrentView('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl bg-[#f2f3ff] px-3.5 py-2.5 text-left text-sm font-semibold text-[#0055c2]"
                >
                  <KeyRound className="h-4 w-4" />
                  Voter Accreditation & Login
                </button>
              ) : (
                <button
                  onClick={() => {
                    logoutVoter();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl bg-[#ffdad6]/30 px-3.5 py-2.5 text-left text-sm font-semibold text-[#ba1a1a]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out Voter Session
                </button>
              )}

              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl bg-[#003f93] px-3.5 py-2.5 text-left text-sm font-semibold text-white"
                >
                  <ShieldCheck className="h-4 w-4 text-[#8ab0fe]" />
                  ELECO Commission Console
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

