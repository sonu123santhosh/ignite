/**
 * /src/data/coachingData.js
 * Comprehensive sample data and helper functions for SportLink Coaching Centres.
 * Supports Athlete Discovery & Booking and Coach / Academy Owner Management.
 * All sample data is simulated for prototype demonstration.
 */

// Helper for dynamic ISO dates relative to today
export const getRelativeDate = (dayOffset = 0, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const formatDate = (isoStr) => {
  if (!isoStr) return 'TBA';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoStr;
  }
};

export const formatTime = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
};

// Earth distance calculation in km
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// 1. DEMO USERS / PERSONAS
export const DEMO_PERSONAS = [
  {
    id: 'user-athlete-1',
    name: 'Aryan Salunke',
    role: 'player',
    email: 'aryan.s@sportlink.demo',
    phone: '+91 98220 11445',
    age: 19,
    skillLevel: 'Intermediate',
    preferredSport: 'Cricket',
    city: 'Pune',
    locality: 'Kothrud',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    description: 'College varsity cricket player looking for weekend fast bowling & conditioning clinics.'
  },
  {
    id: 'user-athlete-2',
    name: 'Sanya Mirza',
    role: 'player',
    email: 'sanya.m@sportlink.demo',
    phone: '+91 98230 77123',
    age: 15,
    skillLevel: 'Beginner',
    preferredSport: 'Badminton',
    city: 'Pune',
    locality: 'Deccan Gymkhana',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    description: 'Junior badminton enthusiast seeking small-group training batches.'
  },
  {
    id: 'user-owner-1',
    name: 'Coach Vikram Rathore',
    role: 'owner',
    email: 'vikram.rathore@elitecricket.demo',
    phone: '+91 98221 88990',
    academyId: 'acad-1',
    academyName: 'Elite Cricket Academy',
    city: 'Pune',
    locality: 'Shivajinagar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    description: 'BCCI Level 2 Certified Head Coach with 14 years experience developing junior and varsity state players.'
  },
  {
    id: 'user-owner-2',
    name: 'Marcus D\'Souza',
    role: 'owner',
    email: 'marcus@punefootball.demo',
    phone: '+91 98233 44556',
    academyId: 'acad-2',
    academyName: 'Pune Football Training Centre',
    city: 'Pune',
    locality: 'Kalyani Nagar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    description: 'AFC \'A\' License Academy Director running youth European-standard football pathways.'
  }
];

