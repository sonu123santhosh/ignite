import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Facilities from './pages/Facilities';
import FacilityDetails from './pages/FacilityDetails';
import FacilityCheckout from './pages/FacilityCheckout';

// Tournaments Feature Pages
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import TournamentRegister from './pages/TournamentRegister';
import TournamentMyRegistrations from './pages/TournamentMyRegistrations';
import TournamentTeams from './pages/TournamentTeams';
import TournamentOrganiserDashboard from './pages/TournamentOrganiserDashboard';
import TournamentOrganiserCreate from './pages/TournamentOrganiserCreate';
import TournamentOrganiserManage from './pages/TournamentOrganiserManage';

// College Friendly Matches Pages
import { FriendliesProvider } from './context/FriendliesContext';
import FriendliesDiscovery from './pages/friendlies/FriendliesDiscovery';
import MatchDetails from './pages/friendlies/MatchDetails';
import ChallengeCollege from './pages/friendlies/ChallengeCollege';
import TeamsDirectory from './pages/friendlies/TeamsDirectory';
import RegisterTeam from './pages/friendlies/RegisterTeam';
import FriendliesInbox from './pages/friendlies/FriendliesInbox';
import FriendliesDashboard from './pages/friendlies/FriendliesDashboard';
import OfficialUpdates from './pages/friendlies/OfficialUpdates';

// Coaching Centres Pages & Context
import { CoachingProvider } from './context/CoachingContext';
import CoachingLanding from './pages/coaching/CoachingLanding';
import CoachingDetails from './pages/coaching/CoachingDetails';
import AthleteTrainingDashboard from './pages/coaching/AthleteTrainingDashboard';

// Sports Trials Pages & Context
import { TrialsProvider } from './context/TrialsContext';
import TrialsLanding from './pages/trials/TrialsLanding';
import TrialDetails from './pages/trials/TrialDetails';
import TrialApply from './pages/trials/TrialApply';
import AthleteTrialsDashboard from './pages/trials/AthleteTrialsDashboard';
import OrganiserDashboard from './pages/trials/OrganiserDashboard';
import OrganiserCreateTrial from './pages/trials/OrganiserCreateTrial';
import OrganiserManageTrial from './pages/trials/OrganiserManageTrial';

// Other Sections
import FriendlyMatches from './pages/FriendlyMatches';
import Coaching from './pages/Coaching';
import Trials from './pages/Trials';
import NotFound from './pages/NotFound';

import { INITIAL_FACILITIES, INITIAL_BOOKINGS } from './data/facilitiesData';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_REGISTRATIONS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS
} from './data/tournamentsData';

