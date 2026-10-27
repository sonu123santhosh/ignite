/**
 * SportLink - Sample Mock & Structural Data
 * Shaped for future API integration and multi-page routing.
 */

export const SAMPLE_DISCLAIMER = "Sample demonstration data. Front-end prototype shell.";

export const HOME_CATEGORIES = [
  {
    id: "turf",
    title: "Book a Turf",
    description: "Find and book football and multi-sport turfs.",
    href: "/facilities",
    icon: "Flame",
    accentColor: "from-emerald-500/20 to-lime-500/10",
    iconColor: "text-emerald-400"
  },
  {
    id: "courts",
    title: "Courts & Indoor Sports",
    description: "Find badminton, basketball, tennis, and indoor sports venues.",
    href: "/facilities",
    icon: "Activity",
    accentColor: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-sky-400"
  },
  {
    id: "tournaments",
    title: "Tournaments",
    description: "Discover events, build your team and register.",
    href: "/tournaments",
    icon: "Trophy",
    accentColor: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400"
  },
  {
    id: "friendly-matches",
    title: "College Friendly Matches",
    description: "Find college teams and arrange friendly games.",
    href: "/friendly-matches",
    icon: "Users",
    accentColor: "from-indigo-500/20 to-purple-500/10",
    iconColor: "text-indigo-400"
  },
  {
    id: "coaching",
    title: "Coaching Centres",
    description: "Find training programmes that match your goals and budget.",
    href: "/coaching",
    icon: "GraduationCap",
    accentColor: "from-purple-500/20 to-pink-500/10",
    iconColor: "text-purple-400"
  },
  {
    id: "trials",
    title: "Sports Trials",
    description: "Discover trials, selection camps, and athlete opportunities.",
    href: "/trials",
    icon: "Compass",
    accentColor: "from-rose-500/20 to-red-500/10",
    iconColor: "text-rose-400"
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Discover",
    description: "Search venues, tournaments, academies, and trials filtered by your sport, skill level, and city.",
    icon: "Compass"
  },
  {
    step: "02",
    title: "Connect",
    description: "Coordinate with facility managers, challenge collegiate teams, and confirm squad rosters directly.",
    icon: "Users"
  },
  {
    step: "03",
    title: "Compete",
    description: "Track live knockout brackets, participate in verified leagues, and showcase your athletic journey.",
    icon: "Trophy"
  }
];

export const PLACEHOLDER_PAGE_SPECS = {
  facilities: {
    title: "Facilities & Grounds",
    description: "Discover, filter, and reserve football turfs, cricket pitches, badminton courts, and multi-sport complexes.",
    tag: "Grounds & Venues",
    bullets: [
      "Filter by sport, court type (AstroTurf, wooden, clay, synthetic), floodlighting, and hourly budget.",
      "Check slot availability schedules and view amenity details (parking, showers, equipment rentals).",
      "Instant turf reservation requests and split-payment coordination for team captains."
    ]
  },
  tournaments: {
    title: "Tournaments",
    description: "Find competitive community leagues, collegiate cups, and corporate invitationals across your region.",
    tag: "Competitions & Leagues",
    bullets: [
      "Browse verified tournaments by sport, format (knockouts vs round-robin), entry fee, and prize pool.",
      "Track live bracket schedules, team standings, and matchday referee assignments.",
      "Digital team roster registration with instant deadline and slot countdown alerts."
    ]
  },
  friendlyMatches: {
    title: "College Friendly Matches",
    description: "Connect varsity squads and university clubs to coordinate competitive weekend friendlies.",
    tag: "Collegiate Matchmaking",
    bullets: [
      "Browse active college rosters by division tier, sport, and current season win-loss record.",
      "Coordinate ground logistics: home ground availability or shared split-cost neutral turf bookings.",
      "Send verified captain-to-captain match challenge requests without public phone number exposure."
    ]
  },
  coaching: {
    title: "Coaching Centres",
    description: "Find certified training academies, NIS/license qualified coaches, and structured athlete development batches.",
    tag: "Academies & Training",
    bullets: [
      "Compare monthly academy tuition, batch age brackets (U-14, U-19, Adult), and coach qualifications.",
      "Check trial session availability (complimentary vs assessment trials) with zero hidden markups.",
      "Direct academy messaging for slot enrollment, performance assessments, and training schedules."
    ]
  },
  trials: {
    title: "Sports Trials",
    description: "Discover state selection trials, academy scouting camps, and college athletic scholarship evaluations.",
    tag: "Scouting & Camps",
    bullets: [
      "Filter upcoming trials by age eligibility, sport, free entry status, and organizing body.",
      "Clear prerequisite checklists: documentation requirements, kit specifications, and quota caps.",
      "Submit athlete trial registrations and receive reporting time instructions."
    ]
  }
};