// 2. COACHING CENTRES / ACADEMIES (6 Illustrative Demo Academies)
export const INITIAL_ACADEMIES = [
  {
    id: 'acad-1',
    name: 'Elite Cricket Academy',
    ownerId: 'user-owner-1',
    sports: ['Cricket'],
    tagline: 'High-Performance Turf & Net Training with BCCI Certified Mentors',
    description: 'Elite Cricket Academy is Pune’s premier cricket centre featuring 6 floodlit turf practice wickets, indoor astro bowling lanes, PitchVision video analysis, and dedicated fitness trainers. We cater to all development phases from grassroots foundations to Ranji Trophy aspirants.',
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1531415074868-036b1c57e359?auto=format&fit=crop&w=150&q=80',
    logoInitials: 'ECA',
    address: 'Survey No. 42, Near Agricultural College Ground, Shivajinagar',
    city: 'Pune',
    locality: 'Shivajinagar',
    lat: 18.5314,
    lng: 73.8446,
    rating: 4.9,
    reviewCount: 148,
    ratingsBreakdown: {
      coachingQuality: 4.9,
      facilities: 4.8,
      communication: 4.7,
      valueForMoney: 4.8
    },
    monthlyFeeMin: 3500,
    monthlyFeeMax: 6000,
    perSessionFee: 400,
    trialClassAvailable: true,
    trialFee: 0, // Free Trial
    trainingLevels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    coachingTypes: ['Group coaching', 'Small-group coaching', 'Individual coaching'],
    facilityType: 'Indoor & Outdoor',
    ageGroups: ['Children (6-12)', 'Teenagers (13-18)', 'Adults (18+)'],
    amenities: ['Floodlit Turf Wickets', 'Indoor Nets', 'PitchVision Video Analysis', 'Changing Rooms & Showers', 'Dedicated Parking', 'Cafeteria & Hydration', 'First Aid Station'],
    accessible: true,
    womenCoaches: true,
    womenFocusedBatches: true,
    beginnerFriendly: true,
    scholarshipsAvailable: true,
    openingHours: 'Mon - Sat: 6:00 AM – 9:00 PM | Sun: 6:30 AM – 1:00 PM',
    contact: {
      phone: '+91 98221 88990',
      email: 'admissions@elitecricket.demo',
      website: 'https://elitecricket.demo'
    },
    status: 'Active',
    verified: true,
    verifiedDate: '2026-09-15',
    cancellationPolicy: 'Full refund if cancelled 48 hours before batch start date. Pro-rated refund for medical leaves over 2 weeks with doctor certificate.'
  },
  {
    id: 'acad-2',
    name: 'Pune Football Training Centre',
    ownerId: 'user-owner-2',
    sports: ['Football'],
    tagline: 'UEFA & AFC Curriculum Grounded in Technical Ball Mastery',
    description: 'PFTC provides structured European coaching methods on state-of-the-art FIFA standard synthetic pitches. Our age-graded training modules emphasize tactical intelligence, positional awareness, physical conditioning, and competitive inter-academy tournament exposure.',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&q=80',
    logoInitials: 'PFTC',
    address: 'Jogger’s Park Extn, East Avenue, Kalyani Nagar',
    city: 'Pune',
    locality: 'Kalyani Nagar',
    lat: 18.5482,
    lng: 73.9023,
    rating: 4.8,
    reviewCount: 112,
    ratingsBreakdown: {
      coachingQuality: 4.8,
      facilities: 4.9,
      communication: 4.6,
      valueForMoney: 4.7
    },
    monthlyFeeMin: 3000,
    monthlyFeeMax: 5500,
    perSessionFee: 350,
    trialClassAvailable: true,
    trialFee: 0,
    trainingLevels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    coachingTypes: ['Group coaching', 'Small-group coaching'],
    facilityType: 'Outdoor Turf',
    ageGroups: ['Children (5-11)', 'Teenagers (12-17)', 'Adults (18+)'],
    amenities: ['FIFA 2-Star AstroTurf', 'Floodlights', 'Speed & Agility Track', 'Locker Rooms', 'Ample Parking', 'Spectator Seating'],
    accessible: true,
    womenCoaches: true,
    womenFocusedBatches: true,
    beginnerFriendly: true,
    scholarshipsAvailable: true,
    openingHours: 'Mon - Sun: 5:30 AM – 9:30 PM',
    contact: {
      phone: '+91 98233 44556',
      email: 'info@punefootball.demo',
      website: 'https://punefootball.demo'
    },
    status: 'Active',
    verified: true,
    verifiedDate: '2026-08-20',
    cancellationPolicy: '7 days written notice for monthly plan cancellation with unused session adjustments.'
  },
  {
    id: 'acad-3',
    name: 'SmashPoint Badminton Academy',
    ownerId: 'user-owner-1',
    sports: ['Badminton'],
    tagline: 'Olympic Standard BWF Certified Wooden & Synthetic Courts',
    description: 'SmashPoint Badminton Academy offers air-cooled indoor training across 8 BWF-approved courts. Headed by former national championship medalists, our programmes focus on footwork agility, racquet speed mechanics, and match simulation psychology.',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1521537634581-0dced2fedc22?auto=format&fit=crop&w=150&q=80',
    logoInitials: 'SBA',
    address: 'Near Balewadi High Street, Baner - Balewadi Road',
    city: 'Pune',
    locality: 'Balewadi',
    lat: 18.5721,
    lng: 73.7712,
    rating: 4.9,
    reviewCount: 96,
    ratingsBreakdown: {
      coachingQuality: 5.0,
      facilities: 4.9,
      communication: 4.8,
      valueForMoney: 4.7
    },
    monthlyFeeMin: 4000,
    monthlyFeeMax: 7500,
    perSessionFee: 500,
    trialClassAvailable: true,
    trialFee: 200,
    trainingLevels: ['Beginner', 'Intermediate', 'Advanced', 'Professional development'],
    coachingTypes: ['Group coaching', 'Small-group coaching', 'Individual coaching'],
    facilityType: 'Indoor',
    ageGroups: ['Children (7-12)', 'Teenagers (13-18)', 'Adults (18+)'],
    amenities: ['8 BWF Synthetic Courts', 'Air Cooled Arena', 'Shuttlecock Machine Drill', 'Physiotherapy Cell', 'Stringing Service', 'Pro Shop'],
    accessible: true,
    womenCoaches: true,
    womenFocusedBatches: true,
    beginnerFriendly: true,
    scholarshipsAvailable: false,
    openingHours: 'Mon - Sat: 5:00 AM – 10:00 PM | Sun: 6:00 AM – 8:00 PM',
    contact: {
      phone: '+91 98229 33221',
      email: 'train@smashpoint.demo',
      website: 'https://smashpoint.demo'
    },
    status: 'Active',
    verified: true,
    verifiedDate: '2026-10-01',
    cancellationPolicy: 'Trial fee refundable if notified 24 hours prior. Monthly fees refundable before 3rd session.'
  },
  {
    id: 'acad-4',
    name: 'AquaFit Swimming School',
    ownerId: 'user-owner-2',
    sports: ['Swimming'],
    tagline: 'Temperature Controlled Olympic Pool with Certified Lifeguards',
    description: 'AquaFit Swimming School features a 50m Olympic competition pool and a separate shallow heated hydrotherapy pool. From water-safety and stroke correction for kids to competitive triathlon timing drills for adults, we maintain the highest standards of water hygiene and coach vigilance.',
    coverImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=150&q=80',
    logoInitials: 'AFSS',
    address: 'Prabhat Road, Lane 14, Deccan Gymkhana',
    city: 'Pune',
    locality: 'Deccan Gymkhana',
    lat: 18.5145,
    lng: 73.8368,
    rating: 4.7,
    reviewCount: 88,
    ratingsBreakdown: {
      coachingQuality: 4.7,
      facilities: 4.8,
      communication: 4.6,
      valueForMoney: 4.6
    },
    monthlyFeeMin: 3200,
    monthlyFeeMax: 5000,
    perSessionFee: 350,
    trialClassAvailable: true,
    trialFee: 0,
    trainingLevels: ['Beginner', 'Intermediate', 'Advanced'],
    coachingTypes: ['Group coaching', 'Small-group coaching', 'Individual coaching'],
    facilityType: 'Indoor Heated Pool',
    ageGroups: ['Children (4-12)', 'Teenagers (13-17)', 'Adults (18+)'],
    amenities: ['50m Olympic Pool', 'Kids Heated Learn Pool', 'Ozone Treated Filtration', 'Certified Lifeguards', 'Drying Rooms', 'Lockers'],
    accessible: true,
    womenCoaches: true,
    womenFocusedBatches: true,
    beginnerFriendly: true,
    scholarshipsAvailable: false,
    openingHours: 'Tue - Sun: 6:00 AM – 8:30 PM (Mon Closed for Maintenance)',
    contact: {
      phone: '+91 98224 55667',
      email: 'swim@aquafit.demo',
      website: 'https://aquafit.demo'
    },
    status: 'Active',
    verified: true,
    verifiedDate: '2026-07-10',
    cancellationPolicy: 'Notice required 48 hours in advance for trial cancellations.'
  },
  {
    id: 'acad-5',
    name: 'Rising Stars Basketball Academy',
    ownerId: 'user-owner-1',
    sports: ['Basketball'],
    tagline: 'Indoor Hardwood Courts, NBA-style Drills & Video Film Breakdown',
    description: 'Rising Stars is Pune’s premier basketball finishing school, led by former Senior National players. We combine strength & conditioning, ball-handling circuits, shooting clinics with Dr. Dish shooting guns, and tactical 3v3 and 5v5 competitive leagues.',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=150&q=80',
    logoInitials: 'RSBA',
    address: 'Plot 18, Paud Road, Ideal Colony, Kothrud',
    city: 'Pune',
    locality: 'Kothrud',
    lat: 18.5074,
    lng: 73.8077,
    rating: 4.8,
    reviewCount: 74,
    ratingsBreakdown: {
      coachingQuality: 4.9,
      facilities: 4.8,
      communication: 4.7,
      valueForMoney: 4.8
    },
    monthlyFeeMin: 2800,
    monthlyFeeMax: 4800,
    perSessionFee: 300,
    trialClassAvailable: true,
    trialFee: 0,
    trainingLevels: ['Beginner', 'Intermediate', 'Advanced', 'Competitive'],
    coachingTypes: ['Group coaching', 'Small-group coaching'],
    facilityType: 'Indoor Hardwood Court',
    ageGroups: ['Children (8-12)', 'Teenagers (13-18)', 'Adults (18+)'],
    amenities: ['FIBA Maple Hardwood Court', 'Dr. Dish Shooting Machine', 'Strength & Plyometric Station', 'Air Cooled Player Lounge', 'Locker Rooms'],
    accessible: true,
    womenCoaches: true,
    womenFocusedBatches: true,
    beginnerFriendly: true,
    scholarshipsAvailable: true,
    openingHours: 'Mon - Sat: 6:00 AM – 9:00 PM | Sun: 7:00 AM – 12:00 PM',
    contact: {
      phone: '+91 98226 77889',
      email: 'hoops@risingstars.demo',
      website: 'https://risingstars.demo'
    },
    status: 'Active',
    verified: true,
    verifiedDate: '2026-09-02',
    cancellationPolicy: 'Refund request processed within 5 business days prior to batch commencement.'
  },
  {
    id: 'acad-6',
    name: 'Apex Tennis & Fitness Hub',
    ownerId: 'user-owner-2',
    sports: ['Tennis'],
    tagline: 'ITF Certified Hard & Clay Courts with High-Performance Biomechanics',
    description: 'Apex Tennis Hub features 4 synthetic Decoturf courts and 2 red clay courts equipped with video telemetry analysis. We run specialised junior development squads, adult evening cardio-tennis sessions, and competitive tournament player camps.',
    coverImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=150&q=80',
    logoInitials: 'ATFH',
    address: 'Survey 22, Viman Nagar Road, Near Phoenix Marketcity',
    city: 'Pune',
    locality: 'Viman Nagar',
    lat: 18.5679,
    lng: 73.9143,
    rating: 4.7,
    reviewCount: 65,
    ratingsBreakdown: {
      coachingQuality: 4.8,
      facilities: 4.7,
      communication: 4.6,
      valueForMoney: 4.5
    },
    monthlyFeeMin: 4500,
    monthlyFeeMax: 8000,
    perSessionFee: 600,
    trialClassAvailable: true,
    trialFee: 250,
    trainingLevels: ['Beginner', 'Intermediate', 'Advanced', 'Professional development'],
    coachingTypes: ['Group coaching', 'Small-group coaching', 'Individual coaching'],
    facilityType: 'Outdoor Hard & Clay',
    ageGroups: ['Children (6-12)', 'Teenagers (13-18)', 'Adults (18+)'],
    amenities: ['4 Synthetic Hard Courts', '2 Red Clay Courts', 'High-Speed Ball Machines', 'Racquet Restringing', 'Clubhouse & Cafe', 'Player Locker Rooms'],
    accessible: false,
    womenCoaches: true,
    womenFocusedBatches: false,
    beginnerFriendly: true,
    scholarshipsAvailable: false,
    openingHours: 'Mon - Sun: 6:00 AM – 10:00 PM',
    contact: {
      phone: '+91 98228 11992',
      email: 'play@apextennis.demo',
      website: 'https://apextennis.demo'
    },
    status: 'Active',
    verified: false,
    verifiedDate: null,
    cancellationPolicy: '24 hours advance notification for session rescheduling.'
  }
];

