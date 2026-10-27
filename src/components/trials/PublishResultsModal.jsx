import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, X, Users, Send } from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';

export default function PublishResultsModal({ trial, applicants, onClose }) {
  const { publishResults } = useTrials();
  const [announcement, setAnnouncement] = useState(
    `Official selection list for ${trial.title} has been finalized by the evaluation committee. Selected athletes must report for documentation as notified.`
  );
  const [published, setPublished] = useState(false);

  const selectedAthletes = applicants.filter(
    (a) => a.status === 'Accepted' || a.status === 'Shortlisted'
  );

  const handlePublish = (e) => {
    e.preventDefault();
    publishResults(trial.id, {
      announcement,
      selectedAthletes: selectedAthletes.map((a) => ({
        id: a.id,
        name: a.athleteName,
        status: a.status
      }))
    });
    setPublished(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#141B24] border border-[#293442] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#293442] pb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Publish Official Trial Results</h3>
            <p className="text-xs text-[#94A3B8]">{trial.title}</p>
          </div>
        </div>

        {published ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Results Published Successfully</h3>
            <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
              All registered applicants have been updated with the published decision.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-4">
            {/* Selection Overview Pill */}
            <div className="bg-[#0B0F14] border border-[#293442] p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Applications:</span>
                <span className="font-bold text-white">{applicants.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Selected / Shortlisted Athletes:</span>
                <span className="font-bold text-[#B6FF3B]">{selectedAthletes.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Waitlisted / Other:</span>
                <span className="font-bold text-slate-300">{applicants.length - selectedAthletes.length}</span>
              </div>
            </div>

            {selectedAthletes.length === 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No athletes currently marked as Shortlisted or Accepted. Review applicants first.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Official Declaration Announcement
              </label>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B6FF3B]"
              />
            </div>

            <div className="text-[11px] text-slate-500">
              * Publication requires organiser confirmation. Private internal notes will not be shown to athletes.
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
                className="flex-1 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] text-xs font-black uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Publish</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
