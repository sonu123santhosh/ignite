import React, { useState } from 'react';
import { User, FileText, CheckCircle2, XCircle, Clock, AlertCircle, X, Shield, MessageSquare } from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';

export default function ApplicantReviewModal({ application, onClose }) {
  const { updateApplicantStatus } = useTrials();

  const [status, setStatus] = useState(application.status || 'Under Review');
  const [internalNotes, setInternalNotes] = useState(application.organiserNotes || '');
  const [nextRoundDetails, setNextRoundDetails] = useState(application.nextRoundDetails || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateApplicantStatus(application.id, status, internalNotes, nextRoundDetails);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#141B24] border border-[#293442] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#293442] pb-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00D4FF] font-bold">
              Applicant Review Dossier
            </span>
            <h3 className="text-xl font-black text-white">{application.athleteName}</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Ref: <strong className="text-white">{application.id}</strong> • Applied for: {application.trialTitle}
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0B0F14] text-slate-300 border border-[#293442]">
            {application.appliedOn}
          </span>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Applicant decision saved and notification delivered to athlete.</span>
          </div>
        )}

        {/* Applicant Profile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0B0F14] p-4 rounded-2xl border border-[#293442] text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Age & Gender</span>
            <span className="font-bold text-white">{application.athleteAge} years • {application.athleteGender}</span>
            {application.athleteAge < 18 && (
              <span className="text-[10px] text-amber-400 block mt-0.5">Minor Athlete</span>
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Primary Position</span>
            <span className="font-bold text-white">{application.position || 'General Squad'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Experience</span>
            <span className="font-bold text-white">{application.experienceLevel || 'Competitive'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Email</span>
            <span className="font-mono text-slate-300 truncate block">{application.athleteEmail}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Contact Phone</span>
            <span className="font-mono text-slate-300 block">{application.athletePhone}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Emergency Contact</span>
            <span className="text-slate-300 truncate block">{application.emergencyContact || 'On file'}</span>
          </div>
        </div>

        {/* Sports Achievements & Stats */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Track Record & Past Credentials
          </h4>
          <div className="bg-[#1B2530] p-3.5 rounded-xl border border-[#293442] space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Achievements:</span>
              <p className="text-white mt-0.5 leading-relaxed">
                {application.previousAchievements || 'District and college representations listed on physical certificate.'}
              </p>
            </div>
            {application.sportsStats && (
              <div className="pt-2 border-t border-[#293442]">
                <span className="text-slate-400 text-[11px] block">Reported Statistics:</span>
                <p className="font-mono text-[#B6FF3B] text-xs mt-0.5">{application.sportsStats}</p>
              </div>
            )}
          </div>
        </div>

        {/* Submitted Documents Roster */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Uploaded Verification Documents</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {application.uploadedDocuments?.length || 0} attached files
            </span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(application.uploadedDocuments || []).map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#00D4FF] shrink-0" />
                  <span className="text-slate-200 truncate">{doc.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{doc.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Decision Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-3 border-t border-[#293442]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Application Decision Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Shortlisted', label: 'Shortlist', color: 'bg-[#B6FF3B] text-[#0B0F14]' },
                { id: 'Accepted', label: 'Accept', color: 'bg-emerald-500 text-white' },
                { id: 'Waitlisted', label: 'Waitlist', color: 'bg-[#00D4FF] text-[#0B0F14]' },
                { id: 'Rejected', label: 'Reject', color: 'bg-red-500 text-white' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatus(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    status === opt.id
                      ? `${opt.color} shadow-lg`
                      : 'bg-[#0B0F14] text-slate-400 border border-[#293442] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Private Internal Organiser Notes (Confidential)
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add confidential scout notes regarding technical balance, sprint speed, or fitness..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Instructions for Athlete (Visible to Candidate)
            </label>
            <textarea
              value={nextRoundDetails}
              onChange={(e) => setNextRoundDetails(e.target.value)}
              placeholder="e.g. Reporting at 06:30 AM at Court 2; bring original Aadhaar and sports bonafide..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF3B]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#1B2530] text-xs font-bold text-slate-300 border border-[#293442] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] text-xs font-black uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10 cursor-pointer"
            >
              Save Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
