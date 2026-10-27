import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  children
}) {
  const cancelBtnRef = useRef(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    cancelBtnRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="bg-[#141B24] border border-[#293442] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 flex items-start gap-3 border-b border-[#293442] bg-[#0B0F14]">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isDestructive
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Children / Form fields (e.g. rejection reason) */}
        {children && <div className="p-5 border-b border-[#293442] space-y-3">{children}</div>}

        {/* Actions */}
        <div className="p-4 bg-[#0B0F14] flex items-center justify-end gap-2.5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#1B2530] border border-[#293442] hover:border-slate-500 rounded-xl transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isDestructive
                ? 'bg-[#EF4444] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