// 3. COACHES (12 Coaches across academies and sports)
export const INITIAL_COACHES = [
  {
    id: 'coach-1',
    academyId: 'acad-1',
    name: 'Coach Vikram Rathore',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sport: 'Cricket',
    experienceYears: 14,
    qualifications: ['BCCI Level 2 Coach', 'NIS Diploma in Cricket Coaching', 'ICC High Performance Certified'],
    qualificationsVerified: true,
    playingBackground: 'Former Maharashtra Ranji Trophy Fast Bowler (2008–2015)',
    languages: ['English', 'Hindi', 'Marathi'],
    rating: 4.9,
    reviewsCount: 78,
    trainingLevels: ['Intermediate', 'Advanced', 'Competitive'],
    bio: 'Specialises in fast bowling mechanics, biomechanical workload management, and match tactical field placement.',
    status: 'Active',
    programmesCount: 3
  },
  {
    id: 'coach-2',
    academyId: 'acad-1',
    name: 'Pooja Kulkarni',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    sport: 'Cricket',
    experienceYears: 8,
    qualifications: ['BCCI Level 1 Coach', 'Cricket Australia Level 1 Representative'],
    qualificationsVerified: true,
    playingBackground: 'Senior West Zone Inter-State Player (Wicketkeeper-Batter)',
    languages: ['English', 'Marathi', 'Hindi'],
    rating: 4.8,
    reviewsCount: 42,
    trainingLevels: ['Beginner', 'Intermediate'],
    bio: 'Specialist in junior hand-eye coordination drills, wicket-keeping stance, and women’s youth development.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-3',
    academyId: 'acad-2',
    name: 'Marcus D\'Souza',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sport: 'Football',
    experienceYears: 12,
    qualifications: ['AFC \'A\' Coaching License', 'AIFF Youth Development Specialist'],
    qualificationsVerified: true,
    playingBackground: 'I-League Professional Midfielder with Churchill Brothers (2010–2016)',
    languages: ['English', 'Hindi', 'Konkani'],
    rating: 4.9,
    reviewsCount: 65,
    trainingLevels: ['Intermediate', 'Advanced', 'Competitive'],
    bio: 'Focuses on positional play, high-press transitions, and European game awareness for aspiring academy players.',
    status: 'Active',
    programmesCount: 3
  },
  {
    id: 'coach-4',
    academyId: 'acad-2',
    name: 'Tanvi Shinde',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    sport: 'Football',
    experienceYears: 6,
    qualifications: ['AFC \'C\' License', 'AIFF Grassroots Leader'],
    qualificationsVerified: true,
    playingBackground: 'Maharashtra State Women’s Football Team Captain (2018–2021)',
    languages: ['English', 'Marathi', 'Hindi'],
    rating: 4.7,
    reviewsCount: 34,
    trainingLevels: ['Beginner', 'Intermediate'],
    bio: 'Specialises in early-stage ball familiarity, agility ladders, and building confidence in youth and girls batches.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-5',
    academyId: 'acad-3',
    name: 'Nikhil Padte',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    sport: 'Badminton',
    experienceYears: 11,
    qualifications: ['BWF Level 2 Certified Coach', 'Prakash Padukone Academy Certified'],
    qualificationsVerified: true,
    playingBackground: 'All India Senior Ranking Quarterfinalist & State Gold Medalist',
    languages: ['English', 'Hindi', 'Marathi'],
    rating: 5.0,
    reviewsCount: 52,
    trainingLevels: ['Intermediate', 'Advanced', 'Professional development'],
    bio: 'Precision footwork expert focusing on overhead smash trajectory, deception at the net, and explosive court coverage.',
    status: 'Active',
    programmesCount: 3
  },
  {
    id: 'coach-6',
    academyId: 'acad-3',
    name: 'Aishwarya Joshi',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    sport: 'Badminton',
    experienceYears: 5,
    qualifications: ['BWF Level 1 Coach', 'Physical Education Masters (BPEd)'],
    qualificationsVerified: false, // Demonstrated distinction: unverified profile claim
    playingBackground: 'Inter-University Gold Medalist (Badminton Singles)',
    languages: ['English', 'Marathi'],
    rating: 4.8,
    reviewsCount: 29,
    trainingLevels: ['Beginner', 'Intermediate'],
    bio: 'Warm-up kinetics, fundamental grip styles, and fun rally development for young school starters.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-7',
    academyId: 'acad-4',
    name: 'Dharmesh Solanki',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    sport: 'Swimming',
    experienceYears: 15,
    qualifications: ['ASCA Level 3 Coach (American Swimming Coaches Assoc.)', 'RLSS UK Certified Lifeguard'],
    qualificationsVerified: true,
    playingBackground: 'National Aquatics Silver Medalist (100m & 200m Freestyle)',
    languages: ['English', 'Hindi', 'Gujarati'],
    rating: 4.8,
    reviewsCount: 46,
    trainingLevels: ['Intermediate', 'Advanced'],
    bio: 'Master of streamlined hydrodynamics, bilateral breathing, and anaerobic interval sets for competitive swim meets.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-8',
    academyId: 'acad-4',
    name: 'Kavita Menon',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sport: 'Swimming',
    experienceYears: 7,
    qualifications: ['AUSTSWIM Certified Swimming & Water Safety Teacher'],
    qualificationsVerified: true,
    playingBackground: 'State Level Breaststroke Finalist',
    languages: ['English', 'Hindi', 'Malayalam'],
    rating: 4.9,
    reviewsCount: 38,
    trainingLevels: ['Beginner', 'Intermediate'],
    bio: 'Patient and encouraging coach specializing in overcoming water phobia, gentle kickboard routines, and backstroke.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-9',
    academyId: 'acad-5',
    name: 'Karanvir Gill',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    sport: 'Basketball',
    experienceYears: 10,
    qualifications: ['FIBA Level 1 Coach', 'Strength & Conditioning Specialist (CSCS)'],
    qualificationsVerified: true,
    playingBackground: 'Punjab & Maharashtra State Senior Basketball Team Point Guard',
    languages: ['English', 'Hindi', 'Punjabi'],
    rating: 4.9,
    reviewsCount: 41,
    trainingLevels: ['Intermediate', 'Advanced', 'Competitive'],
    bio: 'Specialist in pick-and-roll reads, floater releases, and intense high-energy defense press schemes.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-10',
    academyId: 'acad-5',
    name: 'Megha Patil',
    photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    sport: 'Basketball',
    experienceYears: 6,
    qualifications: ['BFI Certified Youth Coach', 'Diploma in Sports Science'],
    qualificationsVerified: true,
    playingBackground: 'All India University Basketball Captain',
    languages: ['English', 'Marathi', 'Hindi'],
    rating: 4.7,
    reviewsCount: 28,
    trainingLevels: ['Beginner', 'Intermediate'],
    bio: 'High focus on shooting form fundamentals, triple-threat stance, and youth confidence building.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-11',
    academyId: 'acad-6',
    name: 'Advait Nadkarni',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sport: 'Tennis',
    experienceYears: 13,
    qualifications: ['ITF Level 2 Coach', 'AITA Senior Coach Certified'],
    qualificationsVerified: true,
    playingBackground: 'ITF Futures Circuit Pro Player (Peak ATP 940)',
    languages: ['English', 'Hindi', 'Marathi'],
    rating: 4.8,
    reviewsCount: 39,
    trainingLevels: ['Intermediate', 'Advanced', 'Professional development'],
    bio: 'Heavy topspin forehand mechanics, slice backhand recovery, and serve placement strategies.',
    status: 'Active',
    programmesCount: 2
  },
  {
    id: 'coach-12',
    academyId: 'acad-6',
    name: 'Rohan Gaikwad',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    sport: 'Tennis',
    experienceYears: 4,
    qualifications: ['AITA Level 1 Certified'],
    qualificationsVerified: false,
    playingBackground: 'Junior State Ranking Player',
    languages: ['English', 'Marathi'],
    rating: 4.6,
    reviewsCount: 19,
    trainingLevels: ['Beginner'],
    bio: 'Red, Orange and Green ball progressive youth tennis drills focusing on hand-eye contact and rally consistency.',
    status: 'Active',
    programmesCount: 1
  }
];

