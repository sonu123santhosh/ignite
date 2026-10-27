import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_PERSONAS,
  INITIAL_ACADEMIES,
  INITIAL_COACHES,
  INITIAL_PROGRAMMES,
  INITIAL_BATCHES,
  INITIAL_TRIAL_BOOKINGS,
  INITIAL_ENROLMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_REVIEWS,
  storageWrapper
} from '../data/coachingData';

const STORAGE_KEY = 'sportlink_coaching_demo_v1';

const CoachingContext = createContext(null);

export function CoachingProvider({ children }) {
  const stored = storageWrapper.get(STORAGE_KEY, null);

  const [role, setRole] = useState(stored?.role || 'player'); // 'player' | 'owner'
  const [activeUser, setActiveUser] = useState(
    stored?.activeUser || DEMO_PERSONAS[0] // Aryan Salunke (Athlete) default
  );

  const [academies, setAcademies] = useState(stored?.academies || INITIAL_ACADEMIES);
  const [coaches, setCoaches] = useState(stored?.coaches || INITIAL_COACHES);
  const [programmes, setProgrammes] = useState(stored?.programmes || INITIAL_PROGRAMMES);
  const [batches, setBatches] = useState(stored?.batches || INITIAL_BATCHES);
  const [trialBookings, setTrialBookings] = useState(stored?.trialBookings || INITIAL_TRIAL_BOOKINGS);
  const [enrolments, setEnrolments] = useState(stored?.enrolments || INITIAL_ENROLMENTS);
  const [attendance, setAttendance] = useState(stored?.attendance || INITIAL_ATTENDANCE);
  const [payments, setPayments] = useState(stored?.payments || INITIAL_PAYMENTS);
  const [reviews, setReviews] = useState(stored?.reviews || INITIAL_REVIEWS);
  const [favourites, setFavourites] = useState(stored?.favourites || ['acad-1', 'acad-3']);
  const [notifications, setNotifications] = useState(stored?.notifications || [
    { id: 'notif-1', message: 'Your booking for Elite Cricket Academy trial is confirmed for tomorrow.', date: 'Today' },
    { id: 'notif-2', message: 'Coach Vikram Rathore updated the morning schedule for Fast Bowling Clinic.', date: 'Yesterday' }
  ]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Persist state changes
  useEffect(() => {
    storageWrapper.set(STORAGE_KEY, {
      role,
      activeUser,
      academies,
      coaches,
      programmes,
      batches,
      trialBookings,
      enrolments,
      attendance,
      payments,
      reviews,
      favourites,
      notifications
    });
  }, [role, activeUser, academies, coaches, programmes, batches, trialBookings, enrolments, attendance, payments, reviews, favourites, notifications]);

  // Synchronise persona when role is switched
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'player' && activeUser.role !== 'player') {
      setActiveUser(DEMO_PERSONAS[0]); // Aryan Salunke
    } else if (newRole === 'owner' && activeUser.role !== 'owner') {
      setActiveUser(DEMO_PERSONAS[2]); // Coach Vikram Rathore
    }
  };

  // --- ATHLETE ACTIONS ---

  // 1. Book Trial Class
  const bookTrialSession = (bookingData) => {
    const newBooking = {
      id: `tb-${Date.now()}`,
      athleteId: activeUser?.id || 'guest-athlete',
      athleteName: bookingData.participantName || activeUser?.name || 'Athlete',
      athletePhone: bookingData.phone || activeUser?.phone || '',
      athleteEmail: bookingData.email || activeUser?.email || '',
      athleteAge: Number(bookingData.age) || 18,
      academyId: bookingData.academyId,
      academyName: bookingData.academyName,
      programmeId: bookingData.programmeId,
      programmeName: bookingData.programmeName,
      coachId: bookingData.coachId || null,
      coachName: bookingData.coachName || 'Academy Coach',
      date: bookingData.date,
      time: bookingData.time,
      fee: Number(bookingData.fee) || 0,
      isFree: Number(bookingData.fee) === 0,
      status: 'Pending', // Awaiting owner confirmation
      goals: bookingData.goals || '',
      parentContact: bookingData.parentContact || '',
      notes: 'Trial request submitted by athlete.',
      createdAt: new Date().toISOString()
    };

    setTrialBookings((prev) => [newBooking, ...prev]);
    return { success: true, booking: newBooking };
  };

  // 2. Cancel Trial Booking
  const cancelTrialBooking = (bookingId, reason = 'Cancelled by athlete') => {
    setTrialBookings((prev) =>
      prev.map((tb) =>
        tb.id === bookingId ? { ...tb, status: 'Cancelled', notes: reason } : tb
      )
    );
  };

  // 3. Enrol in Programme
  const enrolInProgramme = (enrolData) => {
    // Check batch capacity
    const targetBatch = batches.find((b) => b.id === enrolData.batchId);
    let initialStatus = 'Pending Approval';

    if (targetBatch && targetBatch.enrolledCount >= targetBatch.capacity) {
      initialStatus = 'Waitlisted'; // Auto-waitlist if full
    }

    const newEnrolment = {
      id: `enr-${Date.now()}`,
      athleteId: activeUser?.id || 'guest-athlete',
      athleteName: enrolData.participantName || activeUser?.name || 'Athlete',
      athletePhone: enrolData.phone || activeUser?.phone || '',
      athleteEmail: enrolData.email || activeUser?.email || '',
      athleteAge: Number(enrolData.age) || 18,
      parentContact: enrolData.parentContact || '',
      academyId: enrolData.academyId,
      academyName: enrolData.academyName,
      programmeId: enrolData.programmeId,
      programmeName: enrolData.programmeName,
      batchId: enrolData.batchId,
      batchName: enrolData.batchName || 'General Batch',
      batchDays: enrolData.batchDays || 'Weekly Sessions',
      coachId: enrolData.coachId,
      coachName: enrolData.coachName,
      feeMonthly: Number(enrolData.feeMonthly) || 3000,
      startDate: enrolData.startDate || new Date().toISOString().slice(0, 10),
      endDate: enrolData.endDate || null,
      enrolmentStatus: initialStatus,
      paymentStatus: 'Pending', // Payment separate from approval
      submittedOn: new Date().toISOString().slice(0, 10),
      paymentRef: null
    };

    setEnrolments((prev) => [newEnrolment, ...prev]);

    // Record invoice in payments table
    const newPayment = {
      id: `pay-${Date.now()}`,
      enrolmentId: newEnrolment.id,
      academyId: enrolData.academyId,
      academyName: enrolData.academyName,
      studentName: newEnrolment.athleteName,
      programmeName: enrolData.programmeName,
      amount: newEnrolment.feeMonthly,
      dueDate: newEnrolment.startDate,
      paidDate: null,
      status: 'Pending',
      method: 'Pay at Academy / Demo Gateway',
      refId: `DEMO-INV-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setPayments((prev) => [newPayment, ...prev]);

    return {
      success: true,
      enrolment: newEnrolment,
      isWaitlisted: initialStatus === 'Waitlisted'
    };
  };

  // 4. Cancel Enrolment
  const cancelEnrolment = (enrolmentId, reason = 'Cancelled by student') => {
    setEnrolments((prev) =>
      prev.map((e) =>
        e.id === enrolmentId ? { ...e, enrolmentStatus: 'Cancelled', notes: reason } : e
      )
    );
  };

  // 5. Toggle Favourite
  const toggleFavourite = (academyId) => {
    setFavourites((prev) =>
      prev.includes(academyId) ? prev.filter((id) => id !== academyId) : [...prev, academyId]
    );
  };

  // 6. Submit Review
  const submitReview = (reviewData) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      academyId: reviewData.academyId,
      author: activeUser?.name || 'Verified Athlete',
      studentName: reviewData.studentName || activeUser?.name || 'Athlete',
      rating: Number(reviewData.rating) || 5,
      date: new Date().toISOString().slice(0, 10),
      title: reviewData.title,
      comment: reviewData.comment,
      verifiedStudent: true
    };

    setReviews((prev) => [newRev, ...prev]);

    // Update academy average rating
    setAcademies((prev) =>
      prev.map((a) => {
        if (a.id === reviewData.academyId) {
          const totalReviews = a.reviewCount + 1;
          const newAvg = Number(((a.rating * a.reviewCount + newRev.rating) / totalReviews).toFixed(1));
          return {
            ...a,
            rating: newAvg,
            reviewCount: totalReviews
          };
        }
        return a;
      })
    );

    return { success: true };
  };

  // --- COACH / ACADEMY OWNER ACTIONS ---

  // 7. Add Coaching Centre / Academy
  const addAcademy = (academyData) => {
    const newAcad = {
      id: `acad-${Date.now()}`,
      ownerId: activeUser?.id || 'user-owner-1',
      name: academyData.name,
      sports: academyData.sports || ['Cricket'],
      tagline: academyData.tagline || 'Leading Sports Coaching Academy',
      description: academyData.description || '',
      coverImage: academyData.coverImage || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      logo: null,
      logoInitials: academyData.name.slice(0, 3).toUpperCase(),
      address: academyData.address,
      city: academyData.city || 'Pune',
      locality: academyData.locality || 'Shivajinagar',
      lat: Number(academyData.lat) || 18.5204,
      lng: Number(academyData.lng) || 73.8567,
      rating: 5.0,
      reviewCount: 0,
      ratingsBreakdown: { coachingQuality: 5.0, facilities: 5.0, communication: 5.0, valueForMoney: 5.0 },
      monthlyFeeMin: Number(academyData.monthlyFeeMin) || 3000,
      monthlyFeeMax: Number(academyData.monthlyFeeMax) || 5000,
      perSessionFee: Number(academyData.perSessionFee) || 350,
      trialClassAvailable: Boolean(academyData.trialClassAvailable),
      trialFee: Number(academyData.trialFee) || 0,
      trainingLevels: academyData.trainingLevels || ['Beginner', 'Intermediate'],
      coachingTypes: academyData.coachingTypes || ['Group coaching'],
      facilityType: academyData.facilityType || 'Outdoor',
      ageGroups: academyData.ageGroups || ['Children (6-12)', 'Teenagers (13-18)'],
      amenities: academyData.amenities || ['Changing Rooms', 'Dedicated Parking'],
      accessible: Boolean(academyData.accessible),
      womenCoaches: Boolean(academyData.womenCoaches),
      womenFocusedBatches: Boolean(academyData.womenFocusedBatches),
      beginnerFriendly: Boolean(academyData.beginnerFriendly),
      scholarshipsAvailable: Boolean(academyData.scholarshipsAvailable),
      openingHours: academyData.openingHours || 'Mon - Sat: 6:00 AM – 8:00 PM',
      contact: {
        phone: academyData.phone || activeUser?.phone || '',
        email: academyData.email || activeUser?.email || '',
        website: academyData.website || ''
      },
      status: 'Pending Verification', // Explicit unverified start
      verified: false,
      verifiedDate: null,
      cancellationPolicy: academyData.cancellationPolicy || 'Standard 48 hours cancellation notice.'
    };

    setAcademies((prev) => [newAcad, ...prev]);
    return { success: true, academy: newAcad };
  };

  // 8. Update Academy
  const updateAcademy = (academyId, updates) => {
    setAcademies((prev) =>
      prev.map((a) => (a.id === academyId ? { ...a, ...updates } : a))
    );
  };

  // 9. Toggle Academy Status
  const toggleAcademyStatus = (academyId) => {
    setAcademies((prev) =>
      prev.map((a) => {
        if (a.id === academyId) {
          const newStatus = a.status === 'Active' ? 'Inactive' : 'Active';
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  // 10. Add Coach
  const addCoach = (coachData) => {
    const newCoach = {
      id: `coach-${Date.now()}`,
      academyId: coachData.academyId,
      name: coachData.name,
      photo: coachData.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      sport: coachData.sport,
      experienceYears: Number(coachData.experienceYears) || 3,
      qualifications: coachData.qualifications ? coachData.qualifications.split(',').map(s => s.trim()) : ['Certified Coach'],
      qualificationsVerified: false, // New claims start unverified
      playingBackground: coachData.playingBackground || 'Regional level player',
      languages: coachData.languages ? coachData.languages.split(',').map(s => s.trim()) : ['English', 'Hindi'],
      rating: 5.0,
      reviewsCount: 0,
      trainingLevels: coachData.trainingLevels || ['Beginner', 'Intermediate'],
      bio: coachData.bio || 'Passionate sports coach focused on fundamentals.',
      status: 'Active',
      programmesCount: 0
    };

    setCoaches((prev) => [newCoach, ...prev]);
    return { success: true, coach: newCoach };
  };

  // 11. Update Coach
  const updateCoach = (coachId, updates) => {
    setCoaches((prev) =>
      prev.map((c) => (c.id === coachId ? { ...c, ...updates } : c))
    );
  };

  // 12. Toggle Coach Status
  const toggleCoachStatus = (coachId) => {
    setCoaches((prev) =>
      prev.map((c) =>
        c.id === coachId ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
      )
    );
  };

  // 13. Create Programme (with validation)
  const createProgramme = (progData) => {
    if (Number(progData.monthlyFee) < 0) {
      return { success: false, error: 'Fee cannot be negative.' };
    }
    if (Number(progData.enrolmentCapacity) <= 0) {
      return { success: false, error: 'Capacity must be greater than zero.' };
    }

    const newProg = {
      id: `prog-${Date.now()}`,
      academyId: progData.academyId,
      name: progData.name,
      sport: progData.sport,
      coachId: progData.coachId,
      coachName: progData.coachName,
      skillLevel: progData.skillLevel || 'Intermediate',
      ageEligibility: progData.ageEligibility || 'All ages',
      duration: progData.duration || '3 Months',
      sessionsPerWeek: Number(progData.sessionsPerWeek) || 3,
      sessionLengthMinutes: Number(progData.sessionLengthMinutes) || 60,
      monthlyFee: Number(progData.monthlyFee) || 3000,
      perSessionFee: Number(progData.perSessionFee) || 350,
      equipmentRequirements: progData.equipmentRequirements || 'Appropriate sports kit',
      venue: progData.venue || 'Academy Ground',
      description: progData.description || '',
      trialAvailable: Boolean(progData.trialAvailable),
      trialFee: Number(progData.trialFee) || 0,
      status: 'Active',
      enrolmentCapacity: Number(progData.enrolmentCapacity) || 20,
      enrolledCount: 0
    };

    setProgrammes((prev) => [newProg, ...prev]);

    // Increment coach programmesCount
    setCoaches((prev) =>
      prev.map((c) => (c.id === progData.coachId ? { ...c, programmesCount: (c.programmesCount || 0) + 1 } : c))
    );

    return { success: true, programme: newProg };
  };

  // 14. Update Programme
  const updateProgramme = (progId, updates) => {
    setProgrammes((prev) =>
      prev.map((p) => (p.id === progId ? { ...p, ...updates } : p))
    );
  };

  // 15. Close Programme
  const closeProgramme = (progId) => {
    setProgrammes((prev) =>
      prev.map((p) => (p.id === progId ? { ...p, status: 'Closed' } : p))
    );
  };

  // 16. Create Batch Schedule (With Coach & Venue conflict detector)
  const createBatch = (batchData) => {
    // Conflict detection: Same coach on same day and overlapping time
    const conflict = batches.find((b) => {
      if (b.coachId === batchData.coachId) {
        const hasCommonDay = b.days.some((d) => (batchData.days || []).includes(d));
        if (hasCommonDay) {
          const startA = b.startTime;
          const endA = b.endTime;
          const startB = batchData.startTime;
          const endB = batchData.endTime;
          // Check overlap
          if (startB < endA && endB > startA) {
            return true;
          }
        }
      }
      return false;
    });

    if (conflict) {
      return {
        success: false,
        error: `Schedule Conflict: Coach ${batchData.coachName} is already assigned to "${conflict.name}" on ${conflict.days.join(', ')} (${conflict.startTime} - ${conflict.endTime}).`
      };
    }

    const newBatch = {
      id: `batch-${Date.now()}`,
      programmeId: batchData.programmeId,
      academyId: batchData.academyId,
      name: batchData.name,
      days: batchData.days || ['Mon', 'Wed', 'Fri'],
      startTime: batchData.startTime,
      endTime: batchData.endTime,
      coachId: batchData.coachId,
      coachName: batchData.coachName,
      venue: batchData.venue || 'Academy Court 1',
      capacity: Number(batchData.capacity) || 15,
      enrolledCount: 0,
      status: 'Active',
      startDate: batchData.startDate || new Date().toISOString().slice(0, 10),
      endDate: batchData.endDate || null
    };

    setBatches((prev) => [newBatch, ...prev]);
    return { success: true, batch: newBatch };
  };

  // 17. Cancel Batch Session
  const cancelBatchSession = (batchId, reason = 'Maintenance / Holiday') => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId ? { ...b, notes: reason, lastCancelledReason: reason } : b
      )
    );
    return { success: true };
  };

  // 18. Update Enrolment Status (Owner approves / rejects / waitlists)
  const updateEnrolmentStatus = (enrolmentId, newStatus, reason = '') => {
    const enrol = enrolments.find((e) => e.id === enrolmentId);
    if (!enrol) return { success: false, error: 'Enrolment not found' };

    // If approving, check batch capacity
    if (newStatus === 'Approved' || newStatus === 'Active') {
      const targetBatch = batches.find((b) => b.id === enrol.batchId);
      if (targetBatch && targetBatch.enrolledCount >= targetBatch.capacity) {
        return {
          success: false,
          error: `Capacity Reached: Batch "${targetBatch.name}" is already at full capacity (${targetBatch.capacity}/${targetBatch.capacity}). Consider placing student on the Waitlist.`
        };
      }

      // Increment batch enrolled count
      if (targetBatch) {
        setBatches((prev) =>
          prev.map((b) =>
            b.id === targetBatch.id ? { ...b, enrolledCount: b.enrolledCount + 1 } : b
          )
        );
      }
    }

    setEnrolments((prev) =>
      prev.map((e) =>
        e.id === enrolmentId ? { ...e, enrolmentStatus: newStatus, decisionReason: reason } : e
      )
    );

    return { success: true };
  };

  // 19. Update Trial Booking Status (Owner confirms / rejects / completes / no-show)
  const updateTrialStatus = (bookingId, newStatus, reason = '') => {
    setTrialBookings((prev) =>
      prev.map((tb) =>
        tb.id === bookingId ? { ...tb, status: newStatus, decisionReason: reason } : tb
      )
    );
    return { success: true };
  };

  // 20. Record Attendance
  const recordAttendance = (attendancePayload) => {
    const newRecord = {
      id: `att-${Date.now()}`,
      academyId: attendancePayload.academyId,
      programmeId: attendancePayload.programmeId,
      batchId: attendancePayload.batchId,
      date: attendancePayload.date || new Date().toISOString().slice(0, 10),
      sessionName: attendancePayload.sessionName || 'Training Session',
      coachName: attendancePayload.coachName || activeUser?.name,
      records: attendancePayload.records || [] // array of { studentId, studentName, status: 'Present' | 'Absent' | 'Excused', notes }
    };

    setAttendance((prev) => [newRecord, ...prev]);
    return { success: true, record: newRecord };
  };

  // 21. Record Payment Status
  const recordPayment = (paymentId, newStatus, refId = null) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: newStatus,
              paidDate: newStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : p.paidDate,
              refId: refId || p.refId
            }
          : p
      )
    );

    // If marked paid, also update enrolment paymentStatus
    const payObj = payments.find((p) => p.id === paymentId);
    if (payObj && payObj.enrolmentId) {
      setEnrolments((prev) =>
        prev.map((e) =>
          e.id === payObj.enrolmentId ? { ...e, paymentStatus: newStatus } : e
        )
      );
    }
  };

  return (
    <CoachingContext.Provider
      value={{
        role,
        activeRole: role,
        setRole: handleRoleSwitch,
        activeUser,
        currentUser: activeUser,
        setActiveUser,
        setCurrentUser: setActiveUser,
        academies,
        coaches,
        programmes,
        batches,
        trialBookings,
        enrolments,
        attendance,
        payments,
        reviews,
        favourites,
        notifications,
        dismissNotification,

        // Athlete Actions
        bookTrialSession,
        cancelTrialBooking,
        enrolInProgramme,
        cancelEnrolment,
        toggleFavourite,
        submitReview,

        // Owner Actions
        addAcademy,
        updateAcademy,
        toggleAcademyStatus,
        addCoach,
        updateCoach,
        toggleCoachStatus,
        createProgramme,
        updateProgramme,
        closeProgramme,
        createBatch,
        cancelBatchSession,
        updateEnrolmentStatus,
        updateTrialStatus,
        recordAttendance,
        recordPayment
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const context = useContext(CoachingContext);
  if (!context) {
    throw new Error('useCoaching must be used within a CoachingProvider');
  }
  return context;
}
