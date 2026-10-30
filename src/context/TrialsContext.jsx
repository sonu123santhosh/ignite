import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_PERSONAS,
  INITIAL_ORGANISATIONS,
  INITIAL_TRIALS,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  storageWrapper
} from '../data/trialsData';

const STORAGE_KEY = 'sportlink_trials_demo_v1';

const TrialsContext = createContext(null);

export function TrialsProvider({ children }) {
  const stored = storageWrapper.get(STORAGE_KEY, null);

  const [role, setRole] = useState('athlete');
  const [activeUser, setActiveUser] = useState(DEMO_PERSONAS[0]); // Rohan Mane (Athlete)

  const [organisations, setOrganisations] = useState(
    stored?.organisations || INITIAL_ORGANISATIONS
  );
  const [trials, setTrials] = useState(stored?.trials || INITIAL_TRIALS);
  const [applications, setApplications] = useState(
    stored?.applications || INITIAL_APPLICATIONS
  );
  const [savedTrials, setSavedTrials] = useState(
    stored?.savedTrials || ['trial-101', 'trial-103']
  );
  const [notifications, setNotifications] = useState(
    stored?.notifications || INITIAL_NOTIFICATIONS
  );
  const [reports, setReports] = useState(stored?.reports || []);
  const [reminders, setReminders] = useState(
    stored?.reminders || ['trial-101']
  );

  // Sync to localStorage
  useEffect(() => {
    storageWrapper.set(STORAGE_KEY, {
      role,
      activeUser,
      organisations,
      trials,
      applications,
      savedTrials,
      notifications,
      reports,
      reminders
    });
  }, [
    role,
    activeUser,
    organisations,
    trials,
    applications,
    savedTrials,
    notifications,
    reports,
    reminders
  ]);

  // Synchronize persona on role switch
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'athlete' && activeUser.role !== 'athlete') {
      setActiveUser(DEMO_PERSONAS[0]); // Rohan Mane
    } else if (newRole === 'organiser' && activeUser.role !== 'organiser') {
      setActiveUser(DEMO_PERSONAS[2]); // Prof. Arvind Joshi
    }
  };

  // --- ATHLETE ACTIONS ---

  // 1. Apply for a sports trial
  const applyForTrial = (trialId, appData) => {
    const trial = trials.find((t) => t.id === trialId);
    if (!trial) return { success: false, error: 'Trial not found' };

    // Prevent duplicate active applications
    const existing = applications.find(
      (a) =>
        a.trialId === trialId &&
        a.athleteId === (activeUser?.id || 'guest') &&
        a.status !== 'Withdrawn'
    );
    if (existing) {
      return {
        success: false,
        error: 'You have already submitted an application for this trial. Track it in My Trials.'
      };
    }

    const newAppId = `TR-APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApplication = {
      id: newAppId,
      trialId: trial.id,
      trialTitle: trial.title,
      sport: trial.sport,
      organisationId: trial.organisationId,
      organisationName: trial.organisationName,
      trialDate: trial.trialDate,
      venue: trial.venue,
      athleteId: activeUser?.id || 'guest-athlete',
      athleteName: appData.athleteName || activeUser?.name || 'Athlete',
      athleteEmail: appData.athleteEmail || activeUser?.email || '',
      athletePhone: appData.athletePhone || activeUser?.phone || '',
      athleteAge: Number(appData.athleteAge) || 18,
      athleteGender: appData.athleteGender || 'All',
      athleteCity: appData.athleteCity || activeUser?.city || 'Pune',
      position: appData.position || '',
      experienceLevel: appData.experienceLevel || '',
      previousAchievements: appData.previousAchievements || '',
      sportsStats: appData.sportsStats || '',
      emergencyContact: appData.emergencyContact || '',
      guardianConsent: appData.guardianConsent || false,
      uploadedDocuments: appData.uploadedDocuments || [
        { name: 'Profile_Photo.jpg', type: 'image/jpeg', size: '210 KB' },
        { name: 'Identity_Proof.pdf', type: 'application/pdf', size: '750 KB' }
      ],
      appliedOn: new Date().toISOString().slice(0, 10),
      status: 'Submitted', // 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Waitlisted' | 'Rejected' | 'Withdrawn'
      eligibilityVerified: true,
      organiserNotes: '',
      attendanceStatus: 'Pending',
      evaluationScore: null,
      nextRoundDetails: '',
      receiptNumber: `REC-${newAppId}-2026`
    };

    setApplications((prev) => [newApplication, ...prev]);

    // Increment applicant count on trial
    setTrials((prev) =>
      prev.map((t) =>
        t.id === trialId ? { ...t, applicantCount: (t.applicantCount || 0) + 1 } : t
      )
    );

    // Trigger notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: activeUser?.id || 'guest',
      type: 'submitted',
      title: 'Application Submitted',
      message: `Your application for "${trial.title}" was submitted successfully. Ref: ${newAppId}`,
      trialId: trial.id,
      timestamp: new Date().toISOString().slice(0, 10),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, application: newApplication };
  };

  // 2. Edit application before deadline
  const updateApplication = (applicationId, updatedData) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, ...updatedData } : app
      )
    );
    return { success: true };
  };

  // 3. Withdraw application
  const withdrawApplication = (applicationId, reason = '') => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: 'Withdrawn',
              withdrawnReason: reason || 'Withdrawn by athlete',
              withdrawnAt: new Date().toISOString().slice(0, 10)
            }
          : app
      )
    );
    return { success: true };
  };

  // 4. Save / Unsave trial
  const toggleSaveTrial = (trialId) => {
    setSavedTrials((prev) =>
      prev.includes(trialId)
        ? prev.filter((id) => id !== trialId)
        : [...prev, trialId]
    );
  };

  // 5. Toggle Reminder
  const toggleTrialReminder = (trialId) => {
    setReminders((prev) =>
      prev.includes(trialId)
        ? prev.filter((id) => id !== trialId)
        : [...prev, trialId]
    );
  };

  // 6. Dismiss / Read notifications
  const dismissNotification = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  // --- ORGANISER ACTIONS ---

  // 7. Create a new trial
  const createTrial = (trialFormData) => {
    const newTrialId = `trial-${Date.now()}`;
    const newTrial = {
      id: newTrialId,
      title: trialFormData.title,
      sport: trialFormData.sport,
      discipline: trialFormData.discipline || trialFormData.sport,
      organisationId: activeUser?.organisationId || 'org-1',
      organisationName: activeUser?.organisationName || 'University Athletics Cell',
      organisationType: trialFormData.organisationType || 'College',
      verifiedOrganiser: true,
      coverImage:
        trialFormData.coverImage ||
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
      venue: trialFormData.venue,
      address: trialFormData.address,
      city: trialFormData.city,
      lat: trialFormData.lat || 18.5204,
      lng: trialFormData.lng || 73.8567,
      trialDate: trialFormData.trialDate,
      reportingTime: trialFormData.reportingTime || '07:00 AM',
      startTime: trialFormData.startTime || '08:00 AM',
      endTime: trialFormData.endTime || '12:00 PM',
      duration: trialFormData.duration || '1 Day',
      applicationDeadline: trialFormData.applicationDeadline,
      status: 'Open',
      publicationStatus: trialFormData.publicationStatus || 'Published',
      entryFee: Number(trialFormData.entryFee) || 0,
      isFree: Number(trialFormData.entryFee) === 0,
      additionalCharges: trialFormData.additionalCharges || 'None',
      registrationMethod: trialFormData.registrationMethod || 'sportlink',
      officialWebsiteUrl: trialFormData.officialWebsiteUrl || '',
      minAge: Number(trialFormData.minAge) || 16,
      maxAge: Number(trialFormData.maxAge) || 28,
      genderEligibility: trialFormData.genderEligibility || 'All',
      skillLevel: trialFormData.skillLevel || 'Intermediate / Advanced',
      competitionCategory: trialFormData.competitionCategory || 'University & Club',
      trialType: trialFormData.trialType || 'Squad Selection',
      maxCapacity: Number(trialFormData.maxCapacity) || 50,
      applicantCount: 0,
      shortlistedCount: 0,
      description: trialFormData.description,
      eligibilityCriteria: trialFormData.eligibilityCriteria || [
        'Must meet specified age group criteria.',
        'Must bring sports credentials and original proof of age.'
      ],
      requiredEquipment: trialFormData.requiredEquipment || [
        'Sport-specific gear and non-marking/appropriate shoes.',
        'Personal water bottle.'
      ],
      scheduleTimeline: trialFormData.scheduleTimeline || [
        { time: '07:00 AM – 08:00 AM', stage: 'Reporting & Verification', description: 'Desk check.' },
        { time: '08:00 AM – 11:30 AM', stage: 'Technical & Match Drills', description: 'Scored drills.' }
      ],
      requiredDocuments: trialFormData.requiredDocuments || [
        { name: 'Recent Passport Photo', mandatory: true, type: 'Image (JPG/PNG)' },
        { name: 'Age / Identity Proof', mandatory: true, type: 'PDF / Image' }
      ],
      resultsAnnouncementDate: trialFormData.resultsAnnouncementDate || trialFormData.trialDate,
      transportInfo: trialFormData.transportInfo || 'Easily accessible via local transport.',
      notes: trialFormData.notes || ''
    };

    setTrials((prev) => [newTrial, ...prev]);
    return { success: true, trial: newTrial };
  };

  // 8. Update trial
  const updateTrial = (trialId, updatedData) => {
    setTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, ...updatedData } : t))
    );
    return { success: true };
  };

  // 9. Close trial applications
  const closeTrialApplications = (trialId) => {
    setTrials((prev) =>
      prev.map((t) => (t.id === trialId ? { ...t, status: 'Closed' } : t))
    );
  };

  // 10. Cancel trial with reason
  const cancelTrial = (trialId, reason) => {
    setTrials((prev) =>
      prev.map((t) =>
        t.id === trialId
          ? { ...t, status: 'Cancelled', cancellationReason: reason }
          : t
      )
    );

    // Notify affected applicants
    const affectedApps = applications.filter((a) => a.trialId === trialId);
    affectedApps.forEach((app) => {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}-${app.id}`,
          userId: app.athleteId,
          type: 'cancelled',
          title: 'Trial Cancelled',
          message: `The trial "${app.trialTitle}" was cancelled by the organiser. Reason: ${reason}`,
          trialId,
          timestamp: new Date().toISOString().slice(0, 10),
          read: false
        },
        ...prev
      ]);
    });
  };

  // 11. Update Applicant Review Status (Shortlist, Accept, Waitlist, Reject)
  const updateApplicantStatus = (
    applicationId,
    newStatus,
    internalNotes = '',
    nextRoundDetails = ''
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          const updated = {
            ...app,
            status: newStatus,
            organiserNotes: internalNotes || app.organiserNotes,
            nextRoundDetails: nextRoundDetails || app.nextRoundDetails,
            statusUpdatedAt: new Date().toISOString().slice(0, 10)
          };

          // Send notification to the athlete
          const notifTitle =
            newStatus === 'Shortlisted'
              ? 'Application Shortlisted!'
              : newStatus === 'Accepted'
              ? 'Application Accepted!'
              : newStatus === 'Waitlisted'
              ? 'Application Waitlisted'
              : 'Application Status Update';

          const newNotif = {
            id: `notif-${Date.now()}`,
            userId: app.athleteId,
            type: newStatus.toLowerCase(),
            title: notifTitle,
            message: `Your application (${app.id}) for "${app.trialTitle}" was updated to ${newStatus}.${
              nextRoundDetails ? ` Next steps: ${nextRoundDetails}` : ''
            }`,
            trialId: app.trialId,
            timestamp: new Date().toISOString().slice(0, 10),
            read: false
          };
          setNotifications((np) => [newNotif, ...np]);

          return updated;
        }
        return app;
      })
    );
  };

  // 12. Record attendance & score
  const recordAttendance = (
    applicationId,
    attendanceStatus,
    evaluationScore = null,
    reviewNotes = ''
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              attendanceStatus,
              evaluationScore:
                evaluationScore !== null ? Number(evaluationScore) : app.evaluationScore,
              organiserNotes: reviewNotes || app.organiserNotes
            }
          : app
      )
    );
  };

  // 13. Publish Trial Results
  const publishResults = (trialId, resultsData) => {
    setTrials((prev) =>
      prev.map((t) =>
        t.id === trialId
          ? {
              ...t,
              status: 'Results Published',
              resultsPublishedAt: new Date().toISOString().slice(0, 10),
              resultsAnnouncement: resultsData.announcement || 'Results finalized by selection panel.',
              resultsList: resultsData.selectedAthletes || []
            }
          : t
      )
    );

    // Notify all participants
    const trialApps = applications.filter((a) => a.trialId === trialId);
    trialApps.forEach((app) => {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}-${app.id}`,
          userId: app.athleteId,
          type: 'results',
          title: 'Trial Results Published',
          message: `Official selection results for "${app.trialTitle}" have now been published. Check your application status.`,
          trialId,
          timestamp: new Date().toISOString().slice(0, 10),
          read: false
        },
        ...prev
      ]);
    });
  };

  // 14. Report suspicious trial
  const reportTrialListing = (trialId, reportData) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      trialId,
      reporterId: activeUser?.id || 'guest',
      reason: reportData.reason,
      details: reportData.details,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Under Review'
    };
    setReports((prev) => [newReport, ...prev]);
    return { success: true };
  };

  return (
    <TrialsContext.Provider
      value={{
        role,
        activeRole: role,
        setRole: handleRoleSwitch,
        activeUser,
        currentUser: activeUser,
        setActiveUser,
        organisations,
        trials,
        applications,
        savedTrials,
        notifications,
        reports,
        reminders,

        // Athlete Actions
        applyForTrial,
        updateApplication,
        withdrawApplication,
        toggleSaveTrial,
        toggleTrialReminder,
        dismissNotification,
        markNotificationRead,
        reportTrialListing,

        // Organiser Actions
        createTrial,
        updateTrial,
        closeTrialApplications,
        cancelTrial,
        updateApplicantStatus,
        recordAttendance,
        publishResults
      }}
    >
      {children}
    </TrialsContext.Provider>
  );
}

export function useTrials() {
  const context = useContext(TrialsContext);
  if (!context) {
    throw new Error('useTrials must be used within a TrialsProvider');
  }
  return context;
}