// 4. TRAINING PROGRAMMES (15 Sample Programmes)
export const INITIAL_PROGRAMMES = [
  // ECA Programmes
  {
    id: 'prog-1',
    academyId: 'acad-1',
    name: 'Fast Bowling & Pace Mechanics Clinic',
    sport: 'Cricket',
    coachId: 'coach-1',
    coachName: 'Coach Vikram Rathore',
    skillLevel: 'Advanced',
    ageEligibility: '14 to 24 years',
    duration: '3 Months (Quarterly)',
    sessionsPerWeek: 4,
    sessionLengthMinutes: 90,
    monthlyFee: 5500,
    perSessionFee: 450,
    equipmentRequirements: 'Cricket whites, spike boots, personal box/guard, seam match balls provided',
    venue: 'Elite Turf Center, Nets 1 & 2',
    description: 'Specialised technical bowling clinic featuring high-speed video capture, run-up deceleration checks, front foot braking mechanics, and yorker accuracy targets.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 30, // Across batches
    enrolledCount: 24
  },
  {
    id: 'prog-2',
    academyId: 'acad-1',
    name: 'Junior Cricket Foundations (U-14)',
    sport: 'Cricket',
    coachId: 'coach-2',
    coachName: 'Pooja Kulkarni',
    skillLevel: 'Beginner',
    ageEligibility: '8 to 14 years',
    duration: '6 Months',
    sessionsPerWeek: 3,
    sessionLengthMinutes: 75,
    monthlyFee: 3800,
    perSessionFee: 350,
    equipmentRequirements: 'White kit, batting gloves, helmet, cricket kit provided for trial',
    venue: 'Junior Turf Pitch B',
    description: 'Foundational coaching covering grip, front-foot drive balance, basic running between wickets, and team fielding relays.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 36,
    enrolledCount: 28
  },
  {
    id: 'prog-3',
    academyId: 'acad-1',
    name: 'Ranji Aspirants Weekend Match Simulation',
    sport: 'Cricket',
    coachId: 'coach-1',
    coachName: 'Coach Vikram Rathore',
    skillLevel: 'Competitive',
    ageEligibility: '16+ years',
    duration: 'Ongoing Monthly',
    sessionsPerWeek: 2,
    sessionLengthMinutes: 180,
    monthlyFee: 6000,
    perSessionFee: 800,
    equipmentRequirements: 'Full match kit, white flannel, spiked shoes',
    venue: 'Centre Turf Ground, Shivajinagar',
    description: 'Open-wicket match scenarios, situational batting under pressure overs, and tactical field captaincy mentorship.',
    trialAvailable: false,
    trialFee: null,
    status: 'Active',
    enrolmentCapacity: 22,
    enrolledCount: 20
  },

  // PFTC Programmes
  {
    id: 'prog-4',
    academyId: 'acad-2',
    name: 'Youth Elite Squad Development',
    sport: 'Football',
    coachId: 'coach-3',
    coachName: 'Marcus D\'Souza',
    skillLevel: 'Competitive',
    ageEligibility: '13 to 18 years',
    duration: '6 Months',
    sessionsPerWeek: 4,
    sessionLengthMinutes: 90,
    monthlyFee: 5000,
    perSessionFee: 400,
    equipmentRequirements: 'FG studs or turf boots, shin guards, academy jersey supplied',
    venue: 'AstroPitch A, Kalyani Nagar',
    description: 'High-intensity tactical training preparing youth players for sub-junior and junior national leagues and university trials.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 32,
    enrolledCount: 29
  },
  {
    id: 'prog-5',
    academyId: 'acad-2',
    name: 'Grassroots Football FUNdamentals',
    sport: 'Football',
    coachId: 'coach-4',
    coachName: 'Tanvi Shinde',
    skillLevel: 'Beginner',
    ageEligibility: '6 to 12 years',
    duration: 'Monthly / Quarterly',
    sessionsPerWeek: 3,
    sessionLengthMinutes: 60,
    monthlyFee: 3200,
    perSessionFee: 300,
    equipmentRequirements: 'Sports shoes or turf trainers, comfortable shorts, water bottle',
    venue: 'Mini Pitch 1, Kalyani Nagar',
    description: 'Fun-based small-sided games to encourage ball confidence, first-touch reception, and sport appreciation.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 40,
    enrolledCount: 31
  },

  // SmashPoint Programmes
  {
    id: 'prog-6',
    academyId: 'acad-3',
    name: 'High-Performance Singles & Doubles Excellence',
    sport: 'Badminton',
    coachId: 'coach-5',
    coachName: 'Nikhil Padte',
    skillLevel: 'Advanced',
    ageEligibility: '12 to 22 years',
    duration: 'Quarterly',
    sessionsPerWeek: 5,
    sessionLengthMinutes: 90,
    monthlyFee: 7000,
    perSessionFee: 600,
    equipmentRequirements: 'Non-marking badminton shoes, min 2 carbon-fibre racquets (24+ lbs tension)',
    venue: 'Courts 1 to 4, Balewadi Arena',
    description: 'Drills targeting deceptive net slices, multi-shuttle high speed defense, jump smash accuracy, and tournament match preparation.',
    trialAvailable: true,
    trialFee: 200,
    status: 'Active',
    enrolmentCapacity: 24,
    enrolledCount: 22
  },
  {
    id: 'prog-7',
    academyId: 'acad-3',
    name: 'Beginner Strokes & Footwork Clinic',
    sport: 'Badminton',
    coachId: 'coach-6',
    coachName: 'Aishwarya Joshi',
    skillLevel: 'Beginner',
    ageEligibility: 'All ages (8+)',
    duration: '2 Months',
    sessionsPerWeek: 3,
    sessionLengthMinutes: 60,
    monthlyFee: 4200,
    perSessionFee: 400,
    equipmentRequirements: 'Non-marking shoes mandatory, practice racquet',
    venue: 'Courts 5 & 6, Balewadi Arena',
    description: 'Step-by-step masterclass covering basic split-step, forehand clear, drop shot touch, and correct wrist rotation.',
    trialAvailable: true,
    trialFee: 200,
    status: 'Active',
    enrolmentCapacity: 28,
    enrolledCount: 19
  },

  // AquaFit Programmes
  {
    id: 'prog-8',
    academyId: 'acad-4',
    name: 'Stroke Correction & Endurance Conditioning',
    sport: 'Swimming',
    coachId: 'coach-7',
    coachName: 'Dharmesh Solanki',
    skillLevel: 'Intermediate',
    ageEligibility: '12+ years',
    duration: 'Monthly',
    sessionsPerWeek: 3,
    sessionLengthMinutes: 60,
    monthlyFee: 4500,
    perSessionFee: 400,
    equipmentRequirements: 'Swim cap, anti-fog goggles, competitive swimwear, kickboard',
    venue: '50m Main Pool (Lanes 3 & 4)',
    description: 'Detailed analysis of freestyle roll, butterfly pull, and breaststroke whip kick with targeted yardage building.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 24,
    enrolledCount: 18
  },
  {
    id: 'prog-9',
    academyId: 'acad-4',
    name: 'Learn to Swim: Fear to Fluency',
    sport: 'Swimming',
    coachId: 'coach-8',
    coachName: 'Kavita Menon',
    skillLevel: 'Beginner',
    ageEligibility: '5+ years (Kids & Adults batches separated)',
    duration: '1 Month (12 sessions)',
    sessionsPerWeek: 3,
    sessionLengthMinutes: 45,
    monthlyFee: 3500,
    perSessionFee: 350,
    equipmentRequirements: 'Swim cap, goggles, swim costume',
    venue: 'Warm Water Learner Pool',
    description: 'Zero-pressure foundational water acclimation, floating, streamline flutter kicking, and safe independent breathing.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 30,
    enrolledCount: 26
  },

  // Rising Stars Programmes
  {
    id: 'prog-10',
    academyId: 'acad-5',
    name: 'Playmaker Point Guard & Shooting Clinic',
    sport: 'Basketball',
    coachId: 'coach-9',
    coachName: 'Karanvir Gill',
    skillLevel: 'Advanced',
    ageEligibility: '14 to 21 years',
    duration: 'Quarterly',
    sessionsPerWeek: 4,
    sessionLengthMinutes: 75,
    monthlyFee: 4500,
    perSessionFee: 350,
    equipmentRequirements: 'Indoor high-top basketball shoes, Size 7 basketball',
    venue: 'Main Hardwood Court, Kothrud',
    description: 'Heavy ball dribbling, crossover separation, step-back jumper mechanics, and Dr. Dish high-repetition shooting.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 20,
    enrolledCount: 17
  },
  {
    id: 'prog-11',
    academyId: 'acad-5',
    name: 'Youth Basketball Academy (U-14)',
    sport: 'Basketball',
    coachId: 'coach-10',
    coachName: 'Megha Patil',
    skillLevel: 'Beginner',
    ageEligibility: '8 to 14 years',
    duration: 'Monthly / Annual',
    sessionsPerWeek: 3,
    sessionLengthMinutes: 60,
    monthlyFee: 3000,
    perSessionFee: 300,
    equipmentRequirements: 'Comfortable sports shoes, basketball shorts',
    venue: 'Half Court B, Kothrud',
    description: 'Layup footwork, chest and bounce passing fundamentals, and defensive slide habits for junior players.',
    trialAvailable: true,
    trialFee: 0,
    status: 'Active',
    enrolmentCapacity: 32,
    enrolledCount: 25
  },

  // Apex Tennis Programmes
  {
    id: 'prog-12',
    academyId: 'acad-6',
    name: 'ATP / AITA Junior Tournament Squad',
    sport: 'Tennis',
    coachId: 'coach-11',
    coachName: 'Advait Nadkarni',
    skillLevel: 'Competitive',
    ageEligibility: '12 to 18 years',
    duration: '6 Months',
    sessionsPerWeek: 5,
    sessionLengthMinutes: 120,
    monthlyFee: 8000,
    perSessionFee: 700,
    equipmentRequirements: 'All-court tennis shoes, minimum 2 racquets, sweatbands',
    venue: 'Clay Courts 1 & 2, Viman Nagar',
    description: 'Intense drill patterns, point construction from the baseline, first serve percentage drills, and physical match fitness.',
    trialAvailable: true,
    trialFee: 250,
    status: 'Active',
    enrolmentCapacity: 16,
    enrolledCount: 14
  },
  {
    id: 'prog-13',
    academyId: 'acad-6',
    name: 'Adult Weekend Cardio Tennis',
    sport: 'Tennis',
    coachId: 'coach-12',
    coachName: 'Rohan Gaikwad',
    skillLevel: 'Intermediate',
    ageEligibility: '18+ years',
    duration: 'Monthly',
    sessionsPerWeek: 2,
    sessionLengthMinutes: 60,
    monthlyFee: 4500,
    perSessionFee: 600,
    equipmentRequirements: 'Tennis racquet, sports shoes',
    venue: 'Hard Court 3, Viman Nagar',
    description: 'High-energy tennis fitness workout combining cardio drills with ball striking to burn calories and refine strokes.',
    trialAvailable: true,
    trialFee: 250,
    status: 'Active',
    enrolmentCapacity: 20,
    enrolledCount: 12
  }
];

