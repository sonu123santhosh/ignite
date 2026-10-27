import React from 'react';
import { Compass, Users, Trophy, ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from './Card';
import { HOW_IT_WORKS_STEPS } from '../data/sampleData';

export default function HowItWorks() {
  const iconMap = {
    Compass: <Compass className="w-8 h-8 text-[#c6ff3d]" />,
    Users: <Users className="w-8 h-8 text-sky-400" />,
    Trophy: <Trophy className="w-8 h-8 text-amber-400" />
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="Simple & Streamlined"
        title="How SportLink Works"
        subtitle="One platform connecting every pillar of local sports: athletes, college teams, tournament organisers, and ground owners."
        centered={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12">
        {HOW_IT_WORKS_STEPS.map((item, idx) => (
          <div
            key={item.step}
            className="relative bg-[#172033] border border-[#2a3652] hover:border-[#c6ff3d]/60 rounded-[22px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 group"
          >
            <div>
              {/* Step number badge & icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#0a1020] border border-[#2a3652] flex items-center justify-center group-hover:scale-105 transition-transform">
                  {iconMap[item.icon]}
                </div>
                <span className="font-['Barlow_Condensed'] text-4xl font-black text-slate-700 group-hover:text-[#c6ff3d]/40 transition-colors">
                  {item.step}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black text-white uppercase tracking-wide group-hover:text-[#c6ff3d] transition-colors">
                {item.title}
              </h3>

              {/* Step Description */}
              <p className="text-sm text-[#a3afc6] mt-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom mini indicator */}
            <div className="mt-8 pt-4 border-t border-[#2a3652]/70 flex items-center text-xs font-semibold text-slate-400">
              <span className="text-[#c6ff3d]">Step {item.step} of 03</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
