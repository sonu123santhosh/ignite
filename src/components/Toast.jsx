import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#c6ff3d] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className="bg-[#131a2b] border border-[#2a3652] shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_15px_rgba(198,255,61,0.15)] rounded-2xl p-4 flex items-start gap-3 text-slate-100">
        {icons[toast.type] || icons.info}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-bold text-white tracking-wide">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
          {toast.isDemo && (
            <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 text-slate-400 rounded border border-slate-700">
              Demo Simulation &bull; No actual booking made
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
