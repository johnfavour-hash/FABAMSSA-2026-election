import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Fingerprint, Vote, BarChart3, ArrowRight } from 'lucide-react';

interface VotingProcessProps {
  onStepClick: (stepIndex: number) => void;
}

export const VotingProcess: React.FC<VotingProcessProps> = ({ onStepClick }) => {
  const steps = [
    {
      num: 1,
      title: 'Check Eligibility',
      desc: 'Verify your status using your matriculation number.',
      icon: UserCheck,
      active: true,
      actionText: 'Lookup Status',
    },
    {
      num: 2,
      title: 'Get Accredited',
      desc: 'Secure authentication on election day.',
      icon: Fingerprint,
      active: false,
      actionText: 'Generate PIN',
    },
    {
      num: 3,
      title: 'Cast Your Vote',
      desc: 'Select your preferred candidates securely.',
      icon: Vote,
      active: false,
      actionText: 'Open Ballot',
    },
    {
      num: 4,
      title: 'See the Outcome',
      desc: 'Monitor live transparent results.',
      icon: BarChart3,
      active: false,
      actionText: 'Live Monitor',
    },
  ];

  return (
    <motion.section
      id="bamssa-voting-process"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f2f3ff] border-y border-[#c2c6d5]/70"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65 }}
    >
      <div className="container mx-auto max-w-[1280px] text-center">
        <motion.h3 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#131b2e] mb-12 tracking-tight" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          How Voting Works
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Decorative Connecting Line on desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] w-[80%] h-[1px] bg-[#c2c6d5] -z-0"></div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                id={`voting-step-card-${step.num}`}
                onClick={() => onStepClick(step.num)}
                className="bg-white border border-[#c2c6d5] p-6 rounded-[12px] shadow-xs flex flex-col items-center relative text-center hover:border-[#0055c2] hover:shadow-md transition-all cursor-pointer group z-10"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: step.num * 0.08 }}
              >
                {/* Number Box */}
                <div
                  className={`w-12 h-12 rounded-[10px] flex items-center justify-center mb-4 text-base font-bold transition-transform group-hover:scale-110 ${
                    step.num === 1
                      ? 'bg-[#0055c2] text-white shadow-xs'
                      : 'bg-[#dae2fd] text-[#003f93]'
                  }`}
                >
                  {step.num}
                </div>

                {/* Icon */}
                <Icon
                  className={`w-10 h-10 mb-3 transition-colors ${
                    step.num === 1 ? 'text-[#0055c2]' : 'text-[#424653] group-hover:text-[#0055c2]'
                  }`}
                />

                {/* Title */}
                <h4 className="text-lg font-bold text-[#131b2e] mb-2 tracking-tight">
                  {step.title}
                </h4>

                {/* Description */}
                <p className="text-sm text-[#424653] leading-relaxed mb-4">
                  {step.desc}
                </p>

                {/* Interactive cue */}
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-[#0055c2] group-hover:translate-x-0.5 transition-transform">
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
