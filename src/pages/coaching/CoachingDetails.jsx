import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Clock, 
  Users, 
  Award, 
  Calendar, 
  Heart, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Info, 
  Sparkles,
  MessageSquare,
  Building,
  Check,
  Plus
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';
import CoachingRoleSwitcher from '../../components/coaching/CoachingRoleSwitcher';
import BookTrialModal from '../../components/coaching/BookTrialModal';
import EnrolmentModal from '../../components/coaching/EnrolmentModal';
import CoachingMapView from '../../components/coaching/CoachingMapView';

export default function CoachingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    academies, 
    coaches, 
    programmes, 
    batches, 
    reviews, 
    favourites, 
    toggleFavourite, 
    submitReview,
    activeUser
  } = useCoaching();

  // Find target academy
  const academy = academies?.find((a) => a.id === id) || academies?.[0];

  // Active tab state: 'overview' | 'coaches' | 'programmes' | 'schedule' | 'reviews'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [selectedTrialProg, setSelectedTrialProg] = useState(null);
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [selectedEnrolProg, setSelectedEnrolProg] = useState(null);

  // Schedule filtering by day
  const [scheduleDay, setScheduleDay] = useState('All');

  // Review submission state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  if (!academy) {
    return (
      <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#141B24] border border-[#293442] p-8 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-white">Academy Not Found</h2>
          <p className="text-xs text-[#94A3B8]">The requested coaching centre could not be located.</p>
          <Link to="/coaching" className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs font-bold uppercase tracking-wider hover:shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const academyCoaches = (coaches || []).filter((c) => c.academyId === academy.id);
  const academyProgrammes = (programmes || []).filter((p) => p.academyId === academy.id);
  const academyBatches = (batches || []).filter((b) => b.academyId === academy.id);
  const academyReviews = (reviews || []).filter((r) => r.academyId === academy.id);
  const isFav = (favourites || []).includes(academy.id);

  const filteredSchedule = academyBatches.filter((b) => {
    if (scheduleDay === 'All') return true;
    return b.days.includes(scheduleDay);
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    submitReview({
      academyId: academy.id,
      rating: Number(reviewRating),
      title: reviewTitle,
      comment: reviewComment,
      studentName: activeUser?.name || 'Athlete'
    });

    setReviewTitle('');
    setReviewComment('');
    setIsReviewFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Role Switcher */}
        <CoachingRoleSwitcher />

        {/* Back Link */}
        <div>
          <Link
            to="/coaching"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Coaching Centres Directory</span>
          </Link>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-[#0c0d15]/85 border border-red-500/25 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Cover Image Gallery */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black/50">
            <img 
              src={academy.coverImage} 
              alt={academy.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d15] via-[#0c0d15]/40 to-transparent" />

            {/* Overlays: Back, Favourites, Badges */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {academy.sports.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-200 backdrop-blur-md border border-red-500/40">
                    {s}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => toggleFavourite(academy.id)}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-red-400 transition-colors cursor-pointer"
                title={isFav ? 'Remove from Favourites' : 'Save to Favourites'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* Title & Badges Overlay */}
            <div className="absolute bottom-6 inset-x-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1c121e] via-[#120a14] to-[#080509] border border-red-500/40 text-red-200 font-extrabold text-sm flex items-center justify-center shadow-md">
                    {academy.logoInitials}
                  </span>
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                      {academy.name}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{academy.address}, {academy.locality}, {academy.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action CTAs */}
              <div className="flex items-center gap-3">
                {academy.trialClassAvailable && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTrialProg(academyProgrammes[0]);
                      setIsTrialModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-xs hover:shadow-[0_4px_20px_rgba(220,38,38,0.5)] border border-red-500/40 transition-all shadow-lg cursor-pointer"
                  >
                    {academy.trialFee === 0 ? 'Book Free Trial' : `Book Trial (₹${academy.trialFee})`}
                  </button>
                )}

                {academyProgrammes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEnrolProg(academyProgrammes[0]);
                      setIsEnrolModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900/70 text-red-100 border border-red-500/40 font-extrabold text-xs hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)] transition-all shadow-lg cursor-pointer"
                  >
                    Enrol in Programme
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="bg-[#0c0d15]/95 border-t border-red-500/20 px-6 flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'coaches', label: `Coaches (${academyCoaches.length})` },
              { id: 'programmes', label: `Programmes (${academyProgrammes.length})` },
              { id: 'schedule', label: `Schedule & Batches (${academyBatches.length})` },
              { id: 'reviews', label: `Reviews (${academyReviews.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: About, Training Approach, Facilities */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* About Centre Card */}
              <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-red-400" />
                  <span>About the Academy</span>
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {academy.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-red-500/20 text-xs">
                  <div>
                    <span className="text-gray-500 uppercase text-[10px] font-bold block">Facility Type</span>
                    <span className="font-semibold text-white mt-0.5">{academy.facilityType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[10px] font-bold block">Age Groups</span>
                    <span className="font-semibold text-rose-300 mt-0.5">{academy.ageGroups.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[10px] font-bold block">Monthly Fee</span>
                    <span className="font-semibold text-red-400 mt-0.5">₹{academy.monthlyFeeMin.toLocaleString('en-IN')}+</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase text-[10px] font-bold block">Trial Class</span>
                    <span className="font-semibold text-white mt-0.5">{academy.trialFee === 0 ? 'Free' : `₹${academy.trialFee}`}</span>
                  </div>
                </div>
              </div>

              {/* Amenities & Infrastructure */}
              <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-400" />
                  <span>Infrastructure & Amenities</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {academy.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-[#08050c] border border-red-500/20 rounded-xl text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 space-y-2 text-xs">
                <h4 className="font-bold text-white text-sm">Cancellation & Refund Policy</h4>
                <p className="text-gray-400 leading-relaxed">
                  {academy.cancellationPolicy}
                </p>
              </div>
            </div>

            {/* Right 4 Cols: Operating Hours & Contact Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider text-red-400">
                  Opening Hours & Contact
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{academy.openingHours}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{academy.contact.phone}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{academy.contact.email}</span>
                  </div>

                  {academy.contact.website && (
                    <div className="flex items-center gap-2.5 text-red-400">
                      <Globe className="w-4 h-4 shrink-0" />
                      <a href={academy.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {academy.contact.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Academy Rating</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {academy.rating} / 5.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Verified Reviews</span>
                    <span className="font-bold text-red-400">{academy.reviewCount} Reviews</span>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Location Map</span>
                  <span className="text-[10px] text-gray-400 font-mono">{academy.locality}</span>
                </div>
                <div className="h-48 rounded-xl overflow-hidden border border-red-500/20">
                  <CoachingMapView
                    academies={[academy]}
                    userCoords={{ lat: academy.lat, lng: academy.lng }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COACHES                                                            */}
        {/* ========================================================================= */}
        {activeTab === 'coaches' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Certified Coaching Roster</h3>
              <p className="text-xs text-gray-400">
                Official coaches certified by national and international sporting federations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {academyCoaches.map((coach) => (
                <div key={coach.id} className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/40 transition-all shadow-lg space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={coach.photo} 
                        alt={coach.name} 
                        className="w-16 h-16 rounded-2xl object-cover border border-red-500/25 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{coach.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                            {coach.sport}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {coach.experienceYears} Years Experience • Former {coach.playingBackground}
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{coach.rating} ({coach.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {coach.bio}
                    </p>

                    {/* Qualifications with verified badge distinction */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Federation Credentials
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {coach.qualifications.map((q, idx) => (
                          <span 
                            key={idx}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              coach.qualificationsVerified
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[#140e18] text-gray-400 border border-red-500/20'
                            }`}
                          >
                            {coach.qualificationsVerified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                            <span>{q}</span>
                            {!coach.qualificationsVerified && <span className="text-[10px] text-gray-500 font-mono">(Unverified claim)</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      <strong>Languages:</strong> {coach.languages.join(', ')}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-red-500/20 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">
                      {coach.programmesCount} Active Programmes
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetProg = academyProgrammes.find(p => p.coachId === coach.id) || academyProgrammes[0];
                        setSelectedTrialProg(targetProg);
                        setIsTrialModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs hover:shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                    >
                      Book Trial Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROGRAMMES                                                         */}
        {/* ========================================================================= */}
        {activeTab === 'programmes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Training Programmes</h3>
              <p className="text-xs text-gray-400">
                Choose a structured curriculum tailored to your age and competitive goals
              </p>
            </div>

            <div className="space-y-4">
              {academyProgrammes.map((prog) => {
                const progBatches = academyBatches.filter(b => b.programmeId === prog.id);
                const totalCap = progBatches.reduce((acc, b) => acc + b.capacity, 0);
                const totalEnr = progBatches.reduce((acc, b) => acc + b.enrolledCount, 0);
                const seatsLeft = Math.max(0, totalCap - totalEnr);

                return (
                  <div 
                    key={prog.id}
                    className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/50 transition-all shadow-xl"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                          {prog.sport}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          {prog.skillLevel}
                        </span>
                        <span className="text-[10px] text-gray-400 bg-[#08050c] px-2 py-0.5 rounded border border-red-500/20">
                          Age: {prog.ageEligibility}
                        </span>
                        {seatsLeft === 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                            Batch Full (Waitlist Open)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-mono">
                            {seatsLeft} Seats Available
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-white">{prog.name}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">{prog.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span>Coach: <strong className="text-white">{prog.coachName}</strong></span>
                        <span>•</span>
                        <span>{prog.sessionsPerWeek} Sessions/wk ({prog.sessionLengthMinutes} min)</span>
                        <span>•</span>
                        <span>Venue: {prog.venue}</span>
                      </div>
                    </div>

                    {/* Fees & Action Buttons */}
                    <div className="flex flex-col md:items-end justify-between shrink-0 gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-red-500/20">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-gray-400 block">Monthly Subscription</span>
                        <span className="text-xl font-extrabold text-white">
                          ₹{prog.monthlyFee.toLocaleString('en-IN')}
                          <span className="text-xs text-gray-400 font-normal"> / mo</span>
                        </span>
                        {prog.perSessionFee && (
                          <span className="text-[11px] text-gray-500 block">
                            ₹{prog.perSessionFee} / session
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {prog.trialAvailable && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTrialProg(prog);
                              setIsTrialModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#140e18] text-red-200 border border-red-500/30 hover:bg-red-950/40 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            {prog.trialFee === 0 ? 'Free Trial' : `Trial (₹${prog.trialFee})`}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnrolProg(prog);
                            setIsEnrolModalOpen(true);
                          }}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-xs hover:shadow-[0_4px_18px_rgba(220,38,38,0.5)] border border-red-500/40 shadow-md transition-all cursor-pointer"
                        >
                          Enrol Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SCHEDULE & BATCH TIMETABLE                                         */}
        {/* ========================================================================= */}
        {activeTab === 'schedule' && (
          <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Weekly Batch Timetable</h3>
                <p className="text-xs text-gray-400">Filter batches by day to find slots that fit your academic or work calendar</p>
              </div>

              {/* Day filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setScheduleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scheduleDay === day
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                        : 'bg-[#08050c] text-gray-400 border border-red-500/20 hover:text-white hover:border-red-500/40'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#08050c] text-gray-400 uppercase font-mono text-[11px] border-b border-red-500/20">
                  <tr>
                    <th className="p-3.5">Day(s)</th>
                    <th className="p-3.5">Timing</th>
                    <th className="p-3.5">Batch Name</th>
                    <th className="p-3.5">Coach</th>
                    <th className="p-3.5">Venue</th>
                    <th className="p-3.5">Available Seats</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-500/10">
                  {filteredSchedule.map((b) => {
                    const free = Math.max(0, b.capacity - b.enrolledCount);
                    const isFull = free === 0;

                    return (
                      <tr key={b.id} className="hover:bg-red-950/20 transition-colors">
                        <td className="p-3.5 font-bold text-white">{b.days.join(', ')}</td>
                        <td className="p-3.5 font-mono text-red-400">{b.startTime} - {b.endTime}</td>
                        <td className="p-3.5 font-semibold text-white">{b.name}</td>
                        <td className="p-3.5">{b.coachName}</td>
                        <td className="p-3.5 text-gray-400">{b.venue}</td>
                        <td className="p-3.5 font-mono">
                          {isFull ? (
                            <span className="text-red-400 font-bold">Waitlist Only</span>
                          ) : (
                            <span className="text-red-400 font-bold">{free} / {b.capacity} Seats Left</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const matchingProg = programmes.find(p => p.id === b.programmeId) || academyProgrammes[0];
                              setSelectedEnrolProg(matchingProg);
                              setIsEnrolModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs hover:shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                          >
                            Enrol in Batch
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: REVIEWS                                                            */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="bg-[#0c0d15]/85 border border-red-500/20 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-500/20">
              <div>
                <h3 className="text-lg font-bold text-white">Student & Parent Reviews</h3>
                <p className="text-xs text-gray-400">Authentic feedback from verified athletes and guardians</p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                className="px-4 py-2 rounded-xl bg-[#140e18] text-red-200 border border-red-500/30 hover:bg-red-950/40 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                {isReviewFormOpen ? 'Close Form' : '+ Write a Review'}
              </button>
            </div>

            {/* Ratings Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#08050c] border border-red-500/20 rounded-xl text-center text-xs">
              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold">Coaching Quality</span>
                <div className="text-base font-extrabold text-red-400 mt-0.5">
                  {academy.ratingsBreakdown?.coachingQuality || 4.9}
                </div>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold">Facilities & Courts</span>
                <div className="text-base font-extrabold text-rose-400 mt-0.5">
                  {academy.ratingsBreakdown?.facilities || 4.8}
                </div>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold">Communication</span>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {academy.ratingsBreakdown?.communication || 4.7}
                </div>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] font-bold">Value for Money</span>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">
                  {academy.ratingsBreakdown?.valueForMoney || 4.8}
                </div>
              </div>
            </div>

            {/* Review Submission Form */}
            {isReviewFormOpen && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-[#140e18] border border-red-500/30 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-white text-sm">Write Review as {activeUser.name}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                      className="w-full bg-[#08050c] border border-red-500/25 rounded-lg p-2 text-white outline-none focus:border-red-500"
                    >
                      <option value="5">5 / 5 - Exceptional</option>
                      <option value="4">4 / 5 - Very Good</option>
                      <option value="3">3 / 5 - Average</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Great coaching & well maintained turf"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full bg-[#08050c] border border-red-500/25 rounded-lg p-2 text-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Detailed Feedback</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share details about coach attention, fitness drills, and match practice..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-[#08050c] border border-red-500/25 rounded-lg p-2 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#08050c] text-gray-300 border border-red-500/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold hover:shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {academyReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{rev.title}</span>
                        {rev.verifiedStudent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Verified Student
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        By {rev.author} • {rev.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {isTrialModalOpen && (
          <BookTrialModal
            academy={academy}
            initialProgrammeId={selectedTrialProg?.id}
            onClose={() => setIsTrialModalOpen(false)}
          />
        )}

        {isEnrolModalOpen && (
          <EnrolmentModal
            academy={academy}
            initialProgramme={selectedEnrolProg}
            onClose={() => setIsEnrolModalOpen(false)}
          />
        )}

      </div>
    </div>
  );
}
