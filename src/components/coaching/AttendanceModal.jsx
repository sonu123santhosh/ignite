import React, { useState } from 'react';
import { X, CheckCircle, Clock, XCircle, FileText, UserCheck } from 'lucide-react';
import { useCoaching } from '../../context/CoachingContext';

export default function AttendanceModal({ academy, batch, programme, onClose }) {
  const { enrolments, recordAttendance, activeUser } = useCoaching();

  // Find enrolled active students in this batch or programme
  const enrolledStudents = enrolments.filter(
    (e) => (e.batchId === batch?.id || e.programmeId === programme?.id) && (e.enrolmentStatus === 'Active' || e.enrolmentStatus === 'Approved')
  );

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentStatus, setStudentStatus] = useState(() => {
    const map = {};
    enrolledStudents.forEach((s) => {
      map[s.athleteId] = { status: 'Present', notes: '' };
    });
    return map;
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleStatusChange = (athleteId, status) => {
    setStudentStatus((prev) => ({
      ...prev,
      [athleteId]: { ...prev[athleteId], status }
    }));
  };

  const handleNotesChange = (athleteId, notes) => {
    setStudentStatus((prev) => ({
      ...prev,
      [athleteId]: { ...prev[athleteId], notes }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const records = enrolledStudents.map((s) => ({
      studentId: s.athleteId,
      studentName: s.athleteName,
      status: studentStatus[s.athleteId]?.status || 'Present',
      notes: studentStatus[s.athleteId]?.notes || ''
    }));

    recordAttendance({
      academyId: academy.id,
      programmeId: programme?.id || batch?.programmeId,
      batchId: batch?.id,
      date,
      sessionName: batch ? `${batch.name} (${batch.startTime})` : 'Training Session',
      coachName: activeUser?.name || 'Head Coach',
      records
    });

    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0d15]/95 border border-red-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-red-500/20 flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Record Session Attendance</h2>
              <p className="text-xs text-gray-400">
                {batch?.name || 'Batch'} • {programme?.name || academy.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-red-950/40 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <div className="flex items-center justify-between gap-4 bg-[#08050c] border border-red-500/20 p-3 rounded-xl">
            <div>
              <label className="text-[11px] font-bold text-red-300 uppercase">Session Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block bg-transparent text-white font-bold text-sm focus:outline-none mt-0.5"
              />
            </div>
            <div className="text-right">
              <span className="text-gray-400">Roster:</span>
              <span className="text-red-400 font-bold ml-1">{enrolledStudents.length} Students</span>
            </div>
          </div>

          {/* Student list */}
          {enrolledStudents.length === 0 ? (
            <div className="text-center py-8 bg-[#08050c] rounded-xl border border-red-500/20 text-gray-400 space-y-1">
              <p className="font-semibold text-white">No Enrolled Students</p>
              <p className="text-[11px]">There are no active student enrolments in this batch yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledStudents.map((s) => {
                const current = studentStatus[s.athleteId] || { status: 'Present', notes: '' };

                return (
                  <div
                    key={s.id}
                    className="p-3.5 bg-[#08050c] border border-red-500/20 rounded-xl space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-white text-sm">{s.athleteName}</div>
                        <div className="text-[11px] text-gray-400">
                          Age: {s.athleteAge} • Enrolled: {s.submittedOn}
                        </div>
                      </div>

                      {/* Status Buttons */}
                      <div className="inline-flex p-1 bg-[#140e18] border border-red-500/20 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.athleteId, 'Present')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            current.status === 'Present'
                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.athleteId, 'Absent')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            current.status === 'Absent'
                              ? 'bg-red-950 text-red-300 shadow-sm border border-red-500/30'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.athleteId, 'Excused')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            current.status === 'Excused'
                              ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </div>

                    {/* Private internal coaching note */}
                    <div>
                      <input
                        type="text"
                        placeholder="Private coach note: e.g. Executed clean front foot drive; needs work on high release..."
                        value={current.notes || ''}
                        onChange={(e) => handleNotesChange(s.athleteId, e.target.value)}
                        className="w-full bg-[#140e18] border border-red-500/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-red-500/20 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              Private records: Coaching notes are confidential and visible to academy staff only.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#140e18] text-gray-300 border border-red-500/20 hover:text-white font-semibold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={enrolledStudents.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold hover:shadow-[0_4px_18px_rgba(220,38,38,0.5)] border border-red-500/40 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSaved ? 'Saved Successfully!' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
