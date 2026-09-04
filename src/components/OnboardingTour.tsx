import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, HelpCircle, ShieldCheck, Vote, X } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  audience?: 'voter' | 'admin';
}

const VOTER_STEPS = [
  {
    title: 'Welcome to FABAMSSA Elections',
    description: 'This short guide shows you how to check your status, register, vote, and follow official election updates.',
    icon: ShieldCheck,
    view: 'home',
  },
  {
    title: 'Explore the election',
    description: 'Open Elections to view the offices available for contest and the candidates approved by the Electoral Commission.',
    icon: BookOpen,
    view: 'elections',
  },
  {
    title: 'Check your eligibility',
    description: 'Use Eligibility to confirm your electoral record. New voters can submit their registration details for review.',
    icon: CheckCircle2,
    view: 'eligibility',
  },
  {
    title: 'Cast your ballot',
    description: 'After approval and accreditation, sign in with your voter PIN and select one candidate for each available office.',
    icon: Vote,
    view: 'vote',
  },
  {
    title: 'Follow official updates',
    description: 'Live Monitor shows election activity while Results displays outcomes after the Electoral Commission publishes them.',
    icon: HelpCircle,
    view: 'live-monitor',
  },
];

const ADMIN_STEPS = [
  { title: 'Welcome to the ELECO console', description: 'This guide introduces the tools used to manage voters, offices, candidates, polling, and official results.', icon: ShieldCheck, view: 'admin' },
  { title: 'Review voter records', description: 'Verification and Voters let you review registrations, approve eligible students, issue voting PINs, and monitor accreditation.', icon: CheckCircle2, view: 'admin' },
  { title: 'Configure offices and candidates', description: 'Positions and Candidates are controlled here. The public Elections page updates from these records automatically.', icon: BookOpen, view: 'admin' },
  { title: 'Control and monitor the election', description: 'Use Settings to set the voting window, then use Monitoring to follow turnout and system activity as the election runs.', icon: Vote, view: 'admin' },
  { title: 'Certify and publish results', description: 'Review position totals, complete certification, and publish the official results only when the tally is ready.', icon: HelpCircle, view: 'admin' },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onNavigate, audience = 'voter' }) => {
  const [stepIndex, setStepIndex] = useState(0);
  if (!isOpen) return null;

  const tourSteps = audience === 'admin' ? ADMIN_STEPS : VOTER_STEPS;
  const step = tourSteps[stepIndex];
  const Icon = step.icon;
  const isLastStep = stepIndex === tourSteps.length - 1;

  const finish = () => {
    onClose();
  };

  const next = () => {
    if (isLastStep) {
      finish();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  const goToStep = () => {
    onNavigate(step.view);
    finish();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001944]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#c2c6d5] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e2e7ff] bg-[#f8faff] px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#003f93]">
            <ShieldCheck className="h-4 w-4" />
            Getting Started
          </div>
          <button type="button" onClick={finish} className="rounded-lg p-2 text-[#737785] transition-colors hover:bg-[#e2e7ff] hover:text-[#131b2e]" aria-label="Close guide" title="Close guide">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-7 pt-8 text-center sm:px-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e2e7ff] text-[#003f93]">
            <Icon className="h-8 w-8" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#737785]">Step {stepIndex + 1} of {tourSteps.length}</p>
          <h2 id="onboarding-title" className="text-2xl font-extrabold tracking-tight text-[#131b2e]">{step.title}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#424653]">{step.description}</p>

          <div className="mt-6 flex justify-center gap-2" aria-label="Guide progress">
            {tourSteps.map((tourStep, index) => (
              <button key={tourStep.title} type="button" onClick={() => setStepIndex(index)} className={`h-2 rounded-full transition-all ${index === stepIndex ? 'w-8 bg-[#0055c2]' : 'w-2 bg-[#c2c6d5]'}`} aria-label={`Go to guide step ${index + 1}`} />
            ))}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={finish} className="px-3 py-2 text-sm font-semibold text-[#737785] hover:text-[#003f93]">Skip guide</button>
            <div className="flex items-center justify-end gap-2">
              {stepIndex > 0 && (
                <button type="button" onClick={() => setStepIndex((current) => current - 1)} className="inline-flex items-center gap-2 rounded-lg border border-[#c2c6d5] px-4 py-2.5 text-sm font-bold text-[#424653] hover:bg-[#f8faff]">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {!isLastStep && (
                <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-[#0055c2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#003f93]">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {isLastStep && (
                <button type="button" onClick={goToStep} className="inline-flex items-center gap-2 rounded-lg bg-[#0055c2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#003f93]">
                  {audience === 'admin' ? 'Open Admin Console' : 'View Live Monitor'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
