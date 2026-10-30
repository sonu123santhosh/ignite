/**
 * CostSplitModal.jsx
 * Interactive modal to configure Group Cost Splitting before checkout.
 *
 * Requirements:
 *  - Participants stepper: +/- and typed input, clamped between 2 and 30
 *  - Booker is participant 1 (name prefilled from account, locked as creator)
 *  - Equal split by default down to exact paise
 *  - Custom split mode with live "Remaining ₹X" or "Over by ₹X" indicator
 *  - Blocking save until shares sum exactly to total
 *  - Live breakdown table with total row matching booking total
 *  - Optional note field (max 200 chars)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  Plus,
  Minus,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Button from '../Button';
import {
  calculateEqualSplit,
  validateCustomSplit,
  formatINR,
  toPaise,
  toRupees
} from '../../services/costSplitService';

export default function CostSplitModal({
  isOpen,
  onClose,
  totalRupees,
  currentSplitConfig,
  onSaveSplitConfig,
  currentUserName = 'Booker (You)'
}) {
  const totalPaise = useMemo(() => toPaise(totalRupees), [totalRupees]);

  // Local configuration state
  const [participantCount, setParticipantCount] = useState(
    currentSplitConfig?.participantCount || 2
  );
  const [mode, setMode] = useState(currentSplitConfig?.mode || 'equal');
  const [note, setNote] = useState(currentSplitConfig?.note || '');

  // Participants array: [{ position, name, amountPaise }]
  const [participants, setParticipants] = useState(() => {
    if (currentSplitConfig?.participants && currentSplitConfig.participants.length >= 2) {
      return currentSplitConfig.participants;
    }
    return calculateEqualSplit(totalPaise, 2, [
      { name: currentUserName }
    ]);
  });

  // Keep participant 1 name synced with currentUserName if empty
  useEffect(() => {
    if (isOpen) {
      const initialCount = Math.min(30, Math.max(2, currentSplitConfig?.participantCount || participantCount));
      setParticipantCount(initialCount);
      setMode(currentSplitConfig?.mode || 'equal');
      setNote(currentSplitConfig?.note || '');

      if (currentSplitConfig?.participants && currentSplitConfig.participants.length === initialCount) {
        setParticipants(currentSplitConfig.participants);
      } else {
        setParticipants(
          calculateEqualSplit(totalPaise, initialCount, [
            { name: currentUserName }
          ])
        );
      }
    }
  }, [isOpen, totalPaise]);

  // Recalculate equal split whenever participant count changes in equal mode
  const handleCountChange = (newCount) => {
    const clamped = Math.min(30, Math.max(2, Math.floor(Number(newCount) || 2)));
    setParticipantCount(clamped);

    if (mode === 'equal') {
      setParticipants((prev) => calculateEqualSplit(totalPaise, clamped, prev));
    } else {
      // In custom mode, resize participants array
      setParticipants((prev) => {
        const next = [...prev];
        if (clamped > next.length) {
          for (let i = next.length + 1; i <= clamped; i++) {
            next.push({
              position: i,
              name: `Player ${i}`,
              amountPaise: 0,
              amountRupees: 0
            });
          }
        } else if (clamped < next.length) {
          next.length = clamped;
        }
        return next;
      });
    }
  };

  // Switch between equal and custom modes
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    if (newMode === 'equal') {
      setParticipants((prev) => calculateEqualSplit(totalPaise, participantCount, prev));
    }
  };

  // Update participant name
  const handleNameChange = (index, newName) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: newName };
      return next;
    });
  };

  // Update custom amount in rupees
  const handleCustomAmountChange = (index, value) => {
    const cleanNum = Math.max(0, parseFloat(value) || 0);
    const newPaise = Math.round(cleanNum * 100);

    setParticipants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        amountPaise: newPaise,
        amountRupees: toRupees(newPaise)
      };
      return next;
    });
  };

  // Custom validation calculations
  const customValidation = useMemo(() => {
    if (mode === 'equal') {
      return { valid: true, remainingPaise: 0, overPaise: 0 };
    }
    return validateCustomSplit(totalPaise, participants);
  }, [mode, totalPaise, participants]);

  // Auto-fill remaining balance to selected participant in custom mode
  const handleDistributeRemaining = () => {
    if (customValidation.remainingPaise <= 0) return;
    setParticipants((prev) => {
      const next = [...prev];
      // Distribute to the last participant or booker
      const targetIndex = next.length - 1;
      next[targetIndex] = {
        ...next[targetIndex],
        amountPaise: next[targetIndex].amountPaise + customValidation.remainingPaise,
        amountRupees: toRupees(next[targetIndex].amountPaise + customValidation.remainingPaise)
      };
      return next;
    });
  };

  // Save configuration
  const handleSave = () => {
    if (mode === 'custom' && !customValidation.valid) return;

    onSaveSplitConfig({
      enabled: true,
      participantCount,
      mode,
      note: note.trim().slice(0, 200),
      totalRupees,
      totalPaise,
      participants: participants.map((p, idx) => ({
        position: idx + 1,
        name: (p.name || (idx === 0 ? currentUserName : `Player ${idx + 1}`)).trim().slice(0, 50),
        amountPaise: p.amountPaise,
        amountRupees: toRupees(p.amountPaise)
      }))
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="split-modal-title"
    >
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#293442] bg-[#101826]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Cost-Splitting Calculator
              </span>
              <h2 id="split-modal-title" className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA]">
                Split Booking Cost
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F5F7FA] bg-[#0B0F14] border border-[#293442] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#F5F7FA]">
          {/* Top Banner: Total & Amount per person */}
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[#94A3B8] text-[11px] block">Total to Split:</span>
              <span className="font-['Barlow_Condensed'] text-2xl font-black text-rose-200">
                {formatINR(totalRupees)}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">All-inclusive booking total</span>
            </div>

            <div className="sm:text-right">
              <span className="text-[#94A3B8] text-[11px] block">Estimated Share:</span>
              <span className="font-['Barlow_Condensed'] text-2xl font-black text-[#B6FF3B]">
                {mode === 'equal'
                  ? formatINR(participants[0]?.amountRupees || 0)
                  : `Custom (${formatINR(participants[0]?.amountRupees || 0)} booker)`}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">
                {participantCount} participants
              </span>
            </div>
          </div>

          {/* Stepper & Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Participant Count Stepper */}
            <div className="bg-[#101826]/70 border border-[#293442] rounded-xl p-3.5 space-y-2">
              <label htmlFor="participant-count-input" className="block text-[11px] font-semibold text-[#94A3B8]">
                Participants (2 to 30)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={participantCount <= 2}
                  onClick={() => handleCountChange(participantCount - 1)}
                  className="w-8 h-8 rounded-lg bg-[#0B0F14] border border-[#293442] hover:border-slate-400 flex items-center justify-center text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Decrease participants"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  id="participant-count-input"
                  type="number"
                  min="2"
                  max="30"
                  step="1"
                  value={participantCount}
                  onChange={(e) => handleCountChange(e.target.value)}
                  className="w-16 h-8 text-center rounded-lg bg-[#0B0F14] border border-[#293442] text-sm font-bold text-white focus:outline-none focus:border-rose-400"
                />
                <button
                  type="button"
                  disabled={participantCount >= 30}
                  onClick={() => handleCountChange(participantCount + 1)}
                  className="w-8 h-8 rounded-lg bg-[#0B0F14] border border-[#293442] hover:border-slate-400 flex items-center justify-center text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Increase participants"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Split Mode Selector */}
            <div className="bg-[#101826]/70 border border-[#293442] rounded-xl p-3.5 space-y-2">
              <span className="block text-[11px] font-semibold text-[#94A3B8]">
                Calculation Mode
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0F14] border border-[#293442] rounded-lg">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('equal')}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'equal'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('custom')}
                  className={`py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    mode === 'custom'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Customise
                </button>
              </div>
            </div>
          </div>

          {/* Custom Mode Live Indicator */}
          {mode === 'custom' && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                customValidation.valid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : customValidation.remainingPaise > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {customValidation.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {customValidation.valid
                    ? 'Total matches perfectly! You can save this split.'
                    : customValidation.remainingPaise > 0
                    ? `Remaining to allocate: ${formatINR(customValidation.remainingPaise / 100)}`
                    : `Over allocated by: ${formatINR(customValidation.overPaise / 100)}`}
                </span>
              </div>

              {customValidation.remainingPaise > 0 && (
                <button
                  type="button"
                  onClick={handleDistributeRemaining}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 text-amber-200 transition-colors shrink-0 cursor-pointer"
                >
                  Fill Balance
                </button>
              )}
            </div>
          )}

          {/* Participant Rows */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] text-[#94A3B8] font-semibold px-1">
              <span>Participant</span>
              <span>Contribution (₹)</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {participants.map((p, idx) => {
                const isBooker = idx === 0;
                return (
                  <div
                    key={p.position}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0B0F14] border border-[#293442]"
                  >
                    <span className="w-6 text-center text-xs font-mono font-bold text-rose-400">
                      #{p.position}
                    </span>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        maxLength={50}
                        value={p.name}
                        disabled={isBooker}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={`Player ${p.position}`}
                        className="w-full text-xs font-medium bg-transparent border-0 px-2 py-1 rounded text-[#F5F7FA] focus:ring-1 focus:ring-rose-400 placeholder:text-slate-600 disabled:opacity-80"
                      />
                      {isBooker && (
                        <span className="text-[10px] text-rose-300/80 px-2 block">
                          Organizer &bull; Booking Creator
                        </span>
                      )}
                    </div>

                    <div className="w-28 text-right">
                      {mode === 'equal' ? (
                        <span className="font-mono text-xs font-bold text-white px-2">
                          {formatINR(p.amountRupees)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.amountRupees}
                          onChange={(e) => handleCustomAmountChange(idx, e.target.value)}
                          className="w-full text-right font-mono text-xs font-bold bg-[#141B24] border border-[#293442] px-2 py-1 rounded-lg text-white focus:outline-none focus:border-rose-400"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#94A3B8]">
              <label htmlFor="split-note-field">Optional Note for Group</label>
              <span>{note.length}/200</span>
            </div>
            <input
              id="split-note-field"
              type="text"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Bring turf boots & water bottle. Settle share via UPI."
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#293442] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Honesty Notice */}
          <div className="bg-[#101826] border border-[#293442] rounded-xl p-3 flex items-start gap-2 text-[11px] text-[#94A3B8]">
            <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              <strong>Cost Breakdown Only:</strong> Contributions always sum exactly to the total. Payments are settled outside SportLink between match participants.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#293442] bg-[#101826]/90 flex justify-between items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="crimson"
            size="md"
            disabled={mode === 'custom' && !customValidation.valid}
            onClick={handleSave}
            className="gap-1.5"
          >
            <span>Save Split Breakdown</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

