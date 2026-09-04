import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useElection } from '../context/ElectionContext';
import { CheckCircle2, BarChart2, ShieldCheck, GraduationCap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onCheckEligibility: () => void;
  onViewLiveMonitor: () => void;
  onStartVoting: () => void;
}

const HERO_VIDEOS = [
  {
    url: '/assets/hero/hero-1.mp4',
    caption: 'Faculty of Basic Medical Sciences Complex, UNIPORT'
  },
  {
    url: '/assets/hero/hero-2.mp4',
    caption: 'FABAMSSA Student Assembly & Congress'
  },
  {
    url: '/assets/hero/hero-3.mp4',
    caption: 'University of Port Harcourt College of Health Sciences'
  }
];

export const Hero: React.FC<HeroProps> = ({
  onCheckEligibility,
  onViewLiveMonitor,
  onStartVoting,
}) => {
  const { status, endTime, currentVoter } = useElection();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [clockNow, setClockNow] = useState(Date.now());
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  // Auto transition carousel every 11 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 11000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === currentImageIndex) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentImageIndex]);

  useEffect(() => {
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingSeconds = status === 'LIVE' && endTime
    ? Math.max(0, Math.floor((new Date(endTime).getTime() - clockNow) / 1000))
    : 0;
  const remainingTime = `${String(Math.floor(remainingSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;

  return (
    <motion.section
      id="bamssa-hero-section"
      className="relative flex min-h-[560px] w-full items-center justify-center overflow-hidden py-12 sm:py-16 lg:h-[82vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Full-bleed Carousel Backgrounds */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {/* Layered dark blue gradient overlay for optimal text contrast */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[#001944]/95 via-[#003f93]/70 to-[#001944]/65 z-10"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {HERO_VIDEOS.map((video, idx) => (
          <motion.div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center scale-105 ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{
              opacity: idx === currentImageIndex ? 1 : 0,
              scale: 1.08,
            }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          >
            <video
              className="h-full w-full object-cover"
              src={video.url}
              ref={(element) => {
                videoRefs.current[idx] = element;
              }}
              autoPlay={idx === currentImageIndex}
              muted
              loop
              playsInline
              preload={idx === currentImageIndex ? 'auto' : 'metadata'}
              aria-label={video.caption}
            />
          </motion.div>
        ))}
      </div>

      {/* Hero Content Layered Directly Over */}
      <motion.div
        className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl text-white"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        {/* Sub-badge: KEEP rounded-full */}
        <motion.div
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-white shadow-sm backdrop-blur-md sm:px-4 sm:text-[11px]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#8ab0fe] animate-pulse" />
          <span>2026/2027 EXECUTIVE ELECTIONS</span>
        </motion.div>

        {/* Display Headline */}
        <motion.h2
          className="mb-4 text-3xl font-extrabold uppercase leading-[1.08] tracking-[-0.04em] text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-[50px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          YOUR VOICE. YOUR REPRESENTATIVES. YOUR FABAMSSA.
        </motion.h2>

        {/* Sub-headline */}
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          The official, secure voting platform for Faculty of Basic Medical Science students (FABAMSSA). Cast your confidential ballot and shape our association's future.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="mx-auto mb-7 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-lg sm:flex-row"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          {status === 'LIVE' ? (
            <motion.button
              id="hero-vote-live-btn"
              onClick={onStartVoting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.75 text-sm font-semibold text-white shadow-lg shadow-[#003f93]/25 transition-all hover:bg-[#003f93] active:scale-[0.99] sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{currentVoter ? 'Enter Ballot Booth' : 'Authenticate & Vote'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              id="hero-check-eligibility-btn"
              onClick={onViewLiveMonitor}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.75 text-sm font-semibold text-white shadow-lg shadow-[#003f93]/25 transition-all hover:bg-[#003f93] active:scale-[0.99] sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check Eligibility</span>
            </motion.button>
          )}

          <motion.button
            id="hero-view-monitor-btn"
            onClick={onViewLiveMonitor}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.75 text-sm font-semibold text-white backdrop-blur-md shadow-sm transition-all hover:bg-white/20 active:scale-[0.99] sm:w-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart2 className="w-4 h-4" />
            <span>View Live Monitor</span>
          </motion.button>
        </motion.div>

        {/* Carousel indicators */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {HERO_VIDEOS.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-1.5 rounded-none transition-all cursor-pointer ${
                idx === currentImageIndex ? 'w-8 bg-[#8ab0fe]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </motion.div>

        {/* Quick status footnote */}
        <motion.div
          className="flex items-center justify-center gap-6 text-xs text-white/75 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          {status === 'LIVE' && <div className="flex items-center gap-1.5"><span>Time left</span><strong className="font-mono text-white">{remainingTime}</strong></div>}
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8ab0fe]" />
            <span>Zero-Compromise Ballot Secrecy</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#8ab0fe]" />
            <span>University of Port Harcourt Chapter</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
