import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award } from 'lucide-react';
import uniportImage from '../public/uniport images.jpg';

export const AboutSection: React.FC = () => {
  return (
    <motion.section id="bamssa-about-section" className="border-t border-[#eaedff] bg-[#faf8ff] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7 }}>
      <div className="container mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 lg:gap-12">
          <motion.div className="space-y-5 md:col-span-7" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c2c6d5] bg-[#eaedff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#003f93]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0055c2]" />
              <span>ELECO Mandate &amp; Mission</span>
            </div>

            <h3 className="text-2xl font-bold leading-tight tracking-[-0.04em] text-[#131b2e] sm:text-3xl lg:text-[34px]">
              Building leadership. Strengthening representation.
            </h3>

            <div className="relative overflow-hidden rounded-2xl border border-[#c2c6d5]/80 bg-white p-5 shadow-[0_16px_35px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-[#0055c2]" />
              <p className="pl-3 text-[15px] leading-[1.8] text-[#1e293b] sm:text-[17px]">
                The FABAMSSA Electoral Committee (ELECO) is committed to conducting free, fair, and credible elections. We leverage technology to ensure every medical student's voice is heard and accurately recorded.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-[#d2d9f4] bg-[#f2f3ff] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#003f93]">
                <Award className="h-4 w-4 text-[#0055c2]" />
                <span>Our Constitutional Mandate</span>
              </div>
              <p className="text-[14px] leading-[1.75] text-[#334155] sm:text-[15px]">
                Our mandate is to uphold the integrity of the association by providing a secure platform where students can seamlessly participate in the democratic process, fostering a community of responsible future medical professionals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#c2c6d5]/70 bg-white p-3.5 text-center shadow-[0_10px_18px_rgba(15,23,42,0.03)]">
                <div className="text-sm font-bold text-[#003f93]">Free &amp; Fair</div>
                <div className="text-[11px] text-[#737785]">Transparent Process</div>
              </div>
              <div className="rounded-2xl border border-[#c2c6d5]/70 bg-white p-3.5 text-center shadow-[0_10px_18px_rgba(15,23,42,0.03)]">
                <div className="text-sm font-bold text-[#003f93]">1-Student-1-Vote</div>
                <div className="text-[11px] text-[#737785]">Strict Verification</div>
              </div>
              <div className="col-span-2 rounded-2xl border border-[#c2c6d5]/70 bg-white p-3.5 text-center shadow-[0_10px_18px_rgba(15,23,42,0.03)] sm:col-span-1">
                <div className="text-sm font-bold text-[#003f93]">100% Secret</div>
                <div className="text-[11px] text-[#737785]">Decoupled Identity</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="relative h-full min-h-[340px] overflow-hidden rounded-[20px] border border-[#c2c6d5] shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:col-span-5 lg:min-h-[440px]" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, delay: 0.12 }}>
            <div
              className="h-full min-h-[340px] w-full bg-cover bg-center transition-transform duration-700 hover:scale-[1.03] lg:min-h-[440px]"
              style={{
                backgroundImage: `url('${uniportImage.src}')`
              }}
            ></div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#131b2e]/95 via-[#131b2e]/60 to-transparent p-4 text-white sm:p-5">
              <p className="text-xs font-bold text-white/95">Basic Medical Science Students, Faculty of Basic Medical Sciences</p>
              <p className="mt-0.5 text-[11px] text-white/75">University of Port Harcourt, Abuja Campus</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
