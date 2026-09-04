import React from 'react';
import { BookOpen, ShieldCheck, Scale, FileText, HelpCircle, Phone, Mail, CheckCircle2, Users, AlertTriangle, GraduationCap, UserCheck } from 'lucide-react';

interface GuidelinesViewProps {
  onOpenVotingBooth: () => void;
  onOpenEligibility: () => void;
}

const elecoCommittee = [
  { name: 'Obazee Esosa Precious', role: 'ELECO ChairLady', phone: '07059212116', highlight: true },
  { name: 'Chidi-Jonah Chimdiadi Jeremy', role: 'ELECO Secretary', phone: '08089865585', highlight: true },
  { name: 'Obasi Christyjane Ugochi', role: 'Co-ordinator', phone: '08025175183', highlight: false },
  { name: 'Ndubuisi-okoile Blossom Jane', role: 'Member', phone: '', highlight: false },
  { name: 'Obogan Prince David', role: 'Member', phone: '', highlight: false },
  { name: 'Adaugo Edwina Nwokoleme', role: 'Member', phone: '', highlight: false },
  { name: 'Nwankwo Iheanyichukwu', role: 'Member', phone: '', highlight: false },
  { name: 'Victor Abik or Letong', role: 'Member', phone: '', highlight: false },
];

const guidelines = [
  {
    number: 1,
    text: 'Any student aspiring for elective positions in the Faculty of Basic Medical Sciences must:',
    subItems: [
      'Be a registered student in the University of Port Harcourt.',
      'Be a duly registered student of the Faculty of Basic Medical Sciences.',
      'NOT have any criminal record within or in diaspora.',
    ],
  },
  { number: 2, text: 'Aspirants vying for any positions must have good academic standing.' },
  {
    number: 3,
    text: 'Aspirants vying for the position of President and Speaker must have completed at least three (3) academic Sessions, while the office of the Vice President must have completed at least two (2) academic Sessions.',
  },
  {
    number: 4,
    text: 'Aspirants vying for the position of General Secretary must have completed at least two (2) academic Sessions.',
  },
  { number: 5, text: 'A person vying for any position must not owe the association or any other.' },
  {
    number: 6,
    text: 'Any person vying for positions of Treasurer or all Directorates must have completed at least two (2) academic Sessions. (Director of Sport, Welfare and Socials). Director of Information (DOI) must have completed one (1) academic Session.',
  },
  {
    number: 7,
    text: 'All persons vying for the office of the Assistant Secretary General, Provost, Director of Information must have completed one (1) academic Session.',
  },
  {
    number: 8,
    text: 'Any serving officer vying for any position should tender his/her resignation letter duly signed by their president to the ELECO Chairman before returning his/her form. There shall be no pre-election campaign until it\'s flagged off by the Electoral Committee.',
  },
  { number: 9, text: 'All aspirants must have a copy of the constitution.' },
  {
    number: 10,
    text: 'Only honourables that served in the parliament can contest for the position of Speaker and Deputy Speaker.',
  },
  {
    number: 11,
    text: 'Any aspirants vying for any position must partake in Electoral Committee screening, Electoral Committee community service, and security screening by the University of Port Harcourt security unit on the stipulated date and time.',
  },
  {
    number: 12,
    text: 'Any person vying for any elective position must NOT be in academic suspension or any disciplinary suspension.',
  },
];

