import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pages = [
    { label: 'Home', path: '/home' },
    { label: 'Facilities', path: '/facilities' },
    { label: 'Tournaments', path: '/tournaments' },
    { label: 'College Friendly Matches', path: '/friendly-matches' },
    { label: 'Coaching Centres', path: '/coaching' },
    { label: 'Sports Trials', path: '/trials' },
    { label: 'Watch Intro', path: '/intro' }
  ];

  return (
    <footer className="bg-[#070b16] border-t border-[#2a3652] text-slate-400 text-xs sm:text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <Link to="/home" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c6ff3d] to-emerald-400 flex items-center justify-center text-[#0a1020] font-black shadow-[0_0_10px_rgba(198,255,61,0.25)]">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="font-['Barlow_Condensed'] text-2xl font-black tracking-wider uppercase text-white leading-none">
                Sport<span className="text-[#c6ff3d]">Link</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-slate-300">
              &quot;Your Game. Your Ground. Your Opportunity.&quot;
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              A sports platform connecting players, college teams, tournament organisers, coaching centres, and facility owners.
            </p>
          </div>

          {/* Quick Page Links */}
          <div className="md:col-span-7">
            <h4 className="font-['Barlow_Condensed'] text-base font-bold uppercase tracking-wider text-white mb-3">
              Platform Pages
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {pages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className="text-slate-400 hover:text-[#c6ff3d] transition-colors py-1"
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-[#2a3652]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            &copy; 2026 SportLink. Prototype with sample data.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#c6ff3d]" />
            <span>Multi-Page Prototype Shell</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
