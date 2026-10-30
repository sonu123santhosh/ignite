import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ExternalLink, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Info, 
  Radio, 
  Download,
  CheckCircle,
  HelpCircle,
  Search,
  Filter
} from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import FriendliesHeader from '../../components/friendlies/FriendliesHeader';
import FriendliesRoleSwitcher from '../../components/friendlies/FriendliesRoleSwitcher';
import SourceBadge from '../../components/friendlies/SourceBadge';

export default function OfficialUpdates() {
  const { announcements = [] } = useFriendlies();
  const [filterTier, setFilterTier] = useState('all');

  const list = announcements || [];
  const filteredAnnouncements = list.filter(a => {
    if (filterTier === 'all') return true;
    return a.sourceTier === filterTier;
  });

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Role Switcher */}
        <FriendliesHeader />
        <FriendliesRoleSwitcher />

        {/* Hero Section */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 sm:p-8 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Collegiate Sports Bulletins & Authority Portals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Official Zonal Circulars & Match Feeds
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Direct access to regional university sports committee announcements, eligibility guidelines, tournament calendars, and collegiate fixture notices.
          </p>
        </div>

        {/* Official Authority Portals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PCZSC Portal */}
          <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-400/50 hover:shadow-[0_12px_36px_rgba(14,165,233,0.15)] transition-all shadow-lg group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  External Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  Pune City Zonal Sports Committee (PCZSC)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Official repository for Savitribai Phule Pune University (SPPU) city zone fixtures, tournament results, player eligibility proformas, and university trials.
                </p>
              </div>

              {/* Disclaimer Notice */}
              <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-300/90">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Content on external portals is managed by their respective governing bodies and is not verified by SportLink.
                </span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-sky-500/20">
              <a
                href="https://www.pczsc.in/pczsc-data_files/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-white border border-sky-400/30 font-semibold text-xs hover:bg-sky-500/20 hover:text-sky-300 transition-all"
              >
                <span>Open PCZSC Document Directory</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* PDZSC Portal */}
          <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-400/50 hover:shadow-[0_12px_36px_rgba(16,185,129,0.15)] transition-all shadow-lg group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  External Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Pune District Zonal Sports Committee (PDZSC)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Official zonal sports committee governing colleges across Pune District rural & suburban zones, sports event calendars, and selection schedules.
                </p>
              </div>

              {/* Disclaimer Notice */}
              <div className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-300/90">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Content on external portals is managed by their respective governing bodies and is not verified by SportLink.
                </span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-sky-500/20">
              <a
                href="https://www.pdzsc.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/10 text-white border border-sky-400/30 font-semibold text-xs hover:bg-sky-500/20 hover:text-emerald-300 transition-all"
              >
                <span>Visit Official PDZSC Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Source Tiers Breakdown Guide */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>SportLink 4-Tier Verification Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#070d1a]/80 rounded-xl border border-sky-500/30 space-y-1.5">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                1. Official Fixture
              </div>
              <p className="text-slate-400">
                Sanctioned directly by universities, zonal sports boards, or autonomous sports directors.
              </p>
            </div>

            <div className="p-4 bg-[#070d1a]/80 rounded-xl border border-emerald-500/30 space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                2. Verified Organiser
              </div>
              <p className="text-slate-400">
                Host college coordinators or vetted sports organisations with verified credentials.
              </p>
            </div>

            <div className="p-4 bg-[#070d1a]/80 rounded-xl border border-indigo-500/30 space-y-1.5">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                3. Community Proposal
              </div>
              <p className="text-slate-400">
                Created by verified team captains seeking open opponents for practice matches.
              </p>
            </div>

            <div className="p-4 bg-[#070d1a]/80 rounded-xl border border-slate-700/30 space-y-1.5">
              <div className="font-bold text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                4. Demo Prototype
              </div>
              <p className="text-slate-500">
                Synthetic preview data for testing and evaluating SportLink match negotiation flows.
              </p>
            </div>
          </div>
        </div>

        {/* Live Bulletins and Announcements Feed */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                Recent Circulars & Announcements
              </h2>
              <p className="text-xs text-slate-400">Published official fixture circulars and ground status advisories</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTier('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTier === 'all' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md shadow-sky-600/30' : 'bg-[#070d1a]/80 text-slate-400 hover:text-white border border-sky-500/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTier('official')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTier === 'official' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md shadow-sky-600/30' : 'bg-[#070d1a]/80 text-slate-400 hover:text-white border border-sky-500/20'
                }`}
              >
                Official
              </button>
              <button
                onClick={() => setFilterTier('verified_organiser')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTier === 'verified_organiser' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md shadow-sky-600/30' : 'bg-[#070d1a]/80 text-slate-400 hover:text-white border border-sky-500/20'
                }`}
              >
                Organiser
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAnnouncements.map(ann => (
              <div 
                key={ann.id}
                className="bg-[#070d1a]/80 border border-sky-500/20 rounded-xl p-5 space-y-3 hover:border-sky-400/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SourceBadge sourceTier={ann.sourceTier} />
                    <span className="text-xs text-slate-400">
                      Issued by <strong className="text-slate-200">{ann.officialSource}</strong>
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ann.date}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{ann.title}</h3>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">{ann.body}</p>
                </div>

                {ann.link && ann.link !== '#' && (
                  <div className="pt-2">
                    <a
                      href={ann.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline font-semibold"
                    >
                      <span>View Official Source PDF / Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
