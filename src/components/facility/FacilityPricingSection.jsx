import React from 'react';
import { Clock, Info, ShieldCheck } from 'lucide-react';
import { formatINR } from './facilityAdapter';

export default function FacilityPricingSection({ pricing }) {
  if (!pricing || (pricing.standardHourlyRate == null && pricing.peakHourlyRate == null)) {
    return (
      <div
        className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 shadow-xl space-y-3"
        role="region"
        aria-labelledby="pricing-heading"
      >
        <div className="border-b border-[#293442] pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C378]">
            Tariff &amp; Rates
          </span>
          <h2
            id="pricing-heading"
            className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA] mt-0.5 tracking-wide"
          >
            Facility Pricing
          </h2>
        </div>
        <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-5 text-center text-xs text-[#94A3B8] flex flex-col items-center gap-2">
          <Info className="w-5 h-5 text-amber-400" />
          <p>Pricing hasn&apos;t been provided for this facility yet. Contact the venue for rates.</p>
        </div>
      </div>
    );
  }

  const renderRateValue = (val) => {
    if (val === 0) return 'Free';
    if (val != null) return formatINR(val);
    return null;
  };

  const standardRateFormatted = renderRateValue(pricing.standardHourlyRate);
  const peakRateFormatted = renderRateValue(pricing.peakHourlyRate);
  const hasAdditionalCharges =
    (pricing.equipmentRentalCharges && pricing.equipmentRentalCharges.length > 0) ||
    (pricing.otherFees && pricing.otherFees.length > 0);

  return (
    <div
      className="bg-[#141B24] border border-[#293442] rounded-2xl p-6 sm:p-7 shadow-xl space-y-5"
      role="region"
      aria-labelledby="pricing-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#293442] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5C378]">
            Transparent Tariff
          </span>
          <h2
            id="pricing-heading"
            className="font-['Barlow_Condensed'] text-2xl font-black uppercase text-[#F5F7FA] mt-0.5 tracking-wide"
          >
            Court &amp; Pitch Rates
          </h2>
        </div>
        <span className="text-[11px] text-[#94A3B8]">
          Rates in Indian Rupees (₹)
        </span>
      </div>

      {/* Primary Rates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Standard Hourly Rate */}
        {standardRateFormatted !== null && (
          <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-4.5 space-y-2 relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block">
              Standard Hourly Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-['Barlow_Condensed'] text-3xl font-black text-[#F5F7FA]">
                {standardRateFormatted}
              </span>
              <span className="text-xs text-[#94A3B8]">/ hour</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Applies to regular daytime and off-peak sessions.
            </p>
          </div>
        )}

        {/* Peak Hourly Rate */}
        {peakRateFormatted !== null && (
          <div className="bg-[#0B0F14] border border-[#D4AF37]/35 rounded-xl p-4.5 space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E5C378]">
                Peak Hour Rate
              </span>
              <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                High Demand
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-['Barlow_Condensed'] text-3xl font-black text-[#E5C378]">
                {peakRateFormatted}
              </span>
              <span className="text-xs text-[#94A3B8]">/ hour</span>
            </div>
            {pricing.peakWindows && pricing.peakWindows.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 pt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Peak: {pricing.peakWindows.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Charges if defined in data */}
      {hasAdditionalCharges && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
            Additional Charges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pricing.equipmentRentalCharges?.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3 flex justify-between items-center text-xs"
              >
                <span className="text-[#94A3B8]">{item.item || item.name}</span>
                <span className="font-bold text-[#F5F7FA]">
                  {formatINR(item.amount)} {item.unit ? `(${item.unit})` : ''}
                </span>
              </div>
            ))}
            {pricing.otherFees?.map((fee, idx) => (
              <div
                key={idx}
                className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3 flex justify-between items-center text-xs"
              >
                <span className="text-[#94A3B8]">{fee.label || fee.name}</span>
                <span className="font-bold text-[#F5F7FA]">
                  {formatINR(fee.amount)} {fee.unit ? `(${fee.unit})` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note that booking checkout shows final amount */}
      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] pt-1 border-t border-[#293442]/50">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Final amount is shown before you confirm your booking</span>
      </div>
    </div>
  );
}
