import React from 'react';
import { Award, Clock, MapPin, IndianRupee, ShieldCheck, Check, HelpCircle, GraduationCap } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import { SAMPLE_COACHING_CENTRES } from '../data/sampleData';

export default function CoachingSection({ onShowToast }) {
  const handleEnquire = (academy) => {
    onShowToast({
      title: `Enquiry: ${academy.name}`,
      message: `Enquiry submitted for batch level "${academy.level}" at ₹${academy.monthlyFee}/month. Trial option: ${academy.trialAvailability}. (Demo simulation)`,
      type: 'info',
      isDemo: true
    });
  };

  const handleCompare = () => {
    onShowToast({
      title: 'Academy Comparison Tool (Demo)',
      message: 'Comparing batch sizes, coach certifications (NIS / AFC), timings, and monthly fees side-by-side.',
      type: 'info',
      isDemo: true
    });
  };

  const getVerificationBadge = (status) => {
    if (status.includes('Verified')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (status.includes('Pending')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    return 'bg-slate-200 text-slate-700 border-slate-300';
  };

  return (
    <section id="coaching" className="py-20 sm:py-28 bg-[#e8ecf2] text-[#0a1020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Academy & Training"
          title="Train Smarter. Spend Better."
          subtitle="Discover verified coaching centres with clear qualifications, trial options, and transparent monthly fees. No exaggerated scholarship promises."
          light={true}
          action={
            <Button
              variant="dark"
              size="md"
              onClick={handleCompare}
              className="bg-[#0a1020] text-white hover:bg-[#172033]"
            >
              Compare Coaching Centres
            </Button>
          }
        />

        {/* Coaching Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_COACHING_CENTRES.map((academy) => (
            <div
              key={academy.id}
              className="bg-white border border-slate-300/80 rounded-[20px] p-6 shadow-sm hover:shadow-xl hover:border-slate-400 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                    {academy.sport}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getVerificationBadge(
                      academy.verificationStatus
                    )}`}
                  >
                    {academy.verificationStatus}
                  </span>
                </div>

                {/* Academy Name */}
                <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-slate-900 leading-tight">
                  {academy.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {academy.location}
                </p>

                {/* Monthly Fee Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                  <span className="text-xs text-slate-600 font-semibold uppercase">Monthly Tuition</span>
                  <div className="text-xl font-black text-slate-900 font-['Barlow_Condensed']">
                    ₹{academy.monthlyFee}
                    <span className="text-xs font-normal text-slate-500"> / mo</span>
                  </div>
                </div>

                {/* Structured Specs */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start justify-between gap-2 py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Batch Level</span>
                    <span className="font-semibold text-right">{academy.level}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2 py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Schedule</span>
                    <span className="font-semibold text-right">{academy.timings}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2 py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Trial Session</span>
                    <span
                      className={`font-semibold text-right ${
                        academy.trialAvailability === 'Not supplied'
                          ? 'text-slate-400 italic'
                          : 'text-emerald-700 font-bold'
                      }`}
                    >
                      {academy.trialAvailability}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Coach Credentials</span>
                    <span
                      className={`font-semibold text-right ${
                        academy.coachQualification === 'Not supplied'
                          ? 'text-slate-400 italic'
                          : 'text-slate-900'
                      }`}
                    >
                      {academy.coachQualification}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 py-1">
                    <span className="text-slate-500 font-medium">Batch Ratio</span>
                    <span className="font-semibold text-right text-slate-800">{academy.batchSize}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                  Sample academy
                </span>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => handleEnquire(academy)}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Book Demo Trial
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Transparency note at bottom of light section */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Note: Credentials and trial offerings are based on academy submissions. Missing data fields are honestly marked as &quot;Not supplied&quot;.
        </div>
      </div>
    </section>
  );
}
