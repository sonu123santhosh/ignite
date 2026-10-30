import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Swords,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  FileText,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Flag,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import { useFriendlies } from '../../context/FriendliesContext';
import SourceBadge from '../../components/friendlies/SourceBadge';
import MatchStatusBadge from '../../components/friendlies/MatchStatusBadge';
import Toast from '../../components/Toast';
import {
  formatDateDisplay,
  maskContact,
  haversineDistance
} from '../../data/friendliesData';

export default function MatchDetails() {
  const { id } = useParams();
  const {
    role,
    currentActor,
    matches,
    teams,
    registerForMatch,
    withdrawFromMatch,
    submitReport,
    publishAnnouncement
  } = useFriendlies();

  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'roster' | 'announcements' | 'report'

  // Report Form state
  const [reportCategory, setReportCategory] = useState('Incorrect Venue');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Message Organiser state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Announcement state (Coordinator/Organiser)
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // Map DOM reference
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  const match = matches.find((m) => m.id === id);
  const homeTeam = teams.find((t) => t.id === match?.homeTeamId);
  const awayTeam = teams.find((t) => t.id === match?.awayTeamId);

  useEffect(() => {
    if (match) {
      document.title = `${homeTeam?.name || 'Match'} vs ${awayTeam?.name || 'Open Challenge'} | SportLink Friendlies`;
    }
  }, [match, homeTeam, awayTeam]);

  // Leaflet map initialization
  useEffect(() => {
    if (!match?.venue?.lat || !match?.venue?.lng || !mapContainerRef.current) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [match.venue.lat, match.venue.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: true
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon
      const customPin = L.divIcon({
        className: 'custom-venue-pin',
        html: `<div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(14,165,233,0.9); display: flex; align-items: center; justify-content: center;"><span style="font-size: 14px; font-weight: bold; color: #ffffff;">📍</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      L.marker([match.venue.lat, match.venue.lng], { icon: customPin })
        .addTo(map)
        .bindPopup(`<strong>${match.venue.name}</strong><br/>${match.venue.address || ''}`)
        .openPopup();
    } catch (err) {
      console.warn('Leaflet map error:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [match]);

  if (!match) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto px-4">
        <h2 className="font-['Barlow_Condensed'] text-3xl font-bold uppercase text-white mb-2">
          Match Not Found
        </h2>
        <Link to="/friendlies" className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline">
          Return to Friendlies Listing
        </Link>
      </div>
    );
  }

  // Authorisation to view rosters: Captains of either team, Coordinator of those colleges, or Organiser
  const isAuthorisedForRoster =
    role === 'organiser' ||
    role === 'coordinator' ||
    (role === 'captain' && (currentActor?.teamId === match.homeTeamId || currentActor?.teamId === match.awayTeamId));

  // "Get directions" button URL
  const directionsUrl = match.venue?.lat && match.venue?.lng
    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${match.venue.lat}%2C${match.venue.lng}`
    : null;

  const isSeekingOpponent = !match.awayTeamId;

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;

    submitReport({
      matchId: match.id,
      category: reportCategory,
      message: reportMessage
    });

    setReportSubmitted(true);
    setToast({
      title: 'Report Submitted',
      message: 'Your report has been logged and sent to the college sports coordinator for verification.',
      type: 'info'
    });
  };

  const handleSendMessageToOrganiser = (e) => {
    e.preventDefault();
    setIsContactModalOpen(false);
    setContactMessage('');
    setToast({
      title: 'Message Sent to Host',
      message: 'Your inquiry has been relayed through SportLink in-app communications.',
      type: 'success'
    });
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;

    publishAnnouncement(match.id, announcementMsg);
    setAnnouncementMsg('');
    setToast({
      title: 'Announcement Published',
      message: 'Notice added to match schedule.',
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFFFFF] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Breadcrumb */}
      <div className="bg-[#151B23] border-b border-[#293442] py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/friendlies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Friendly Matches</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">
            Match #{match.id} &bull; Demo Data
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
        {/* Match Header Hero Card */}
        <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <MatchStatusBadge status={match.status} />
              <SourceBadge source={match.source} lastVerified={match.lastVerified} showDate={true} />
            </div>

            <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/60 text-slate-400 border border-white/10">
              Demo Listing
            </span>
          </div>

          {/* Teams Matchup Display */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center py-4 border-y border-white/10">
            {/* Home Team */}
            <div className="md:col-span-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-2xl text-slate-100 shrink-0 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_16px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                <span className="relative z-10 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {homeTeam?.logoInitials || 'HT'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                  Host College
                </span>
                <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black uppercase text-white truncate">
                  {homeTeam?.name || 'Home Team'}
                </h2>
                <span className="text-xs text-slate-400 block truncate">
                  {homeTeam?.collegeName}
                </span>
              </div>
            </div>

            {/* VS */}
            <div className="md:col-span-1 text-center font-['Barlow_Condensed'] font-black text-2xl text-amber-400">
              VS
            </div>

            {/* Away Team */}
            <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-4 text-left md:text-right">
              <div className="min-w-0 order-2 md:order-1">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
                  {isSeekingOpponent ? 'Challenge Quota' : 'Rival College'}
                </span>
                <h2 className="font-['Barlow_Condensed'] text-2xl sm:text-3xl font-black uppercase text-white truncate">
                  {isSeekingOpponent ? 'Seeking Opponent' : (awayTeam?.name || 'Away Team')}
                </h2>
                <span className="text-xs text-slate-400 block truncate">
                  {isSeekingOpponent ? 'Open friendly slot' : (awayTeam?.collegeName || 'Collegiate Squad')}
                </span>
              </div>
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-['Barlow_Condensed'] font-black text-2xl shrink-0 order-1 md:order-2 ${
                  isSeekingOpponent
                    ? 'border-2 border-dashed border-sky-400/50 text-sky-300 bg-sky-500/10'
                    : 'text-slate-100 bg-gradient-to-br from-[#182235] via-[#0f1726] to-[#080d18] border border-sky-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_16px_rgba(0,0,0,0.6)] relative overflow-hidden'
                }`}
              >
                {!isSeekingOpponent && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                )}
                <span className="relative z-10 tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {isSeekingOpponent ? '?' : (awayTeam?.logoInitials || 'AT')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                Date &amp; Kickoff
              </span>
              <div className="font-bold text-white text-sm mt-0.5">
                {formatDateDisplay(match.date)}
              </div>
              <span className="text-slate-400">{match.startTime} ({match.durationMinutes} min)</span>
            </div>

            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                Format
              </span>
              <div className="font-bold text-white text-sm mt-0.5">{match.format}</div>
              <span className="text-slate-400">Skill: {match.skillLevel}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                Fee / Turf Cost
              </span>
              <div className="font-bold text-emerald-400 text-sm mt-0.5">
                {match.fee === 0 ? 'FREE FRIENDLY' : `₹${match.fee}`}
              </div>
              <span className="text-slate-400">{match.feeUnit}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                Slots
              </span>
              <div className="font-bold text-white text-sm mt-0.5">
                {match.slots?.registered || 1} / {match.slots?.total || 2} Registered
              </div>
              <span className="text-slate-400">
                {isSeekingOpponent ? '1 open opponent spot' : 'Full fixture'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            {/* Get Directions button with link */}
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors backdrop-blur-sm"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Get Directions (OpenStreetMap)</span>
              </a>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl text-xs cursor-not-allowed"
                title="Coordinates not provided for this venue"
              >
                Directions Unavailable
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Contact Organiser</span>
            </button>
          </div>

          {/* Registration / Acceptance */}
          {isSeekingOpponent && role === 'captain' && (
            <button
              type="button"
              onClick={() => {
                if (currentActor?.teamId) {
                  registerForMatch(match.id, currentActor.teamId);
                  setToast({
                    title: 'Registration Confirmed',
                    message: 'Your squad has filled the opponent slot. Match confirmed!',
                    type: 'success'
                  });
                }
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-[0_4px_16px_rgba(14,165,233,0.35)] active:translate-y-0.5"
            >
              Accept Match Challenge
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Venue & Regulations' },
            { id: 'roster', label: `Squad Rosters ${isAuthorisedForRoster ? '' : '(Restricted)'}` },
            { id: 'announcements', label: `Announcements (${match.announcements?.length || 0})` },
            { id: 'report', label: 'Report Incorrect Info' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Overview & Leaflet Map */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Venue details & Leaflet map */}
            <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                  Match Venue &amp; Map
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {match.venue?.name} &bull; {match.venue?.address}
                </p>
              </div>

              {/* Leaflet map container */}
              <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-[#293442] bg-[#0B0F14]">
                {mapError ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[#9CA3AF] space-y-2">
                    <MapPin className="w-6 h-6 text-slate-500" />
                    <span>Map tiles could not be loaded. Venue address: {match.venue?.address}</span>
                  </div>
                ) : (
                  <div ref={mapContainerRef} className="h-full w-full z-10" />
                )}
              </div>
            </div>

            {/* Right: Rules & Cancellation Policy */}
            <div className="space-y-6">
              <div className="bg-[#151B23] border border-[#293442] p-6 rounded-2xl space-y-3 shadow-xl">
                <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                  Match Rules &amp; Equipment
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  {match.rules?.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#151B23] border border-[#293442] p-6 rounded-2xl space-y-2 shadow-xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400">
                  Reschedule &amp; Cancellation Policy
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {match.cancellationPolicy || 'Standard collegiate friendly notice required.'}
                </p>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-[#293442] italic">
                  Organiser Contact: {match.organiserName || homeTeam?.captainName} &bull; {maskContact(null, false)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Squad Rosters (Restricted to Authorised Roles) */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            {!isAuthorisedForRoster ? (
              <div className="p-8 bg-[#151B23] border border-[#293442] rounded-2xl text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
                <h4 className="font-bold text-sm text-white">Roster Privacy Protection</h4>
                <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                  Detailed player lineups and contacts are restricted to confirmed match captains, collegiate coordinators, and match organisers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Home Team Roster */}
                <div className="bg-[#151B23] border border-[#293442] p-6 rounded-2xl space-y-4 shadow-xl">
                  <h4 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                    {homeTeam?.name} Lineup
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {homeTeam?.roster?.map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-[#1B2530] rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-slate-400">{p.position} &bull; {p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Team Roster */}
                <div className="bg-[#151B23] border border-[#293442] p-6 rounded-2xl space-y-4 shadow-xl">
                  <h4 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">
                    {awayTeam ? `${awayTeam.name} Lineup` : 'Away Squad (Pending Opponent)'}
                  </h4>
                  {awayTeam ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {awayTeam.roster?.map((p, idx) => (
                        <div key={idx} className="p-2.5 bg-[#1B2530] rounded-xl flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{p.name}</span>
                          <span className="text-slate-400">{p.position} &bull; {p.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Lineup will appear once an opponent accepts this open match challenge.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Announcements */}
        {activeTab === 'announcements' && (
          <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 p-6 rounded-2xl space-y-6 shadow-xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Official Match Notices &amp; Bulletins
            </h3>

            {/* Post Announcement Form for Coordinators & Organisers */}
            {(role === 'coordinator' || role === 'organiser') && (
              <form onSubmit={handlePostAnnouncement} className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
                <label className="text-xs font-bold uppercase text-sky-400 block">
                  Post New Coordinator Announcement
                </label>
                <input
                  type="text"
                  required
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="e.g. Venue gate 3 access will be open from 03:30 PM..."
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-lg text-xs text-white outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-lg hover:from-sky-400 hover:to-blue-500 cursor-pointer shadow-md shadow-sky-500/20"
                >
                  Publish Notice
                </button>
              </form>
            )}

            <div className="space-y-3">
              {match.announcements?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No special announcements have been posted for this match.
                </div>
              ) : (
                match.announcements?.map((a) => (
                  <div key={a.id} className="p-4 bg-black/30 border border-white/10 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-sky-300">{a.author}</span>
                      <span>{a.date}</span>
                    </div>
                    <p className="text-white leading-relaxed">{a.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Report Incorrect Information */}
        {activeTab === 'report' && (
          <div className="bg-[#0c1629]/80 backdrop-blur-xl border border-sky-500/20 p-6 sm:p-8 rounded-2xl max-w-xl space-y-5 shadow-xl">
            <div>
              <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                Report Incorrect Match Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Spotted an inaccurate time, incorrect venue, or false college claim? Send an inquiry directly to the college coordinator.
              </p>
            </div>

            {reportSubmitted ? (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">Report Received</h4>
                <p className="text-xs text-slate-300">
                  Thank you for keeping collegiate sports accurate. The college sports coordinator has been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Report Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-white outline-none cursor-pointer focus:border-sky-400"
                  >
                    <option value="Incorrect Venue" className="bg-[#0b1326] text-white">Incorrect Venue or Address</option>
                    <option value="Time Discrepancy" className="bg-[#0b1326] text-white">Match Timing Mismatch</option>
                    <option value="Unverified Team Claim" className="bg-[#0b1326] text-white">Unauthorised College Representation</option>
                    <option value="Rules Infraction" className="bg-[#0b1326] text-white">Rules or Format Dispute</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Clarification Details *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    placeholder="Describe the discrepancy..."
                    className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-blue-500 cursor-pointer shadow-md shadow-sky-500/25"
                >
                  Submit Report
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Contact Organiser Modal */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#0c1629]/95 backdrop-blur-xl border border-sky-500/30 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Relay Inquiry to Host
            </h3>
            <p className="text-xs text-slate-400">
              All communication is relayed in-app to protect private student and captain contact numbers.
            </p>

            <form onSubmit={handleSendMessageToOrganiser} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Inquire regarding team jerseys, warm-up times, etc."
                  className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-blue-500 cursor-pointer shadow-md shadow-sky-500/25"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
