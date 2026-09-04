import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useElection } from '../context/ElectionContext';

interface StatusStripProps {
  onOpenAdminPrompt?: () => void;
  onOpenLiveMonitor?: () => void;
}

const AnimatedNumber = ({
  value,
  suffix = '',
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [duration, value]);

  const formattedValue =
    Number.isInteger(value)
      ? Math.round(displayValue).toLocaleString()
      : displayValue.toFixed(1).replace(/\.0$/, '');

  return (
    <span>
      {formattedValue}
      {suffix}
    </span>
  );
};

export const StatusStrip: React.FC<StatusStripProps> = () => {
  const { totalEligible, totalBallotsCast, turnoutPercentage } = useElection();

  const eligibleTarget = totalEligible;
  const ballotsTarget = totalBallotsCast;
  const turnoutTarget = turnoutPercentage;

  return (
    <motion.section
      id="bamssa-status-strip" 
      className="border-y border-[#d2d9f4] bg-[radial-gradient(circle_at_top,_#f4f8ff,_#edf4fc_50%,_#edf3ff)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <div className="rounded-2xl border border-[#c2c6d5]/70 bg-white px-5 py-7 text-center shadow-[0_12px_22px_rgba(15,23,42,0.04)] transition-colors hover:border-[#0055c2]/40 sm:px-6">
            <div className="mb-3 text-3xl font-bold leading-none tracking-[-0.04em] text-[#003f93] sm:text-4xl md:text-[38px]">
              <AnimatedNumber value={eligibleTarget} />
            </div>
            <div className="text-sm font-medium text-[#424653] md:text-base">
              Eligible Voters
            </div>
          </div>

          <div className="rounded-2xl border border-[#c2c6d5]/70 bg-white px-5 py-7 text-center shadow-[0_12px_22px_rgba(15,23,42,0.04)] transition-colors hover:border-[#0055c2]/40 sm:px-6">
            <div className="mb-3 text-3xl font-bold leading-none tracking-[-0.04em] text-[#003f93] sm:text-4xl md:text-[38px]">
              <AnimatedNumber value={ballotsTarget} />
            </div>
            <div className="text-sm font-medium text-[#424653] md:text-base">
              Ballots Cast
            </div>
          </div>

          <div className="rounded-2xl border border-[#c2c6d5]/70 bg-white px-5 py-7 text-center shadow-[0_12px_22px_rgba(15,23,42,0.04)] transition-colors hover:border-[#0055c2]/40 sm:px-6">
            <div className="mb-3 text-3xl font-bold leading-none tracking-[-0.04em] text-[#003f93] sm:text-4xl md:text-[38px]">
              <AnimatedNumber value={turnoutTarget} suffix="%" />
            </div>
            <div className="text-sm font-medium text-[#424653] md:text-base">
              Turnout
            </div>
          </div>

          <div className="rounded-2xl border border-[#c2c6d5]/70 bg-white px-5 py-7 text-center shadow-[0_12px_22px_rgba(15,23,42,0.04)] transition-colors hover:border-[#0055c2]/40 sm:px-6">
            <div className="mb-3 text-2xl font-bold leading-none tracking-[-0.04em] text-[#003f93] sm:text-3xl md:text-[32px]">
              4 Sept, 2026
            </div>
            <div className="text-sm font-medium text-[#424653] md:text-base">
              Election Day
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

