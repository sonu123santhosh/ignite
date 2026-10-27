/**
 * /src/data/trialsData.js
 * Comprehensive sample dataset and helpers for the SportLink Sports Trials section.
 * Realistic demonstration data across Football, Cricket, Badminton, Basketball,
 * Athletics, Swimming, Volleyball, and Tennis.
 */

// Relative date helper
export const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

// 1. DEMO PERSONAS
export const DEMO_PERSONAS = [
  {
    id: 'user-athlete-1',
    name: 'Rohan Mane',
    role: 'athlete',
    email: 'rohan.mane@sportlink.demo',
    phone: '+91 98221 44550',
    city: 'Pune',
    age: 19,
    gender: 'Male',
    sport: 'Football',
    position: 'Central Midfielder',
    experience: '4 years (District / Inter-College)',
    currentTeam: 'Fergusson College FC',
    bio: 'Dedicated playmaker with vision and high stamina. Seeking university scholarship squad trials.',
    avatar: 'https://images.unsplash.com/photo-1508215885820-4523e4e13f71?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user-athlete-2',
    name: 'Tanvi Deshmukh',
    role: 'athlete',
    email: 'tanvi.d@sportlink.demo',
    phone: '+91 98234 66120',
    city: 'Mumbai',
    age: 16, // Minor: triggers guardian consent requirements
    gender: 'Female',
    sport: 'Badminton',
    position: 'Singles / Mixed Doubles',
    experience: '3 years (State Ranked U-17)',
    currentTeam: 'Suburban Sports Academy',
    bio: 'Attacking singles player looking for national junior development trials.',
    parentContact: '+91 98234 66121 (Suresh Deshmukh - Father)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user-organiser-1',
    name: 'Prof. Arvind Joshi',
    role: 'organiser',
    organisationId: 'org-1',
    organisationName: 'MIT-WPU Sports Directorate',
    email: 'sports@mitwpu.edu.demo',
    phone: '+91 98225 33001',
    city: 'Pune',
    title: 'Director of University Physical Education',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user-organiser-2',
    name: 'Coach Sahil Khan',
    role: 'organiser',
    organisationId: 'org-2',
    organisationName: 'Pune City FC Youth Academy',
    email: 'academy.scout@pcfc.demo',
    phone: '+91 98901 88200',
    city: 'Pune',
    title: 'Head of Youth Recruitment & Scouting',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
  }
];

// 2. SAMPLE ORGANISATIONS
export const INITIAL_ORGANISATIONS = [
  {
    id: 'org-1',
    name: 'MIT-WPU Sports Directorate',
    type: 'College',
    city: 'Pune',
    address: 'Survey No. 124, Paud Road, Kothrud, Pune - 411038',
    verified: true,
    website: 'https://mitwpu.edu.in/sports',
    contactEmail: 'sports@mitwpu.edu.demo',
    contactPhone: '+91 20 2570 3400',
    description: 'Premier collegiate athletics programme offering sports quota admissions and annual university championship representation.',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 'org-2',
    name: 'Pune City FC Youth Academy',
    type: 'Club',
    city: 'Pune',
    address: 'Kalyani Nagar Sports Complex, Pune - 411006',
    verified: true,
    website: 'https://punecityfc-youth.demo',
    contactEmail: 'scouting@pcfc.demo',
    contactPhone: '+91 98901 88200',
    description: 'Accredited youth residential football setup preparing athletes for I-League 2 and national youth leagues.',
    logo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 'org-3',
    name: 'Maharashtra State Badminton Association',
    type: 'Sports Association',
    city: 'Mumbai',
    address: 'Brabourne Stadium, Veer Nariman Road, Mumbai - 400020',
    verified: true,
    website: 'https://msba-badminton.demo',
    contactEmail: 'trials@msba.demo',
    contactPhone: '+91 22 2280 1199',
    description: 'Governing state sports body organising official selection trials for upcoming National Games and Zonals.',
    logo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 'org-4',
    name: 'Apex Athletic Sprint Cell',
    type: 'Academy',
    city: 'Pune',
    address: 'Shiv Chhatrapati Sports Complex, Balewadi, Pune - 411045',
    verified: false, // Demo unverified academy to demonstrate verification flag distinction
    website: 'https://apexsprint.demo',
    contactEmail: 'coach@apexsprint.demo',
    contactPhone: '+91 98229 99011',
    description: 'Track and field high-performance training unit focusing on 100m, 200m, and 400m speed mechanics.',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 'org-5',
    name: 'Deccan Gymkhana Basketball Club',
    type: 'Club',
    city: 'Pune',
    address: '759/2 Deccan Gymkhana, Pune - 411004',
    verified: true,
    website: 'https://deccangymkhana.demo',
    contactEmail: 'hoops@deccangymkhana.demo',
    contactPhone: '+91 20 2567 4488',
    description: 'Historic sports gymkhana fielding senior and junior men and women teams in state invitation leagues.',
    logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=128&q=80'
  }
];

