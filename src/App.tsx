import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ElectionProvider, useElection } from './context/ElectionContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatusStrip } from './components/StatusStrip';
import { AboutSection } from './components/AboutSection';
import { VotingProcess } from './components/VotingProcess';
import { IntegritySection } from './components/IntegritySection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { OnboardingTour } from './components/OnboardingTour';

import { EligibilityModal } from './components/EligibilityModal';
import { VoterLoginModal } from './components/VoterLoginModal';
import { ElecoAdminModal } from './components/ElecoAdminModal';

import { VotingBoothView } from './views/VotingBoothView';
import { LiveMonitorView } from './views/LiveMonitorView';
import { ResultsView } from './views/ResultsView';
import { RegistrationView } from './views/RegistrationView';
import { AdminPortalView } from './views/AdminPortalView';
import { GuidelinesView } from './views/GuidelinesView';
import { ElectionDetailsView } from './views/ElectionDetailsView';
import { EligibilityView } from './views/EligibilityView';
import { VoterLoginView } from './views/VoterLoginView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { VoterDashboardView } from './views/VoterDashboardView';
import { AccreditationStatusView } from './views/AccreditationStatusView';
import { Voter } from './types';
import { AdminLoginView } from './views/AdminLoginView';

const VIEW_TO_PATH: Record<string, string> = {
  home: '/',
  elections: '/elections',
  vote: '/vote',
  'live-monitor': '/live-monitor',
  results: '/results',
  register: '/register',
  login: '/login',
  'forgot-password': '/forgot-password',
  dashboard: '/dashboard',
  'accreditation-status': '/accreditation-status',
  eligibility: '/eligibility',
  'admin-login': '/admin-login',
  admin: '/admin',
  guidelines: '/guidelines',
};

const PATH_TO_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view]),
);

