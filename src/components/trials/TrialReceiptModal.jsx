import React from 'react';
import { FileText, Download, Printer, CheckCircle2, MapPin, Calendar, X, QrCode } from 'lucide-react';

export default function TrialReceiptModal({ application, trial, onClose }) {
  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c0f17]/95 border border-amber-500/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative text-left backdrop-blur-md">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="border-b border-amber-500/20 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              SportLink Official Trial Pass
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Application Receipt
            </h3>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Reference No.</span>
            <span className="text-xs font-bold text-amber-400 bg-[#07090e] px-2 py-1 rounded border border-amber-500/30">
              {application.receiptNumber || application.id}
            </span>
          </div>
        </div>

        {/* Candidate & Trial Specs */}
        <div className="bg-[#07090e] border border-amber-500/20 p-4 rounded-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <span className="text-slate-400">Candidate Name:</span>
            <span className="font-bold text-white">{application.athleteName} ({application.athleteAge} yrs)</span>
          </div>
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <span className="text-slate-400">Trial Event:</span>
            <span className="font-bold text-amber-400 max-w-[220px] text-right truncate">
              {application.trialTitle}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <span className="text-slate-400">Organising Body:</span>
            <span className="font-semibold text-white">{application.organisationName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <span className="text-slate-400">Trial Date & Reporting:</span>
            <span className="font-bold text-amber-300">
              {application.trialDate} (Reporting: {trial?.reportingTime || '07:00 AM'})
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
            <span className="text-slate-400">Venue Address:</span>
            <span className="text-slate-300 max-w-[220px] text-right truncate">
              {application.venue}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Registration Fee:</span>
            <span className="font-mono font-bold text-emerald-400">
              {trial?.isFree ? 'FREE (Scholarship Quota)' : `₹${trial?.entryFee || 0} Paid (Demo)`}
            </span>
          </div>
        </div>

        {/* Verification QR / Security Placeholder */}
        <div className="flex items-center gap-4 bg-[#141824] p-3.5 rounded-2xl border border-amber-500/25">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-black" />
          </div>
          <div className="text-[11px] text-slate-300 leading-tight">
            <strong className="text-white block font-mono">DIGITAL ADMIT PASS</strong>
            Present this reference ID and original photo ID at the venue reporting desk for bib allocation.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-[#141824] hover:bg-amber-950/40 text-xs font-bold text-white border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-black uppercase tracking-wider text-center hover:shadow-[0_4px_20px_rgba(245,158,11,0.45)] transition-all shadow-md border border-amber-400/40 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
