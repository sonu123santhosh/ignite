import React from 'react';
import { ArrowRight, ShieldCheck, Clock, Calendar, Layers, Users } from 'lucide-react';
import Button from './Button';
import { formatINR, formatDisplayDate, formatTime12h } from './facility/facilityAdapter';

export default function PriceSummary({
  facility,
  selectedGround,
  selectedDate,
  selectedSlotTime,
  durationHours,
  priceBreakdown,
  onContinueToCheckout,
  canContinue,
  splitConfig,
  onToggleSplit,
  onOpenSplitModal
}) {
  const { basePrice = 0, taxPercent = 18, taxes = 0, platformFee = 0, total = 0 } = priceBreakdown || {};

  const formattedDate = selectedDate ? formatDisplayDate(selectedDate).full : '';
  const timeDisplay = selectedSlotTime
    ? `${selectedSlotTime} (${formatTime12h(selectedSlotTime)}) - ${durationHours} ${durationHours === 1 ? 'Hour' : 'Hours'}`
    : 'No slot chosen';

  const participantCount = splitConfig?.participantCount || 2;
  const estimatedPerPerson = total > 0 ? total / participantCount : 0;

  return (
    <div
      className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24"
      role="region"
      aria-label="Booking Summary"
    >
      <div className="border-b border-[#293442] pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
          Live Booking Summary
        </span>
        <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-[#F5F7FA] uppercase tracking-wide mt-1">
          {facility.name}
        </h3>
        <p className="text-xs text-[#94A3B8]">
          {selectedGround ? selectedGround.name : 'Select a pitch'}
        </p>
      </div>

      {/* Selected Timing & Court Specs */}
      <div className="space-y-2 text-xs text-[#F5F7FA]">
        <div className="flex justify-between py-1 border-b border-[#293442]/60">
          <span className="text-[#94A3B8] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Date:</span>
          </span>
          <span className="font-semibold text-right">{formattedDate || selectedDate}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-[#293442]/60">
          <span className="text-[#94A3B8] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time Window:</span>
          </span>
          <span className="font-semibold text-right">{timeDisplay}</span>
        </div>

        {facility.surfaceType && (
          <div className="flex justify-between py-1 border-b border-[#293442]/60">
            <span className="text-[#94A3B8] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Surface:</span>
            </span>
            <span className="font-semibold text-right truncate max-w-[180px]">{facility.surfaceType}</span>
          </div>
        )}
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 space-y-2.5 text-xs">
        <div className="flex justify-between text-[#94A3B8]">
          <span>Ground Base Tariff:</span>
          <span className="text-[#F5F7FA] font-medium">{formatINR(basePrice)}</span>
        </div>
        <div className="flex justify-between text-[#94A3B8]">
          <span>GST / Taxes ({taxPercent}%):</span>
          <span className="text-[#F5F7FA] font-medium">{formatINR(taxes)}</span>
        </div>
        <div className="flex justify-between text-[#94A3B8]">
          <span>Platform Convenience Fee:</span>
          <span className="text-[#F5F7FA] font-medium">{formatINR(platformFee)}</span>
        </div>

        <div className="pt-2.5 border-t border-[#293442] flex justify-between items-baseline">
          <span className="text-sm font-bold text-[#F5F7FA]">Estimated Total:</span>
          <div className="text-right">
            <span className="text-3xl font-black text-rose-200 font-['Barlow_Condensed']">
              {formatINR(total)}
            </span>
            <span className="block text-[10px] text-[#94A3B8]">All inclusive</span>
          </div>
        </div>
      </div>

      {/* Group Cost Splitting Toggle & Indicator */}
      <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <div>
              <span className="text-xs font-bold text-white block">Split Cost with Friends</span>
              <span className="text-[10px] text-[#94A3B8] block">Share breakdown with squad</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(splitConfig?.enabled)}
              onChange={(e) => onToggleSplit && onToggleSplit(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {splitConfig?.enabled && (
          <div className="pt-2 border-t border-[#293442] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">
                {participantCount} Players ({splitConfig.mode === 'equal' ? 'Equal' : 'Custom'}):
              </span>
              <span className="font-mono font-bold text-rose-300">
                {splitConfig.mode === 'equal'
                  ? `${formatINR(estimatedPerPerson)} / person`
                  : 'Custom shares'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenSplitModal}
              className="w-full py-2 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Configure Cost Split</span>
            </button>
          </div>
        )}
      </div>

      {/* Cancellation Policy Preview (omitted if not defined) */}
      {facility.cancellationPolicy && (
        <div className="p-3 rounded-lg bg-[#1B2530] border border-[#293442] text-[11px] text-[#94A3B8]">
          <strong className="text-[#F5F7FA] block mb-0.5">Cancellation Policy:</strong>
          {facility.cancellationPolicy}
        </div>
      )}

      {/* Action Button */}
      <Button
        variant="crimson"
        size="lg"
        disabled={!canContinue}
        onClick={onContinueToCheckout}
        className="w-full gap-2 py-3"
      >
        <span>Continue to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </Button>

      <div className="text-center">
        <span className="text-[10px] text-[#94A3B8] inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Demo simulation &bull; Real-time conflict verified
        </span>
      </div>
    </div>
  );
}
