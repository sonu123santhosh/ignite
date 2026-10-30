import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export default function BookTrialModal({
  academy,
  onClose,
  initialProgrammeId = null
}) {
  const { programmes, coaches, bookTrialSession, activeUser } = useCoaching();

  // Filter programmes for this academy
  const academyProgrammes = programmes.filter((p) => p.academyId === academy.id && p.trialAvailable);
  const selectedProg = programmes.find((p) => p.id === (initialProgrammeId || academyProgrammes[0]?.id)) || academyProgrammes[0];

  // Stepper state (1: Select Details, 2: Participant Info, 3: Review & Confirm, 4: Success)
  const [step, setStep] = useState(1);

  // Form fields
  const [chosenProgId, setChosenProgId] = useState(selectedProg?.id || '');
  const [trialDate, setTrialDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [trialTime, setTrialTime] = useState('06:30');
  const [participantName, setParticipantName] = useState(activeUser?.name || '');
  const [age, setAge] = useState(activeUser?.age || '18');
  const [phone, setPhone] = useState(activeUser?.phone || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [experienceLevel, setExperienceLevel] = useState(activeUser?.skillLevel || 'Beginner');
  const [goals, setGoals] = useState('Improve basic technique and evaluate batch fit.');
  const [parentContact, setParentContact] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);

  const activeProg = programmes.find((p) => p.id === chosenProgId) || academyProgrammes[0];
  const assignedCoach = coaches.find((c) => c.id === activeProg?.coachId);

  const isMinor = Number(age) < 18;
  const trialFee = activeProg ? activeProg.trialFee : academy.trialFee;

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    const result = bookTrialSession({
      academyId: academy.id,
      academyName: academy.name,
      programmeId: activeProg?.id || null,
      programmeName: activeProg?.name || `${academy.sports[0]} Trial Session`,
      coachId: assignedCoach?.id || null,
      coachName: assignedCoach?.name || 'Academy Coach',
      date: trialDate,
      time: trialTime,
      fee: trialFee,
      participantName,
      age,
      phone,
      email,
      experienceLevel,
      goals,
      parentContact: isMinor ? parentContact : ''
    });

    if (result.success) {
      setCreatedBooking(result.booking);
      setStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c0d15] border border-red-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-red-500/20 flex items-center justify-between bg-[#140e18]/80">
          <div>
            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {step} of 3 • Book Trial Session</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {academy.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-red-950/40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Select Programme, Date & Slot */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Select Training Programme
                </label>
                <select
                  value={chosenProgId}
                  onChange={(e) => setChosenProgId(e.target.value)}
                  className="w-full bg-[#08050c] border border-red-500/25 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {academyProgrammes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sport}) • {p.trialFee === 0 ? 'Free Trial' : `₹${p.trialFee}`}
                    </option>
                  ))}
                </select>
              </div>

              {activeProg && (
                <div className="p-3.5 bg-[#08050c] border border-red-500/20 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assigned Coach:</span>
                    <span className="text-white font-semibold">{activeProg.coachName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skill Level:</span>
                    <span className="text-red-400 font-semibold">{activeProg.skillLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age Requirement:</span>
                    <span className="text-gray-200">{activeProg.ageEligibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Venue:</span>
                    <span className="text-gray-200">{activeProg.venue}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Trial Date
                  </label>
                  <input
                    type="date"
                    value={trialDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setTrialDate(e.target.value)}
                    className="w-full bg-[#08050c] border border-red-500/25 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Available Time Slot
                  </label>
                  <select
                    value={trialTime}
                    onChange={(e) => setTrialTime(e.target.value)}
                    className="w-full bg-[#08050c] border border-red-500/25 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="06:30">06:30 AM (Morning Conditioning)</option>
                    <option value="08:00">08:00 AM (Technical Drills)</option>
                    <option value="16:30">04:30 PM (Youth Batch Slot)</option>
                    <option value="17:30">05:30 PM (Senior Batch Slot)</option>
                    <option value="18:30">06:30 PM (Evening Game Play)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs hover:shadow-[0_4px_16px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Participant Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Participant Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Participant Full Name</label>
                  <input
                    type="text"
                    required
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="e.g. Aryan Salunke"
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Participant Age</label>
                  <input
                    type="number"
                    required
                    min="4"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98220 00000"
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@domain.com"
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              {isMinor && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Parent / Guardian Contact (Required for minors under 18)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    placeholder="Parent's mobile number or email"
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-lg p-2 text-xs text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Previous Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="Beginner">Beginner (No formal training yet)</option>
                  <option value="Intermediate">Intermediate (1-2 years school/club play)</option>
                  <option value="Advanced">Advanced (Varsity / State tournament player)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Training Goals for Trial</label>
                <textarea
                  rows={2}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Want to assess my backhand drive and stamina..."
                  className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-xs text-white placeholder-gray-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-gray-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!participantName || !phone || (isMinor && !parentContact)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs hover:shadow-[0_4px_16px_rgba(220,38,38,0.5)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#08050c] border border-red-500/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-red-500/15 pb-2">
                  <span className="text-xs text-gray-400">Academy:</span>
                  <span className="font-bold text-white text-sm">{academy.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-red-500/15 pb-2">
                  <span className="text-xs text-gray-400">Programme:</span>
                  <span className="font-bold text-red-400 text-sm">{activeProg?.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-red-500/15 pb-2">
                  <span className="text-xs text-gray-400">Date & Slot:</span>
                  <span className="font-semibold text-white text-xs">{trialDate} at {trialTime}</span>
                </div>
                <div className="flex items-center justify-between border-b border-red-500/15 pb-2">
                  <span className="text-xs text-gray-400">Participant:</span>
                  <span className="text-gray-200 text-xs">{participantName} ({age} yrs)</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-white">Trial Fee:</span>
                  <span className="text-base font-extrabold text-red-400">
                    {trialFee === 0 ? 'FREE TRIAL' : `₹${trialFee}`}
                  </span>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="bg-[#140e18] border border-red-500/20 rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>Prototype Booking Flow</span>
                </div>
                <p>
                  This is a front-end simulation. Your request is registered under your demo profile and visible in the Academy Owner’s Trial Bookings queue.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-[#140e18] text-gray-300 border border-red-500/20 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-xs hover:shadow-[0_4px_18px_rgba(220,38,38,0.5)] shadow-lg cursor-pointer transition-all"
                >
                  Confirm Trial Booking
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">Trial Session Requested!</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Your trial request has been submitted to <span className="text-white font-semibold">{academy.name}</span>. The head coach will confirm your arrival on {trialDate}.
                </p>
              </div>

              {createdBooking && (
                <div className="bg-[#08050c] border border-red-500/25 rounded-xl p-3.5 text-xs text-left max-w-sm mx-auto space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking ID:</span>
                    <span className="text-red-400 font-bold">{createdBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-red-400 font-bold">{createdBooking.status}</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs hover:shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                >
                  Close & View in My Training
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
