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
    <div className="min-h-screen bg-[#0B0F14] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Role Switcher */}
        <FriendliesHeader />
        <FriendliesRoleSwitcher />

        {/* Hero Section */}
        <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 sm:p-8 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00D9FF]">
            <Radio className="w-4 h-4 text-[#00D9FF] animate-pulse" />
            <span>Collegiate Sports Bulletins & Authority Portals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Official Zonal Circulars & Match Feeds
          </h1>
          <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
            Direct access to regional university sports committee announcements, eligibility guidelines, tournament calendars, and collegiate fixture notices.
          </p>
        </div>

        {/* Official Authority Portals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PCZSC Portal */}
          <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 flex flex-col justify-between hover:border-[#3b82f6]/50 transition-all shadow-lg group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  External Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#00D9FF] transition-colors">
                  Pune City Zonal Sports Committee (PCZSC)
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Official repository for Savitribai Phule Pune University (SPPU) city zone fixtures, tournament results, player eligibility proformas, and university trials.
                </p>
              </div>

              {/* Disclaimer Notice */}
              <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-300/90">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Content on external portals is managed by their respective governing bodies and is not verified by SportLink.
                </span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#293442]">
              <a
                href="https://www.pczsc.in/pczsc-data_files/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2530] text-white border border-[#293442] font-semibold text-xs hover:bg-[#222f3d] hover:text-[#00D9FF] transition-all"
              >
                <span>Open PCZSC Document Directory</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* PDZSC Portal */}
          <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 flex flex-col justify-between hover:border-[#B6FF3B]/50 transition-all shadow-lg group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
                  External Portal
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#B6FF3B] transition-colors">
                  Pune District Zonal Sports Committee (PDZSC)
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Official zonal sports committee governing colleges across Pune District rural & suburban zones, sports event calendars, and selection schedules.
                </p>
              </div>

              {/* Disclaimer Notice */}
              <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-amber-300/90">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> Content on external portals is managed by their respective governing bodies and is not verified by SportLink.
                </span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#293442]">
              <a
                href="https://www.pdzsc.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2530] text-white border border-[#293442] font-semibold text-xs hover:bg-[#222f3d] hover:text-[#B6FF3B] transition-all"
              >
                <span>Visit Official PDZSC Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Source Tiers Breakdown Guide */}
        <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#00D9FF]" />
            <span>SportLink 4-Tier Verification Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#0B0F14] rounded-xl border border-blue-500/30 space-y-1.5">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                1. Official Fixture
              </div>
              <p className="text-gray-400">
                Sanctioned directly by universities, zonal sports boards, or autonomous sports directors.
              </p>
            </div>

            <div className="p-4 bg-[#0B0F14] rounded-xl border border-[#B6FF3B]/30 space-y-1.5">
              <div className="font-bold text-[#B6FF3B] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                2. Verified Organiser
              </div>
              <p className="text-gray-400">
                Host college coordinators or vetted sports organisations with verified credentials.
              </p>
            </div>

            <div className="p-4 bg-[#0B0F14] rounded-xl border border-purple-500/30 space-y-1.5">
              <div className="font-bold text-purple-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                3. Community Proposal
              </div>
              <p className="text-gray-400">
                Created by verified team captains seeking open opponents for practice matches.
              </p>
            </div>

            <div className="p-4 bg-[#0B0F14] rounded-xl border border-gray-600/30 space-y-1.5">
              <div className="font-bold text-gray-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                4. Demo Prototype
              </div>
              <p className="text-gray-500">
                Synthetic preview data for testing and evaluating SportLink match negotiation flows.
              </p>
            </div>
          </div>
        </div>

        {/* Live Bulletins and Announcements Feed */}
        <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#B6FF3B]" />
                Recent Circulars & Announcements
              </h2>
              <p className="text-xs text-gray-400">Published official fixture circulars and ground status advisories</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterTier('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTier === 'all' ? 'bg-[#00D9FF] text-black font-bold' : 'bg-[#0B0F14] text-gray-400 hover:text-white border border-[#293442]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTier('official')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTier === 'official' ? 'bg-[#00D9FF] text-black font-bold' : 'bg-[#0B0F14] text-gray-400 hover:text-white border border-[#293442]'
                }`}
              >
                Official
              </button>
              <button
                onClick={() => setFilterTier('verified_organiser')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTier === 'verified_organiser' ? 'bg-[#00D9FF] text-black font-bold' : 'bg-[#0B0F14] text-gray-400 hover:text-white border border-[#293442]'
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
                className="bg-[#0B0F14] border border-[#293442] rounded-xl p-5 space-y-3 hover:border-[#38485c] transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SourceBadge sourceTier={ann.sourceTier} />
                    <span className="text-xs text-gray-400">
                      Issued by <strong className="text-gray-200">{ann.officialSource}</strong>
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ann.date}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{ann.title}</h3>
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">{ann.body}</p>
                </div>

                {ann.link && ann.link !== '#' && (
                  <div className="pt-2">
                    <a
                      href={ann.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#00D9FF] hover:underline font-semibold"
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
