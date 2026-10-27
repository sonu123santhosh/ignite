/**
 * /src/data/tournamentsData.js
 * Comprehensive sample data and pure helper functions for SportLink Tournaments.
 * All data is simulated prototype data. No real backend, payments or notifications.
 *
 * API REPLACEMENT POINT: Replace mock collections and helper return values
 * with asynchronous REST / GraphQL endpoints in production.
 */

// Helper to compute ISO dates relative to today
export const getRelativeDate = (dayOffset = 0, hour = 10, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const formatDateDisplay = (isoStr) => {
  if (!isoStr) return 'TBA';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoStr;
  }
};

export const formatTimeDisplay = (isoStr) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

export const daysUntil = (isoStr) => {
  if (!isoStr) return 999;
  const now = new Date();
  const target = new Date(isoStr);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Demo Users for role and permission simulation
export const DEMO_USERS = [
  {
    id: 'user-player-1',
    name: 'Priya Sen',
    email: 'priya.sen@demo.sportlink.in',
    phone: '+91 98230 11223',
    role: 'player',
    college: 'Pune University',
    age: 21,
    avatar: 'PS',
    description: 'Individual badminton & tennis competitor'
  },
  {
    id: 'user-captain-1',
    name: 'Rahul Sharma',
    email: 'rahul.s@demo.sportlink.in',
    phone: '+91 98765 43210',
    role: 'captain',
    college: 'Fergusson College, Pune',
    age: 22,
    avatar: 'RS',
    description: 'Captain of Fergusson Strikers Football Team'
  },
  {
    id: 'user-captain-2',
    name: 'Vikram Deshmukh',
    email: 'vikram.d@demo.sportlink.in',
    phone: '+91 98221 55443',
    role: 'captain',
    college: 'COEP Tech, Pune',
    age: 23,
    avatar: 'VD',
    description: 'Captain of Deccan Warriors Cricket Club'
  },
  {
    id: 'user-org-1',
    name: 'Maharashtra Football Association',
    contactPerson: 'Sanjay Deshpande',
    email: 'tournaments@mfa-demo.org',
    phone: '+91 20 2567 8901',
    role: 'organiser',
    verified: true,
    avatar: 'MFA',
    description: 'Governing body for collegiate football invitationals'
  },
  {
    id: 'user-org-2',
    name: 'Pune District Badminton Association',
    contactPerson: 'Neeta Kulkarni',
    email: 'events@pdba-demo.in',
    phone: '+91 20 2445 6789',
    role: 'organiser',
    verified: true,
    avatar: 'PDBA',
    description: 'District open tournaments and shuttle ranking cups'
  },
  {
    id: 'user-org-3',
    name: 'Apex Sports Club',
    contactPerson: 'Arun Nair',
    email: 'contact@apexsports-demo.in',
    phone: '+91 98229 00998',
    role: 'organiser',
    verified: false,
    avatar: 'ASC',
    description: 'Private sports enterprise running weekend corporate and community cups'
  }
];

// 4 Sample Teams
export const INITIAL_TEAMS = [
  {
    id: 'team-1',
    name: 'Fergusson Strikers',
    sport: 'Football',
    city: 'Pune',
    collegeOrOrg: 'Fergusson College',
    description: 'Official collegiate 7-a-side and 11-a-side football squad of Fergusson College.',
    captainId: 'user-captain-1',
    captainName: 'Rahul Sharma',
    logoInitials: 'FS',
    members: [
      { id: 'm-1', name: 'Rahul Sharma', email: 'rahul.s@demo.sportlink.in', phone: '+91 98765 43210', position: 'Forward / Striker', role: 'Captain', invitationStatus: 'Joined' },
      { id: 'm-2', name: 'Aditya Kadam', email: 'aditya.k@demo.sportlink.in', phone: '+91 98765 43211', position: 'Midfielder', role: 'Vice-captain', invitationStatus: 'Joined' },
      { id: 'm-3', name: 'Faizan Sheikh', email: 'faizan.s@demo.sportlink.in', phone: '+91 98765 43212', position: 'Defender', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-4', name: 'Kunal Joshi', email: 'kunal.j@demo.sportlink.in', phone: '+91 98765 43213', position: 'Goalkeeper', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-5', name: 'Rohan Shinde', email: 'rohan.s@demo.sportlink.in', phone: '+91 98765 43214', position: 'Winger', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-6', name: 'Siddharth Roy', email: 'sid.roy@demo.sportlink.in', phone: '+91 98765 43215', position: 'Centre Back', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-7', name: 'Nikhil Patil', email: 'nikhil.p@demo.sportlink.in', phone: '+91 98765 43216', position: 'Striker', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-8', name: 'Sameer Varma', email: 'sameer.v@demo.sportlink.in', phone: '+91 98765 43217', position: 'Substitute Mid', role: 'Substitute', invitationStatus: 'Joined' },
      { id: 'm-9', name: 'Tushar Mane', email: 'tushar.m@demo.sportlink.in', phone: '+91 98765 43218', position: 'Substitute Def', role: 'Substitute', invitationStatus: 'Pending' }
    ]
  },
  {
    id: 'team-2',
    name: 'Deccan Warriors CC',
    sport: 'Cricket',
    city: 'Pune',
    collegeOrOrg: 'Deccan Gymkhana',
    description: 'Premier amateur cricket squad training at Deccan Gymkhana nets.',
    captainId: 'user-captain-2',
    captainName: 'Vikram Deshmukh',
    logoInitials: 'DW',
    members: [
      { id: 'm-201', name: 'Vikram Deshmukh', email: 'vikram.d@demo.sportlink.in', phone: '+91 98221 55443', position: 'All-Rounder', role: 'Captain', invitationStatus: 'Joined' },
      { id: 'm-202', name: 'Gaurav Kulkarni', email: 'gaurav.k@demo.sportlink.in', phone: '+91 98221 55444', position: 'Opening Batsman', role: 'Vice-captain', invitationStatus: 'Joined' },
      { id: 'm-203', name: 'Aniket More', email: 'aniket.m@demo.sportlink.in', phone: '+91 98221 55445', position: 'Wicket-Keeper Batsman', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-204', name: 'Prasad Sawant', email: 'prasad.s@demo.sportlink.in', phone: '+91 98221 55446', position: 'Fast Bowler', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-205', name: 'Suhas Jadhav', email: 'suhas.j@demo.sportlink.in', phone: '+91 98221 55447', position: 'Spin Bowler', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-206', name: 'Harshvardhan Rane', email: 'harsh.r@demo.sportlink.in', phone: '+91 98221 55448', position: 'Middle Order', role: 'Player', invitationStatus: 'Joined' }
    ]
  },
  {
    id: 'team-3',
    name: 'Phoenix Smashers',
    sport: 'Badminton',
    city: 'Pune',
    collegeOrOrg: 'Symbiosis Sports Arena',
    description: 'Competitive doubles and club badminton roster competing in Pune district circuits.',
    captainId: 'user-player-1',
    captainName: 'Priya Sen',
    logoInitials: 'PS',
    members: [
      { id: 'm-301', name: 'Priya Sen', email: 'priya.sen@demo.sportlink.in', phone: '+91 98230 11223', position: 'Singles / Mixed Doubles', role: 'Captain', invitationStatus: 'Joined' },
      { id: 'm-302', name: 'Tanvi Bhosale', email: 'tanvi.b@demo.sportlink.in', phone: '+91 98230 11224', position: 'Women Doubles Partner', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-303', name: 'Manish Chawla', email: 'manish.c@demo.sportlink.in', phone: '+91 98230 11225', position: 'Men Doubles Partner', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-304', name: 'Deepak Rao', email: 'deepak.r@demo.sportlink.in', phone: '+91 98230 11226', position: 'Reserve', role: 'Substitute', invitationStatus: 'Pending' }
    ]
  },
  {
    id: 'team-4',
    name: 'Pune Dunkers',
    sport: 'Basketball',
    city: 'Pune',
    collegeOrOrg: 'COEP Technological University',
    description: 'Fast-break collegiate 3x3 and 5x5 basketball club.',
    captainId: 'user-captain-1',
    captainName: 'Rahul Sharma',
    logoInitials: 'PD',
    members: [
      { id: 'm-401', name: 'Rahul Sharma', email: 'rahul.s@demo.sportlink.in', phone: '+91 98765 43210', position: 'Point Guard', role: 'Captain', invitationStatus: 'Joined' },
      { id: 'm-402', name: 'Varun Joshi', email: 'varun.j@demo.sportlink.in', phone: '+91 98765 99881', position: 'Shooting Guard', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-403', name: 'Karthik Rao', email: 'karthik.r@demo.sportlink.in', phone: '+91 98765 99882', position: 'Small Forward', role: 'Player', invitationStatus: 'Joined' },
      { id: 'm-404', name: 'Siddharth Iyer', email: 'sid.iyer@demo.sportlink.in', phone: '+91 98765 99883', position: 'Power Forward', role: 'Player', invitationStatus: 'Joined' }
    ]
  }
];

// Initial 8 Realistic Tournaments
export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourn-1',
    name: 'Pune Inter-College Football Cup',
    sport: 'Football',
    organiserId: 'user-org-1',
    organiserName: 'Maharashtra Football Association',
    organiserVerified: true,
    city: 'Pune',
    venue: 'Shivaji Park Stadium Grounds',
    address: 'Near Deccan Gymkhana, Pune 411004',
    startDate: getRelativeDate(10, 8, 30),
    endDate: getRelativeDate(12, 18, 0),
    registrationOpens: getRelativeDate(-14, 9, 0),
    registrationDeadline: getRelativeDate(2, 23, 59), // Closing soon (< 3 days)
    format: 'single_elimination',
    participationType: 'team',
    teamSize: { min: 7, max: 10, substitutes: 3 },
    capacity: 8,
    entryFee: 1500,
    feeUnit: 'per team',
    prizePool: 20000,
    prizeDistribution: [
      { rank: 'Champion', amount: 12000, trophy: true },
      { rank: 'Runners-up', amount: 6000, trophy: true },
      { rank: '3rd Place', amount: 2000, trophy: false }
    ],
    eligibility: {
      minAge: 17,
      maxAge: 25,
      collegeOnly: true,
      skill: 'Inter-College',
      documents: ['College Student ID Card', 'Bonafide Certificate']
    },
    rules: [
      '7 players on field with rolling substitutions allowed (max 3 per half).',
      'Match duration: 2 halves of 25 minutes each with a 7-minute interval.',
      'In knockout matches, a tie at full time will proceed directly to a penalty shootout (5 kicks each).',
      'All team members must belong to the registered bona-fide college.',
      'Shin guards and team jerseys with printed numbers are compulsory.'
    ],
    refundPolicy: 'Full refund (less 5% bank charge) if cancelled 5 days before registration deadline. 50% refund before deadline. No refund once fixtures are drawn.',
    contact: { email: 'football.cup@mfa-demo.org', phone: '+91 20 2567 8901' },
    status: 'Registration Open',
    waitlistEnabled: true,
    isSample: true,
    scoringConfig: {
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [
      {
        id: 'fix-1',
        roundName: 'Semi-finals',
        roundIndex: 1,
        matchNumber: 1,
        teamA: { id: 'team-1', name: 'Fergusson Strikers' },
        teamB: { id: 'team-sample-b', name: 'BMCC Knights' },
        scheduledTime: getRelativeDate(10, 9, 0),
        courtOrPitch: 'Pitch 1 (Main Turf)',
        status: 'Completed',
        result: {
          teamAScore: 3,
          teamBScore: 1,
          winnerId: 'team-1',
          notes: 'Fergusson Strikers advanced to Final'
        }
      },
      {
        id: 'fix-2',
        roundName: 'Semi-finals',
        roundIndex: 1,
        matchNumber: 2,
        teamA: { id: 'team-sample-c', name: 'COEP Dynamos' },
        teamB: { id: 'team-sample-d', name: 'MIT Titans' },
        scheduledTime: getRelativeDate(10, 11, 0),
        courtOrPitch: 'Pitch 1 (Main Turf)',
        status: 'Completed',
        result: {
          teamAScore: 0,
          teamBScore: 2,
          winnerId: 'team-sample-d',
          notes: 'MIT Titans advanced to Final'
        }
      },
      {
        id: 'fix-3',
        roundName: 'Final',
        roundIndex: 2,
        matchNumber: 3,
        teamA: { id: 'team-1', name: 'Fergusson Strikers' },
        teamB: { id: 'team-sample-d', name: 'MIT Titans' },
        scheduledTime: getRelativeDate(12, 16, 0),
        courtOrPitch: 'Pitch 1 (Main Turf)',
        status: 'Scheduled',
        result: null
      }
    ],
    resultsPublished: true
  },
  {
    id: 'tourn-2',
    name: 'Cricket Champions League T20',
    sport: 'Cricket',
    organiserId: 'user-org-3',
    organiserName: 'Apex Sports Club',
    organiserVerified: false,
    city: 'Pune',
    venue: 'Deccan Gymkhana Main Pavilion',
    address: 'Prabhat Road, Deccan Gymkhana, Pune 411004',
    startDate: getRelativeDate(18, 9, 0),
    endDate: getRelativeDate(24, 18, 0),
    registrationOpens: getRelativeDate(-20, 9, 0),
    registrationDeadline: getRelativeDate(8, 23, 59),
    format: 'league',
    participationType: 'team',
    teamSize: { min: 11, max: 15, substitutes: 4 },
    capacity: 6,
    entryFee: 3000,
    feeUnit: 'per team',
    prizePool: 50000,
    prizeDistribution: [
      { rank: 'Champions', amount: 30000, trophy: true },
      { rank: 'Runners-up', amount: 15000, trophy: true },
      { rank: 'Player of Tournament', amount: 5000, trophy: true }
    ],
    eligibility: {
      minAge: 16,
      maxAge: 40,
      collegeOnly: false,
      skill: 'Open',
      documents: ['Government Photo ID']
    },
    rules: [
      'Standard ICC T20 rules with 20 overs per side, maximum 4 overs per bowler.',
      'Red leather ball will be provided by tournament organisers.',
      'Proper cricket whites or matching team coloured jerseys required.',
      'DLS method will be applied in case of rain interruptions.'
    ],
    refundPolicy: 'Full refund if cancelled before registration closing. 50% refund up to 72 hours prior to opening match.',
    contact: { email: 'ccl.t20@apexsports-demo.in', phone: '+91 98229 00998' },
    status: 'Registration Open',
    waitlistEnabled: true,
    isSample: true,
    scoringConfig: {
      pointsWin: 2,
      pointsDraw: 1,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [
      {
        id: 'fix-c1',
        roundName: 'Round 1',
        roundIndex: 1,
        matchNumber: 1,
        teamA: { id: 'team-2', name: 'Deccan Warriors CC' },
        teamB: { id: 'team-cc-2', name: 'Pune Stallions CC' },
        scheduledTime: getRelativeDate(18, 9, 30),
        courtOrPitch: 'Pavilion Oval',
        status: 'Scheduled',
        result: null
      }
    ],
    resultsPublished: false
  },
  {
    id: 'tourn-3',
    name: 'City Badminton Open',
    sport: 'Badminton',
    organiserId: 'user-org-2',
    organiserName: 'Pune District Badminton Association',
    organiserVerified: true,
    city: 'Pune',
    venue: 'Balewadi Sports Complex Badminton Hall',
    address: 'National Games Park, Balewadi, Pune 411045',
    startDate: getRelativeDate(14, 8, 0),
    endDate: getRelativeDate(16, 20, 0),
    registrationOpens: getRelativeDate(-25, 9, 0),
    registrationDeadline: getRelativeDate(5, 23, 59),
    format: 'individual',
    participationType: 'both',
    teamSize: { min: 1, max: 2, substitutes: 0 },
    capacity: 16,
    entryFee: 300,
    feeUnit: 'per player',
    prizePool: 15000,
    prizeDistribution: [
      { rank: 'Gold / Champion', amount: 8000, trophy: true },
      { rank: 'Silver / Runners-up', amount: 5000, trophy: true },
      { rank: 'Bronze / 3rd Place', amount: 2000, trophy: true }
    ],
    eligibility: {
      minAge: 14,
      maxAge: 45,
      collegeOnly: false,
      skill: 'Amateur & Club',
      documents: ['Aadhar Card or Driving License']
    },
    rules: [
      'BWF 21-point rally scoring system, best of 3 games.',
      'Yonex Aerosensa 2 feather shuttles will be provided for all championship rounds.',
      'Non-marking badminton shoes are mandatory on synthetic courts.',
      'Both singles and doubles brackets available.'
    ],
    refundPolicy: 'Withdrawals accepted with 100% refund up to 48 hours before match draw.',
    contact: { email: 'badminton.open@pdba-demo.in', phone: '+91 20 2445 6789' },
    status: 'Registration Open',
    waitlistEnabled: true,
    isSample: true,
    scoringConfig: {
      pointsWin: 2,
      pointsDraw: 0,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [],
    resultsPublished: false
  },
  {
    id: 'tourn-4',
    name: 'Apex Volleyball Community Cup',
    sport: 'Volleyball',
    organiserId: 'user-org-3',
    organiserName: 'Apex Sports Club',
    organiserVerified: false,
    city: 'Pune',
    venue: 'Kothrud Community Sports Arena',
    address: 'Near Gandhi Bhavan, Kothrud, Pune 411038',
    startDate: getRelativeDate(7, 10, 0),
    endDate: getRelativeDate(8, 18, 0),
    registrationOpens: getRelativeDate(-10, 9, 0),
    registrationDeadline: getRelativeDate(1, 20, 0), // Closing very soon!
    format: 'single_elimination',
    participationType: 'team',
    teamSize: { min: 6, max: 9, substitutes: 3 },
    capacity: 8,
    entryFee: 0, // Free entry
    feeUnit: 'per team',
    prizePool: 10000,
    prizeDistribution: [
      { rank: 'Champions', amount: 7000, trophy: true },
      { rank: 'Runners-up', amount: 3000, trophy: true }
    ],
    eligibility: {
      minAge: 16,
      maxAge: 35,
      collegeOnly: false,
      skill: 'Open',
      documents: ['Photo ID']
    },
    rules: [
      'Best of 3 sets: first two sets to 25 points, deciding 3rd set to 15 points (2-point lead).',
      'Free entry tournament organised to encourage amateur volleyball.',
      'Libero substitutions follow FIVB standards.'
    ],
    refundPolicy: 'Free event. No entry fee collected. Teams withdrawing less than 24 hours prior may face a 1-tournament suspension.',
    contact: { email: 'volleyball@apexsports-demo.in', phone: '+91 98229 00998' },
    status: 'Registration Open',
    waitlistEnabled: true,
    isSample: true,
    scoringConfig: {
      pointsWin: 2,
      pointsDraw: 0,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [],
    resultsPublished: false
  },
  {
    id: 'tourn-5',
    name: 'Metro Basketball 3x3 Championship',
    sport: 'Basketball',
    organiserId: 'user-org-3',
    organiserName: 'Apex Sports Club',
    organiserVerified: false,
    city: 'Mumbai',
    venue: 'Bandra Reclamation Urban Courts',
    address: 'KC Marg, Bandra West, Mumbai 400050',
    startDate: getRelativeDate(25, 9, 30),
    endDate: getRelativeDate(26, 21, 0),
    registrationOpens: getRelativeDate(-5, 9, 0),
    registrationDeadline: getRelativeDate(15, 23, 59),
    format: 'group_knockout',
    participationType: 'team',
    teamSize: { min: 3, max: 4, substitutes: 1 },
    capacity: 12,
    entryFee: 1000,
    feeUnit: 'per team',
    prizePool: 25000,
    prizeDistribution: [
      { rank: 'Champions', amount: 15000, trophy: true },
      { rank: 'Runners-up', amount: 7000, trophy: true },
      { rank: '3-Point Contest Winner', amount: 3000, trophy: true }
    ],
    eligibility: {
      minAge: 18,
      maxAge: 32,
      collegeOnly: false,
      skill: 'Advanced',
      documents: ['Government Photo ID']
    },
    rules: [
      'Official FIBA 3x3 half-court rules.',
      'Game duration: 10 minutes or first team to reach 21 points.',
      '12-second shot clock enforced.'
    ],
    refundPolicy: 'Full refund if requested 7 days before event.',
    contact: { email: 'hoops@apexsports-demo.in', phone: '+91 98229 00998' },
    status: 'Registration Open',
    waitlistEnabled: true,
    isSample: true,
    scoringConfig: {
      pointsWin: 3,
      pointsDraw: 0,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [],
    resultsPublished: false
  },
  {
    id: 'tourn-6',
    name: 'Deccan Clay Court Tennis Masters',
    sport: 'Tennis',
    organiserId: 'user-org-2',
    organiserName: 'Pune District Badminton Association',
    organiserVerified: true,
    city: 'Pune',
    venue: 'Deccan Gymkhana Tennis Courts',
    address: 'Near Swimming Pool, Deccan, Pune 411004',
    startDate: getRelativeDate(30, 7, 30),
    endDate: getRelativeDate(33, 19, 0),
    registrationOpens: getRelativeDate(0, 9, 0),
    registrationDeadline: getRelativeDate(20, 23, 59),
    format: 'single_elimination',
    participationType: 'individual',
    teamSize: { min: 1, max: 1, substitutes: 0 },
    capacity: 16,
    entryFee: 600,
    feeUnit: 'per player',
    prizePool: 18000,
    prizeDistribution: [
      { rank: 'Champion', amount: 10000, trophy: true },
      { rank: 'Finalist', amount: 5000, trophy: true },
      { rank: 'Semi-finalists', amount: 1500, trophy: false }
    ],
    eligibility: {
      minAge: 16,
      maxAge: 50,
      collegeOnly: false,
      skill: 'Open',
      documents: ['AITA Card or Govt ID']
    },
    rules: [
      'Best of 3 sets with 7-point tiebreak at 6-6 in the first two sets; 10-point super tiebreak in deciding 3rd set.',
      'ITF approved Wilson clay court balls provided.'
    ],
    refundPolicy: 'Full refund minus payment gateway fee if withdrawn 4 days prior.',
    contact: { email: 'tennis@pdba-demo.in', phone: '+91 20 2445 6789' },
    status: 'Registration Open',
    waitlistEnabled: false,
    isSample: true,
    scoringConfig: {
      pointsWin: 1,
      pointsDraw: 0,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [],
    resultsPublished: false
  },
  {
    id: 'tourn-7',
    name: 'Monsoon Futsal Premier League',
    sport: 'Football',
    organiserId: 'user-org-1',
    organiserName: 'Maharashtra Football Association',
    organiserVerified: true,
    city: 'Pune',
    venue: 'Elite Football Arena Turf A',
    address: 'Baner-Pashan Link Road, Pune 411045',
    startDate: getRelativeDate(-2, 18, 0),
    endDate: getRelativeDate(3, 22, 0),
    registrationOpens: getRelativeDate(-30, 9, 0),
    registrationDeadline: getRelativeDate(-4, 23, 59),
    format: 'round_robin',
    participationType: 'team',
    teamSize: { min: 5, max: 8, substitutes: 3 },
    capacity: 4,
    entryFee: 2500,
    feeUnit: 'per team',
    prizePool: 35000,
    prizeDistribution: [
      { rank: 'League Champions', amount: 20000, trophy: true },
      { rank: '2nd Place', amount: 10000, trophy: true },
      { rank: 'Golden Boot', amount: 5000, trophy: true }
    ],
    eligibility: {
      minAge: 18,
      maxAge: 35,
      collegeOnly: false,
      skill: 'Open',
      documents: ['Photo ID']
    },
    rules: [
      '5v5 Futsal with low bounce FIFA size 4 balls.',
      '2 halves of 20 minutes running time.',
      'Round-robin league format where each team plays all other teams once.'
    ],
    refundPolicy: 'No refunds once league fixtures are published.',
    contact: { email: 'futsal@mfa-demo.org', phone: '+91 20 2567 8901' },
    status: 'Ongoing',
    waitlistEnabled: false,
    isSample: true,
    scoringConfig: {
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [
      {
        id: 'fix-f1',
        roundName: 'Matchday 1',
        roundIndex: 1,
        matchNumber: 1,
        teamA: { id: 'team-1', name: 'Fergusson Strikers' },
        teamB: { id: 'team-fut-2', name: 'Baner Bulls' },
        scheduledTime: getRelativeDate(-2, 19, 0),
        courtOrPitch: 'Turf A',
        status: 'Completed',
        result: {
          teamAScore: 4,
          teamBScore: 2,
          winnerId: 'team-1',
          notes: 'Fergusson Strikers won 4-2'
        }
      },
      {
        id: 'fix-f2',
        roundName: 'Matchday 1',
        roundIndex: 1,
        matchNumber: 2,
        teamA: { id: 'team-fut-3', name: 'Kothrud Kickers' },
        teamB: { id: 'team-fut-4', name: 'Aundh Aces' },
        scheduledTime: getRelativeDate(-2, 20, 15),
        courtOrPitch: 'Turf A',
        status: 'Completed',
        result: {
          teamAScore: 1,
          teamBScore: 1,
          winnerId: null,
          isDraw: true,
          notes: 'Match ended in 1-1 draw'
        }
      },
      {
        id: 'fix-f3',
        roundName: 'Matchday 2',
        roundIndex: 2,
        matchNumber: 3,
        teamA: { id: 'team-1', name: 'Fergusson Strikers' },
        teamB: { id: 'team-fut-3', name: 'Kothrud Kickers' },
        scheduledTime: getRelativeDate(1, 19, 0),
        courtOrPitch: 'Turf A',
        status: 'Scheduled',
        result: null
      },
      {
        id: 'fix-f4',
        roundName: 'Matchday 2',
        roundIndex: 2,
        matchNumber: 4,
        teamA: { id: 'team-fut-2', name: 'Baner Bulls' },
        teamB: { id: 'team-fut-4', name: 'Aundh Aces' },
        scheduledTime: getRelativeDate(1, 20, 15),
        courtOrPitch: 'Turf A',
        status: 'Scheduled',
        result: null
      }
    ],
    resultsPublished: true
  },
  {
    id: 'tourn-8',
    name: 'State University Inter-Collegiate Derbies',
    sport: 'Football',
    organiserId: 'user-org-1',
    organiserName: 'Maharashtra Football Association',
    organiserVerified: true,
    city: 'Pune',
    venue: 'University Stadium Ground',
    address: 'Ganeshkhind Road, Pune 411007',
    startDate: getRelativeDate(-20, 8, 0),
    endDate: getRelativeDate(-18, 18, 0),
    registrationOpens: getRelativeDate(-45, 9, 0),
    registrationDeadline: getRelativeDate(-25, 23, 59),
    format: 'single_elimination',
    participationType: 'team',
    teamSize: { min: 11, max: 18, substitutes: 7 },
    capacity: 8,
    entryFee: 1800,
    feeUnit: 'per team',
    prizePool: 40000,
    prizeDistribution: [
      { rank: 'State Champions', amount: 25000, trophy: true },
      { rank: 'Runners-up', amount: 15000, trophy: true }
    ],
    eligibility: {
      minAge: 18,
      maxAge: 25,
      collegeOnly: true,
      skill: 'Inter-College',
      documents: ['University ID Card', 'Medical Fitness Certificate']
    },
    rules: ['Full 11-a-side FIFA rules with 45 min halves.'],
    refundPolicy: 'No refunds post registration closing.',
    contact: { email: 'derbies@mfa-demo.org', phone: '+91 20 2567 8901' },
    status: 'Completed',
    waitlistEnabled: false,
    isSample: true,
    scoringConfig: {
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha']
    },
    fixtures: [
      {
        id: 'fix-comp-1',
        roundName: 'Final',
        roundIndex: 1,
        matchNumber: 1,
        teamA: { id: 'team-1', name: 'Fergusson Strikers' },
        teamB: { id: 'team-comp-b', name: 'Modern College FC' },
        scheduledTime: getRelativeDate(-18, 16, 0),
        courtOrPitch: 'Main Arena',
        status: 'Completed',
        result: {
          teamAScore: 2,
          teamBScore: 1,
          winnerId: 'team-1',
          notes: 'Fergusson Strikers won the championship 2-1'
        }
      }
    ],
    resultsPublished: true
  }
];

// Initial 12 Sample Registrations
export const INITIAL_REGISTRATIONS = [
  {
    id: 'reg-101',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-1',
    entrantName: 'Fergusson Strikers',
    captainId: 'user-captain-1',
    captainName: 'Rahul Sharma',
    captainPhone: '+91 98765 43210',
    captainEmail: 'rahul.s@demo.sportlink.in',
    playerCount: 8,
    submittedOn: getRelativeDate(-10, 14, 20),
    registrationStatus: 'Approved',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['College Student ID Card', 'Bonafide Certificate'],
    documents: [
      { name: 'fergusson_roster_ids.pdf', verified: true },
      { name: 'principal_bonafide.pdf', verified: true }
    ],
    roster: [
      { name: 'Rahul Sharma', role: 'Captain', position: 'Forward' },
      { name: 'Aditya Kadam', role: 'Vice-captain', position: 'Midfield' },
      { name: 'Faizan Sheikh', role: 'Player', position: 'Defender' },
      { name: 'Kunal Joshi', role: 'Player', position: 'Goalkeeper' },
      { name: 'Rohan Shinde', role: 'Player', position: 'Winger' },
      { name: 'Siddharth Roy', role: 'Player', position: 'Defender' },
      { name: 'Nikhil Patil', role: 'Player', position: 'Striker' },
      { name: 'Sameer Varma', role: 'Substitute', position: 'Midfield' }
    ]
  },
  {
    id: 'reg-102',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-b',
    entrantName: 'BMCC Knights',
    captainId: 'user-sample-bmcc',
    captainName: 'Rohan Mehta',
    captainPhone: '+91 98220 99881',
    captainEmail: 'rohan.m@bmcc.demo',
    playerCount: 8,
    submittedOn: getRelativeDate(-9, 11, 0),
    registrationStatus: 'Approved',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['College Student ID Card'],
    documents: [{ name: 'bmcc_ids.pdf', verified: true }]
  },
  {
    id: 'reg-103',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-c',
    entrantName: 'COEP Dynamos',
    captainId: 'user-sample-coep',
    captainName: 'Sarang Date',
    captainPhone: '+91 98220 44332',
    captainEmail: 'sarang@coep.demo',
    playerCount: 7,
    submittedOn: getRelativeDate(-8, 16, 30),
    registrationStatus: 'Approved',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['College Student ID Card'],
    documents: [{ name: 'coep_bonafide.pdf', verified: true }]
  },
  {
    id: 'reg-104',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-d',
    entrantName: 'MIT Titans',
    captainId: 'user-sample-mit',
    captainName: 'Chinmay Joshi',
    captainPhone: '+91 98220 77112',
    captainEmail: 'chinmay@mit.demo',
    playerCount: 9,
    submittedOn: getRelativeDate(-8, 18, 0),
    registrationStatus: 'Approved',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['College Student ID Card'],
    documents: [{ name: 'mit_doc.pdf', verified: true }]
  },
  {
    id: 'reg-105',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-e',
    entrantName: 'DY Patil Strikers',
    captainId: 'user-sample-dyp',
    captainName: 'Naveen Pawar',
    captainPhone: '+91 98220 66221',
    captainEmail: 'naveen@dyp.demo',
    playerCount: 8,
    submittedOn: getRelativeDate(-3, 10, 15),
    registrationStatus: 'Submitted',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: [],
    documents: [{ name: 'dyp_student_cards.pdf', verified: false }]
  },
  {
    id: 'reg-106',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-f',
    entrantName: 'Singhad Scorpions',
    captainId: 'user-sample-singhad',
    captainName: 'Pratik Jagtap',
    captainPhone: '+91 98220 33119',
    captainEmail: 'pratik@singhad.demo',
    playerCount: 7,
    submittedOn: getRelativeDate(-2, 12, 0),
    registrationStatus: 'Pending',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: 'Bonafide certificate copy is blurry and missing college seal. Please upload a clear scanned copy.',
    rejectionReason: '',
    verifiedDocs: [],
    documents: [{ name: 'singhad_unclear.pdf', verified: false }]
  },
  {
    id: 'reg-107',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-g',
    entrantName: 'AISSMS Gladiators',
    captainId: 'user-sample-aissms',
    captainName: 'Vivek Shinde',
    captainPhone: '+91 98220 55884',
    captainEmail: 'vivek@aissms.demo',
    playerCount: 8,
    submittedOn: getRelativeDate(-1, 15, 45),
    registrationStatus: 'Waitlisted',
    paymentStatus: 'Demo-paid',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: [],
    documents: [{ name: 'aissms_ids.pdf', verified: false }]
  },
  {
    id: 'reg-108',
    tournamentId: 'tourn-2',
    tournamentName: 'Cricket Champions League T20',
    participationType: 'team',
    entrantId: 'team-2',
    entrantName: 'Deccan Warriors CC',
    captainId: 'user-captain-2',
    captainName: 'Vikram Deshmukh',
    captainPhone: '+91 98221 55443',
    captainEmail: 'vikram.d@demo.sportlink.in',
    playerCount: 12,
    submittedOn: getRelativeDate(-6, 17, 0),
    registrationStatus: 'Approved',
    paymentStatus: 'Demo-paid',
    amountPaid: 3000,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['Government Photo ID'],
    documents: [{ name: 'deccan_roster_aadhar.pdf', verified: true }]
  },
  {
    id: 'reg-109',
    tournamentId: 'tourn-3',
    tournamentName: 'City Badminton Open',
    participationType: 'individual',
    entrantId: 'user-player-1',
    entrantName: 'Priya Sen',
    captainId: 'user-player-1',
    captainName: 'Priya Sen',
    captainPhone: '+91 98230 11223',
    captainEmail: 'priya.sen@demo.sportlink.in',
    playerCount: 1,
    submittedOn: getRelativeDate(-5, 10, 0),
    registrationStatus: 'Approved',
    paymentStatus: 'Demo-paid',
    amountPaid: 300,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['Aadhar Card or Driving License'],
    documents: [{ name: 'priya_aadhar_card.pdf', verified: true }]
  },
  {
    id: 'reg-110',
    tournamentId: 'tourn-4',
    tournamentName: 'Apex Volleyball Community Cup',
    participationType: 'team',
    entrantId: 'team-vol-1',
    entrantName: 'Kothrud Smashers',
    captainId: 'user-vol-cap',
    captainName: 'Amit Gokhale',
    captainPhone: '+91 98221 11002',
    captainEmail: 'amit.g@volleyball.demo',
    playerCount: 7,
    submittedOn: getRelativeDate(-4, 15, 30),
    registrationStatus: 'Approved',
    paymentStatus: 'Not required',
    amountPaid: 0,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: ['Photo ID'],
    documents: [{ name: 'kothrud_id_bundle.pdf', verified: true }]
  },
  {
    id: 'reg-111',
    tournamentId: 'tourn-1',
    tournamentName: 'Pune Inter-College Football Cup',
    participationType: 'team',
    entrantId: 'team-sample-x',
    entrantName: 'Pune Tech Renegades',
    captainId: 'user-sample-x',
    captainName: 'Ashok Gaikwad',
    captainPhone: '+91 98220 11229',
    captainEmail: 'ashok.g@demo.in',
    playerCount: 6,
    submittedOn: getRelativeDate(-12, 19, 0),
    registrationStatus: 'Rejected',
    paymentStatus: 'Refunded',
    amountPaid: 1500,
    missingInfoReason: '',
    rejectionReason: 'Team roster did not meet minimum requirement of 7 players before registration verification cutoff.',
    verifiedDocs: [],
    documents: []
  },
  {
    id: 'reg-112',
    tournamentId: 'tourn-3',
    tournamentName: 'City Badminton Open',
    participationType: 'individual',
    entrantId: 'user-sample-withdrawn',
    entrantName: 'Kunal Mehra',
    captainId: 'user-sample-withdrawn',
    captainName: 'Kunal Mehra',
    captainPhone: '+91 98220 99441',
    captainEmail: 'kunal.m@demo.in',
    playerCount: 1,
    submittedOn: getRelativeDate(-7, 14, 0),
    registrationStatus: 'Withdrawn',
    paymentStatus: 'Refund pending',
    amountPaid: 300,
    missingInfoReason: '',
    rejectionReason: '',
    verifiedDocs: [],
    documents: []
  }
];

// Initial In-App Notifications
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Registration Approved',
    message: 'Fergusson Strikers has been approved for the Pune Inter-College Football Cup.',
    tournamentId: 'tourn-1',
    timestamp: getRelativeDate(-5, 12, 0),
    read: false,
    type: 'success',
    targetUserId: 'user-captain-1'
  },
  {
    id: 'notif-2',
    title: 'Match Schedule Published',
    message: 'Semi-final fixtures for Pune Inter-College Football Cup are now live. First match vs BMCC Knights on Pitch 1.',
    tournamentId: 'tourn-1',
    timestamp: getRelativeDate(-3, 10, 30),
    read: false,
    type: 'info',
    targetUserId: 'user-captain-1'
  },
  {
    id: 'notif-3',
    title: 'New Team Registration',
    message: 'DY Patil Strikers has submitted an application for Pune Inter-College Football Cup.',
    tournamentId: 'tourn-1',
    timestamp: getRelativeDate(-3, 10, 15),
    read: true,
    type: 'info',
    targetUserId: 'user-org-1'
  },
  {
    id: 'notif-4',
    title: 'Registration Closing Soon',
    message: 'Registration for Pune Inter-College Football Cup closes in 48 hours. Capacity is currently 80% full.',
    tournamentId: 'tourn-1',
    timestamp: getRelativeDate(-1, 9, 0),
    read: false,
    type: 'warning',
    targetUserId: 'all'
  }
];

// Pure Helper Functions for Status Transitions & Verification

/**
 * Transition validation for Registration Status
 * Allowed transitions:
 * - Submitted -> Approved | Rejected | Waitlisted | Pending
 * - Pending -> Submitted | Withdrawn
 * - Waitlisted -> Approved | Withdrawn
 * - Approved -> Withdrawn
 * - Rejected is final
 * - Withdrawn is final
 */
export const ALLOWED_REG_TRANSITIONS = {
  Submitted: ['Approved', 'Rejected', 'Waitlisted', 'Pending'],
  Pending: ['Submitted', 'Withdrawn'],
  Waitlisted: ['Approved', 'Withdrawn'],
  Approved: ['Withdrawn'],
  Rejected: [],
  Withdrawn: []
};

export const canTransitionRegistration = (currentStatus, newStatus) => {
  if (!currentStatus || !newStatus) return false;
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_REG_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};

export const transitionRegistration = (registration, newStatus, reason = '', currentUserId = null) => {
  if (!canTransitionRegistration(registration.registrationStatus, newStatus)) {
    return {
      success: false,
      error: `Illegal registration status transition from "${registration.registrationStatus}" to "${newStatus}".`
    };
  }

  const updated = {
    ...registration,
    registrationStatus: newStatus
  };

  if (newStatus === 'Rejected') {
    updated.rejectionReason = reason || 'Application did not meet tournament criteria.';
    if (registration.paymentStatus === 'Demo-paid') {
      updated.paymentStatus = 'Refund pending';
    }
  }

  if (newStatus === 'Pending') {
    updated.missingInfoReason = reason || 'Additional documentation or clarification requested.';
  }

  if (newStatus === 'Withdrawn') {
    if (registration.paymentStatus === 'Demo-paid') {
      updated.paymentStatus = 'Refund pending';
    }
  }

  return { success: true, registration: updated };
};

/**
 * Filter pure function
 */
export const filterTournaments = (tournaments, filters = {}) => {
  return tournaments.filter((t) => {
    // Sport
    if (filters.sport && filters.sport !== 'all' && t.sport.toLowerCase() !== filters.sport.toLowerCase()) {
      return false;
    }

    // City / Search location
    if (filters.city && filters.city.trim() !== '') {
      const qCity = filters.city.toLowerCase().trim();
      if (!t.city.toLowerCase().includes(qCity) && !t.venue.toLowerCase().includes(qCity) && !t.address.toLowerCase().includes(qCity)) {
        return false;
      }
    }

    // Keyword Search
    if (filters.keyword && filters.keyword.trim() !== '') {
      const q = filters.keyword.toLowerCase().trim();
      const inName = t.name.toLowerCase().includes(q);
      const inSport = t.sport.toLowerCase().includes(q);
      const inOrg = t.organiserName.toLowerCase().includes(q);
      const inVenue = t.venue.toLowerCase().includes(q);
      const inCity = t.city.toLowerCase().includes(q);
      if (!inName && !inSport && !inOrg && !inVenue && !inCity) {
        return false;
      }
    }

    // Entry Fee range
    if (filters.maxFee !== undefined && filters.maxFee !== null && filters.maxFee !== '') {
      if (t.entryFee > Number(filters.maxFee)) {
        return false;
      }
    }
    if (filters.freeOnly && t.entryFee > 0) {
      return false;
    }

    // Min Prize Pool
    if (filters.minPrize && Number(filters.minPrize) > 0) {
      if ((t.prizePool || 0) < Number(filters.minPrize)) {
        return false;
      }
    }

    // Participation Type (individual vs team)
    if (filters.participationType && filters.participationType !== 'all') {
      if (filters.participationType === 'individual' && t.participationType === 'team') {
        return false;
      }
      if (filters.participationType === 'team' && t.participationType === 'individual') {
        return false;
      }
    }

    // College Only
    if (filters.collegeOnly && !t.eligibility?.collegeOnly) {
      return false;
    }

    // Status
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'closing_soon') {
        const days = daysUntil(t.registrationDeadline);
        if (t.status !== 'Registration Open' || days < 0 || days > 3) return false;
      } else if (t.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
    }

    // Collection Shortcuts
    if (filters.collection) {
      if (filters.collection === 'closing_soon') {
        const days = daysUntil(t.registrationDeadline);
        if (t.status !== 'Registration Open' || days < 0 || days > 3) return false;
      } else if (filters.collection === 'college') {
        if (!t.eligibility?.collegeOnly) return false;
      } else if (filters.collection === 'free') {
        if (t.entryFee > 0) return false;
      } else if (filters.collection === 'prize_pool') {
        if (!t.prizePool || t.prizePool < 20000) return false;
      } else if (filters.collection === 'open') {
        if (t.status !== 'Registration Open') return false;
      }
    }

    return true;
  });
};

/**
 * Sort pure function
 */
export const sortTournaments = (tournaments, sortKey = 'starting_soon') => {
  const cloned = [...tournaments];

  switch (sortKey) {
    case 'starting_soon':
      return cloned.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    case 'closing_soon':
      return cloned.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
    case 'fee_low':
      return cloned.sort((a, b) => a.entryFee - b.entryFee);
    case 'prize_high':
      return cloned.sort((a, b) => (b.prizePool || 0) - (a.prizePool || 0));
    case 'popular':
      return cloned.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    default:
      return cloned;
  }
};

/**
 * Derived Tournament Badges (Honesty & Trust rules)
 */
export const getDerivedLabels = (tournament, registrations = []) => {
  const labels = [];
  const days = daysUntil(tournament.registrationDeadline);

  if (tournament.status === 'Registration Open') {
    if (days >= 0 && days <= 3) {
      labels.push({ text: 'Closing Soon', variant: 'warning' });
    }
    // Filling fast derived only if registered count >= 80% of capacity
    const approvedCount = registrations.filter(
      (r) => r.tournamentId === tournament.id && (r.registrationStatus === 'Approved' || r.registrationStatus === 'Submitted')
    ).length;

    if (tournament.capacity && approvedCount >= Math.floor(tournament.capacity * 0.8)) {
      labels.push({ text: 'Filling Fast', variant: 'amber' });
    }
  }

  return labels;
};

/**
 * Detailed Eligibility Checker
 */
export const checkEligibility = (tournament, entrantDetails, existingRegistrations = []) => {
  const checks = [];
  let eligible = true;

  // 1. Tournament Status Check
  const isStatusOpen = tournament.status === 'Registration Open';
  checks.push({
    title: 'Tournament Registration Status',
    passed: isStatusOpen,
    message: isStatusOpen ? 'Registration is open.' : `Registration is ${tournament.status}.`
  });
  if (!isStatusOpen) eligible = false;

  // 2. Deadline Recheck
  const deadlineDays = daysUntil(tournament.registrationDeadline);
  const deadlinePassed = deadlineDays < 0;
  checks.push({
    title: 'Registration Deadline',
    passed: !deadlinePassed,
    message: !deadlinePassed ? `Open until ${formatDateDisplay(tournament.registrationDeadline)}.` : 'Deadline has passed.'
  });
  if (deadlinePassed) eligible = false;

  // 3. Duplicate Registration Check
  const entrantId = entrantDetails.teamId || entrantDetails.playerId;
  const isDuplicate = existingRegistrations.some(
    (r) =>
      r.tournamentId === tournament.id &&
      r.entrantId === entrantId &&
      ['Submitted', 'Approved', 'Waitlisted', 'Pending'].includes(r.registrationStatus)
  );
  checks.push({
    title: 'Duplicate Registration Check',
    passed: !isDuplicate,
    message: isDuplicate ? 'This player or team is already registered for this tournament.' : 'No existing registration found.'
  });
  if (isDuplicate) eligible = false;

  // 4. College Only Rule
  if (tournament.eligibility?.collegeOnly) {
    const isCollegeEntrant = Boolean(entrantDetails.college || entrantDetails.collegeOrOrg);
    checks.push({
      title: 'College Eligibility',
      passed: isCollegeEntrant,
      message: isCollegeEntrant
        ? `Verified collegiate affiliation: ${entrantDetails.college || entrantDetails.collegeOrOrg}`
        : 'This tournament is strictly open only to collegiate teams and bona fide students.'
    });
    if (!isCollegeEntrant) eligible = false;
  }

  // 5. Team Size Validation (if team)
  if (tournament.participationType !== 'individual' && entrantDetails.rosterSize) {
    const min = tournament.teamSize?.min || 1;
    const max = (tournament.teamSize?.max || 10) + (tournament.teamSize?.substitutes || 0);
    const sizeOk = entrantDetails.rosterSize >= min && entrantDetails.rosterSize <= max;
    checks.push({
      title: 'Squad Roster Limits',
      passed: sizeOk,
      message: sizeOk
        ? `Squad has ${entrantDetails.rosterSize} players (required: ${min} to ${max} players).`
        : `Roster has ${entrantDetails.rosterSize} players. Must have between ${min} and ${max} players.`
    });
    if (!sizeOk) eligible = false;
  }

  // 6. Age Validation (if individual or age provided)
  if (entrantDetails.age && tournament.eligibility) {
    const { minAge, maxAge } = tournament.eligibility;
    const ageOk = (!minAge || entrantDetails.age >= minAge) && (!maxAge || entrantDetails.age <= maxAge);
    checks.push({
      title: 'Age Eligibility',
      passed: ageOk,
      message: ageOk
        ? `Age ${entrantDetails.age} falls within allowed window (${minAge || 0} - ${maxAge || 'Any'} years).`
        : `Age ${entrantDetails.age} is outside the allowed bracket (${minAge} - ${maxAge} years).`
    });
    if (!ageOk) eligible = false;
  }

  // 7. Capacity and Waitlist Check
  const activeRegistrations = existingRegistrations.filter(
    (r) => r.tournamentId === tournament.id && (r.registrationStatus === 'Approved' || r.registrationStatus === 'Submitted')
  ).length;

  const isFull = tournament.capacity && activeRegistrations >= tournament.capacity;
  if (isFull) {
    if (tournament.waitlistEnabled) {
      checks.push({
        title: 'Capacity & Waitlist',
        passed: true,
        message: 'Direct quota is full, but Waitlist is active. Your entry will be waitlisted.',
        isWaitlistNotice: true
      });
    } else {
      checks.push({
        title: 'Capacity & Quota',
        passed: false,
        message: `Tournament capacity of ${tournament.capacity} has been reached and no waitlist is enabled.`
      });
      eligible = false;
    }
  } else {
    checks.push({
      title: 'Capacity Availability',
      passed: true,
      message: `${tournament.capacity - activeRegistrations} spots remaining of ${tournament.capacity}.`
    });
  }

  return { eligible, checks, isFull, willWaitlist: isFull && tournament.waitlistEnabled };
};

/**
 * Single-Elimination Fixture Generator with Byes
 */
export const generateSingleEliminationFixtures = (entrants = [], startDateIso, venue = 'Arena Court 1') => {
  if (entrants.length < 2) {
    return { success: false, error: 'At least 2 approved entrants are required to generate knockout fixtures.' };
  }

  // Nearest power of two
  let powerOfTwo = 2;
  while (powerOfTwo < entrants.length) {
    powerOfTwo *= 2;
  }

  const byesNeeded = powerOfTwo - entrants.length;
  const totalSlots = powerOfTwo;

  // Seed entrants and pad byes
  const seeded = [...entrants];
  for (let b = 0; b < byesNeeded; b++) {
    seeded.push({ id: `bye-${b}`, name: 'BYE', isBye: true });
  }

  // Round label generator
  const getRoundLabel = (totalTeamsInRound) => {
    if (totalTeamsInRound === 2) return 'Final';
    if (totalTeamsInRound === 4) return 'Semi-finals';
    if (totalTeamsInRound === 8) return 'Quarter-finals';
    return `Round of ${totalTeamsInRound}`;
  };

  const fixtures = [];
  const baseDate = new Date(startDateIso || Date.now());
  let matchIdCounter = 1;

  // Round 1 matches
  const round1MatchesCount = totalSlots / 2;
  const round1Label = getRoundLabel(totalSlots);

  for (let i = 0; i < round1MatchesCount; i++) {
    const teamA = seeded[i * 2];
    const teamB = seeded[i * 2 + 1];

    const matchDate = new Date(baseDate);
    matchDate.setHours(matchDate.getHours() + i * 2);

    const isABye = teamA.isBye;
    const isBBye = teamB.isBye;

    let matchStatus = 'Scheduled';
    let result = null;

    // Auto-advance if bye
    if (isABye && !isBBye) {
      matchStatus = 'Completed';
      result = { teamAScore: 0, teamBScore: 0, winnerId: teamB.id, notes: `${teamB.name} advanced via BYE` };
    } else if (!isABye && isBBye) {
      matchStatus = 'Completed';
      result = { teamAScore: 0, teamBScore: 0, winnerId: teamA.id, notes: `${teamA.name} advanced via BYE` };
    }

    fixtures.push({
      id: `fix-ko-${matchIdCounter++}`,
      roundName: round1Label,
      roundIndex: 1,
      matchNumber: i + 1,
      teamA: { id: teamA.id, name: teamA.name, isBye: teamA.isBye },
      teamB: { id: teamB.id, name: teamB.name, isBye: teamB.isBye },
      scheduledTime: matchDate.toISOString(),
      courtOrPitch: venue,
      status: matchStatus,
      result
    });
  }

  return { success: true, fixtures };
};

/**
 * Round-Robin Fixture Generator using Circle Method
 */
export const generateRoundRobinFixtures = (entrants = [], startDateIso, venue = 'Arena Court 1') => {
  if (entrants.length < 3) {
    return { success: false, error: 'At least 3 approved entrants are required for round-robin leagues.' };
  }

  const teams = [...entrants];
  // If odd, add a dummy bye
  if (teams.length % 2 !== 0) {
    teams.push({ id: 'dummy-bye', name: 'BYE', isBye: true });
  }

  const n = teams.length;
  const roundsCount = n - 1;
  const matchesPerRound = n / 2;
  const fixtures = [];
  const baseDate = new Date(startDateIso || Date.now());
  let matchCounter = 1;

  for (let round = 0; round < roundsCount; round++) {
    const roundDate = new Date(baseDate);
    roundDate.setDate(roundDate.getDate() + round);

    for (let match = 0; match < matchesPerRound; match++) {
      const homeIdx = (round + match) % (n - 1);
      let awayIdx = (n - 1 - match + round) % (n - 1);
      if (match === 0) {
        awayIdx = n - 1;
      }

      const teamA = teams[homeIdx];
      const teamB = teams[awayIdx];

      // Ignore matches against dummy bye
      if (teamA.isBye || teamB.isBye) continue;

      const matchTime = new Date(roundDate);
      matchTime.setHours(10 + match * 2, 0, 0, 0);

      fixtures.push({
        id: `fix-rr-${matchCounter++}`,
        roundName: `Matchday ${round + 1}`,
        roundIndex: round + 1,
        matchNumber: match + 1,
        teamA: { id: teamA.id, name: teamA.name },
        teamB: { id: teamB.id, name: teamB.name },
        scheduledTime: matchTime.toISOString(),
        courtOrPitch: `${venue} (Pitch ${(match % 2) + 1})`,
        status: 'Scheduled',
        result: null
      });
    }
  }

  return { success: true, fixtures };
};

/**
 * Fixture Conflict Detector
 * Checks for:
 * 1) Same team playing in overlapping match windows
 * 2) Same court/pitch double booked at the same time
 */
export const detectFixtureConflicts = (fixtures = []) => {
  const conflicts = [];

  for (let i = 0; i < fixtures.length; i++) {
    for (let j = i + 1; j < fixtures.length; j++) {
      const m1 = fixtures[i];
      const m2 = fixtures[j];

      if (!m1.scheduledTime || !m2.scheduledTime) continue;

      const t1 = new Date(m1.scheduledTime).getTime();
      const t2 = new Date(m2.scheduledTime).getTime();
      const diffMinutes = Math.abs(t1 - t2) / (1000 * 60);

      // Assume typical match window is 90 minutes
      const isOverlap = diffMinutes < 90;

      if (isOverlap) {
        // Venue collision
        if (m1.courtOrPitch && m2.courtOrPitch && m1.courtOrPitch === m2.courtOrPitch) {
          conflicts.push({
            type: 'venue_collision',
            matchA: m1,
            matchB: m2,
            message: `Double-booking on "${m1.courtOrPitch}": Match ${m1.matchNumber} (${m1.teamA?.name} vs ${m1.teamB?.name}) overlaps with Match ${m2.matchNumber} (${m2.teamA?.name} vs ${m2.teamB?.name}).`
          });
        }

        // Team collision
        const teams1 = [m1.teamA?.id, m1.teamB?.id].filter(Boolean);
        const teams2 = [m2.teamA?.id, m2.teamB?.id].filter(Boolean);
        const common = teams1.filter((id) => teams2.includes(id));

        if (common.length > 0) {
          conflicts.push({
            type: 'team_collision',
            matchA: m1,
            matchB: m2,
            message: `Scheduling clash: Team participates in both Match ${m1.matchNumber} and Match ${m2.matchNumber} within 90 minutes.`
          });
        }
      }
    }
  }

  return conflicts;
};

/**
 * Recalculate League Standings with Configurable Tie-Break Rules
 */
export const calculateStandings = (fixtures = [], scoringConfig = {}, teams = []) => {
  const config = {
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    tieBreakerOrder: ['points', 'headToHead', 'diff', 'scored', 'alpha'],
    ...scoringConfig
  };

  const tableMap = {};

  // Initialize table for all known teams
  teams.forEach((t) => {
    tableMap[t.id] = {
      id: t.id,
      name: t.name || t.entrantName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      for: 0,
      against: 0,
      diff: 0,
      points: 0,
      h2h: {} // vs opponent
    };
  });

  // Tally completed fixtures
  fixtures.forEach((f) => {
    if (f.status === 'Completed' && f.result && f.teamA && f.teamB) {
      const aId = f.teamA.id;
      const bId = f.teamB.id;

      if (!tableMap[aId]) {
        tableMap[aId] = {
          id: aId,
          name: f.teamA.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          for: 0,
          against: 0,
          diff: 0,
          points: 0,
          h2h: {}
        };
      }
      if (!tableMap[bId]) {
        tableMap[bId] = {
          id: bId,
          name: f.teamB.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          for: 0,
          against: 0,
          diff: 0,
          points: 0,
          h2h: {}
        };
      }

      const scoreA = Number(f.result.teamAScore || 0);
      const scoreB = Number(f.result.teamBScore || 0);

      tableMap[aId].played += 1;
      tableMap[bId].played += 1;
      tableMap[aId].for += scoreA;
      tableMap[aId].against += scoreB;
      tableMap[bId].for += scoreB;
      tableMap[bId].against += scoreA;

      if (scoreA > scoreB) {
        tableMap[aId].won += 1;
        tableMap[aId].points += config.pointsWin;
        tableMap[bId].lost += 1;
        tableMap[bId].points += config.pointsLoss;
        tableMap[aId].h2h[bId] = (tableMap[aId].h2h[bId] || 0) + 1;
      } else if (scoreB > scoreA) {
        tableMap[bId].won += 1;
        tableMap[bId].points += config.pointsWin;
        tableMap[aId].lost += 1;
        tableMap[aId].points += config.pointsLoss;
        tableMap[bId].h2h[aId] = (tableMap[bId].h2h[aId] || 0) + 1;
      } else {
        tableMap[aId].drawn += 1;
        tableMap[bId].drawn += 1;
        tableMap[aId].points += config.pointsDraw;
        tableMap[bId].points += config.pointsDraw;
      }

      tableMap[aId].diff = tableMap[aId].for - tableMap[aId].against;
      tableMap[bId].diff = tableMap[bId].for - tableMap[bId].against;
    }
  });

  const standingsList = Object.values(tableMap);

  // Sorting with Tie-Break criteria
  standingsList.sort((a, b) => {
    // 1. Points
    if (b.points !== a.points) return b.points - a.points;

    // 2. Head-to-Head
    const h2hAB = a.h2h[b.id] || 0;
    const h2hBA = b.h2h[a.id] || 0;
    if (h2hBA !== h2hAB) return h2hBA - h2hAB;

    // 3. Goal Difference
    if (b.diff !== a.diff) return b.diff - a.diff;

    // 4. Goals Scored
    if (b.for !== a.for) return b.for - a.for;

    // 5. Alphabetical
    return a.name.localeCompare(b.name);
  });

  return standingsList.map((team, idx) => ({
    ...team,
    position: idx + 1
  }));
};

/**
 * Enforce Permission Matrix Helper
 */
export const checkActionPermission = ({ role, currentUserId, action, resource }) => {
  // Player
  if (role === 'player') {
    if (action === 'view_public') return { allowed: true };
    if (action === 'register_individual') return { allowed: true };
    if (action === 'withdraw_own_registration') {
      const isOwner = resource?.captainId === currentUserId || resource?.entrantId === currentUserId;
      return isOwner
        ? { allowed: true }
        : { allowed: false, message: 'You can only withdraw your own registrations.' };
    }
    return { allowed: false, message: 'Permission Denied: Player role has view-only access for this action.' };
  }

  // Team Captain
  if (role === 'captain') {
    if (action === 'view_public' || action === 'register_individual') return { allowed: true };
    if (action === 'manage_team') {
      const isCaptain = resource?.captainId === currentUserId;
      return isCaptain
        ? { allowed: true }
        : { allowed: false, message: 'Permission Denied: You can only edit and manage squads you captain.' };
    }
    if (action === 'register_team') {
      const isCaptain = resource?.captainId === currentUserId;
      return isCaptain
        ? { allowed: true }
        : { allowed: false, message: 'Only the designated team captain can submit this team roster for tournament entry.' };
    }
    if (action === 'withdraw_own_registration') {
      const isOwner = resource?.captainId === currentUserId || resource?.entrantId === currentUserId;
      return isOwner
        ? { allowed: true }
        : { allowed: false, message: 'You can only withdraw registrations submitted by you.' };
    }
    return { allowed: false, message: 'Permission Denied: Action requires Tournament Organiser privileges.' };
  }

  // Tournament Organiser
  if (role === 'organiser') {
    if (action === 'create_tournament') return { allowed: true };
    if (['edit_tournament', 'publish_tournament', 'cancel_tournament', 'manage_registrations', 'generate_fixtures', 'enter_results'].includes(action)) {
      const isTournamentOrganiser = resource?.organiserId === currentUserId;
      if (!isTournamentOrganiser) {
        return {
          allowed: false,
          message: `Permission Refused: You are signed in as organiser ID "${currentUserId}". This tournament is owned and managed by "${resource?.organiserName || resource?.organiserId}".`
        };
      }
      return { allowed: true };
    }

    if (action === 'approve_registration') {
      // Conflict of interest check
      if (resource?.captainId === currentUserId || resource?.entrantId === currentUserId) {
        return {
          allowed: false,
          message: 'Conflict of Interest: Organisers are strictly barred from approving their own registrations.'
        };
      }
      return { allowed: true };
    }
    return { allowed: true };
  }

  return { allowed: false, message: 'Invalid role or unrecognized action.' };
};
