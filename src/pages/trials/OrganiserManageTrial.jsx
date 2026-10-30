import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Award,
  Calendar,
  MapPin,
  Check,
  Send,
  Eye,
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialsRoleSwitcher from '../../components/trials/TrialsRoleSwitcher';
import ApplicantReviewModal from '../../components/trials/ApplicantReviewModal';
import PublishResultsModal from '../../components/trials/PublishResultsModal';

export default function OrganiserManageTrial() {
  const { id } = useParams();
  const { trials, applications, recordAttendance } = useTrials();

  const trial = (trials || []).find((t) => t.id === id) || trials[0];

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [scoringAppId, setScoringAppId] = useState(null);
  const [tempScore, setTempScore] = useState('');

  if (!trial) {
    return (
      <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-28 pb-20 px-4 text-center">
        <h2 className="text-xl font-bold text-white">Trial not found</h2>
        <Link to="/trials/organiser" className="text-[#00D4FF] underline text-sm mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Applications for this trial
  const trialApps = (applications || []).filter((a) => a.trialId === trial.id);

  // Filtered applicants
  const filteredApplicants = trialApps.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const shortlistedCount = trialApps.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Accepted'
  ).length;

  const handleSaveScore = (appId) => {
    if (tempScore === '') return;
    recordAttendance(appId, 'Present', Number(tempScore));
    setScoringAppId(null);
    setTempScore('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> {status}
          </span>
        );
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
            <Clock className="w-3.5 h-3.5" /> Submitted
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Waitlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Waitlisted
          </span>
        );
      case 'Withdrawn':
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Role Switcher */}
        <TrialsRoleSwitcher />

        {/* Back Link */}
        <div>
          <Link
            to="/trials/organiser"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#00D4FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Organiser Dashboard</span>
          </Link>
        </div>

        {/* Trial Header Summary */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                {trial.sport} • {trial.discipline}
              </span>
              <span className="text-xs text-slate-400">ID: {trial.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-['Barlow_Condensed',sans-serif]">
              {trial.title}
            </h1>
            <p className="text-xs text-[#94A3B8] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#B6FF3B]" />
              <span>{trial.venue}, {trial.city} • Trial Date: <strong className="text-white">{trial.trialDate}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Publish Trial Results</span>
            </button>
            <Link
              to={`/trials/${trial.id}`}
              className="px-4 py-2.5 rounded-xl bg-[#1B2530] text-slate-200 hover:text-white font-bold text-xs border border-[#293442] transition-colors"
            >
              View Public Page
            </Link>
          </div>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Registered</span>
            <div className="text-2xl font-black text-white font-mono">{trialApps.length}</div>
            <p className="text-[11px] text-slate-500">Max capacity: {trial.maxCapacity}</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Shortlisted / Selected</span>
            <div className="text-2xl font-black text-[#B6FF3B] font-mono">{shortlistedCount}</div>
            <p className="text-[11px] text-slate-500">Passed review stage</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Awaiting Decision</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {trialApps.filter((a) => a.status === 'Submitted' || a.status === 'Under Review').length}
            </div>
            <p className="text-[11px] text-slate-500">Unprocessed dossiers</p>
          </div>

          <div className="bg-[#141B24] border border-[#293442] p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance Recorded</span>
            <div className="text-2xl font-black text-[#00D4FF] font-mono">
              {trialApps.filter((a) => a.attendanceStatus === 'Present').length}
            </div>
            <p className="text-[11px] text-slate-500">Present on ground</p>
          </div>
        </div>

        {/* APPLICANT ROSTER TABLE */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#293442] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Candidate Applications & Evaluation Roster
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Click on any candidate to inspect sporting certificates, add scout notes, and update status.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'submitted', 'shortlisted', 'accepted', 'waitlisted', 'rejected'].map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-[#00D4FF] text-[#0B0F14]'
                        : 'bg-[#1B2530] text-[#94A3B8] hover:text-white border border-[#293442]'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12 bg-[#0B0F14]/50 rounded-2xl border border-dashed border-[#293442] space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No candidates under &quot;{statusFilter}&quot;</p>
              <p className="text-xs text-slate-500">Try changing your status filter above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F14] text-[#94A3B8] uppercase text-[10px] tracking-wider font-semibold border-b border-[#293442]">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Position / Role</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Docs Attached</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Eval Score</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#293442]">
                  {filteredApplicants.map((app) => (
                    <tr key={app.id} className="hover:bg-[#1B2530]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{app.athleteName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {app.athleteAge} yrs • {app.athleteGender} • {app.athleteCity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {app.position || 'General Squad'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {app.experienceLevel || 'Competitive'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[#00D4FF]">
                          {app.uploadedDocuments?.length || 0} files
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => recordAttendance(app.id, 'Present', app.evaluationScore)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.attendanceStatus === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-[#1B2530] text-slate-400 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => recordAttendance(app.id, 'Absent', app.evaluationScore)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.attendanceStatus === 'Absent'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-[#1B2530] text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {scoringAppId === app.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={tempScore}
                              onChange={(e) => setTempScore(e.target.value)}
                              placeholder="Score"
                              className="w-14 px-1.5 py-0.5 rounded bg-[#0B0F14] border border-[#293442] text-xs text-white"
                            />
                            <button type="button" onClick={() => handleSaveScore(app.id)} className="px-2 py-0.5 rounded bg-[#B6FF3B] text-black font-bold text-[10px]">Save</button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setScoringAppId(app.id);
                              setTempScore(app.evaluationScore !== null ? String(app.evaluationScore) : '');
                            }}
                            className="font-mono font-bold text-slate-300 hover:text-[#B6FF3B] cursor-pointer"
                          >
                            {app.evaluationScore !== null ? `${app.evaluationScore} / 100` : '+ Score'}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#00D4FF] hover:bg-[#33ddff] text-[#0B0F14] font-bold text-xs transition-colors cursor-pointer"
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Review Modal */}
      {selectedApplicant && (
        <ApplicantReviewModal
          application={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}

      {/* Publish Results Modal */}
      {isPublishModalOpen && (
        <PublishResultsModal
          trial={trial}
          applicants={trialApps}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}
    </div>
  );
}
