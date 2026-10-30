import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_COLLEGES,
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_INVITATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
  DEMO_PERSONAS,
  invitationStateMachine,
  checkPermission,
  storageWrapper
} from '../data/friendliesData';

const STORAGE_KEY = 'sportlink_friendlies_demo_v2';

const FriendliesContext = createContext(null);

export function FriendliesProvider({ children }) {
  // Load initial state from storageWrapper or fall back to default fixtures
  const stored = storageWrapper.get(STORAGE_KEY, null);

  const [role, setRole] = useState(stored?.role || 'student');
  const [currentActor, setCurrentActor] = useState(
    stored?.currentActor || DEMO_PERSONAS[0] // Default to Rohan Deshmukh (PIT Captain)
  );

  const [colleges, setColleges] = useState(stored?.colleges || INITIAL_COLLEGES);
  const [teams, setTeams] = useState(stored?.teams || INITIAL_TEAMS);
  const [matches, setMatches] = useState(stored?.matches || INITIAL_MATCHES);
  const [invitations, setInvitations] = useState(stored?.invitations || INITIAL_INVITATIONS);
  const [notifications, setNotifications] = useState(stored?.notifications || INITIAL_NOTIFICATIONS);
  const [followedTeamIds, setFollowedTeamIds] = useState(stored?.followedTeamIds || ['team-f1']);
  const [reports, setReports] = useState(stored?.reports || []);
  const [announcements, setAnnouncements] = useState(stored?.announcements || INITIAL_ANNOUNCEMENTS);

  // Map of colleges by ID for quick O(1) lookup
  const collegesMap = useMemo(() => {
    const map = {};
    if (Array.isArray(colleges)) {
      colleges.forEach((c) => {
        if (c?.id) map[c.id] = c;
      });
    } else if (colleges && typeof colleges === 'object') {
      return colleges;
    }
    return map;
  }, [colleges]);

  // Save to prototype storage on changes
  useEffect(() => {
    storageWrapper.set(STORAGE_KEY, {
      role,
      currentActor,
      colleges,
      teams,
      matches,
      invitations,
      notifications,
      followedTeamIds,
      reports
    });
  }, [role, currentActor, colleges, teams, matches, invitations, notifications, followedTeamIds, reports]);

  // Actions

  // 1. Send Direct Challenge (Captain only)
  const sendChallenge = (challengeData) => {
    const newInvId = `inv-${Date.now()}`;
    const newInvitation = {
      id: newInvId,
      matchId: null,
      senderTeamId: challengeData.senderTeamId,
      senderCollegeId: challengeData.senderCollegeId,
      recipientTeamId: challengeData.recipientTeamId,
      recipientCollegeId: challengeData.recipientCollegeId,
      sport: challengeData.sport,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      terms: {
        date: challengeData.date,
        startTime: challengeData.startTime,
        durationMinutes: challengeData.durationMinutes || 90,
        venueName: challengeData.venueName,
        format: challengeData.format,
        message: challengeData.message
      },
      history: [
        {
          timestamp: new Date().toISOString(),
          actorName: currentActor?.name || 'Captain',
          actorRole: 'sender',
          action: 'Sent Match Proposal',
          details: `Proposed match on ${challengeData.date} at ${challengeData.startTime} (${challengeData.venueName}).`
        }
      ]
    };

    setInvitations((prev) => [newInvitation, ...prev]);

    // Send in-app notification to opponent captain
    const newNotif = {
      id: `n-${Date.now()}`,
      title: 'New College Match Challenge',
      message: `${challengeData.senderTeamName || 'A rival college team'} challenged your squad to a friendly match.`,
      date: new Date().toISOString(),
      read: false,
      type: 'info',
      targetUserId: challengeData.recipientCaptainId,
      link: '/friendlies/inbox'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, invitation: newInvitation };
  };

  // 2. Respond to Invitation (ACCEPT, DECLINE, COUNTER, WITHDRAW)
  const respondInvitation = (invitationId, action, payload = {}) => {
    const inv = invitations.find((i) => i.id === invitationId);
    if (!inv) return { success: false, error: 'Invitation not found.' };

    const result = invitationStateMachine(inv, action, payload, currentActor);
    if (!result.success) return result;

    setInvitations((prev) =>
      prev.map((i) => (i.id === invitationId ? result.invitation : i))
    );

    // If accepted, add confirmed match to matches state
    if (action === 'ACCEPT' && result.confirmedMatch) {
      setMatches((prev) => [result.confirmedMatch, ...prev]);

      // Notify both sides
      const confirmNotif = {
        id: `n-${Date.now()}`,
        title: 'Match Confirmed!',
        message: `Both captains have agreed to the match terms! Match confirmed for ${result.confirmedMatch.format}.`,
        date: new Date().toISOString(),
        read: false,
        type: 'success',
        targetUserId: 'all',
        link: `/friendlies/matches/${result.confirmedMatch.id}`
      };
      setNotifications((prev) => [confirmNotif, ...prev]);
    } else if (action === 'COUNTER') {
      const counterNotif = {
        id: `n-${Date.now()}`,
        title: 'Counter-Proposal Received',
        message: `${currentActor?.name} submitted counter-terms for the friendly match. Review in Inbox.`,
        date: new Date().toISOString(),
        read: false,
        type: 'warning',
        targetUserId: inv.senderTeamId === currentActor.teamId ? inv.recipientTeamId : inv.senderTeamId,
        link: '/friendlies/inbox'
      };
      setNotifications((prev) => [counterNotif, ...prev]);
    }

    return result;
  };

  // 3. Register a Team (Unverified by default until Coordinator approves)
  const registerTeam = (teamData) => {
    const newTeam = {
      id: `team-cust-${Date.now()}`,
      collegeId: teamData.collegeId || 'col-custom',
      collegeName: teamData.collegeName,
      name: teamData.name,
      sport: teamData.sport,
      captainId: currentActor?.id || 'user-cap-cust',
      captainName: teamData.captainName,
      captainPhone: teamData.captainPhone,
      captainEmail: teamData.captainEmail,
      contactVisible: false,
      skillLevel: teamData.skillLevel || 'Intermediate',
      verified: false, // New teams start Unverified
      verificationStatus: 'Pending review by college coordinator',
      followersCount: 1,
      preferredHomeGround: teamData.preferredHomeGround || 'College Main Ground',
      logoInitials: (teamData.name || 'TM').slice(0, 2).toUpperCase(),
      primaryColor: '#0f1726',
      roster: teamData.roster || []
    };

    setTeams((prev) => [newTeam, ...prev]);

    // Send coordinator notification
    const coordNotif = {
      id: `n-${Date.now()}`,
      title: 'New Squad Awaiting Coordinator Verification',
      message: `${newTeam.name} (${newTeam.collegeName}) submitted registration for ${newTeam.sport}.`,
      date: new Date().toISOString(),
      read: false,
      type: 'info',
      targetUserId: 'coordinator',
      link: '/friendlies/dashboard'
    };
    setNotifications((prev) => [coordNotif, ...prev]);

    return { success: true, team: newTeam };
  };

  // 4. Verify / Reject Team (Coordinator only)
  const verifyTeam = (teamId, approve = true, reason = '') => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            verified: approve,
            verificationStatus: approve ? 'Verified by College Sports Coordinator' : `Rejected: ${reason}`
          };
        }
        return t;
      })
    );
  };

  // 5. Cancel Match (Organiser only)
  const cancelMatch = (matchId, reason) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            status: 'Cancelled',
            cancelReason: reason || 'Cancelled by match organiser.'
          };
        }
        return m;
      })
    );

    const cancelNotif = {
      id: `n-${Date.now()}`,
      title: 'Friendly Match Cancelled',
      message: `Match #${matchId} was cancelled by organiser: "${reason || 'Unforeseen circumstances'}"`,
      date: new Date().toISOString(),
      read: false,
      type: 'warning',
      targetUserId: 'all'
    };
    setNotifications((prev) => [cancelNotif, ...prev]);
  };

  // 6. Register Team for Open Match
  const registerForMatch = (matchId, teamId) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            awayTeamId: teamId,
            status: 'Confirmed',
            slots: { total: 2, registered: 2, open: 0 }
          };
        }
        return m;
      })
    );

    const notif = {
      id: `n-${Date.now()}`,
      title: 'Opponent Joined Open Match!',
      message: `An opponent has registered for match #${matchId}. Match is now Confirmed!`,
      date: new Date().toISOString(),
      read: false,
      type: 'success',
      targetUserId: 'all',
      link: `/friendlies/matches/${matchId}`
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 7. Withdraw from Match
  const withdrawFromMatch = (matchId, teamId) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          if (m.awayTeamId === teamId) {
            return {
              ...m,
              awayTeamId: null,
              status: 'Open for Teams',
              slots: { total: 2, registered: 1, open: 1 }
            };
          }
        }
        return m;
      })
    );
  };

  // 8. Follow / Unfollow Team (Student feature)
  const toggleFollowTeam = (teamId) => {
    setFollowedTeamIds((prev) => {
      const isFollowed = prev.includes(teamId);
      const updated = isFollowed ? prev.filter((id) => id !== teamId) : [...prev, teamId];

      // Update follower count on team object
      setTeams((tList) =>
        tList.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              followersCount: Math.max(0, (t.followersCount || 0) + (isFollowed ? -1 : 1))
            };
          }
          return t;
        })
      );

      return updated;
    });
  };

  // 9. Report Incorrect Information
  const submitReport = (reportData) => {
    const newReport = {
      id: `rep-${Date.now()}`,
      matchId: reportData.matchId,
      category: reportData.category,
      message: reportData.message,
      submittedBy: currentActor?.name || 'Anonymous Student',
      submittedAt: new Date().toISOString(),
      status: 'Pending review'
    };
    setReports((prev) => [newReport, ...prev]);
    return { success: true };
  };

  // 10. Publish Announcement (supports both match announcement and system circulars)
  const publishAnnouncement = (firstArg, maybeMessage) => {
    if (typeof firstArg === 'object' && firstArg !== null) {
      const newAnn = {
        id: `ann-${Date.now()}`,
        title: firstArg.title || 'Announcement',
        body: firstArg.body || '',
        sourceTier: firstArg.sourceTier || 'official',
        officialSource: firstArg.officialSource || currentActor?.name || 'College Sports Directorate',
        link: firstArg.link || '#',
        date: new Date().toISOString().slice(0, 10),
        category: firstArg.category || 'fixture_update'
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      return newAnn;
    }

    const matchId = firstArg;
    const message = maybeMessage;
    const ann = {
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      author: currentActor?.name || 'College Coordinator',
      message
    };

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            announcements: [ann, ...(m.announcements || [])]
          };
        }
        return m;
      })
    );
  };

  // 11. Notification helpers
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Check permission helper
  const checkPermissionFn = (action, resource = null) => {
    if (role === 'captain' && (action === 'canSendInvitations' || action === 'send_challenge')) return true;
    const res = checkPermission(role, currentActor?.id, action, resource);
    return res && res.allowed === true;
  };

  return (
    <FriendliesContext.Provider
      value={{
        // Role & User
        role,
        setRole,
        activeRole: role,
        setActiveRole: setRole,
        currentActor,
        setCurrentActor,
        activeUser: currentActor,
        setActiveUser: setCurrentActor,

        // Data collections
        colleges,
        collegesMap,
        teams,
        matches,
        invitations,
        notifications,
        followedTeamIds,
        reports,
        announcements,

        // Permission
        checkPermission: checkPermissionFn,

        // Actions
        sendChallenge,
        respondInvitation,
        registerTeam,
        verifyTeam,
        cancelMatch,
        registerForMatch,
        withdrawFromMatch,
        toggleFollowTeam,
        submitReport,
        publishAnnouncement,
        markNotificationRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </FriendliesContext.Provider>
  );
}

export function useFriendlies() {
  const context = useContext(FriendliesContext);
  if (!context) {
    throw new Error('useFriendlies must be used within a FriendliesProvider');
  }
  return context;
}