export default function App() {
  // Facilities Demo Role state: 'player' | 'owner'
  const [facilitiesRole, setFacilitiesRole] = useState('player');

  // Shared in-memory Facilities & Bookings state
  const [sharedState, setSharedState] = useState({
    facilities: INITIAL_FACILITIES,
    bookings: INITIAL_BOOKINGS,
    customSlotOverrides: {}
  });

  // Current slot booking selection for facilities checkout transition
  const [currentBookingSelection, setCurrentBookingSelection] = useState(null);

  // Tournaments Demo Role state: 'player' | 'captain' | 'organiser' (In React state only)
  const [tournamentRole, setTournamentRole] = useState('player');

  // Current active demo persona for permission testing
  const [currentDemoUser, setCurrentDemoUser] = useState(DEMO_USERS[0]);

  // Shared in-memory Tournaments state
  const [sharedTournamentsState, setSharedTournamentsState] = useState({
    tournaments: INITIAL_TOURNAMENTS,
    teams: INITIAL_TEAMS,
    registrations: INITIAL_REGISTRATIONS,
    notifications: INITIAL_NOTIFICATIONS
  });

  return (
    <FriendliesProvider>
      <CoachingProvider>
        <TrialsProvider>
          <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* Facilities & Grounds Feature Routes */}
          <Route
            path="facilities"
            element={
              <Facilities
                sharedRole={facilitiesRole}
                onRoleChange={setFacilitiesRole}
                sharedState={sharedState}
                setSharedState={setSharedState}
              />
            }
          />
          <Route
            path="facilities/:id"
            element={
              <FacilityDetails
                sharedState={sharedState}
                setSharedState={setSharedState}
                currentBookingSelection={currentBookingSelection}
                setCurrentBookingSelection={setCurrentBookingSelection}
              />
            }
          />
          <Route
            path="facilities/:id/checkout"
            element={
              <FacilityCheckout
                sharedState={sharedState}
                setSharedState={setSharedState}
                currentBookingSelection={currentBookingSelection}
              />
            }
          />

          {/* Tournaments Feature Routes */}
          <Route
            path="tournaments"
            element={
              <Tournaments
                tournamentRole={tournamentRole}
                setTournamentRole={setTournamentRole}
                currentDemoUser={currentDemoUser}
                setCurrentDemoUser={setCurrentDemoUser}
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
              />
            }
          />
          <Route
            path="tournaments/:id"
            element={
              <TournamentDetails
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                tournamentRole={tournamentRole}
                currentDemoUser={currentDemoUser}
              />
            }
          />
          <Route
            path="tournaments/:id/register"
            element={
              <TournamentRegister
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                currentDemoUser={currentDemoUser}
                tournamentRole={tournamentRole}
              />
            }
          />
          <Route
            path="tournaments/my-registrations"
            element={
              <TournamentMyRegistrations
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                currentDemoUser={currentDemoUser}
                tournamentRole={tournamentRole}
              />
            }
          />
          <Route
            path="tournaments/teams"
            element={
              <TournamentTeams
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                currentDemoUser={currentDemoUser}
                tournamentRole={tournamentRole}
              />
            }
          />
          <Route
            path="tournaments/organiser"
            element={
              <TournamentOrganiserDashboard
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                currentDemoUser={currentDemoUser}
                tournamentRole={tournamentRole}
              />
            }
          />
          <Route
            path="tournaments/organiser/create"
            element={
              <TournamentOrganiserCreate
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                currentDemoUser={currentDemoUser}
                tournamentRole={tournamentRole}
              />
            }
          />
          <Route
            path="tournaments/organiser/:id"
            element={
              <TournamentOrganiserManage
                sharedTournamentsState={sharedTournamentsState}
                setSharedTournamentsState={setSharedTournamentsState}
                currentDemoUser={currentDemoUser}
                tournamentRole={tournamentRole}
              />
            }
          />

          {/* College Friendly Matches Routes */}
          <Route path="friendlies" element={<FriendliesDiscovery />} />
          <Route path="friendlies/matches/:id" element={<MatchDetails />} />
          <Route path="friendlies/challenge" element={<ChallengeCollege />} />
          <Route path="friendlies/teams" element={<TeamsDirectory />} />
          <Route path="friendlies/register-team" element={<RegisterTeam />} />
          <Route path="friendlies/inbox" element={<FriendliesInbox />} />
          <Route path="friendlies/dashboard" element={<FriendliesDashboard />} />
          <Route path="friendlies/updates" element={<OfficialUpdates />} />
          <Route path="friendly-matches" element={<FriendliesDiscovery />} />

          {/* Coaching Centres Routes */}
          <Route path="coaching" element={<CoachingLanding />} />
          <Route path="coaching/:id" element={<CoachingDetails />} />
          <Route path="coaching/my-training" element={<AthleteTrainingDashboard />} />

          {/* Sports Trials Routes */}
          <Route path="trials" element={<TrialsLanding />} />
          <Route path="trials/:id" element={<TrialDetails />} />
          <Route path="trials/:id/apply" element={<TrialApply />} />
          <Route path="trials/dashboard" element={<AthleteTrialsDashboard />} />
          <Route path="trials/organiser" element={<OrganiserDashboard />} />
          <Route path="trials/organiser/create" element={<OrganiserCreateTrial />} />
          <Route path="trials/organiser/:id" element={<OrganiserManageTrial />} />

          {/* Remaining sections */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
        </TrialsProvider>
      </CoachingProvider>
    </FriendliesProvider>
  );
}