// 5. BATCHES & SCHEDULES (Each batch belongs to a programme and academy)
export const INITIAL_BATCHES = [
  // Fast Bowling Clinic (Prog 1)
  {
    id: 'batch-101',
    programmeId: 'prog-1',
    academyId: 'acad-1',
    name: 'Morning Pace Batch A',
    days: ['Mon', 'Wed', 'Fri', 'Sat'],
    startTime: '06:30',
    endTime: '08:00',
    coachId: 'coach-1',
    coachName: 'Coach Vikram Rathore',
    venue: 'Nets 1 & 2',
    capacity: 15,
    enrolledCount: 13,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },
  {
    id: 'batch-102',
    programmeId: 'prog-1',
    academyId: 'acad-1',
    name: 'Evening Pace Batch B',
    days: ['Tue', 'Thu', 'Sat', 'Sun'],
    startTime: '17:00',
    endTime: '18:30',
    coachId: 'coach-1',
    coachName: 'Coach Vikram Rathore',
    venue: 'Nets 1 & 2',
    capacity: 15,
    enrolledCount: 11,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },

  // Junior Cricket Foundations (Prog 2)
  {
    id: 'batch-103',
    programmeId: 'prog-2',
    academyId: 'acad-1',
    name: 'After-School Junior Batch',
    days: ['Mon', 'Wed', 'Fri'],
    startTime: '16:30',
    endTime: '17:45',
    coachId: 'coach-2',
    coachName: 'Pooja Kulkarni',
    venue: 'Junior Turf Pitch B',
    capacity: 18,
    enrolledCount: 16,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2027-03-31'
  },
  {
    id: 'batch-104',
    programmeId: 'prog-2',
    academyId: 'acad-1',
    name: 'Weekend Youth Morning Batch',
    days: ['Sat', 'Sun'],
    startTime: '08:00',
    endTime: '09:30',
    coachId: 'coach-2',
    coachName: 'Pooja Kulkarni',
    venue: 'Junior Turf Pitch B',
    capacity: 18,
    enrolledCount: 12,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2027-03-31'
  },

  // Youth Elite Football (Prog 4)
  {
    id: 'batch-201',
    programmeId: 'prog-4',
    academyId: 'acad-2',
    name: 'Evening Elite Varsity Batch',
    days: ['Tue', 'Thu', 'Sat', 'Sun'],
    startTime: '17:30',
    endTime: '19:00',
    coachId: 'coach-3',
    coachName: 'Marcus D\'Souza',
    venue: 'AstroPitch A',
    capacity: 16,
    enrolledCount: 16, // FULL BATCH to test waitlist / overbooking prevention
    status: 'Active',
    startDate: '2026-09-15',
    endDate: '2027-03-15'
  },
  {
    id: 'batch-202',
    programmeId: 'prog-4',
    academyId: 'acad-2',
    name: 'Morning Development Batch',
    days: ['Mon', 'Wed', 'Fri', 'Sat'],
    startTime: '06:00',
    endTime: '07:30',
    coachId: 'coach-3',
    coachName: 'Marcus D\'Souza',
    venue: 'AstroPitch A',
    capacity: 16,
    enrolledCount: 13,
    status: 'Active',
    startDate: '2026-09-15',
    endDate: '2027-03-15'
  },

  // Grassroots Football (Prog 5)
  {
    id: 'batch-203',
    programmeId: 'prog-5',
    academyId: 'acad-2',
    name: 'Kids Academy Batch 1',
    days: ['Tue', 'Thu', 'Sat'],
    startTime: '16:30',
    endTime: '17:30',
    coachId: 'coach-4',
    coachName: 'Tanvi Shinde',
    venue: 'Mini Pitch 1',
    capacity: 20,
    enrolledCount: 18,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },

  // SmashPoint High Performance (Prog 6)
  {
    id: 'batch-301',
    programmeId: 'prog-6',
    academyId: 'acad-3',
    name: 'State Elite Squad Batch',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '06:00',
    endTime: '07:30',
    coachId: 'coach-5',
    coachName: 'Nikhil Padte',
    venue: 'Courts 1 to 4',
    capacity: 12,
    enrolledCount: 12, // FULL
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },
  {
    id: 'batch-302',
    programmeId: 'prog-6',
    academyId: 'acad-3',
    name: 'Tournament Prep Evening Batch',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '18:00',
    endTime: '19:30',
    coachId: 'coach-5',
    coachName: 'Nikhil Padte',
    venue: 'Courts 1 to 4',
    capacity: 12,
    enrolledCount: 10,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },

  // AquaFit Swimming Stroke Correction (Prog 8)
  {
    id: 'batch-401',
    programmeId: 'prog-8',
    academyId: 'acad-4',
    name: 'Morning Conditioning Cadre',
    days: ['Tue', 'Thu', 'Sat'],
    startTime: '06:30',
    endTime: '07:30',
    coachId: 'coach-7',
    coachName: 'Dharmesh Solanki',
    venue: '50m Main Pool',
    capacity: 12,
    enrolledCount: 10,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },

  // Rising Stars Basketball (Prog 10)
  {
    id: 'batch-501',
    programmeId: 'prog-10',
    academyId: 'acad-5',
    name: 'Playmaker Evening Intensive',
    days: ['Mon', 'Wed', 'Fri', 'Sat'],
    startTime: '17:00',
    endTime: '18:15',
    coachId: 'coach-9',
    coachName: 'Karanvir Gill',
    venue: 'Main Hardwood Court',
    capacity: 10,
    enrolledCount: 9,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31'
  },

  // Apex Tennis (Prog 12)
  {
    id: 'batch-601',
    programmeId: 'prog-12',
    academyId: 'acad-6',
    name: 'Junior ITF Clay Squad',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '16:00',
    endTime: '18:00',
    coachId: 'coach-11',
    coachName: 'Advait Nadkarni',
    venue: 'Clay Courts 1 & 2',
    capacity: 8,
    enrolledCount: 7,
    status: 'Active',
    startDate: '2026-10-01',
    endDate: '2027-03-31'
  }
];

