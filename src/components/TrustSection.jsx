import React from 'react';
import { BadgeCheck, ShieldCheck, FileText, Activity, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from './Card';
import { TRUST_PILLARS } from '../data/sampleData';

export default function TrustSection() {
  const iconMap = {
    BadgeCheck: <BadgeCheck className="w-6 h-6 text-[#c6ff3d]" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    FileText: <FileText className="w-6 h-6 text-sky-400" />,
    Activity: <Activity className="w-6 h-6 text-amber-400" />,
    MapPin: <MapPin className="w-6 h-6 text-purple-400" />,
    CheckCircle2: <CheckCircle2 className="w-6 h-6 text-[#c6ff3d]" />
  };

  return (
    <section id="trust" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="Integrity & Standards"
        title="Built for Every Kind of Athlete."
        subtitle="We value honesty over vanity metrics. From clear eligibility rules to transparent pricing, here is how we build trust."
        centered={true}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {TRUST_PILLARS.map((pillar, idx) => (
          <Card
            key={idx}
            className="flex flex-col justify-between p-6 sm:p-7 bg-[#172033] hover:border-[#c6ff3d]/60"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0a1020] border border-[#2a3652] flex items-center justify-center mb-4">
                {iconMap[pillar.icon]}
              </div>

              <h3 className="font-['Barlow_Condensed'] text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                {pillar.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#a3afc6] mt-2.5 leading-relaxed">
                {pillar.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#2a3652]/70 flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c6ff3d]" />
              <span>Standardised Protocol</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Honest Verification Disclaimer Banner */}
      <div className="mt-10 bg-[#131a2b] border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white">Honest Verification Guarantee:</strong> We never make blanket claims that all grounds, tournaments or academies are verified. Verification badges are assigned individually only after document review.
          </p>
        </div>
        <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20 shrink-0 self-start sm:self-auto">
          Per-Listing Only
        </span>
      </div>
    </section>
  );
}
