import React, { useState } from 'react';
import { X, Award, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export default function AddProgrammeModal({ academy, onClose }) {
  const { coaches, createProgramme } = useCoaching();

  // Coaches available for this academy
  const academyCoaches = coaches.filter((c) => c.academyId === academy.id);

  const [name, setName] = useState('');
  const [sport, setSport] = useState(academy.sports[0] || 'Cricket');
  const [coachId, setCoachId] = useState(academyCoaches[0]?.id || '');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [ageEligibility, setAgeEligibility] = useState('12 to 20 years');
  const [duration, setDuration] = useState('3 Months');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('3');
  const [sessionLengthMinutes, setSessionLengthMinutes] = useState('90');
  const [monthlyFee, setMonthlyFee] = useState('4500');
  const [perSessionFee, setPerSessionFee] = useState('400');
  const [enrolmentCapacity, setEnrolmentCapacity] = useState('20');
  const [venue, setVenue] = useState('Main Training Pitch / Court');
  const [equipmentRequirements, setEquipmentRequirements] = useState('Standard sports kit and personal footwear.');
  const [description, setDescription] = useState('');
  const [trialAvailable, setTrialAvailable] = useState(true);
  const [trialFee, setTrialFee] = useState('0');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (Number(monthlyFee) < 0) {
      setErrorMsg('Monthly fee cannot be a negative amount.');
      return;
    }
    if (Number(enrolmentCapacity) <= 0) {
      setErrorMsg('Total enrolment capacity must be at least 1.');
      return;
    }

    const assignedCoach = coaches.find((c) => c.id === coachId);

    const res = createProgramme({
      academyId: academy.id,
      name,
      sport,
      coachId,
      coachName: assignedCoach ? assignedCoach.name : 'Academy Head Coach',
      skillLevel,
      ageEligibility,
      duration,
      sessionsPerWeek: Number(sessionsPerWeek),
      sessionLengthMinutes: Number(sessionLengthMinutes),
      monthlyFee: Number(monthlyFee),
      perSessionFee: Number(perSessionFee),
      enrolmentCapacity: Number(enrolmentCapacity),
      venue,
      equipmentRequirements,
      description,
      trialAvailable,
      trialFee: Number(trialFee)
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create programme');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-[#293442] flex items-center justify-between bg-[#1B2530]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Training Programme</h2>
              <p className="text-xs text-gray-400">{academy.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#293442]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-gray-300">Programme Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Weekend High-Performance Bowling Clinic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-[#B6FF3B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Sport *</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              >
                {academy.sports.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Assigned Coach *</label>
              <select
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              >
                {academyCoaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.sport})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Target Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Competitive">Competitive</option>
                <option value="Professional development">Professional development</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Age Eligibility</label>
              <input
                type="text"
                placeholder="e.g. 10 to 18 years"
                value={ageEligibility}
                onChange={(e) => setAgeEligibility(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Monthly Fee (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Per Session (₹)</label>
              <input
                type="number"
                min="0"
                value={perSessionFee}
                onChange={(e) => setPerSessionFee(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Max Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={enrolmentCapacity}
                onChange={(e) => setEnrolmentCapacity(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Sessions per Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-300">Session Length (Minutes)</label>
              <input
                type="number"
                min="30"
                step="15"
                value={sessionLengthMinutes}
                onChange={(e) => setSessionLengthMinutes(e.target.value)}
                className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-300">Venue / Specific Court</label>
            <input
              type="text"
              placeholder="e.g. Indoor Turf Net 1 / Court 3"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-300">Programme Description</label>
            <textarea
              rows={2}
              placeholder="Summary of training curriculum, biomechanics, drills, and student outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0B0F14] border border-[#293442] rounded-xl p-2.5 text-white"
            />
          </div>

          {/* Trial availability */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#293442]">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300">
              <input
                type="checkbox"
                checked={trialAvailable}
                onChange={(e) => setTrialAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-[#B6FF3B]"
              />
              <span>Allow Athletes to Book Trial Class</span>
            </label>
            {trialAvailable && (
              <input
                type="number"
                min="0"
                placeholder="Trial Fee (0 = Free)"
                value={trialFee}
                onChange={(e) => setTrialFee(e.target.value)}
                className="w-28 bg-[#0B0F14] border border-[#293442] rounded-lg p-1.5 text-center text-white"
              />
            )}
          </div>

          <div className="pt-4 border-t border-[#293442] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#1B2530] text-gray-300 font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#B6FF3B] text-black font-extrabold hover:bg-[#a5ef28] shadow-md">
              Create Programme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