// 6. SAMPLE TRIAL BOOKINGS
export const INITIAL_TRIAL_BOOKINGS = [
  {
    id: 'tb-101',
    athleteId: 'user-athlete-1',
    athleteName: 'Aryan Salunke',
    athletePhone: '+91 98220 11445',
    athleteEmail: 'aryan.s@sportlink.demo',
    athleteAge: 19,
    academyId: 'acad-1',
    academyName: 'Elite Cricket Academy',
    programmeId: 'prog-1',
    programmeName: 'Fast Bowling & Pace Mechanics Clinic',
    coachId: 'coach-1',
    coachName: 'Coach Vikram Rathore',
    date: getRelativeDate(2),
    time: '06:30',
    fee: 0,
    isFree: true,
    status: 'Confirmed', // 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected'
    goals: 'Refine run-up approach and front-foot bracing for higher speed.',
    notes: 'Trial spot reserved on Net 1. Academy will supply seam balls.',
    createdAt: getRelativeDate(-2)
  },
  {
    id: 'tb-102',
    athleteId: 'user-athlete-1',
    athleteName: 'Aryan Salunke',
    athletePhone: '+91 98220 11445',
    athleteEmail: 'aryan.s@sportlink.demo',
    athleteAge: 19,
    academyId: 'acad-2',
    academyName: 'Pune Football Training Centre',
    programmeId: 'prog-4',
    programmeName: 'Youth Elite Squad Development',
    coachId: 'coach-3',
    coachName: 'Marcus D\'Souza',
    date: getRelativeDate(5),
    time: '17:30',
    fee: 0,
    isFree: true,
    status: 'Pending',
    goals: 'Assess fitness and midfield passing speed with senior squad.',
    notes: 'Awaiting Academy Owner review.',
    createdAt: getRelativeDate(-1)
  },
  {
    id: 'tb-103',
    athleteId: 'user-athlete-2',
    athleteName: 'Sanya Mirza',
    athletePhone: '+91 98230 77123',
    athleteEmail: 'sanya.m@sportlink.demo',
    athleteAge: 15,
    academyId: 'acad-3',
    academyName: 'SmashPoint Badminton Academy',
    programmeId: 'prog-7',
    programmeName: 'Beginner Strokes & Footwork Clinic',
    coachId: 'coach-6',
    coachName: 'Aishwarya Joshi',
    date: getRelativeDate(3),
    time: '16:30',
    fee: 200,
    isFree: false,
    status: 'Confirmed',
    goals: 'Learn correct racquet grip and baseline movement.',
    notes: 'Bring non-marking badminton shoes.',
    createdAt: getRelativeDate(-3)
  },
  {
    id: 'tb-104',
    athleteId: 'user-athlete-2',
    athleteName: 'Sanya Mirza',
    athletePhone: '+91 98230 77123',
    athleteEmail: 'sanya.m@sportlink.demo',
    athleteAge: 15,
    academyId: 'acad-4',
    academyName: 'AquaFit Swimming School',
    programmeId: 'prog-9',
    programmeName: 'Learn to Swim: Fear to Fluency',
    coachId: 'coach-8',
    coachName: 'Kavita Menon',
    date: getRelativeDate(-5),
    time: '08:00',
    fee: 0,
    isFree: true,
    status: 'Completed',
    goals: 'Trial complete. Student recommended for Level 1 Foundation batch.',
    notes: 'Completed evaluation with Coach Kavita.',
    createdAt: getRelativeDate(-8)
  }
];

