import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onCheckEligibility: () => void;
  onViewGuidelines: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onCheckEligibility,
  onViewGuidelines,
}) => {
  return (
    <motion.section id="bamssa-final-cta" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#faf8ff] text-center border-t border-[#c2c6d5]/50" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }}>
      <div className="container mx-auto max-w-3xl">
        <motion.h3 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#131b2e] mb-4 tracking-tight" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          Ready to participate?
        </motion.h3>
        
        <p className="text-base sm:text-lg text-[#424653] mb-8 max-w-xl mx-auto leading-relaxed">
          Ensure your eligibility status is confirmed before casting your confidential ballot.
        </p>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.15 }}>
          <button
            id="cta-check-eligibility-btn"
            onClick={onCheckEligibility}
            className="w-full sm:w-auto bg-[#2563eb] text-white font-semibold text-base px-8 py-3.5 rounded-none hover:bg-[#003f93] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Live Monitor</span>
          </button>

          <button
            id="cta-view-guidelines-btn"
            onClick={onViewGuidelines}
            className="w-full sm:w-auto bg-white text-[#131b2e] border border-[#c2c6d5] font-semibold text-base px-8 py-3.5 rounded-none hover:bg-[#f2f3ff] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <BookOpen className="w-4 h-4 text-[#0055c2]" />
            <span>View Election Details</span>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};
