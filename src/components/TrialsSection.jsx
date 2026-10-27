import React, { useState, useMemo } from 'react';
import { Compass, Calendar, MapPin, Award, Clock, Filter, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import Card from './Card';
import { SAMPLE_TRIALS, SPORTS_OPTIONS } from '../data/sampleData';

export default function TrialsSection({ onShowToast }) {
  const [sportFilter, setSportFilter] = useState('All');
  const [feeType, setFeeType] = useState('all'); // 'all', 'free', 'paid'
  const [locationQuery, setLocationQuery] = useState('');

  const filteredTrials = useMemo(() => {
    return SAMPLE_TRIALS.filter((trial) => {
      const matchSport = sportFilter === 'All' || trial.sport.toLowerCase() === sportFilter.toLowerCase();
      const matchLocation =
        !locationQuery.trim() ||
        trial.location.toLowerCase().includes(locationQuery.trim().toLowerCase());

      const isFree = trial.fee.toLowerCase().includes('free');
      let matchFee = true;
      if (feeType === 'free') matchFee = isFree;
      if (feeType === 'paid') matchFee = !isFree;

      return matchSport && matchLocation && matchFee;
    });
  }, [sportFilter, feeType, locationQuery]);

  const handleApply = (trial) => {
    onShowToast({
      title: `Trial Application: ${trial.name}`,
      message: `Eligibility requirements noted for ${trial.ageEligibility}. Free/Entry fee status: ${trial.fee}. (Demo simulation)`,
      type: 'info',
      isDemo: true
    });
  };

  const handleReset = () => {
    setSportFilter('All');
    setFeeType('all');
    setLocationQuery('');
  };

  const getVerificationBadge = (status) => {
    if (status.includes('Verified')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (status.includes('Pending')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-slate-700 text-slate-300 border-slate-600';
  };

  return (
    <section id="trials" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        tag="Athlete Scouting &amp; Camps"
        title="Your Next Opportunity Could Start Here."
        subtitle="Selection camps, state team scouting, and college athletic scholarship trials. All listings represent demonstration content."
        action={
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              handleReset();
              onShowToast({
                title: 'All Scout Trials (Demo)',
                message: 'Displaying all current regional trial listings.',
                type: 'info',
                isDemo: true
              });
            }}
          >
            Explore All Trials
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-[#131a2b] border border-[#2a3652] rounded-2xl p-4 sm:p-5 mb-8">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-[#c6ff3d]">
          <Filter className="w-4 h-4" />
          <span>Filter Selection Camps</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Sport Filter */}
          <div>
            <label htmlFor="trial-sport-filter" className="block text-xs font-semibold text-slate-300 mb-1">
              Sport
            </label>
            <select
              id="trial-sport-filter"
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="w-full bg-[#172033] border border-[#2a3652] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] cursor-pointer"
            >
              <option value="All">All Sports</option>
              {SPORTS_OPTIONS.filter((s) => s !== 'All Sports').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Fee Filter: Free vs Paid */}
          <div>
            <label htmlFor="trial-fee-filter" className="block text-xs font-semibold text-slate-300 mb-1">
              Entry Type
            </label>
            <select
              id="trial-fee-filter"
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full bg-[#172033] border border-[#2a3652] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d] cursor-pointer"
            >
              <option value="all">All Trials (Free &amp; Paid)</option>
              <option value="free">Free Entry Only</option>
              <option value="paid">Paid Evaluation Camp</option>
            </select>
          </div>

          {/* Location Query */}
          <div>
            <label htmlFor="trial-loc-filter" className="block text-xs font-semibold text-slate-300 mb-1">
              Location Filter
            </label>
            <input
              id="trial-loc-filter"
              type="text"
              placeholder="e.g. Bengaluru, Hyderabad"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full bg-[#172033] border border-[#2a3652] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d]"
            />
          </div>
        </div>
      </div>

      {/* Trials Grid */}
      {filteredTrials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
          {filteredTrials.map((trial) => (
            <Card
              key={trial.id}
              className="flex flex-col justify-between group hover:border-[#c6ff3d] p-6 bg-[#172033] relative"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c6ff3d] bg-[#c6ff3d]/10 px-2.5 py-0.5 rounded-full border border-[#c6ff3d]/25">
                    {trial.sport}
                  </span>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getVerificationBadge(
                      trial.verificationStatus
                    )}`}
                  >
                    {trial.verificationStatus}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-['Barlow_Condensed'] text-2xl font-black text-white group-hover:text-[#c6ff3d] transition-colors leading-tight">
                  {trial.name}
                </h3>

                {/* Organiser */}
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Organised by: <span className="text-slate-200">{trial.organiser}</span>
                </p>

                {/* Structured Details */}
                <div className="space-y-2 mt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{trial.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Camp Date: <strong className="text-white">{trial.date}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Registration Closes: <strong className="text-slate-200">{trial.registrationDeadline}</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-[#2a3652]/70">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-300">
                      <strong>Age Criteria:</strong> {trial.ageEligibility}
                    </span>
                  </div>
                </div>

                {/* Highlight fee and quota box */}
                <div className="mt-4 p-3 rounded-xl bg-[#0a1020]/70 border border-[#2a3652] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Camp Fee
                    </span>
                    <div className="text-sm font-bold text-[#c6ff3d] font-['Barlow_Condensed'] text-base">
                      {trial.fee}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Scouting Quota
                    </span>
                    <div className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                      {trial.spotsQuota}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[#2a3652] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Demo content
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApply(trial)}
                >
                  Apply for Trial (Demo)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#172033] border border-[#2a3652] rounded-2xl p-10 text-center max-w-lg mx-auto" aria-live="polite">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
            No Trials Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            No demonstration trials match your current selection ({sportFilter}, {feeType} fee).
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="primary" size="sm" onClick={handleReset}>
              Reset Trial Filters
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
