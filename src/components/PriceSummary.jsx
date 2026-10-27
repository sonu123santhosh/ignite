import React from 'react';
import { ArrowRight, Info, ShieldCheck, Check } from 'lucide-react';
import Button from './Button';

export default function PriceSummary({
  facility,
  selectedGround,
  selectedDate,
  selectedSlotTime,
  durationHours,
  priceBreakdown,
  onContinueToCheckout,
  canContinue
}) {
  const { basePrice, taxPercent, taxes, platformFee, total } = priceBreakdown;

  return (
    <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 shadow-2xl space-y-5 sticky top-24">
      <div className="border-b border-[#293442] pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C378]">
          Live Booking Summary
        </span>
        <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-[#F5F7FA] uppercase tracking-wide mt-1">
          {facility.name}
        </h3>
        <p className="text-xs text-[#94A3B8]">
          {selectedGround ? selectedGround.name : 'Select a pitch'}
        </p>
      </div>

      {/* Selected Timing Specs */}
      <div className="space-y-2 text-xs text-[#F5F7FA]">
        <div className="flex justify-between py-1 border-b border-[#293442]/60">
          <span className="text-[#94A3B8]">Date:</span>
          <span className="font-semibold">{selectedDate}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#293442]/60">
          <span className="text-[#94A3B8]">Time Window:</span>
          <span className="font-semibold">
            {selectedSlotTime ? `${selectedSlotTime} (${durationHours}h)` : 'No slot chosen'}
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#293442]/60">
          <span className="text-[#94A3B8]">Court Type:</span>
          <span className="font-semibold text-right">{facility.surface}</span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4 space-y-2.5 text-xs">
        <div className="flex justify-between text-[#94A3B8]">
          <span>Ground Base Tariff:</span>
          <span className="text-[#F5F7FA] font-medium">₹{basePrice}</span>
        </div>
        <div className="flex justify-between text-[#94A3B8]">
          <span>GST / Taxes ({taxPercent}%):</span>
          <span className="text-[#F5F7FA] font-medium">₹{taxes}</span>
        </div>
        <div className="flex justify-between text-[#94A3B8]">
          <span>Platform Convenience Fee:</span>
          <span className="text-[#F5F7FA] font-medium">₹{platformFee}</span>
        </div>

        <div className="pt-2.5 border-t border-[#293442] flex justify-between items-baseline">
          <span className="text-sm font-bold text-[#F5F7FA]">Estimated Total:</span>
          <div className="text-right">
            <span className="text-2xl font-black text-[#E5C378] font-['Barlow_Condensed']">
              ₹{total}
            </span>
            <span className="block text-[10px] text-[#94A3B8]">All inclusive</span>
          </div>
        </div>
      </div>

      {/* Cancellation Policy Preview */}
      <div className="p-3 rounded-lg bg-[#1B2530] border border-[#293442] text-[11px] text-[#94A3B8]">
        <strong className="text-[#F5F7FA] block mb-0.5">Cancellation Policy:</strong>
        {facility.cancellationPolicy}
      </div>

      {/* Action Button */}
      <Button
        variant="gold"
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
          <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
          Demo simulation &bull; No payment charged
        </span>
      </div>
    </div>
  );
}