// 7. SAMPLE ENROLMENTS
export const INITIAL_ENROLMENTS = [
  {
    id: 'enr-101',
    athleteId: 'user-athlete-1',
    athleteName: 'Aryan Salunke',
    athletePhone: '+91 98220 11445',
    athleteEmail: 'aryan.s@sportlink.demo',
    athleteAge: 19,
    academyId: 'acad-1',
    academyName: 'Elite Cricket Academy',
    programmeId: 'prog-1',
    programmeName: 'Fast Bowling & Pace Mechanics Clinic',
    batchId: 'batch-101',
    batchName: 'Morning Pace Batch A',
    batchDays: 'Mon, Wed, Fri, Sat (06:30 – 08:00)',
    coachId: 'coach-1',
    coachName: 'Coach Vikram Rathore',
    feeMonthly: 5500,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    enrolmentStatus: 'Active', // 'Pending Approval' | 'Approved' | 'Waitlisted' | 'Rejected' | 'Active' | 'Completed' | 'Cancelled'
    paymentStatus: 'Paid', // 'Pending' | 'Paid' | 'Failed' | 'Refunded'
    submittedOn: '2026-09-28',
    paymentRef: 'DEMO-TXN-88412'
  },
  {
    id: 'enr-102',
    athleteId: 'user-athlete-2',
    athleteName: 'Sanya Mirza',
    athletePhone: '+91 98230 77123',
    athleteEmail: 'sanya.m@sportlink.demo',
    athleteAge: 15,
    academyId: 'acad-3',
    academyName: 'SmashPoint Badminton Academy',
    programmeId: 'prog-7',
    programmeName: 'Beginner Strokes & Footwork Clinic',
    batchId: 'batch-103', // using batch
    batchName: 'Junior Badminton Foundation Batch',
    batchDays: 'Mon, Wed, Fri (16:30 – 17:30)',
    coachId: 'coach-6',
    coachName: 'Aishwarya Joshi',
    feeMonthly: 4200,
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    enrolmentStatus: 'Pending Approval',
    paymentStatus: 'Pending',
    submittedOn: '2026-10-25',
    paymentRef: null
  },
  {
    id: 'enr-103',
    athleteId: 'user-athlete-1',
    athleteName: 'Aryan Salunke',
    athletePhone: '+91 98220 11445',
    athleteEmail: 'aryan.s@sportlink.demo',
    athleteAge: 19,
    academyId: 'acad-2',
    academyName: 'Pune Football Training Centre',
    programmeId: 'prog-4',
    programmeName: 'Youth Elite Squad Development',
    batchId: 'batch-201',
    batchName: 'Evening Elite Varsity Batch',
    batchDays: 'Tue, Thu, Sat, Sun (17:30 – 19:00)',
    coachId: 'coach-3',
    coachName: 'Marcus D\'Souza',
    feeMonthly: 5000,
    startDate: '2026-10-15',
    endDate: '2027-03-15',
    enrolmentStatus: 'Waitlisted', // Batch is full (16/16)
    paymentStatus: 'Pending',
    submittedOn: '2026-10-20',
    paymentRef: null
  }
];

// 8. SAMPLE ATTENDANCE RECORDS (For Owner / Coach tracking)
export const INITIAL_ATTENDANCE = [
  {
    id: 'att-1',
    academyId: 'acad-1',
    programmeId: 'prog-1',
    batchId: 'batch-101',
    date: getRelativeDate(-1),
    sessionName: 'Morning Pace Batch A',
    coachName: 'Coach Vikram Rathore',
    records: [
      { studentId: 'user-athlete-1', studentName: 'Aryan Salunke', status: 'Present', notes: 'Hit 128 km/h on speed radar, good gather.' },
      { studentId: 'stud-2', studentName: 'Pranav Joshi', status: 'Present', notes: 'Worked on wrist snap.' },
      { studentId: 'stud-3', studentName: 'Aditya Kadam', status: 'Absent', notes: 'Informed exam conflict.' },
      { studentId: 'stud-4', studentName: 'Rohan Shinde', status: 'Excused', notes: 'Medical rest for ankle sprain.' }
    ]
  },
  {
    id: 'att-2',
    academyId: 'acad-2',
    programmeId: 'prog-4',
    batchId: 'batch-201',
    date: getRelativeDate(-2),
    sessionName: 'Evening Elite Varsity Batch',
    coachName: 'Marcus D\'Souza',
    records: [
      { studentId: 'stud-11', studentName: 'Kabir Verma', status: 'Present', notes: 'Solid linkup play.' },
      { studentId: 'stud-12', studentName: 'Zaid Khan', status: 'Present', notes: '2 goals in practice game.' },
      { studentId: 'stud-13', studentName: 'Samir Rao', status: 'Absent', notes: 'No show without notice.' }
    ]
  }
];

// 9. SAMPLE FEES & PAYMENT RECORDS
export const INITIAL_PAYMENTS = [
  {
    id: 'pay-1',
    enrolmentId: 'enr-101',
    academyId: 'acad-1',
    academyName: 'Elite Cricket Academy',
    studentName: 'Aryan Salunke',
    programmeName: 'Fast Bowling & Pace Mechanics Clinic',
    amount: 5500,
    dueDate: '2026-10-01',
    paidDate: '2026-09-28',
    status: 'Paid',
    method: 'UPI Demo Payment',
    refId: 'DEMO-TXN-88412'
  },
  {
    id: 'pay-2',
    enrolmentId: 'enr-102',
    academyId: 'acad-3',
    academyName: 'SmashPoint Badminton Academy',
    studentName: 'Sanya Mirza',
    programmeName: 'Beginner Strokes & Footwork Clinic',
    amount: 4200,
    dueDate: '2026-11-01',
    paidDate: null,
    status: 'Pending',
    method: 'Pay at Academy / Card',
    refId: 'DEMO-INV-30119'
  },
  {
    id: 'pay-3',
    enrolmentId: 'enr-103',
    academyId: 'acad-2',
    academyName: 'Pune Football Training Centre',
    studentName: 'Aryan Salunke',
    programmeName: 'Youth Elite Squad Development',
    amount: 5000,
    dueDate: '2026-10-15',
    paidDate: null,
    status: 'Pending',
    method: 'Pending Approval',
    refId: 'DEMO-INV-44018'
  }
];