function ElectionAppContent() {
  const { currentVoter, isAdminAuthenticated, logoutAdmin, loginVoter } = useElection();
  const location = useLocation();
  const navigate = useNavigate();

  const currentView = PATH_TO_VIEW[location.pathname] ?? 'home';
  const setCurrentView = (view: string) => {
    const target = VIEW_TO_PATH[view] ?? '/';
    navigate(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showVoterLoginModal, setShowVoterLoginModal] = useState(false);
  const [showElecoAdminModal, setShowElecoAdminModal] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(() => localStorage.getItem('election_onboarding_completed') !== 'true');
  const [showAdminOnboardingTour, setShowAdminOnboardingTour] = useState(false);
  const [selectedAccreditationVoter, setSelectedAccreditationVoter] = useState<Voter | null>(null);

  const closeOnboardingTour = () => {
    localStorage.setItem('election_onboarding_completed', 'true');
    setShowOnboardingTour(false);
  };

  const closeAdminOnboardingTour = () => {
    localStorage.setItem('election_admin_onboarding_completed', 'true');
    setShowAdminOnboardingTour(false);
  };

  React.useEffect(() => {
    if (isAdminAuthenticated && currentView === 'admin' && localStorage.getItem('election_admin_onboarding_completed') !== 'true') {
      setShowAdminOnboardingTour(true);
    }
  }, [currentView, isAdminAuthenticated]);

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === 1) {
      setCurrentView('eligibility');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (stepIndex === 2) {
      setCurrentView('register');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (stepIndex === 3) {
      setCurrentView('vote');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (stepIndex === 4) {
      setCurrentView('live-monitor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] selection:bg-[#dae2fd] selection:text-[#003f93]">
      {/* Universal Header (Hidden when inside full Admin Console) */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          setCurrentView={(view) => {
            setCurrentView(view);
          }}
          onOpenEligibility={() => setShowEligibilityModal(true)}
          onOpenVoterModal={() => setShowVoterLoginModal(true)}
          onOpenGuide={() => setShowOnboardingTour(true)}
          onOpenElecoModal={() => {
            if (isAdminAuthenticated) {
              setCurrentView('admin');
            } else {
              setCurrentView('admin-login');
            }
          }}
        />
      )}

      {/* Main View Switcher */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="space-y-0">
                <Hero
                  onCheckEligibility={() => setCurrentView('eligibility')}
                  onViewLiveMonitor={() => setCurrentView('live-monitor')}
                  onStartVoting={() => setCurrentView('vote')}
                />

                <StatusStrip onOpenLiveMonitor={() => setCurrentView('live-monitor')} />

                <AboutSection />
                <VotingProcess onStepClick={handleStepClick} />
                <IntegritySection />

                <FinalCTA
                  onCheckEligibility={() => setCurrentView('eligibility')}
                  onViewGuidelines={() => setCurrentView('guidelines')}
                />
              </div>
            }
          />

          <Route
            path="/elections"
            element={
              <ElectionDetailsView
                onCheckEligibility={() => setCurrentView('eligibility')}
                onOpenLiveMonitor={() => setCurrentView('live-monitor')}
                onOpenVotingBooth={() => setCurrentView('vote')}
                onNavigateHome={() => setCurrentView('home')}
                onNavigateResults={() => setCurrentView('results')}
              />
            }
          />

          <Route
            path="/results"
            element={<ResultsView />}
          />

          <Route
            path="/vote"
            element={
              <VotingBoothView
                onBackToHome={() => setCurrentView('home')}
                onOpenLiveMonitor={() => setCurrentView('live-monitor')}
                onOpenEligibility={() => setShowEligibilityModal(true)}
              />
            }
          />

          <Route
            path="/live-monitor"
            element={
              <LiveMonitorView
                onBackToHome={() => setCurrentView('home')}
                onOpenVotingBooth={() => setCurrentView('vote')}
              />
            }
          />

          <Route
            path="/register"
            element={
              <RegistrationView
                onSuccessNavigateToVote={() => setCurrentView('vote')}
                onOpenEligibility={() => setCurrentView('eligibility')}
                onNavigateToLogin={() => setCurrentView('login')}
                onNavigateToAccreditationStatus={(voter) => {
                  setSelectedAccreditationVoter(voter);
                  setCurrentView('accreditation-status');
                }}
              />
            }
          />

          <Route
            path="/dashboard"
            element={
              <VoterDashboardView
                onNavigateToElections={() => setCurrentView('elections')}
                onNavigateToLiveMonitor={() => setCurrentView('live-monitor')}
                onNavigateToGuidelines={() => setCurrentView('guidelines')}
                onNavigateToVote={() => setCurrentView('vote')}
              />
            }
          />

          <Route
            path="/accreditation-status"
            element={
              <AccreditationStatusView
                voter={selectedAccreditationVoter}
                onNavigateToDashboard={() => setCurrentView(currentVoter ? 'dashboard' : 'home')}
                onNavigateToElectionDetails={() => setCurrentView('elections')}
              />
            }
          />

          <Route
            path="/login"
            element={
              <VoterLoginView
                onSuccessNavigateToVote={() => setCurrentView('dashboard')}
                onNavigateToRegister={() => setCurrentView('register')}
                onNavigateToEligibility={() => setCurrentView('eligibility')}
                onNavigateToForgotPassword={() => setCurrentView('forgot-password')}
              />
            }
          />

          <Route
            path="/forgot-password"
            element={
              <ForgotPasswordView
                onNavigateToLogin={() => setCurrentView('login')}
                onNavigateToRegister={() => setCurrentView('register')}
              />
            }
          />

          <Route
            path="/admin-login"
            element={
              <AdminLoginView
                onSuccess={() => setCurrentView('admin')}
                onNavigateToVoterPortal={() => setCurrentView('login')}
                onNavigateToGuidelines={() => setCurrentView('guidelines')}
              />
            }
          />

          <Route
            path="/admin"
            element={
              isAdminAuthenticated ? (
                <AdminPortalView
                  onLogout={() => {
                    logoutAdmin();
                    setCurrentView('home');
                  }}
                  onOpenGuide={() => setShowAdminOnboardingTour(true)}
                />
              ) : <Navigate to="/admin-login" replace />
            }
          />

          <Route
            path="/guidelines"
            element={
              <GuidelinesView
                onOpenVotingBooth={() => setCurrentView('vote')}
                onOpenEligibility={() => setShowEligibilityModal(true)}
              />
            }
          />

          <Route
            path="/eligibility"
            element={
              <EligibilityView
                onNavigateToLogin={(voter) => {
                  if (voter) {
                    setCurrentView('login');
                  } else {
                    setCurrentView('login');
                  }
                }}
                onNavigateToRegister={() => setCurrentView('register')}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Landing page footer */}
      {currentView === 'home' && (
        <Footer
          setCurrentView={(view) => {
            setCurrentView(view);
          }}
          onOpenEligibility={() => setShowEligibilityModal(true)}
          onOpenElecoModal={() => {
            if (isAdminAuthenticated) {
              setCurrentView('admin');
            } else {
              setCurrentView('admin-login');
            }
          }}
          onOpenVoterModal={() => setShowVoterLoginModal(true)}
        />
      )}

      {/* Global Modals */}
      <EligibilityModal
        isOpen={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        onProceedToVote={(voter) => {
          setCurrentView('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <VoterLoginModal
        isOpen={showVoterLoginModal}
        onClose={() => setShowVoterLoginModal(false)}
        onSuccess={() => {
          setCurrentView('vote');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCheckEligibility={() => setShowEligibilityModal(true)}
      />

      <OnboardingTour
        isOpen={showOnboardingTour && currentView === 'home'}
        onClose={closeOnboardingTour}
        onNavigate={setCurrentView}
      />

      <OnboardingTour
        isOpen={showAdminOnboardingTour && currentView === 'admin'}
        onClose={closeAdminOnboardingTour}
        onNavigate={setCurrentView}
        audience="admin"
      />

      <ElecoAdminModal
        isOpen={showElecoAdminModal}
        onClose={() => setShowElecoAdminModal(false)}
        onSuccess={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ElectionProvider>
      <ElectionAppContent />
    </ElectionProvider>
  );
}
