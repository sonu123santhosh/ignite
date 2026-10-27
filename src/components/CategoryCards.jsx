import React from 'react';
import { ArrowUpRight, Flame, Target, Activity, Waves, GraduationCap, Compass } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from './Card';
import { CATEGORIES_DATA } from '../data/sampleData';

export default function CategoryCards({ onSelectCategory }) {
  const iconMap = {
    turf: <Flame className="w-6 h-6 text-emerald-400" />,
    cricket: <Target className="w-6 h-6 text-amber-400" />,
    courts: <Activity className="w-6 h-6 text-sky-400" />,
    swimming: <Waves className="w-6 h-6 text-cyan-400" />,
    coaching: <GraduationCap className="w-6 h-6 text-purple-400" />,
    trials: <Compass className="w-6 h-6 text-rose-400" />
  };

  const handleCardClick = (cat) => {
    onSelectCategory(cat);
  };

  const handleKeyDown = (e, cat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(cat);
    }
  };

  return (
    <section id="explore-sports" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="Explore Ecosystem"
        title="Find Your Way to Play"
        subtitle="Whether you're booking an evening turf slot, training for competitive trials, or finding varsity rivals."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {CATEGORIES_DATA.map((cat) => (
          <div
            key={cat.id}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(cat)}
            onKeyDown={(e) => handleKeyDown(e, cat)}
            aria-label={`${cat.title}: ${cat.description}`}
            className="group relative bg-[#172033] border border-[#2a3652] hover:border-[#c6ff3d] rounded-[20px] p-6 sm:p-7 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(198,255,61,0.12)] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6ff3d]"
          >
            {/* Top Row: Icon & Arrow */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${cat.accentColor} border border-white/10 flex items-center justify-center p-3 transition-transform group-hover:scale-110`}
                >
                  {iconMap[cat.id] || <Activity className="w-6 h-6 text-[#c6ff3d]" />}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                    {cat.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#0a1020] border border-[#2a3652] group-hover:border-[#c6ff3d] group-hover:bg-[#c6ff3d] group-hover:text-[#0a1020] flex items-center justify-center text-slate-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-wide group-hover:text-[#c6ff3d] transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#a3afc6] mt-2 leading-relaxed">
                {cat.description}
              </p>
            </div>

            {/* Bottom hint */}
            <div className="mt-5 pt-4 border-t border-[#2a3652]/70 flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">
                {cat.actionType === 'search' ? `Filters to ${cat.sport}` : 'Explore section'}
              </span>
              <span className="text-[#c6ff3d] font-bold group-hover:underline">
                {cat.actionType === 'search' ? 'Quick Search &rarr;' : 'View Details &rarr;'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