// 3. SAMPLE SPORTS TRIALS
export const INITIAL_TRIALS = [
  {
    id: 'trial-101',
    title: 'University Varsity Football Selection Trials 2026',
    sport: 'Football',
    discipline: '11-a-side Turf Football',
    organisationId: 'org-1',
    organisationName: 'MIT-WPU Sports Directorate',
    organisationType: 'College',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
    venue: 'MIT-WPU Main Sports Arena, Kothrud',
    address: 'Survey No. 124, Paud Road, Kothrud, Pune - 411038',
    city: 'Pune',
    lat: 18.5089,
    lng: 73.8125,
    trialDate: getRelativeDate(12),
    reportingTime: '06:30 AM',
    startTime: '07:30 AM',
    endTime: '12:00 PM',
    duration: '1 Day (Evaluation + Match Play)',
    applicationDeadline: getRelativeDate(7),
    status: 'Open', // 'Open' | 'Closing Soon' | 'Closed' | 'Cancelled' | 'Results Published'
    publicationStatus: 'Published', // 'Draft' | 'Published'
    entryFee: 0,
    isFree: true,
    additionalCharges: 'None. Refreshments and training bibs supplied.',
    registrationMethod: 'sportlink', // 'sportlink' | 'external'
    officialWebsiteUrl: '',
    minAge: 17,
    maxAge: 25,
    genderEligibility: 'Male', // Only where legitimately required by competition rules
    skillLevel: 'Advanced / Competitive',
    competitionCategory: 'Inter-University (West Zone FISU)',
    trialType: 'Collegiate Squad Selection',
    maxCapacity: 80,
    applicantCount: 42,
    shortlistedCount: 16,
    description: 'Official university football selection trials for the upcoming Inter-University West Zone Championship and All India University Tournament. Shortlisted athletes receive sports quota admission recommendations and complete gear sponsorship.',
    eligibilityCriteria: [
      'Must be enrolled or seeking admission in Undergraduate/Postgraduate programmes for AY 2026-27.',
      'Prior district, state, or university representation within the past 3 academic years.',
      'Must be physically fit to participate in two 30-minute high-tempo evaluation games.',
      'Age between 17 and 25 years as of August 1, 2026.'
    ],
    requiredEquipment: [
      'Moulded football studs (FG/AG suitable for artificial turf)',
      'Shin guards (mandatory for small-sided games)',
      'Black/navy shorts and football stockings',
      'Water bottle and valid student identity card'
    ],
    scheduleTimeline: [
      { time: '06:30 AM – 07:15 AM', stage: 'Reporting & Document Verification', description: 'Desk check for age proof and sports certificates.' },
      { time: '07:15 AM – 07:45 AM', stage: 'Dynamic Warm-up & Agility Drills', description: 'Conducted by university head fitness coach.' },
      { time: '07:45 AM – 09:30 AM', stage: 'Technical Assessment & 7v7 Drills', description: 'Passing accuracy, 1v1 defensive balance, and tactical awareness.' },
      { time: '09:45 AM – 11:30 AM', stage: 'Full-Field 11v11 Trial Match', description: 'Two halves of 35 minutes with live video recording.' },
      { time: '11:30 AM – 12:00 PM', stage: 'Cool Down & Next Steps Debrief', description: 'Announcement of shortlist publication date.' }
    ],
    requiredDocuments: [
      { name: 'Recent Passport Size Photograph', mandatory: true, type: 'Image (JPG/PNG)' },
      { name: 'Government ID Proof (Aadhaar / Passport)', mandatory: true, type: 'PDF / Image' },
      { name: 'Highest Sports Certificate (District/State/National)', mandatory: true, type: 'PDF / Image' },
      { name: 'Medical Fitness Certificate (Signed within 6 months)', mandatory: false, type: 'PDF' },
      { name: 'College / School Bonafide Certificate', mandatory: true, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(14),
    transportInfo: 'Metro: Vanaz Station (1.2 km). Free two-wheeler parking available at Gate 3.',
    notes: 'No parents or non-registered spectators permitted inside the turf dugout.'
  },
  {
    id: 'trial-102',
    title: 'Pune City FC Under-19 I-League Residential Trials',
    sport: 'Football',
    discipline: '11-a-side Football',
    organisationId: 'org-2',
    organisationName: 'Pune City FC Youth Academy',
    organisationType: 'Club',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
    venue: 'Kalyani Nagar Astro Arena',
    address: 'Lane 7, Kalyani Nagar Sports Hub, Pune - 411006',
    city: 'Pune',
    lat: 18.5482,
    lng: 73.9015,
    trialDate: getRelativeDate(5),
    reportingTime: '07:00 AM',
    startTime: '08:00 AM',
    endTime: '01:00 PM',
    duration: '2 Days (Day 1: Open Drills, Day 2: Invited Match)',
    applicationDeadline: getRelativeDate(2),
    status: 'Closing Soon',
    publicationStatus: 'Published',
    entryFee: 300,
    isFree: false,
    additionalCharges: '₹300 administrative registration & hydration kit fee.',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 16,
    maxAge: 19,
    genderEligibility: 'Male',
    skillLevel: 'Competitive / Pre-Professional',
    competitionCategory: 'AIFF Youth I-League (U-19)',
    trialType: 'Professional Academy Scouting',
    maxCapacity: 60,
    applicantCount: 54,
    shortlistedCount: 12,
    description: 'Open scouting trials for Pune City FC Youth residential academy squad. Top 5 selected players receive full residential scholarships including lodging, schooling, and European license coaching.',
    eligibilityCriteria: [
      'Born on or between January 1, 2007 and December 31, 2010.',
      'Experience in Sub-Junior / Junior National Championship, Reliance Foundation Youth Sports, or State Youth League preferred.',
      'Physically fit for intensive 90-minute testing session.'
    ],
    requiredEquipment: [
      'Turf or FG cleats, shin pads, two pairs of socks',
      'Personal water bottle and original government birth certificate'
    ],
    scheduleTimeline: [
      { time: '07:00 AM – 07:45 AM', stage: 'Registration Desk & Height/Weight Screen', description: 'Physical profile documentation.' },
      { time: '08:00 AM – 09:30 AM', stage: 'Sprint 30m, Yo-Yo Intermittent Test & Positional Skills', description: 'Scored by AFC-A License evaluators.' },
      { time: '09:45 AM – 11:30 AM', stage: 'Phase Play & High Pressure Possession', description: 'Assessing quick decision making.' },
      { time: '11:45 AM – 12:45 PM', stage: 'Game Simulation (3 x 20 min intervals)', description: 'Match play analysis.' }
    ],
    requiredDocuments: [
      { name: 'Original Municipal Birth Certificate', mandatory: true, type: 'PDF / Image' },
      { name: 'Aadhaar Card Copy', mandatory: true, type: 'PDF / Image' },
      { name: 'Parent / Guardian Consent Form (Minors)', mandatory: true, type: 'PDF' },
      { name: 'Recent Passport Photo', mandatory: true, type: 'Image (JPG/PNG)' }
    ],
    resultsAnnouncementDate: getRelativeDate(7),
    transportInfo: 'Bus stop: Kalyani Nagar Bridge (200m). On-site parking available.',
    notes: 'Admin fee collected digitally at venue desk or verified via demo token.'
  },
  {
    id: 'trial-103',
    title: 'Maharashtra State Sub-Junior Badminton Championship Trials',
    sport: 'Badminton',
    discipline: 'Singles & Doubles',
    organisationId: 'org-3',
    organisationName: 'Maharashtra State Badminton Association',
    organisationType: 'Sports Association',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80',
    venue: 'Brabourne Stadium Wooden Courts, Churchgate',
    address: 'Veer Nariman Road, Churchgate, Mumbai - 400020',
    city: 'Mumbai',
    lat: 18.9322,
    lng: 72.8258,
    trialDate: getRelativeDate(18),
    reportingTime: '08:00 AM',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    duration: '2 Days (Knockout matches)',
    applicationDeadline: getRelativeDate(12),
    status: 'Open',
    publicationStatus: 'Published',
    entryFee: 500,
    isFree: false,
    additionalCharges: 'Official BAI player scoring affiliation fee.',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 12,
    maxAge: 17,
    genderEligibility: 'All', // Open to Boys & Girls
    skillLevel: 'Advanced',
    competitionCategory: 'National Sub-Junior Championships (BAI)',
    trialType: 'State Squad Selection',
    maxCapacity: 100,
    applicantCount: 38,
    shortlistedCount: 8,
    description: 'Official selection tournament for Maharashtra State Under-15 and Under-17 badminton team for the 46th National Sub-Junior Badminton Championships.',
    eligibilityCriteria: [
      'Valid BAI (Badminton Association of India) Player ID required.',
      'Must have reached Quarterfinals in a District ranking tournament within past 12 months.',
      'Age verification according to BAI age norms (Bone density test may be requested if contested).'
    ],
    requiredEquipment: [
      'Non-marking badminton court shoes (strictly verified at entrance)',
      'At least 2 strung racquets with suitable tension',
      'White competition apparel as per BAI guidelines'
    ],
    scheduleTimeline: [
      { time: '08:00 AM – 08:45 AM', stage: 'Badge Verification & Court Allocation', description: 'BAI ID check.' },
      { time: '09:00 AM – 01:00 PM', stage: 'Round 1 & Round 2 Knockout Matches', description: 'Best of 3 sets to 21 points.' },
      { time: '02:00 PM – 05:00 PM', stage: 'Final Selection Stage & Ranking Play-offs', description: 'Observer scoring by State Chief Coach.' }
    ],
    requiredDocuments: [
      { name: 'BAI Registration Card Copy', mandatory: true, type: 'PDF / Image' },
      { name: 'School Leaving Certificate / Birth Certificate', mandatory: true, type: 'PDF' },
      { name: 'Parent Consent Form for Under-18 athletes', mandatory: true, type: 'PDF' },
      { name: 'District Badminton Association Endorsement Letter', mandatory: true, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(20),
    transportInfo: 'Train: Churchgate Railway Station (5 min walk).',
    notes: 'Yonex Aerosensa 50 feather shuttlecocks provided by the association.'
  },
  {
    id: 'trial-104',
    title: 'Senior District Basketball League Tryouts',
    sport: 'Basketball',
    discipline: '5v5 Full Court Basketball',
    organisationId: 'org-5',
    organisationName: 'Deccan Gymkhana Basketball Club',
    organisationType: 'Club',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80',
    venue: 'Deccan Gymkhana Indoor Wooden Court',
    address: '759/2 Deccan Gymkhana, Pune - 411004',
    city: 'Pune',
    lat: 18.5167,
    lng: 73.8417,
    trialDate: getRelativeDate(8),
    reportingTime: '17:00 PM',
    startTime: '17:30 PM',
    endTime: '20:30 PM',
    duration: '3 Hours',
    applicationDeadline: getRelativeDate(4),
    status: 'Open',
    publicationStatus: 'Published',
    entryFee: 0,
    isFree: true,
    additionalCharges: 'None',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 18,
    maxAge: 32,
    genderEligibility: 'All',
    skillLevel: 'Intermediate / Advanced',
    competitionCategory: 'Pune District "A" Division League',
    trialType: 'Club Team Selection',
    maxCapacity: 45,
    applicantCount: 28,
    shortlistedCount: 10,
    description: 'Tryouts for Deccan Gymkhana Men\'s and Women\'s Senior \'A\' Division basketball squads for the 2026 Invitational League and State Club Championships.',
    eligibilityCriteria: [
      'Minimum age of 18 years on trial date.',
      'Proven competitive playing experience at college, club, or district level.',
      'Commitment to attend weekly team training sessions (Tue/Thu/Sat evening).'
    ],
    requiredEquipment: [
      'Indoor basketball shoes with clean tread',
      'Reversible light/dark scrimmage jersey',
      'Personal water bottle and towel'
    ],
    scheduleTimeline: [
      { time: '17:00 PM – 17:30 PM', stage: 'Registration & Jersey Numbering', description: 'Sign-in desk.' },
      { time: '17:30 PM – 18:15 PM', stage: 'Shooting Drills, Pick & Roll Defense', description: 'Half-court fundamentals.' },
      { time: '18:15 PM – 20:00 PM', stage: 'Full-Court 5v5 Scrimmages', description: 'Assessed on transition pace and rebounding.' },
      { time: '20:00 PM – 20:30 PM', stage: 'Player Interviews & Roster Discussion', description: 'Staff evaluation.' }
    ],
    requiredDocuments: [
      { name: 'Government ID with Date of Birth', mandatory: true, type: 'PDF / Image' },
      { name: 'Recent Sports Resume or Highlights Link', mandatory: false, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(10),
    transportInfo: 'Central Deccan area. Ample parking for two-wheelers and cars.',
    notes: 'Indoor hardwood court requires clean shoes not worn outdoors.'
  },
  {
    id: 'trial-105',
    title: 'State Track & Field Sprint Talent Scouting Cell',
    sport: 'Athletics',
    discipline: '100m, 200m, 400m Sprint',
    organisationId: 'org-4',
    organisationName: 'Apex Athletic Sprint Cell',
    organisationType: 'Academy',
    verifiedOrganiser: false, // Unverified demonstration organisation
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    venue: 'Balewadi Synthetic Running Track',
    address: 'Shiv Chhatrapati Sports Complex, Balewadi, Pune - 411045',
    city: 'Pune',
    lat: 18.5772,
    lng: 73.7667,
    trialDate: getRelativeDate(15),
    reportingTime: '06:00 AM',
    startTime: '06:45 AM',
    endTime: '11:00 AM',
    duration: '1 Day',
    applicationDeadline: getRelativeDate(9),
    status: 'Open',
    publicationStatus: 'Published',
    entryFee: 200,
    isFree: false,
    additionalCharges: '₹200 laser timing gate fee.',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 14,
    maxAge: 22,
    genderEligibility: 'All',
    skillLevel: 'Competitive',
    competitionCategory: 'State Athletics Championships & Khelo India Qualifiers',
    trialType: 'High-Performance Development Cell',
    maxCapacity: 50,
    applicantCount: 22,
    shortlistedCount: 6,
    description: 'High-precision electronic laser timed sprint trials. Top 4 sprinters receive sponsored biometric biomechanical sprint analysis and year-round track coaching.',
    eligibilityCriteria: [
      'Athletes competing in 100m (Target Boys < 11.8s, Girls < 13.2s) or 200m / 400m equivalents.',
      'Must bring valid age proof and running spikes suitable for synthetic tracks (6mm max).'
    ],
    requiredEquipment: [
      'Sprint spikes with 6mm pyramid or Christmas tree pins only',
      'Compression wear or standard athletic singlet',
      'Hydration pack and post-sprint recovery snacks'
    ],
    scheduleTimeline: [
      { time: '06:00 AM – 06:45 AM', stage: 'Spike Inspection & Bib Allocation', description: 'Electronic timing chip assignment.' },
      { time: '06:45 AM – 07:30 AM', stage: 'Guided Track Warm-up & Strides', description: 'Coordinated drills.' },
      { time: '07:30 AM – 09:30 AM', stage: 'Electronic Laser Gate Sprint Heats (100m/200m)', description: 'Two attempts recorded.' },
      { time: '09:45 AM – 10:45 AM', stage: '400m Assessment & Lactate Recovery Test', description: 'Endurance capacity.' }
    ],
    requiredDocuments: [
      { name: 'Birth Certificate / Aadhaar', mandatory: true, type: 'PDF / Image' },
      { name: 'District / School Sprint Timing Certificate', mandatory: false, type: 'PDF' },
      { name: 'Guardian Consent Form (under 18)', mandatory: true, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(16),
    transportInfo: 'Balewadi Stadium complex, accessible via Pune-Bangalore highway.',
    notes: 'Laser timing results provided directly to athletes post-trial.'
  },
  {
    id: 'trial-106',
    title: 'State Aquatics Championship Selection Trials',
    sport: 'Swimming',
    discipline: '50m/100m Freestyle, Breaststroke & Backstroke',
    organisationId: 'org-1',
    organisationName: 'MIT-WPU Sports Directorate',
    organisationType: 'College',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=80',
    venue: 'Olympic Size Heated Pool, Balewadi',
    address: 'Shiv Chhatrapati Complex, Balewadi, Pune - 411045',
    city: 'Pune',
    lat: 18.5772,
    lng: 73.7667,
    trialDate: getRelativeDate(22),
    reportingTime: '06:30 AM',
    startTime: '07:30 AM',
    endTime: '12:30 PM',
    duration: '1 Day',
    applicationDeadline: getRelativeDate(16),
    status: 'Open',
    publicationStatus: 'Published',
    entryFee: 0,
    isFree: true,
    additionalCharges: 'None',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 16,
    maxAge: 25,
    genderEligibility: 'All',
    skillLevel: 'Advanced / Competitive',
    competitionCategory: 'All-India Inter-University Aquatics Meet',
    trialType: 'University Aquatics Team Selection',
    maxCapacity: 40,
    applicantCount: 19,
    shortlistedCount: 8,
    description: 'Selection trials for MIT-WPU varsity swim team for the All-India University Aquatics Meet. Touchpad electronic timing in standard 50-metre competition pool.',
    eligibilityCriteria: [
      'Enrolled or eligible student athlete for university sports quotas.',
      'Proficient in FINA competitive stroke rules with prior competition times.'
    ],
    requiredEquipment: [
      'FINA approved competition swimsuit',
      'Competition goggles and silicone swim cap'
    ],
    scheduleTimeline: [
      { time: '06:30 AM – 07:15 AM', stage: 'Warm-up in Lap Lanes 1 to 8', description: 'Pool adaptation.' },
      { time: '07:30 AM – 10:00 AM', stage: 'Sprint Heats (50m & 100m Freestyle, Back, Breast)', description: 'Touchpad electronic scoring.' },
      { time: '10:30 AM – 12:00 PM', stage: '200m Medley & Team Relay Combination Test', description: 'Team relay drafting.' }
    ],
    requiredDocuments: [
      { name: 'Photo ID / Student ID', mandatory: true, type: 'PDF / Image' },
      { name: 'Recent Swim Meet Timing Sheet', mandatory: true, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(24),
    transportInfo: 'Balewadi Complex Aquatic Center Gate 2.',
    notes: 'Warm-up pool open 45 minutes before first heat.'
  },
  {
    id: 'trial-107',
    title: 'Maharashtra Cricket Premier U-23 Talent Hunt',
    sport: 'Cricket',
    discipline: 'T20 & Multi-Day Cricket',
    organisationId: 'org-2',
    organisationName: 'Pune City FC Youth Academy', // Has cricket division
    organisationType: 'Academy',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80',
    venue: 'Poona Club Cricket Ground',
    address: '6 Bund Garden Road, Pune - 411001',
    city: 'Pune',
    lat: 18.5362,
    lng: 73.8798,
    trialDate: getRelativeDate(3),
    reportingTime: '06:30 AM',
    startTime: '07:30 AM',
    endTime: '14:00 PM',
    duration: '2 Days',
    applicationDeadline: getRelativeDate(-1), // Closed trial to demonstrate expired deadline badge
    status: 'Closed',
    publicationStatus: 'Published',
    entryFee: 400,
    isFree: false,
    additionalCharges: '₹400 net pitch and leather ball maintenance fee.',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 17,
    maxAge: 23,
    genderEligibility: 'Male',
    skillLevel: 'Competitive',
    competitionCategory: 'BCCI U-23 / Invitational T20 League',
    trialType: 'Club Scout Selection',
    maxCapacity: 75,
    applicantCount: 75,
    shortlistedCount: 22,
    description: 'Pace bowling radar gun tracking, spin evaluation, and open turf middle overs batting trials under former Ranji Trophy selectors.',
    eligibilityCriteria: [
      'Born after September 1, 2003.',
      'Must have represented school, college, or club in registered MCA / BCCI affiliate matches.'
    ],
    requiredEquipment: [
      'Complete cricket kit (Bat, pads, gloves, helmet with safety grill)',
      'All-white cricket whites and spiked cricket shoes for turf wicket'
    ],
    scheduleTimeline: [
      { time: '06:30 AM – 07:15 AM', stage: 'Kit Inspection & Group Numbering', description: 'Registration check.' },
      { time: '07:30 AM – 10:30 AM', stage: 'Net Sessions with Bowling Speed Radar', description: 'Assessed on seam and swing.' },
      { time: '11:00 AM – 13:30 PM', stage: 'Open Wicket Scenario Match (8 overs per pair)', description: 'Pressure batting simulation.' }
    ],
    requiredDocuments: [
      { name: 'Original Aadhaar Card', mandatory: true, type: 'PDF / Image' },
      { name: 'MCA / District Cricket Registration Card', mandatory: true, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(5),
    transportInfo: 'Poona Club central Pune. Bund Garden road.',
    notes: 'Registration is now closed. Walk-ins strictly prohibited.'
  },
  {
    id: 'trial-108',
    title: 'Inter-Collegiate Volleyball League Squad Trials',
    sport: 'Volleyball',
    discipline: '6v6 Indoor Court Volleyball',
    organisationId: 'org-1',
    organisationName: 'MIT-WPU Sports Directorate',
    organisationType: 'College',
    verifiedOrganiser: true,
    coverImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1000&q=80',
    venue: 'MIT-WPU Indoor Sports Pavilion',
    address: 'Survey No. 124, Paud Road, Kothrud, Pune - 411038',
    city: 'Pune',
    lat: 18.5089,
    lng: 73.8125,
    trialDate: getRelativeDate(10),
    reportingTime: '15:30 PM',
    startTime: '16:00 PM',
    endTime: '19:00 PM',
    duration: '3 Hours',
    applicationDeadline: getRelativeDate(6),
    status: 'Open',
    publicationStatus: 'Published',
    entryFee: 0,
    isFree: true,
    additionalCharges: 'None',
    registrationMethod: 'sportlink',
    officialWebsiteUrl: '',
    minAge: 17,
    maxAge: 25,
    genderEligibility: 'All',
    skillLevel: 'Intermediate / Advanced',
    competitionCategory: 'Pune University Inter-Collegiate Tournaments',
    trialType: 'Varsity Team Selection',
    maxCapacity: 35,
    applicantCount: 16,
    shortlistedCount: 6,
    description: 'Trials for university men\'s and women\'s volleyball teams. Evaluation covers attack spiking power, setter distribution touch, and libero defensive serve reception.',
    eligibilityCriteria: [
      'Currently enrolled or applied student athletes.',
      'Prior participation in inter-school, college, or district volleyball matches.'
    ],
    requiredEquipment: [
      'Court volleyball shoes with good lateral grip and knee pads',
      'Athletic shorts and moisture-wicking jersey'
    ],
    scheduleTimeline: [
      { time: '15:30 PM – 16:00 PM', stage: 'Registration & Height/Reach Metric Recording', description: 'Reach test.' },
      { time: '16:00 PM – 17:30 PM', stage: 'Spike Timing, Setting Drills & Serve Reception', description: 'Skill stations.' },
      { time: '17:30 PM – 19:00 PM', stage: '6v6 Rotational Game Play', description: 'Scored by university volleyball panel.' }
    ],
    requiredDocuments: [
      { name: 'Student Identity Card', mandatory: true, type: 'PDF / Image' },
      { name: 'Sports Participation Certificate', mandatory: false, type: 'PDF' }
    ],
    resultsAnnouncementDate: getRelativeDate(11),
    transportInfo: 'MIT Paud Road campus.',
    notes: 'Indoor synthetic court with official Mikasa V200W match balls.'
  }
];

// 4. SAMPLE APPLICATIONS (For Athlete and Organiser views)
export const INITIAL_APPLICATIONS = [
  {
    id: 'TR-APP-8812',
    trialId: 'trial-101',
    trialTitle: 'University Varsity Football Selection Trials 2026',
    sport: 'Football',
    organisationId: 'org-1',
    organisationName: 'MIT-WPU Sports Directorate',
    trialDate: getRelativeDate(12),
    venue: 'MIT-WPU Main Sports Arena, Kothrud',
    athleteId: 'user-athlete-1',
    athleteName: 'Rohan Mane',
    athleteEmail: 'rohan.mane@sportlink.demo',
    athletePhone: '+91 98221 44550',
    athleteAge: 19,
    athleteGender: 'Male',
    athleteCity: 'Pune',
    position: 'Central Midfielder',
    experienceLevel: 'Competitive (4 years)',
    previousAchievements: 'Captained Fergusson College in 2025 Zonal Semi-Finals; Best Midfielder at Pune District Inter-Collegiate Trophy.',
    sportsStats: 'Matches: 24 | Goals: 6 | Assists: 14 | Pass Completion: 84%',
    emergencyContact: '+91 98221 44555 (Father - Vinod Mane)',
    uploadedDocuments: [
      { name: 'Rohan_Photo.jpg', type: 'image/jpeg', size: '240 KB' },
      { name: 'Aadhaar_Card.pdf', type: 'application/pdf', size: '820 KB' },
      { name: 'Zonal_Championship_Certificate.pdf', type: 'application/pdf', size: '1.2 MB' },
      { name: 'College_Bonafide.pdf', type: 'application/pdf', size: '450 KB' }
    ],
    appliedOn: getRelativeDate(-2),
    status: 'Shortlisted', // 'Draft' | 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Waitlisted' | 'Rejected' | 'Withdrawn'
    eligibilityVerified: true,
    organiserNotes: 'Impressive midfield statistics. Fast transition vision noted in 2025 footage. Invited to Reporting Stage.',
    attendanceStatus: 'Pending', // 'Pending' | 'Present' | 'Absent'
    evaluationScore: null,
    nextRoundDetails: 'Report directly to Net Dugout 2 at 06:30 AM with original Bonafide certificate for bib allocation.',
    receiptNumber: 'REC-TR-8812-2026'
  },
  {
    id: 'TR-APP-8813',
    trialId: 'trial-102',
    trialTitle: 'Pune City FC Under-19 I-League Residential Trials',
    sport: 'Football',
    organisationId: 'org-2',
    organisationName: 'Pune City FC Youth Academy',
    trialDate: getRelativeDate(5),
    venue: 'Kalyani Nagar Astro Arena',
    athleteId: 'user-athlete-1',
    athleteName: 'Rohan Mane',
    athleteEmail: 'rohan.mane@sportlink.demo',
    athletePhone: '+91 98221 44550',
    athleteAge: 19,
    athleteGender: 'Male',
    athleteCity: 'Pune',
    position: 'Central Midfielder',
    experienceLevel: 'Competitive (4 years)',
    previousAchievements: 'State Youth League Squad Member 2024; Sub-Junior State representation.',
    sportsStats: 'Matches: 18 | Goals: 3 | Assists: 9',
    emergencyContact: '+91 98221 44555 (Vinod Mane)',
    uploadedDocuments: [
      { name: 'Rohan_Photo.jpg', type: 'image/jpeg', size: '240 KB' },
      { name: 'Birth_Certificate.pdf', type: 'application/pdf', size: '610 KB' },
      { name: 'Aadhaar_Card.pdf', type: 'application/pdf', size: '820 KB' }
    ],
    appliedOn: getRelativeDate(-1),
    status: 'Under Review',
    eligibilityVerified: true,
    organiserNotes: 'Age verification verified. Scouter review pending.',
    attendanceStatus: 'Pending',
    evaluationScore: null,
    nextRoundDetails: '',
    receiptNumber: 'REC-TR-8813-2026'
  },
  {
    id: 'TR-APP-8814',
    trialId: 'trial-103',
    trialTitle: 'Maharashtra State Sub-Junior Badminton Championship Trials',
    sport: 'Badminton',
    organisationId: 'org-3',
    organisationName: 'Maharashtra State Badminton Association',
    trialDate: getRelativeDate(18),
    venue: 'Brabourne Stadium Wooden Courts, Churchgate',
    athleteId: 'user-athlete-2',
    athleteName: 'Tanvi Deshmukh',
    athleteEmail: 'tanvi.d@sportlink.demo',
    athletePhone: '+91 98234 66120',
    athleteAge: 16,
    athleteGender: 'Female',
    athleteCity: 'Mumbai',
    position: 'Singles',
    experienceLevel: 'State Ranked U-17 (3 years)',
    previousAchievements: 'Gold Medalist - Mumbai Suburban District U-17 Girls Singles 2025; State Ranking Tournament Round of 16.',
    sportsStats: 'BAI Ranking: 44 (U-17) | Win Rate: 72%',
    emergencyContact: '+91 98234 66121 (Suresh Deshmukh - Father & Guardian)',
    uploadedDocuments: [
      { name: 'Tanvi_Passport_Photo.png', type: 'image/png', size: '180 KB' },
      { name: 'BAI_Player_Card.pdf', type: 'application/pdf', size: '540 KB' },
      { name: 'Guardian_Consent_Signed.pdf', type: 'application/pdf', size: '1.1 MB' },
      { name: 'District_Endorsement_Letter.pdf', type: 'application/pdf', size: '390 KB' }
    ],
    appliedOn: getRelativeDate(-4),
    status: 'Accepted',
    eligibilityVerified: true,
    organiserNotes: 'BAI credentials confirmed with State Secretariat. Court 3 seeding allocated.',
    attendanceStatus: 'Pending',
    evaluationScore: null,
    nextRoundDetails: 'Reporting time 08:00 AM on Court 3. Bring non-marking shoes for strict entrance inspection.',
    receiptNumber: 'REC-TR-8814-2026'
  },
  {
    id: 'TR-APP-8815',
    trialId: 'trial-104',
    trialTitle: 'Senior District Basketball League Tryouts',
    sport: 'Basketball',
    organisationId: 'org-5',
    organisationName: 'Deccan Gymkhana Basketball Club',
    trialDate: getRelativeDate(8),
    venue: 'Deccan Gymkhana Indoor Wooden Court',
    athleteId: 'user-athlete-1',
    athleteName: 'Rohan Mane',
    athleteEmail: 'rohan.mane@sportlink.demo',
    athletePhone: '+91 98221 44550',
    athleteAge: 19,
    athleteGender: 'Male',
    athleteCity: 'Pune',
    position: 'Shooting Guard',
    experienceLevel: 'College Division (2 years)',
    previousAchievements: 'Inter-College Quarterfinalist with Fergusson College.',
    sportsStats: 'Points per game: 14.2 | 3PT%: 38%',
    emergencyContact: '+91 98221 44555 (Vinod Mane)',
    uploadedDocuments: [
      { name: 'Rohan_ID.pdf', type: 'application/pdf', size: '600 KB' }
    ],
    appliedOn: getRelativeDate(-3),
    status: 'Submitted',
    eligibilityVerified: true,
    organiserNotes: 'Awaiting preliminary video / resume verification.',
    attendanceStatus: 'Pending',
    evaluationScore: null,
    nextRoundDetails: '',
    receiptNumber: 'REC-TR-8815-2026'
  }
];

// 5. SAMPLE IN-APP NOTIFICATIONS
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'user-athlete-1',
    type: 'shortlist',
    title: 'Application Shortlisted!',
    message: 'Your application for University Varsity Football Selection Trials 2026 was shortlisted by MIT-WPU Sports Directorate.',
    trialId: 'trial-101',
    timestamp: getRelativeDate(-1),
    read: false
  },
  {
    id: 'notif-2',
    userId: 'user-athlete-1',
    type: 'deadline',
    title: 'Trial Closing Soon',
    message: 'Registration for Pune City FC Under-19 I-League Residential Trials closes in 2 days.',
    trialId: 'trial-102',
    timestamp: getRelativeDate(0),
    read: false
  },
  {
    id: 'notif-3',
    userId: 'user-athlete-2',
    type: 'accepted',
    title: 'Trial Registration Confirmed',
    message: 'Your application for Maharashtra State Sub-Junior Badminton Championship Trials has been Accepted.',
    trialId: 'trial-103',
    timestamp: getRelativeDate(-2),
    read: true
  }
];

// 6. SPORTS CATEGORIES FOR DISCOVERY
export const SPORTS_CATEGORIES = [
  { id: 'all', label: 'All Sports', icon: 'Trophy' },
  { id: 'Football', label: 'Football', icon: 'Footprints' },
  { id: 'Cricket', label: 'Cricket', icon: 'Activity' },
  { id: 'Badminton', label: 'Badminton', icon: 'Zap' },
  { id: 'Basketball', label: 'Basketball', icon: 'Circle' },
  { id: 'Athletics', label: 'Athletics', icon: 'Flame' },
  { id: 'Swimming', label: 'Swimming', icon: 'Waves' },
  { id: 'Volleyball', label: 'Volleyball', icon: 'Target' },
  { id: 'Tennis', label: 'Tennis', icon: 'Award' }
];

// 7. PURE HELPER: Haversine distance in km
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// 8. PURE HELPER: Filter trials
export const filterTrials = (trials, filters, userCoords = null) => {
  return trials.filter((t) => {
    // Keyword search
    if (filters.keyword && filters.keyword.trim()) {
      const q = filters.keyword.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSport = t.sport.toLowerCase().includes(q);
      const matchOrg = t.organisationName.toLowerCase().includes(q);
      const matchCity = t.city.toLowerCase().includes(q);
      const matchVenue = t.venue.toLowerCase().includes(q);
      if (!matchTitle && !matchSport && !matchOrg && !matchCity && !matchVenue) {
        return false;
      }
    }

    // Sport
    if (filters.sport && filters.sport !== 'all') {
      if (t.sport.toLowerCase() !== filters.sport.toLowerCase()) return false;
    }

    // City
    if (filters.city && filters.city !== 'all') {
      if (t.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    }

    // Organisation Type
    if (filters.organisationType && filters.organisationType !== 'all') {
      if (t.organisationType !== filters.organisationType) return false;
    }

    // Skill Level
    if (filters.skillLevel && filters.skillLevel !== 'all') {
      if (!t.skillLevel.toLowerCase().includes(filters.skillLevel.toLowerCase())) return false;
    }

    // Status: 'Open' | 'Closing Soon' | 'Closed'
    if (filters.status && filters.status !== 'all') {
      if (t.status.toLowerCase() !== filters.status.toLowerCase()) return false;
    }

    // Entry Fee: 'free' | 'paid'
    if (filters.entryFee && filters.entryFee !== 'all') {
      if (filters.entryFee === 'free' && !t.isFree) return false;
      if (filters.entryFee === 'paid' && t.isFree) return false;
    }

    // Verified Organiser Only
    if (filters.verifiedOnly && !t.verifiedOrganiser) {
      return false;
    }

    // Max Distance Radius (km)
    if (filters.maxDistance && userCoords && t.lat && t.lng) {
      const dist = haversineDistance(userCoords.lat, userCoords.lng, t.lat, t.lng);
      if (dist && dist > Number(filters.maxDistance)) return false;
    }

    return true;
  });
};

// 9. PURE HELPER: Sort trials
export const sortTrials = (trials, sortKey = 'nearest', userCoords = null) => {
  const cloned = [...trials];

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
    case 'upcoming':
      return cloned.sort((a, b) => new Date(a.trialDate) - new Date(b.trialDate));
    case 'deadline':
      return cloned.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
    case 'relevance':
    default:
      // Verified first, then status Open/Closing soon, then date
      return cloned.sort((a, b) => {
        if (a.verifiedOrganiser !== b.verifiedOrganiser) {
          return a.verifiedOrganiser ? -1 : 1;
        }
        if (a.status === 'Closed' && b.status !== 'Closed') return 1;
        if (b.status === 'Closed' && a.status !== 'Closed') return -1;
        return new Date(a.trialDate) - new Date(b.trialDate);
      });
  }
};

// 10. SAFE LOCALSTORAGE WRAPPER
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
      // Continue safely in memory
    }
  }
};
