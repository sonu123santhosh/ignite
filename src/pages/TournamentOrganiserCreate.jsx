import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { getRelativeDate } from '../data/tournamentsData';

export default function TournamentOrganiserCreate({
  sharedTournamentsState,
  setSharedTournamentsState,
  currentDemoUser,
  tournamentRole = 'organiser'
}) {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  // 1. Basic Details
  const [name, setName] = useState('');
  const [sport, setSport] = useState('Football');
  const [participationType, setParticipationType] = useState('team');
  const [description, setDescription] = useState('');

  // 2. Dates & Venue
  const [city, setCity] = useState('Pune');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState(getRelativeDate(14, 9, 0).slice(0, 16));
  const [endDate, setEndDate] = useState(getRelativeDate(16, 18, 0).slice(0, 16));
  const [registrationOpens, setRegistrationOpens] = useState(getRelativeDate(0, 9, 0).slice(0, 16));
  const [registrationDeadline, setRegistrationDeadline] = useState(getRelativeDate(7, 23, 59).slice(0, 16));

  // 3. Format & Capacity
  const [format, setFormat] = useState('single_elimination');
  const [capacity, setCapacity] = useState(8);
  const [teamMin, setTeamMin] = useState(7);
  const [teamMax, setTeamMax] = useState(10);
  const [teamSubs, setTeamSubs] = useState(3);
  const [matchDurationMins, setMatchDurationMins] = useState(50);

  // 4. Fees & Prizes
  const [isFree, setIsFree] = useState(false);
  const [entryFee, setEntryFee] = useState(1500);
  const [feeUnit, setFeeUnit] = useState('per team');
  const [prizePool, setPrizePool] = useState(20000);
  const [firstPrize, setFirstPrize] = useState(12000);
  const [secondPrize, setSecondPrize] = useState(6000);
  const [thirdPrize, setThirdPrize] = useState(2000);
  const [refundPolicy, setRefundPolicy] = useState(
    'Full refund up to 72 hours before draw. 50% refund prior to registration closing.'
  );

  // 5. Eligibility & Rules
  const [minAge, setMinAge] = useState(16);
  const [maxAge, setMaxAge] = useState(35);
  const [collegeOnly, setCollegeOnly] = useState(false);
  const [skill, setSkill] = useState('Open');
  const [docsInput, setDocsInput] = useState('Government Photo ID, Student ID');
  const [rulesInput, setRulesInput] = useState(
    'Standard tournament rules apply.\nMatching team jerseys compulsory.\nReferees decision is final.'
  );

  const steps = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Dates & Venue' },
    { num: 3, label: 'Format' },
    { num: 4, label: 'Fees & Prizes' },
    { num: 5, label: 'Eligibility' },
    { num: 6, label: 'Review' }
  ];

  // Validation function
  const validateStep = (step) => {
    setError('');

    if (step === 1) {
      if (!name.trim()) return 'Tournament Name is required.';
      if (!description.trim()) return 'Please provide a brief event overview.';
    }

    if (step === 2) {
      if (!venue.trim()) return 'Venue Name is required.';
      if (!address.trim()) return 'Address is required.';

      const regOpenD = new Date(registrationOpens);
      const regDeadD = new Date(registrationDeadline);
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      const now = new Date();

      if (regDeadD <= regOpenD) return 'Registration deadline must be after registration opening date.';
      if (startD <= regDeadD) return 'Tournament start date must be after registration deadline.';
      if (endD < startD) return 'Tournament end date cannot be earlier than start date.';
    }

    if (step === 3) {
      if (Number(capacity) < 2) return 'Capacity must be at least 2 teams/competitors.';
      if (participationType === 'team' && Number(teamMin) > Number(teamMax)) {
        return 'Minimum squad size cannot exceed maximum squad size.';
      }
    }

    if (step === 4) {
      if (!isFree && Number(entryFee) < 0) return 'Entry fee cannot be negative.';
      const totalPrizes = Number(firstPrize || 0) + Number(secondPrize || 0) + Number(thirdPrize || 0);
      if (Number(prizePool) > 0 && totalPrizes > Number(prizePool)) {
        return `Sum of prize distribution (₹${totalPrizes}) cannot exceed total prize pool (₹${prizePool}).`;
      }
    }

    if (step === 5) {
      if (Number(minAge) > Number(maxAge)) return 'Minimum age cannot exceed maximum age.';
    }

    return '';
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  // Submit & Save Draft or Publish
  const handleSave = (publish = false) => {
    const err = validateStep(5);
    if (err) {
      setError(err);
      return;
    }

    // Honesty rule: Unverified organisers create listings with 'Pending Verification'
    const newStatus = publish
      ? currentDemoUser?.verified
        ? 'Registration Open'
        : 'Pending Verification'
      : 'Draft';

    const newTournament = {
      id: `tourn-${Date.now()}`,
      name,
      sport,
      organiserId: currentDemoUser?.id || 'user-org-3',
      organiserName: currentDemoUser?.name || 'Apex Sports Club',
      organiserVerified: Boolean(currentDemoUser?.verified),
      city,
      venue,
      address,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      registrationOpens: new Date(registrationOpens).toISOString(),
      registrationDeadline: new Date(registrationDeadline).toISOString(),
      format,
      participationType,
      teamSize: {
        min: Number(teamMin),
        max: Number(teamMax),
        substitutes: Number(teamSubs)
      },
      capacity: Number(capacity),
      entryFee: isFree ? 0 : Number(entryFee),
      feeUnit,
      prizePool: Number(prizePool) || 0,
      prizeDistribution: [
        { rank: 'Champion', amount: Number(firstPrize) || 0, trophy: true },
        { rank: 'Runners-up', amount: Number(secondPrize) || 0, trophy: true },
        { rank: '3rd Place', amount: Number(thirdPrize) || 0, trophy: false }
      ],
      eligibility: {
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        collegeOnly,
        skill,
        documents: docsInput.split(',').map((d) => d.trim()).filter(Boolean)
      },
      rules: rulesInput.split('\n').filter(Boolean),
      refundPolicy,
      contact: {
        email: currentDemoUser?.email || 'contact@tournaments-demo.in',
        phone: currentDemoUser?.phone || '+91 20 2500 0000'
      },
      status: newStatus,
      waitlistEnabled: true,
      isSample: true,
      fixtures: [],
      resultsPublished: false
    };

    setSharedTournamentsState((prev) => ({
      ...prev,
      tournaments: [newTournament, ...prev.tournaments]
    }));

    navigate('/tournaments/organiser');
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-24">
      {/* Header bar */}
      <div className="bg-[#141B24] border-b border-[#293442] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/tournaments/organiser"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discard &amp; Exit</span>
          </Link>
          <span className="text-xs text-[#94A3B8]">
            Publishing as: <strong className="text-white">{currentDemoUser?.name}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Progress Bar */}
        <div className="bg-[#141B24] border border-[#293442] p-4 sm:p-5 rounded-2xl mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            {steps.map((st) => (
              <div key={st.num} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    currentStep > st.num
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C]'
                      : currentStep === st.num
                      ? 'bg-amber-400 text-[#0B0F14] ring-4 ring-amber-400/20'
                      : 'bg-[#1B2530] text-slate-500 border border-[#293442]'
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                    currentStep === st.num ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Basic Details */}
        {currentStep === 1 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-5 shadow-xl">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              1. Basic Tournament Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pune Monsoon Football Championship"
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Sport
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none cursor-pointer"
                  >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Participation Structure
                  </label>
                  <select
                    value={participationType}
                    onChange={(e) => setParticipationType(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none cursor-pointer"
                  >
                    <option value="team">Team / Squad Only</option>
                    <option value="individual">Solo / Individual Only</option>
                    <option value="both">Both (Singles &amp; Doubles)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Description / Event Overview *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your competition, atmosphere, and target participants..."
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Dates & Venue */}
        {currentStep === 2 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-5 shadow-xl">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              2. Dates &amp; Venue
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Venue Facility / Ground Name *
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Shivaji Park Stadium Grounds"
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Complete Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Road, locality, landmark, pincode"
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#293442]">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Registration Opens
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationOpens}
                    onChange={(e) => setRegistrationOpens(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Registration Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Tournament Starts *
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Tournament Ends *
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Format & Capacity */}
        {currentStep === 3 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-5 shadow-xl">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              3. Competition Format &amp; Capacity
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Tournament Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none cursor-pointer"
                  >
                    <option value="single_elimination">Single Elimination (Knockout)</option>
                    <option value="round_robin">Round Robin League</option>
                    <option value="group_knockout">Group Stage + Knockout</option>
                    <option value="league">Full League Season</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Total Entrant Quota (Capacity) *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="64"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              {participationType === 'team' && (
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#293442]">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                      Min Squad Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={teamMin}
                      onChange={(e) => setTeamMin(e.target.value)}
                      className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                      Max Squad Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={teamMax}
                      onChange={(e) => setTeamMax(e.target.value)}
                      className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                      Substitutes Allowed
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={teamSubs}
                      onChange={(e) => setTeamSubs(e.target.value)}
                      className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Fees & Prizes */}
        {currentStep === 4 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-5 shadow-xl">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              4. Entry Fees &amp; Prize Pool
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
                />
                <span className="font-bold text-white">This is a Free Entry Tournament</span>
              </label>

              {!isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                      Entry Fee (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                      Fee Charged
                    </label>
                    <select
                      value={feeUnit}
                      onChange={(e) => setFeeUnit(e.target.value)}
                      className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none cursor-pointer"
                    >
                      <option value="per team">Per Team Squad</option>
                      <option value="per player">Per Player / Competitor</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-[#293442]">
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Total Prize Pool (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">1st Place (₹)</label>
                  <input
                    type="number"
                    value={firstPrize}
                    onChange={(e) => setFirstPrize(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">2nd Place (₹)</label>
                  <input
                    type="number"
                    value={secondPrize}
                    onChange={(e) => setSecondPrize(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] block mb-1">3rd Place (₹)</label>
                  <input
                    type="number"
                    value={thirdPrize}
                    onChange={(e) => setThirdPrize(e.target.value)}
                    className="w-full p-2 bg-[#1B2530] border border-[#293442] rounded-lg text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Refund Policy Terms *
                </label>
                <textarea
                  rows={2}
                  value={refundPolicy}
                  onChange={(e) => setRefundPolicy(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Eligibility & Rules */}
        {currentStep === 5 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-5 shadow-xl">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              5. Eligibility &amp; Competition Rules
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Maximum Age
                  </label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={collegeOnly}
                  onChange={(e) => setCollegeOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
                />
                <span className="font-bold text-white">College-Only Tournament (Requires College Student ID verification)</span>
              </label>

              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Required Verification Documents (comma separated)
                </label>
                <input
                  type="text"
                  value={docsInput}
                  onChange={(e) => setDocsInput(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Official Match Rules (one per line)
                </label>
                <textarea
                  rows={3}
                  value={rulesInput}
                  onChange={(e) => setRulesInput(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Publish */}
        {currentStep === 6 && (
          <div className="bg-[#141B24] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              6. Review &amp; Submit Tournament
            </h2>

            <div className="p-4 bg-[#1B2530] border border-[#293442] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Tournament:</span>
                <span className="font-bold text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Sport &amp; Format:</span>
                <span className="font-semibold text-white">{sport} &bull; {format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Venue:</span>
                <span className="text-white">{venue}, {city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Entry Fee:</span>
                <span className="font-bold text-[#E5C378]">{isFree ? 'FREE' : `₹${entryFee} ${feeUnit}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Prize Pool:</span>
                <span className="font-bold text-amber-400">₹{prizePool}</span>
              </div>
            </div>

            {/* Unverified Organiser Notice */}
            {!currentDemoUser?.verified && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-start gap-3 text-xs text-amber-300">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Honesty Notice:</strong> Since your organiser account is currently unverified, publishing will set this tournament&apos;s status to <strong>&quot;Pending Verification&quot;</strong>. It will be reviewed before full public activation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
              currentStep === 1 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'bg-[#1B2530] text-white hover:bg-slate-700'
            }`}
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2.5 rounded-xl bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] text-xs font-semibold"
            >
              Save as Draft
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-amber-300 flex items-center gap-1.5 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Tournament</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