export const GuidelinesView: React.FC<GuidelinesViewProps> = ({
  onOpenVotingBooth,
  onOpenEligibility,
}) => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#faf8ff] min-h-[85vh]">
      <div className="container mx-auto max-w-4xl space-y-10">

        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eaedff] text-[#003f93] rounded-md text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Electoral Guidelines &amp; Charter</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#0055c2] mb-1">
            Faculty of Basic Medical Science Students Association (FABAMSSA) • UNIPORT Chapter
          </p>
          <h2 className="text-3xl font-bold text-[#131b2e] tracking-tight">
            FABAMSSA UNIPORT Elections 2026/2027
          </h2>
          <p className="text-xs italic text-[#003f93] font-medium mt-1">
            MOTTO: Structural &amp; Functional Pathway to Modern Medicine
          </p>
          <p className="text-sm text-[#424653] mt-2">
            In line with <strong>Article 15, Section 15.4</strong> of the FABAMSSA Constitution — Rules and Regulations governing the conduct of all aspirants during any Faculty of Basic Medical Sciences Students Association Election.
          </p>
        </div>

        {/* Section 1: Aspirant Eligibility Guidelines */}
        <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-[#eaedff] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#eaedff] text-[#0055c2] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">
                Article 15 §15.4 — Electoral Guidelines for Aspirants
              </h3>
              <p className="text-xs text-[#737785]">
                These rules govern all positions in the FABAMSSA 2026 election cycle.
              </p>
            </div>
          </div>

          <div className="space-y-5 text-sm text-[#424653] leading-relaxed">
            {guidelines.map((g) => (
              <div key={g.number} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#0055c2] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {g.number}
                </span>
                <div className="space-y-1.5">
                  <p>{g.text}</p>
                  {g.subItems && (
                    <ul className="ml-2 space-y-1">
                      {g.subItems.map((sub, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#0055c2] font-bold shrink-0">
                            {String.fromCharCode(97 + i)}.
                          </span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Campaign NOTE */}
          <div className="mt-4 flex items-start gap-3 bg-[#fff8ed] border border-[#f4c26a] rounded-xl p-4">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0 mt-0.5" />
            <div className="text-xs text-[#78350f] leading-relaxed">
              <strong>NOTE:</strong> Defacing of faculty or department property is highly prohibited. Printing of banners must not exceed <strong>2ft × 2ft</strong> in size.
            </div>
          </div>
        </div>

        {/* Section 2: Code of Conduct */}
        <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-[#eaedff] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#eaedff] text-[#0055c2] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">
                Article IV: Code of Conduct &amp; Ballot Secrecy
              </h3>
              <p className="text-xs text-[#737785]">
                General Principles Governing the 2026 E-Voting Exercise
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#424653] leading-relaxed">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#eaedff] text-[#0055c2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <p><strong>One-Student-One-Ballot Principle:</strong> Every accredited student within the Anatomy and Psychology departments is entitled to exactly one non-transferable electronic vote.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#eaedff] text-[#0055c2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <p><strong>Ballot Secrecy &amp; Anonymity:</strong> Voting choices are strictly and permanently decoupled from voter identities at the moment of submission. No commissioner, faculty dean, or system operator can view how an individual voted.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#eaedff] text-[#0055c2] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <p><strong>Campaign Moratorium on Election Day:</strong> All active digital and physical campaigns must cease precisely 12 hours prior to the opening of polls at 08:00 AM WAT.</p>
            </div>
          </div>
        </div>

        {/* Section 3: ELECO Committee Members */}
        <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-[#eaedff] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#eaedff] text-[#0055c2] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">ELECO Committee Members</h3>
              <p className="text-xs text-[#737785]">
                FABAMSSA Electoral Committee, University of Port Harcourt Chapter
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {elecoCommittee.map((member) => (
              <div
                key={member.name}
                className={`rounded-xl border p-4 flex flex-col gap-1 ${
                  member.highlight
                    ? 'bg-[#eaedff] border-[#0055c2]/30'
                    : 'bg-[#faf8ff] border-[#c2c6d5]/70'
                }`}
              >
                <p className={`text-sm font-bold ${member.highlight ? 'text-[#003f93]' : 'text-[#131b2e]'}`}>
                  {member.name}
                </p>
                <p className="text-xs text-[#737785] font-medium">{member.role}</p>
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1.5 text-xs text-[#0055c2] font-semibold mt-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    {member.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: FAQ */}
        <div className="bg-white border border-[#c2c6d5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-[#eaedff] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#eaedff] text-[#0055c2] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e]">Frequently Asked Questions (FAQ)</h3>
              <p className="text-xs text-[#737785]">Guidance on voting, lost PINs, and election results</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#faf8ff] border border-[#c2c6d5]/70 rounded-xl">
              <h4 className="text-sm font-bold text-[#131b2e] mb-1">How do I get my 4-digit voting PIN?</h4>
              <p className="text-xs text-[#424653] leading-relaxed">
                Click on "Check Eligibility" or "Register" on the navigation bar. Enter your UNIPORT matriculation number (e.g. U2022/5570012). If verified, your 4-digit PIN is displayed securely.
              </p>
            </div>
            <div className="p-4 bg-[#faf8ff] border border-[#c2c6d5]/70 rounded-xl">
              <h4 className="text-sm font-bold text-[#131b2e] mb-1">Can I vote from my mobile phone or laptop?</h4>
              <p className="text-xs text-[#424653] leading-relaxed">
                Yes. The FABAMSSA 2026 electoral system is fully responsive and compatible with mobile smartphones, tablets, and computers across any modern browser.
              </p>
            </div>
            <div className="p-4 bg-[#faf8ff] border border-[#c2c6d5]/70 rounded-xl">
              <h4 className="text-sm font-bold text-[#131b2e] mb-1">When will final results be declared?</h4>
              <p className="text-xs text-[#424653] leading-relaxed">
                Live vote counts are visible in real time on the Live Monitor. Official certification is published upon poll closure after formal audit reconciliation by the ELECO Chairman.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: ELECO Support & Technical Contact */}
        <div className="bg-[#f2f3ff] border border-[#c2c6d5] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-[#003f93]">Need Immediate Electoral Assistance?</h4>
            <p className="text-xs text-[#424653] mt-1">
              Contact the ELECO directly via the numbers listed above, or reach the ELECO ICT Help Desk at the BMS Faculty Building.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#131b2e] font-medium">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0055c2]" />
                07059212116 (ChairLady)
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0055c2]" />
                08089865585 (Secretary)
              </span>
            </div>
          </div>
          <button
            onClick={onOpenEligibility}
            className="bg-[#0055c2] hover:bg-[#003f93] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Check My Eligibility Now
          </button>
        </div>

      </div>
    </div>
  );
};

