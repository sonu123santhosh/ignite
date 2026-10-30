import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';

export default function ReportListingModal({ trial, onClose }) {
  const { reportTrialListing } = useTrials();
  const [reason, setReason] = useState('Fraudulent / Demanding Unofficial Fees');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details.trim()) return;

    reportTrialListing(trial.id, { reason, details });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c0f17]/95 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative backdrop-blur-md">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Report Submitted</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Thank you for keeping SportLink safe. Our compliance and verification committee will investigate this listing immediately.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-[#141824] hover:bg-amber-950/40 text-xs font-bold text-white border border-amber-500/30 cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Report Trial Listing</h3>
                <p className="text-xs text-slate-400 truncate max-w-[240px]">{trial.title}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/25 text-xs text-white focus:outline-none focus:border-red-400"
              >
                <option value="Fraudulent / Demanding Unofficial Fees">
                  Fraudulent / Demanding Unofficial Fees
                </option>
                <option value="False University / Club Affiliation">
                  False University / Club Affiliation
                </option>
                <option value="Misleading Age / Skill Requirements">
                  Misleading Age / Skill Requirements
                </option>
                <option value="Unsafe Venue / Substandard Facilities">
                  Unsafe Venue / Substandard Facilities
                </option>
                <option value="Impersonating an Authorised Scout">
                  Impersonating an Authorised Scout
                </option>
                <option value="Other Safety Violation">Other Safety Violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Details & Evidence (Required)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was misleading, unverified, or fraudulent about this trial listing..."
                rows={4}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-amber-500/25 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
              SportLink actively protects young athletes. Submitting false reports may result in account suspension.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#141824] hover:bg-amber-950/40 text-xs font-bold text-slate-300 border border-amber-500/30 hover:text-white cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/20"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