// 10. REVIEWS (Sample written feedback)
export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    academyId: 'acad-1',
    author: 'Sunil Deshmukh (Parent)',
    studentName: 'Varun D. (U-16 Bowler)',
    rating: 5,
    date: '2026-09-20',
    title: 'Transformational coaching for my son',
    comment: 'Coach Vikram’s video analysis helped Varun correct his back-foot collapse within 3 weeks. The turf wickets at Shivajinagar are kept in pristine condition. Highly recommended!',
    verifiedStudent: true
  },
  {
    id: 'rev-2',
    academyId: 'acad-1',
    author: 'Gaurav Sawant',
    studentName: 'Gaurav Sawant',
    rating: 5,
    date: '2026-08-14',
    title: 'Best nets and fitness equipment in Pune',
    comment: 'The focus on biomechanical recovery and pace conditioning is what sets Elite apart. Truly a modern academy.',
    verifiedStudent: true
  },
  {
    id: 'rev-3',
    academyId: 'acad-2',
    author: 'Farhan Merchant',
    studentName: 'Rayan M. (U-14 Midfielder)',
    rating: 5,
    date: '2026-09-04',
    title: 'European style positional coaching',
    comment: 'Coach Marcus treats grassroots training with serious professional attention. My son loves the tactical mini-matches.',
    verifiedStudent: true
  },
  {
    id: 'rev-4',
    academyId: 'acad-3',
    author: 'Neha Chitnis',
    studentName: 'Neha Chitnis (Adult Intermediate)',
    rating: 5,
    date: '2026-10-10',
    title: 'Superb wooden courts with air cooling',
    comment: 'Nikhil sir’s footwork drills pushed my endurance to another gear. Court grip is top notch.',
    verifiedStudent: true
  }
];

// 11. SPORTS CATEGORIES
export const SPORTS_CATEGORIES = [
  { id: 'all', name: 'All Sports', icon: 'Sparkles', count: 6 },
  { id: 'cricket', name: 'Cricket', icon: 'Trophy', count: 1 },
  { id: 'football', name: 'Football', icon: 'Flame', count: 1 },
  { id: 'badminton', name: 'Badminton', icon: 'Zap', count: 1 },
  { id: 'swimming', name: 'Swimming', icon: 'Waves', count: 1 },
  { id: 'basketball', name: 'Basketball', icon: 'Activity', count: 1 },
  { id: 'tennis', name: 'Tennis', icon: 'Target', count: 1 },
  { id: 'volleyball', name: 'Volleyball', icon: 'Users', count: 0 },
  { id: 'athletics', name: 'Athletics', icon: 'Compass', count: 0 },
  { id: 'table_tennis', name: 'Table Tennis', icon: 'Shield', count: 0 },
  { id: 'martial_arts', name: 'Martial Arts', icon: 'Swords', count: 0 }
];

// 12. PURE HELPER FUNCTIONS

// Filter coaching centres
export const filterAcademies = (academies, filters = {}, userCoords = null) => {
  return academies.filter((acad) => {
    // Sport
    if (filters.sport && filters.sport !== 'all') {
      const matchSport = acad.sports.some((s) => s.toLowerCase() === filters.sport.toLowerCase());
      if (!matchSport) return false;
    }

    // Keyword Search (Name, sport, location, coach)
    if (filters.keyword && filters.keyword.trim()) {
      const q = filters.keyword.toLowerCase().trim();
      const inName = acad.name.toLowerCase().includes(q);
      const inLocality = acad.locality.toLowerCase().includes(q);
      const inCity = acad.city.toLowerCase().includes(q);
      const inSports = acad.sports.some((s) => s.toLowerCase().includes(q));
      const inTagline = (acad.tagline || '').toLowerCase().includes(q);
      if (!inName && !inLocality && !inCity && !inSports && !inTagline) return false;
    }

    // City / Locality
    if (filters.city && filters.city !== 'all') {
      if (acad.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    }
    if (filters.locality && filters.locality !== 'all') {
      if (acad.locality.toLowerCase() !== filters.locality.toLowerCase()) return false;
    }

    // Budget Filters (Monthly min / max)
    if (filters.minBudget && acad.monthlyFeeMin < Number(filters.minBudget)) return false;
    if (filters.maxBudget && acad.monthlyFeeMin > Number(filters.maxBudget)) return false;

    // Trial Available
    if (filters.trialOnly && !acad.trialClassAvailable) return false;

    // Free Trial Only
    if (filters.freeTrialOnly && (acad.trialFee > 0 || !acad.trialClassAvailable)) return false;

    // Skill Level
    if (filters.skillLevel && filters.skillLevel !== 'all') {
      if (!acad.trainingLevels.includes(filters.skillLevel)) return false;
    }

    // Age Group
    if (filters.ageGroup && filters.ageGroup !== 'all') {
      const matchesAge = acad.ageGroups.some((ag) => ag.toLowerCase().includes(filters.ageGroup.toLowerCase()));
      if (!matchesAge) return false;
    }

    // Facility Type (Indoor / Outdoor)
    if (filters.facilityType && filters.facilityType !== 'all') {
      if (!acad.facilityType.toLowerCase().includes(filters.facilityType.toLowerCase())) return false;
    }

    // Women Coaches / Women Batches
    if (filters.womenCoaches && !acad.womenCoaches) return false;
    if (filters.womenFocusedBatches && !acad.womenFocusedBatches) return false;

    // Beginner Friendly
    if (filters.beginnerFriendly && !acad.beginnerFriendly) return false;

    // Accessible
    if (filters.accessible && !acad.accessible) return false;

    // Scholarship
    if (filters.scholarshipsOnly && !acad.scholarshipsAvailable) return false;

    // Verified Only
    if (filters.verifiedOnly && !acad.verified) return false;

    // Radius Filter (if userCoords available)
    if (filters.maxDistance && userCoords && acad.lat && acad.lng) {
      const dist = haversineDistance(userCoords.lat, userCoords.lng, acad.lat, acad.lng);
      if (dist && dist > Number(filters.maxDistance)) return false;
    }

    return true;
  });
};

// Sort coaching centres
export const sortAcademies = (academies, sortKey = 'relevant', userCoords = null) => {
  const cloned = [...academies];

  switch (sortKey) {
    case 'nearest':
      if (userCoords && userCoords.lat && userCoords.lng) {
        return cloned.sort((a, b) => {
          const distA = a.lat ? haversineDistance(userCoords.lat, userCoords.lng, a.lat, a.lng) : 999;
          const distB = b.lat ? haversineDistance(userCoords.lat, userCoords.lng, b.lat, b.lng) : 999;
          return distA - distB;
        });
      }
      return cloned;
    case 'lowest_fee':
      return cloned.sort((a, b) => a.monthlyFeeMin - b.monthlyFeeMin);
    case 'highest_rated':
      return cloned.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'trial_available':
      return cloned.sort((a, b) => (b.trialClassAvailable ? 1 : 0) - (a.trialClassAvailable ? 1 : 0));
    case 'relevant':
    default:
      // Verified first, then rating
      return cloned.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || b.rating - a.rating);
  }
};

// Safe localStorage wrapper
export const storageWrapper = {
  get: (key, defaultValue) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
      const val = window.localStorage.getItem(key);
      if (!val) return defaultValue;
      return JSON.parse(val);
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Memory state continues normally
    }
  }
};
