import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Heart,
  Users,
  Award,
  FileText,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  Bell,
  Share2,
  Navigation,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialsRoleSwitcher from '../../components/trials/TrialsRoleSwitcher';
import ReportListingModal from '../../components/trials/ReportListingModal';
import TrialsMapView from '../../components/trials/TrialsMapView';

export default function TrialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    trials,
    savedTrials,
    toggleSaveTrial,
    reminders,
    toggleTrialReminder,
    activeUser
  } = useTrials();

  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'eligibility' | 'schedule' | 'documents' | 'venue' | 'organiser'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Find target trial
  const trial = trials.find((t) => t.id === id) || trials[0];

  if (!trial) {
    return (
      <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-28 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#141B24] border border-[#293442] p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-white">Sports Trial Not Found</h2>
          <p className="text-xs text-[#94A3B8]">The requested trial listing could not be located.</p>
          <Link
            to="/trials"
            className="inline-block px-4 py-2 rounded-xl bg-[#B6FF3B] text-[#0B0F14] text-xs font-bold uppercase tracking-wider"
          >
            Back to All Trials
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = (savedTrials || []).includes(trial.id);
  const hasReminder = (reminders || []).includes(trial.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Role Switcher Demo Bar */}
        <TrialsRoleSwitcher />

        {/* Back Link & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/trials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#B6FF3B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sports Trials Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#141B24] border border-[#293442] text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleTrialReminder(trial.id)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasReminder
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-[#141B24] text-slate-300 border-[#293442] hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasReminder ? 'Reminder Set' : 'Remind Me'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSaveTrial(trial.id)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                  : 'bg-[#141B24] text-slate-300 border-[#293442] hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={trial.coverImage}
              alt={trial.title}
              className="w-full h-full object-cover filter brightness-[0.45]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141B24] via-transparent to-black/60" />

            {/* Badges Overlay */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-[#0B0F14]/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-slate-700">
                {trial.sport} • {trial.discipline}
              </span>

              <div className="flex items-center gap-2">
                {trial.verifiedOrganiser && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 text-xs font-bold backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Organiser
                  </span>
                )}
                {trial.isFree ? (
                  <span className="px-3 py-1 rounded-xl bg-[#B6FF3B]/20 text-[#B6FF3B] border border-[#B6FF3B]/40 text-xs font-black uppercase backdrop-blur-md font-mono">
                    Free Entry
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 text-xs font-black uppercase backdrop-blur-md font-mono">
                    ₹{trial.entryFee} Entry Fee
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Title Bar */}
            <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
              <div className="text-xs font-semibold text-[#00D4FF] uppercase tracking-wider">
                {trial.organisationName} • {trial.organisationType}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-['Barlow_Condensed',sans-serif]">
                {trial.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B6FF3B] shrink-0" />
                <span>{trial.venue}, {trial.city}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#293442] bg-[#0B0F14] border-t border-[#293442] text-xs">
            <div className="p-4 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Trial Date</span>
              <span className="font-bold text-white text-sm block">{trial.trialDate}</span>
              <span className="text-[11px] text-[#B6FF3B] block">Reporting: {trial.reportingTime}</span>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Apply Deadline</span>
              <span className="font-bold text-amber-400 text-sm block">{trial.applicationDeadline}</span>
              <span className="text-[11px] text-slate-400 block">{trial.status}</span>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Eligibility</span>
              <span className="font-bold text-white text-sm block">{trial.minAge} – {trial.maxAge} Years</span>
              <span className="text-[11px] text-slate-400 block">{trial.genderEligibility} Candidates</span>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Category & Level</span>
              <span className="font-bold text-white text-sm block truncate">{trial.competitionCategory}</span>
              <span className="text-[11px] text-slate-400 block">{trial.skillLevel}</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#293442]">
          {[
            { id: 'overview', label: 'A. Overview' },
            { id: 'eligibility', label: 'B. Eligibility' },
            { id: 'schedule', label: 'C. Trial Schedule' },
            { id: 'documents', label: 'D. Required Documents' },
            { id: 'venue', label: 'E. Venue & Map' },
            { id: 'organiser', label: 'F. Organiser Info' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-md shadow-[#B6FF3B]/10'
                  : 'bg-[#141B24] text-[#94A3B8] border border-[#293442] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* A. OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-3">
                    About This Sports Trial
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {trial.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#293442] text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500">Trial Format & Duration:</span>
                    <p className="font-semibold text-white">{trial.duration}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Official Selection Quota:</span>
                    <p className="font-semibold text-white">{trial.trialType}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Entry & Administration Charges:</span>
                    <p className="font-semibold text-white">{trial.additionalCharges}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Max Candidate Capacity:</span>
                    <p className="font-semibold text-white">{trial.maxCapacity} Applicants</p>
                  </div>
                </div>

                <div className="bg-[#1B2530] p-4 rounded-2xl border border-[#293442] space-y-2 text-xs">
                  <span className="font-bold text-white block uppercase text-[11px] text-[#B6FF3B]">
                    Important Instructions
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Candidates must arrive strictly before the reporting time ({trial.reportingTime}). Late arrivals cannot be accommodated in scheduled matches. Proper athletic attire is required.
                  </p>
                </div>
              </div>
            )}

            {/* B. ELIGIBILITY */}
            {activeSection === 'eligibility' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Eligibility & Selection Criteria
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Verify that you meet all age, competition, and fitness prerequisites before applying.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#00D4FF]">
                    Prerequisites Checklist
                  </h4>
                  <ul className="space-y-2.5">
                    {trial.eligibilityCriteria.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#B6FF3B] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#293442] space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#B6FF3B]">
                    Required Playing Equipment
                  </h4>
                  <ul className="space-y-2.5">
                    {trial.requiredEquipment.map((eq, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF3B] shrink-0 mt-1.5" />
                        <span>{eq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* C. SCHEDULE */}
            {activeSection === 'schedule' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Day of Trial Schedule & Timeline
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Detailed breakdown of verification, warmup, technical testing, and match play.
                  </p>
                </div>

                <div className="space-y-4">
                  {trial.scheduleTimeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-[#0B0F14] border border-[#293442]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#1B2530] text-[#00D4FF] border border-[#293442] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#B6FF3B]">
                            {item.time}
                          </span>
                          <span className="text-xs font-bold text-white">• {item.stage}</span>
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#1B2530] border border-[#293442] text-xs space-y-1">
                  <span className="text-slate-400">Results Announcement Expected:</span>
                  <p className="font-bold text-white">{trial.resultsAnnouncementDate}</p>
                </div>
              </div>
            )}

            {/* D. DOCUMENTS */}
            {activeSection === 'documents' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Required Verification Documents
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Athletes must upload clear scanned copies during the application flow and bring originals to the trial venue.
                  </p>
                </div>

                <div className="space-y-3">
                  {trial.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F14] border border-[#293442]"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#00D4FF] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">{doc.name}</div>
                          <div className="text-[11px] text-slate-400">Accepted format: {doc.type}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold ${
                          doc.mandatory
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {doc.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                      </span>
                    </div>
                  ))}
                </div>

                {trial.minAge < 18 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs leading-relaxed space-y-1">
                    <strong className="block font-bold">Child Protection & Minor Consent Notice</strong>
                    Athletes under 18 years of age must provide verified parent or legal guardian contact details and consent declaration.
                  </div>
                )}
              </div>
            )}

            {/* E. VENUE & MAP */}
            {activeSection === 'venue' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Trial Venue & Directions
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {trial.venue} • {trial.address}
                  </p>
                </div>

                {/* Leaflet Map */}
                <TrialsMapView trials={[trial]} userCoords={null} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-[#0B0F14] p-4 rounded-2xl border border-[#293442] space-y-1">
                    <span className="text-slate-400 font-bold block">Transport & Transit:</span>
                    <p className="text-slate-300">{trial.transportInfo}</p>
                  </div>
                  <div className="bg-[#0B0F14] p-4 rounded-2xl border border-[#293442] space-y-1">
                    <span className="text-slate-400 font-bold block">Venue Parking:</span>
                    <p className="text-slate-300">Dedicated parking available at main gate.</p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${trial.venue} ${trial.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-[#00D4FF] border border-[#293442]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Driving Directions (External Map)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* F. ORGANISER */}
            {activeSection === 'organiser' && (
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Conducting Organisation
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Authorised sports organisation administering this trial listing.
                  </p>
                </div>

                <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#0B0F14] border border-[#293442]">
                  <div className="w-14 h-14 rounded-2xl bg-[#1B2530] text-[#00D4FF] border border-[#293442] flex items-center justify-center font-bold text-lg shrink-0">
                    {trial.organisationName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{trial.organisationName}</h4>
                      {trial.verifiedOrganiser && (
                        <span className="text-[10px] text-[#00D4FF] font-bold px-2 py-0.5 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block">{trial.organisationType}</span>
                    <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                      Official recruitment body organizing collegiate trials, tournaments, and scout networks.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span>Website: {trial.officialWebsiteUrl || 'https://sportlink.demo/organisers'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Inquiries: trials-cell@sportlink.demo</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#293442] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Report this trial listing as suspicious or misleading</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Floating Application Sidebar */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 space-y-5 shadow-2xl">
              <div>
                <span className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider block font-bold">
                  Registration Portal
                </span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {trial.isFree ? 'FREE' : `₹${trial.entryFee}`}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {trial.isFree ? 'Zero application fee' : 'Administrative venue registration'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#293442] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Application Status:</span>
                  <span className="font-bold text-emerald-400">{trial.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-bold text-amber-400">{trial.applicationDeadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trial Date:</span>
                  <span className="font-bold text-white">{trial.trialDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Seats Available:</span>
                  <span className="font-bold text-[#B6FF3B]">
                    {Math.max(0, trial.maxCapacity - trial.applicantCount)} remaining
                  </span>
                </div>
              </div>

              {trial.status !== 'Closed' ? (
                <Link
                  to={`/trials/${trial.id}/apply`}
                  className="w-full py-3.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider text-center block hover:bg-[#a5ef28] transition-all shadow-lg shadow-[#B6FF3B]/10"
                >
                  Apply for Trial
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
                >
                  Registrations Closed
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                By submitting an application, you agree to comply with the organiser’s venue safety and document verification guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Listing Modal */}
      {isReportModalOpen && (
        <ReportListingModal
          trial={trial}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}
