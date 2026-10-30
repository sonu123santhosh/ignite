import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, Users } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export default function AddBatchModal({ academy, initialProgramme, onClose }) {
  const { programmes, coaches, createBatch } = useCoaching();

  const academyProgrammes = programmes.filter((p) => p.academyId === academy.id);
  const academyCoaches = coaches.filter((c) => c.academyId === academy.id);

  const [programmeId, setProgrammeId] = useState(initialProgramme?.id || academyProgrammes[0]?.id || '');
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
  const [startTime, setStartTime] = useState('06:30');
  const [endTime, setEndTime] = useState('08:00');
  const [coachId, setCoachId] = useState(initialProgramme?.coachId || academyCoaches[0]?.id || '');
  const [venue, setVenue] = useState(initialProgramme?.venue || 'Court 1');
  const [capacity, setCapacity] = useState('16');
  const [conflictError, setConflictError] = useState('');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (d) => {
    setSelectedDays((prev) =>
      prev.includes(d)
        ? prev.length > 1 ? prev.filter((day) => day !== d) : prev
        : [...prev, d]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConflictError('');

    if (startTime >= endTime) {
      setConflictError('End time must be after start time.');
      return;
    }

    const assignedCoach = coaches.find((c) => c.id === coachId);

    const res = createBatch({
      programmeId,
      academyId: academy.id,
      name: name.trim() || `${startTime} Batch`,
      days: selectedDays,
      startTime,
      endTime,
      coachId,
      coachName: assignedCoach ? assignedCoach.name : 'Coach',
      venue,
      capacity: Number(capacity)
    });

    if (res.success) {
      onClose();
    } else {
      setConflictError(res.error || 'Schedule conflict encountered');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0d15]/95 border border-red-500/30 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Calendar className="w-5 h-5 text-red-500" />
            <span>Create New Batch Schedule</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {conflictError && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{conflictError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-gray-300">Target Programme *</label>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
            >
              {academyProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sport})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-300">Batch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Early Morning Pace Squad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Days selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-300">Recurring Training Days *</label>
            <div className="flex flex-wrap gap-1.5">
              {weekDays.map((d) => {
                const isSelected = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-10 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                        : 'bg-[#08050c] text-gray-400 border border-red-500/20 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Capacity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Capacity (Seats)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Assign Coach *</label>
              <select
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2 text-white focus:outline-none focus:border-red-500"
              >
                {academyCoaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-300">Venue / Pitch</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#08050c] border border-red-500/20 rounded-xl p-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-red-500/20 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#140e18] text-gray-300 border border-red-500/20 hover:text-white font-semibold cursor-pointer transition-all">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold hover:shadow-[0_4px_18px_rgba(220,38,38,0.5)] border border-red-500/40 cursor-pointer transition-all">
              Save Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
