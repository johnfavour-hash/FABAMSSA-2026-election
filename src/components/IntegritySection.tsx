import React from 'react';
import { ShieldCheck, UserCheck, Eye, Scale, Lock, Key } from 'lucide-react';
import electoosImage from '../public/electoos.jpg';

export const IntegritySection: React.FC = () => {
  const pillars = [
    {
      title: 'Secure Voting',
      desc: 'A controlled voting process keeps ballot choices confidential and supports accountable election administration.',
      icon: ShieldCheck,
    },
    {
      title: 'Accredited Voters',
      desc: 'Academic record and eligibility checks help ensure that only approved students participate.',
      icon: UserCheck,
    },
    {
      title: 'Transparent Results',
      desc: 'Real-time vote tallying visible to all stakeholders upon poll closure.',
      icon: Eye,
    },
    {
      title: 'ELECO Oversight',
      desc: 'Independent electoral commission auditing every step of the election lifecycle.',
      icon: Scale,
    },
  ];

  return (
    <section id="bamssa-integrity-section" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#faf8ff]">
      <div className="container mx-auto max-w-[1280px] grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column Image */}
        <div className="order-2 md:order-1 rounded-[12px] overflow-hidden border border-[#c2c6d5] shadow-xs h-full min-h-[380px] lg:min-h-[440px] relative group">
          <div
            className="w-full h-full min-h-[380px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('${electoosImage}')`
            }}
          ></div>

          {/* Secure verification badge overlay */}
          <div className="absolute top-4 right-4 bg-[#131b2e]/85 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 rounded-none text-xs font-semibold flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#8ab0fe]" />
            <span>Secure Voter Verification</span>
          </div>
        </div>

        {/* Right Column Content */}
        <div className="order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eaedff] text-[#003f93] rounded-[10px] border border-[#c2c6d5] text-xs font-bold uppercase tracking-wider mb-4">
            <Key className="w-3.5 h-3.5" />
            <span>Electoral Security Architecture</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#131b2e] mb-8 leading-tight tracking-tight">
            Your vote matters. Trust the process.
          </h3>

          <div className="space-y-6">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-none bg-[#eaedff] text-[#0055c2] flex items-center justify-center shrink-0 group-hover:bg-[#0055c2] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#131b2e] mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#424653] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
