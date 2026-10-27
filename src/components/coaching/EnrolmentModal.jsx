import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  Users,
  Sparkles
} from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export default function EnrolmentModal({
  academy,
  initialProgramme,
  onClose
}) {
  const { programmes, batches, coaches, enrolInProgramme, activeUser } = useCoaching();

  // Programmes for this academy
  const academyProgrammes = programmes.filter((p) => p.academyId === academy.id);
  const [selectedProgId, setSelectedProgId] = useState(initialProgramme?.id || academyProgrammes[0]?.id || '');
  const currentProg = programmes.find((p) => p.id === selectedProgId) || academyProgrammes[0];

  // Batches for this programme
  const progBatches = batches.filter((b) => b.programmeId === currentProg?.id);
  const [selectedBatchId, setSelectedBatchId] = useState(progBatches[0]?.id || '');
  const activeBatch = batches.find((b) => b.id === selectedBatchId) || progBatches[0];

  // Stepper state
  const [step, setStep] = useState(1); // 1: Batch & Terms, 2: Participant Info, 3: Review & Payment, 4: Done

  // Form fields
  const [participantName, setParticipantName] = useState(activeUser?.name || '');
  const [age, setAge] = useState(activeUser?.age || '18');
  const [phone, setPhone] = useState(activeUser?.phone || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [parentContact, setParentContact] = useState('');
  const [paymentOption, setPaymentOption] = useState('pay_later'); // 'pay_later' | 'demo_upi'
  const [createdEnrolment, setCreatedEnrolment] = useState(null);

  const availableSeats = activeBatch ? Math.max(0, activeBatch.capacity - activeBatch.enrolledCount) : 0;
  const isBatchFull = availableSeats === 0;
  const isMinor = Number(age) < 18;

  const handleConfirmEnrolment = (e) => {
    e.preventDefault();
    const res = enrolInProgramme({
      academyId: academy.id,
      academyName: academy.name,
      programmeId: currentProg?.id,
      programmeName: currentProg?.name,
      batchId: activeBatch?.id,
      batchName: activeBatch?.name,
      batchDays: `${activeBatch?.days?.join(', ')} (${activeBatch?.startTime} - ${activeBatch?.endTime})`,
      coachId: currentProg?.coachId,
      coachName: currentProg?.coachName,
      feeMonthly: currentProg?.monthlyFee,
      participantName,
      age,
      phone,
      email,
      parentContact: isMinor ? parentContact : ''
    });

    if (res.success) {
      setCreatedEnrolment(res.enrolment);
      setStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-[#293442] flex items-center justify-between bg-[#1B2530]/50">
          <div>
            <div className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {step} of 3 • Programme Enrolment</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {currentProg?.name || 'Enrol in Training'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#293442]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Select Batch & Review Capacity */}
          {step === 1 && (
            <div className="space-y-5">
              {academyProgrammes.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Select Programme
                  </label>
                  <select
                    value={selectedProgId}
                    onChange={(e) => {
                      setSelectedProgId(e.target.value);
                      const matching = batches.filter((b) => b.programmeId === e.target.value);
                      if (matching.length > 0) setSelectedBatchId(matching[0].id);
                    }}
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
                  >
                    {academyProgrammes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} • ₹{p.monthlyFee.toLocaleString('en-IN')}/mo
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Batch Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Select Training Batch
                </label>
                {progBatches.length === 0 ? (
                  <div className="p-4 bg-[#0B0F14] rounded-xl text-xs text-gray-400 border border-[#293442]">
                    No active batches configured for this programme yet. Please check back soon or contact the academy.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {progBatches.map((b) => {
                      const isSelected = activeBatch?.id === b.id;
                      const free = Math.max(0, b.capacity - b.enrolledCount);
                      const isFull = free === 0;

                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBatchId(b.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1B2530] border-[#00D4FF] shadow-md'
                              : 'bg-[#0B0F14] border-[#293442] hover:border-slate-500'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-2">
                              <span>{b.name}</span>
                              {isFull ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                  Full (Waitlist Available)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#B6FF3B]/15 text-[#B6FF3B] border border-[#B6FF3B]/30 font-mono">
                                  {free} Seats Left
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                              <span>{b.days.join(', ')}</span>
                              <span>•</span>
                              <span>{b.startTime} – {b.endTime}</span>
                              <span>•</span>
                              <span>Coach: {b.coachName}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-gray-300 font-mono">
                              {b.enrolledCount} / {b.capacity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isBatchFull && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Notice:</strong> This batch is currently full. Submitting this application will place you on the academy’s official <strong>Waitlist</strong>. The academy owner will notify you as soon as a seat opens.
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!activeBatch}
                  className="w-full py-2.5 rounded-xl bg-[#00D4FF] text-black font-bold text-xs hover:bg-[#00c2e6] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>Continue to Participant Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Participant Info */}
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
                  <label className="text-xs font-bold text-gray-300">Age</label>
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
                  <label className="text-xs font-bold text-gray-300">Contact Mobile</label>
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
                    <span>Parent / Guardian Contact (Compulsory for Minors)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    placeholder="Parent's phone number or email"
                    className="w-full bg-[#0B0F14] border border-[#293442] rounded-lg p-2 text-xs text-white"
                  />
                </div>
              )}

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
                  className="px-5 py-2 rounded-xl bg-[#00D4FF] text-black font-bold text-xs disabled:opacity-50"
                >
                  Review Terms & Fees
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review Fees & Payment Preference */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0B0F14] border border-[#293442] rounded-xl space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#293442] pb-2">
                  <span className="text-gray-400">Programme:</span>
                  <span className="font-bold text-white">{currentProg?.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#293442] pb-2">
                  <span className="text-gray-400">Batch:</span>
                  <span className="font-semibold text-[#00D4FF]">{activeBatch?.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#293442] pb-2">
                  <span className="text-gray-400">Schedule:</span>
                  <span className="text-gray-200">{activeBatch?.days?.join(', ')} ({activeBatch?.startTime} - {activeBatch?.endTime})</span>
                </div>
                <div className="flex justify-between border-b border-[#293442] pb-2">
                  <span className="text-gray-400">Required Kit:</span>
                  <span className="text-gray-300 max-w-[240px] text-right truncate">{currentProg?.equipmentRequirements}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-white text-sm">Monthly Subscription Fee:</span>
                  <span className="text-base font-extrabold text-[#B6FF3B]">
                    ₹{currentProg?.monthlyFee?.toLocaleString('en-IN')} / month
                  </span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Select Payment Preference (Demo Flow)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('pay_later')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentOption === 'pay_later'
                        ? 'bg-[#1B2530] border-[#00D4FF] text-white'
                        : 'bg-[#0B0F14] border-[#293442] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Pay at Academy</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Settle after batch verification</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('demo_upi')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentOption === 'demo_upi'
                        ? 'bg-[#1B2530] border-[#B6FF3B] text-white'
                        : 'bg-[#0B0F14] border-[#293442] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#B6FF3B]">Demo UPI / Gateway</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Simulate digital payment invoice</div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-gray-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEnrolment}
                  className="px-6 py-2.5 rounded-xl bg-[#B6FF3B] text-black font-extrabold text-xs hover:bg-[#a5ef28] shadow-lg cursor-pointer"
                >
                  Submit Enrolment Application
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF] text-[#00D4FF] flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">
                  {createdEnrolment?.enrolmentStatus === 'Waitlisted' ? 'Added to Official Waitlist!' : 'Application Submitted!'}
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {createdEnrolment?.enrolmentStatus === 'Waitlisted'
                    ? 'Because this batch is at capacity, your spot is waitlisted. The academy owner will notify you if a student withdraws.'
                    : `Your enrolment request is under review with ${academy.name}. The owner will approve your seat within 24 hours.`}
                </p>
              </div>

              {createdEnrolment && (
                <div className="bg-[#0B0F14] border border-[#293442] rounded-xl p-3.5 text-xs text-left max-w-sm mx-auto space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enrolment ID:</span>
                    <span className="text-white font-bold">{createdEnrolment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enrolment Status:</span>
                    <span className="text-[#00D4FF] font-bold">{createdEnrolment.enrolmentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="text-amber-400 font-bold">{createdEnrolment.paymentStatus}</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-[#1B2530] text-white border border-[#293442] hover:bg-[#222f3d] text-xs font-bold"
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
