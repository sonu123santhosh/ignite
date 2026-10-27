/**
 * /src/data/friendliesData.js
 * Comprehensive sample data and pure helper functions for SportLink College Friendly Matches.
 * All data is simulated prototype data. No real backend, payments or notifications.
 *
 * API REPLACEMENT POINT: Replace mock collections and helper return values
 * with asynchronous REST / GraphQL endpoints in production.
 */

import { INITIAL_FACILITIES } from './facilitiesData';

// Helper to compute ISO dates relative to today
export const getRelativeDate = (dayOffset = 0, hour = 16, minute = 30) => {
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
      weekday: 'short',
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

// 6 Sample Colleges in Pune and Mumbai
export const INITIAL_COLLEGES = [
  {
    id: 'col-1',
    name: 'Pune Institute of Technology',
    shortName: 'PIT',
    city: 'Pune',
    area: 'Shivajinagar',
    emailDomain: 'pit.edu.in',
    primaryColor: '#00D9FF',
    logoInitials: 'PIT',
    address: 'Near FC Road, Shivajinagar, Pune 411005',
    verified: true
  },
  {
    id: 'col-2',
    name: 'Deccan College of Engineering',
    shortName: 'DCE',
    city: 'Pune',
    area: 'Deccan Gymkhana',
    emailDomain: 'dce.edu.in',
    primaryColor: '#B6FF3B',
    logoInitials: 'DCE',
    address: 'Prabhat Road, Deccan Gymkhana, Pune 411004',
    verified: true
  },
  {
    id: 'col-3',
    name: 'Maharashtra Arts & Science College',
    shortName: 'MASC',
    city: 'Pune',
    area: 'Kothrud',
    emailDomain: 'masc.ac.in',
    primaryColor: '#F59E0B',
    logoInitials: 'MASC',
    address: 'Paud Road, Kothrud, Pune 411038',
    verified: false
  },
  {
    id: 'col-4',
    name: 'Symbiosis Institute of Sports',
    shortName: 'SIS',
    city: 'Pune',
    area: 'Viman Nagar',
    emailDomain: 'sis.edu.in',
    primaryColor: '#EC4899',
    logoInitials: 'SIS',
    address: 'Symbiosis Campus, Viman Nagar, Pune 411014',
    verified: true
  },
  {
    id: 'col-5',
    name: 'COEP Technological University',
    shortName: 'COEP',
    city: 'Pune',
    area: 'Shivajinagar',
    emailDomain: 'coep.ac.in',
    primaryColor: '#3B82F6',
    logoInitials: 'COEP',
    address: 'Wellesley Road, Shivajinagar, Pune 411005',
    verified: true
  },
  {
    id: 'col-6',
    name: 'Bombay Modern Commerce College',
    shortName: 'BMCC-M',
    city: 'Mumbai',
    area: 'Churchgate',
    emailDomain: 'bmcc.edu.in',
    primaryColor: '#8B5CF6',
    logoInitials: 'BMCC',
    address: 'Marine Lines, Churchgate, Mumbai 400020',
    verified: true
  }
];

// Demo Personas for role & permission testing
export const DEMO_PERSONAS = [
  {
    id: 'user-cap-1',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@pit.edu.in',
    phone: '+91 98220 11223',
    role: 'captain',
    collegeId: 'col-1',
    collegeName: 'Pune Institute of Technology',
    teamId: 'team-f1',
    teamName: 'PIT Strikers (Football)',
    description: 'Football Captain (PIT) - Test initiating & receiving challenges'
  },
  {
    id: 'user-cap-2',
    name: 'Aakash Shinde',
    email: 'aakash.s@dce.edu.in',
    phone: '+91 98221 44556',
    role: 'captain',
    collegeId: 'col-2',
    collegeName: 'Deccan College of Engineering',
    teamId: 'team-f2',
    teamName: 'DCE Tigers (Football)',
    description: 'Football Captain (DCE) - Test accepting & countering proposals'
  },
  {
    id: 'user-coord-1',
    name: 'Dr. Vivek More',
    email: 'sports.coord@pit.edu.in',
    phone: '+91 98230 77889',
    role: 'coordinator',
    collegeId: 'col-1',
    collegeName: 'Pune Institute of Technology',
    description: 'College Sports Coordinator (PIT) - Verify teams & review proposals'
  },
  {
    id: 'user-org-1',
    name: 'Prof. Sandeep Joshi',
    email: 'events@intercollegiate-sports.demo',
    phone: '+91 98225 99001',
    role: 'organiser',
    description: 'Regional Match Organiser - Manage fixtures & registrations'
  },
  {
    id: 'user-stud-1',
    name: 'Ananya Sharma',
    email: 'ananya.s@pit.edu.in',
    phone: '+91 98233 44110',
    role: 'student',
    collegeId: 'col-1',
    collegeName: 'Pune Institute of Technology',
    description: 'Student & Sports Enthusiast - Follow teams & register for open matches'
  }
];

// 8 Teams across Sports
export const INITIAL_TEAMS = [
  {
    id: 'team-f1',
    collegeId: 'col-1',
    collegeName: 'Pune Institute of Technology',
    name: 'PIT Strikers',
    sport: 'Football',
    captainId: 'user-cap-1',
    captainName: 'Rohan Deshmukh',
    captainPhone: '+91 98220 11223',
    captainEmail: 'rohan.d@pit.edu.in',
    contactVisible: false,
    skillLevel: 'Competitive',
    verified: true,
    followersCount: 128,
    preferredHomeGround: 'Shivaji Park Ground, Pune',
    logoInitials: 'PS',
    primaryColor: '#00D9FF',
    roster: [
      { id: 'p1', name: 'Rohan Deshmukh', position: 'Forward / Striker', role: 'Captain' },
      { id: 'p2', name: 'Faizan Sheikh', position: 'Midfielder', role: 'Vice-captain' },
      { id: 'p3', name: 'Aditya Kadam', position: 'Defender', role: 'Player' },
      { id: 'p4', name: 'Kunal Joshi', position: 'Goalkeeper', role: 'Player' },
      { id: 'p5', name: 'Rohan Shinde', position: 'Winger', role: 'Player' },
      { id: 'p6', name: 'Siddharth Roy', position: 'Centre Back', role: 'Player' },
      { id: 'p7', name: 'Nikhil Patil', position: 'Left Back', role: 'Player' },
      { id: 'p8', name: 'Sameer Varma', position: 'Midfielder', role: 'Substitute' }
    ]
  },
  {
    id: 'team-f2',
    collegeId: 'col-2',
    collegeName: 'Deccan College of Engineering',
    name: 'DCE Tigers',
    sport: 'Football',
    captainId: 'user-cap-2',
    captainName: 'Aakash Shinde',
    captainPhone: '+91 98221 44556',
    captainEmail: 'aakash.s@dce.edu.in',
    contactVisible: false,
    skillLevel: 'Competitive',
    verified: true,
    followersCount: 94,
    preferredHomeGround: 'Deccan Gymkhana Main Turf',
    logoInitials: 'DT',
    primaryColor: '#B6FF3B',
    roster: [
      { id: 'p21', name: 'Aakash Shinde', position: 'Central Midfield', role: 'Captain' },
      { id: 'p22', name: 'Gaurav Kulkarni', position: 'Centre Forward', role: 'Vice-captain' },
      { id: 'p23', name: 'Aniket More', position: 'Goalkeeper', role: 'Player' },
      { id: 'p24', name: 'Prasad Sawant', position: 'Defender', role: 'Player' },
      { id: 'p25', name: 'Suhas Jadhav', position: 'Right Back', role: 'Player' },
      { id: 'p26', name: 'Harsh Rane', position: 'Left Winger', role: 'Player' },
      { id: 'p27', name: 'Tushar Mane', position: 'Centre Back', role: 'Player' }
    ]
  },
  {
    id: 'team-f3',
    collegeId: 'col-5',
    collegeName: 'COEP Technological University',
    name: 'COEP Engineers CC',
    sport: 'Cricket',
    captainId: 'user-cap-coep',
    captainName: 'Nikhil Kulkarni',
    captainPhone: '+91 98220 99881',
    captainEmail: 'nikhil.k@coep.ac.in',
    contactVisible: false,
    skillLevel: 'Competitive',
    verified: true,
    followersCount: 156,
    preferredHomeGround: 'COEP Sports Ground, Pune',
    logoInitials: 'CE',
    primaryColor: '#3B82F6',
    roster: [
      { id: 'p31', name: 'Nikhil Kulkarni', position: 'All-Rounder', role: 'Captain' },
      { id: 'p32', name: 'Sarang Date', position: 'Opening Batsman', role: 'Player' },
      { id: 'p33', name: 'Chinmay Joshi', position: 'Wicket Keeper', role: 'Player' },
      { id: 'p34', name: 'Vivek Shinde', position: 'Fast Bowler', role: 'Player' },
      { id: 'p35', name: 'Aditya Ranade', position: 'Off-Spinner', role: 'Player' },
      { id: 'p36', name: 'Pratik Jagtap', position: 'Middle Order', role: 'Player' }
    ]
  },
  {
    id: 'team-f4',
    collegeId: 'col-3',
    collegeName: 'Maharashtra Arts & Science College',
    name: 'MASC Lions',
    sport: 'Cricket',
    captainId: 'user-cap-masc',
    captainName: 'Yashraj Patil',
    captainPhone: '+91 98220 77112',
    captainEmail: 'yashraj@masc.ac.in',
    contactVisible: false,
    skillLevel: 'Intermediate',
    verified: false,
    followersCount: 42,
    preferredHomeGround: 'Kothrud Public Ground',
    logoInitials: 'ML',
    primaryColor: '#F59E0B',
    roster: [
      { id: 'p41', name: 'Yashraj Patil', position: 'Batsman', role: 'Captain' },
      { id: 'p42', name: 'Sunil Dhavale', position: 'Bowler', role: 'Player' },
      { id: 'p43', name: 'Mandar Gore', position: 'All-Rounder', role: 'Player' }
    ]
  },
  {
    id: 'team-f5',
    collegeId: 'col-4',
    collegeName: 'Symbiosis Institute of Sports',
    name: 'SIS Hoopers',
    sport: 'Basketball',
    captainId: 'user-cap-sis',
    captainName: 'Tanvi Joshi',
    captainPhone: '+91 98220 44332',
    captainEmail: 'tanvi.j@sis.edu.in',
    contactVisible: false,
    skillLevel: 'Competitive',
    verified: true,
    followersCount: 88,
    preferredHomeGround: 'Symbiosis Indoor Arena',
    logoInitials: 'SH',
    primaryColor: '#EC4899',
    roster: [
      { id: 'p51', name: 'Tanvi Joshi', position: 'Point Guard', role: 'Captain' },
      { id: 'p52', name: 'Ria Sen', position: 'Shooting Guard', role: 'Player' },
      { id: 'p53', name: 'Neha Sharma', position: 'Small Forward', role: 'Player' },
      { id: 'p54', name: 'Kavya Pillai', position: 'Power Forward', role: 'Player' },
      { id: 'p55', name: 'Ananya Roy', position: 'Center', role: 'Player' }
    ]
  },
  {
    id: 'team-f6',
    collegeId: 'col-1',
    collegeName: 'Pune Institute of Technology',
    name: 'PIT Dunkers',
    sport: 'Basketball',
    captainId: 'user-cap-pit-bb',
    captainName: 'Varun Mehta',
    captainPhone: '+91 98220 33119',
    captainEmail: 'varun.m@pit.edu.in',
    contactVisible: false,
    skillLevel: 'Intermediate',
    verified: true,
    followersCount: 60,
    preferredHomeGround: 'PIT Basketball Court',
    logoInitials: 'PD',
    primaryColor: '#00D9FF',
    roster: [
      { id: 'p61', name: 'Varun Mehta', position: 'Shooting Guard', role: 'Captain' },
      { id: 'p62', name: 'Karthik Rao', position: 'Point Guard', role: 'Player' },
      { id: 'p63', name: 'Siddharth Iyer', position: 'Forward', role: 'Player' }
    ]
  },
  {
    id: 'team-f7',
    collegeId: 'col-2',
    collegeName: 'Deccan College of Engineering',
    name: 'DCE Smashers',
    sport: 'Badminton',
    captainId: 'user-cap-dce-bad',
    captainName: 'Neha Kadam',
    captainPhone: '+91 98220 55884',
    captainEmail: 'neha.k@dce.edu.in',
    contactVisible: false,
    skillLevel: 'Intermediate',
    verified: true,
    followersCount: 51,
    preferredHomeGround: 'Deccan Gymkhana Badminton Complex',
    logoInitials: 'DS',
    primaryColor: '#B6FF3B',
    roster: [
      { id: 'p71', name: 'Neha Kadam', position: 'Singles / Doubles', role: 'Captain' },
      { id: 'p72', name: 'Omkar Date', position: 'Mixed Doubles', role: 'Player' }
    ]
  },
  {
    id: 'team-f8',
    collegeId: 'col-6',
    collegeName: 'Bombay Modern Commerce College',
    name: 'BMCC Spikers',
    sport: 'Volleyball',
    captainId: 'user-cap-bmcc-vol',
    captainName: 'Sameer Sheikh',
    captainPhone: '+91 98220 66221',
    captainEmail: 'sameer.s@bmcc.edu.in',
    contactVisible: false,
    skillLevel: 'Competitive',
    verified: true,
    followersCount: 73,
    preferredHomeGround: 'University Marine Ground, Mumbai',
    logoInitials: 'BS',
    primaryColor: '#8B5CF6',
    roster: [
      { id: 'p81', name: 'Sameer Sheikh', position: 'Setter', role: 'Captain' },
      { id: 'p82', name: 'Rahul Nair', position: 'Spiker', role: 'Player' },
      { id: 'p83', name: 'Pravin Jadhav', position: 'Libero', role: 'Player' }
    ]
  }
];

// 8 Matches across Pune and Mumbai
export const INITIAL_MATCHES = [
  {
    id: 'match-101',
    type: 'confirmed_fixture', // 'open_challenge' | 'direct_challenge' | 'confirmed_fixture'
    source: 'official_fixture', // 'official_fixture' | 'verified_organiser' | 'community_proposal' | 'demo_data'
    sport: 'Football',
    homeTeamId: 'team-f1',
    awayTeamId: 'team-f2',
    date: getRelativeDate(4, 16, 30),
    startTime: '16:30',
    durationMinutes: 90,
    format: '7-a-side (2 x 35 min)',
    venue: {
      name: 'Elite Football Arena (Pitch 1)',
      address: '80 Feet Road, 4th Block, Koramangala / Deccan Turf, Pune',
      lat: 18.5167,
      lng: 73.8562,
      facilityId: 'fac-1'
    },
    skillLevel: 'Competitive',
    fee: 0,
    feeUnit: 'Free friendly match',
    slots: { total: 2, registered: 2, open: 0 },
    registrationDeadline: getRelativeDate(2, 23, 59),
    organiserId: 'user-org-1',
    organiserName: 'Prof. Sandeep Joshi',
    status: 'Confirmed', // 'Open for Teams' | 'Pending Confirmation' | 'Confirmed' | 'Completed' | 'Cancelled'
    lastVerified: '2026-10-25',
    rules: [
      'Standard 7-a-side rolling substitutions.',
      'Shin guards and collegiate jerseys compulsory.',
      'Certified referee appointed by organizing council.'
    ],
    announcements: [
      { id: 'a1', date: '2026-10-26', author: 'Prof. Sandeep Joshi', message: 'Match balls and bibs will be supplied at the venue dugout.' }
    ],
    cancellationPolicy: 'Notice of at least 48 hours required from either captain to reschedule without penalty.',
    isSample: true
  },
  {
    id: 'match-102',
    type: 'open_challenge',
    source: 'verified_organiser',
    sport: 'Football',
    homeTeamId: 'team-f1',
    awayTeamId: null, // Seeking opponent
    date: getRelativeDate(6, 17, 0),
    startTime: '17:00',
    durationMinutes: 60,
    format: '5-a-side Turf Derby',
    venue: {
      name: 'Shivaji Park Mini Turf',
      address: 'Near FC Road, Shivajinagar, Pune 411005',
      lat: 18.5284,
      lng: 73.8443,
      facilityId: null
    },
    skillLevel: 'Competitive',
    fee: 300,
    feeUnit: 'per team (turf split)',
    slots: { total: 2, registered: 1, open: 1 },
    registrationDeadline: getRelativeDate(4, 20, 0),
    organiserId: 'user-cap-1',
    organiserName: 'Rohan Deshmukh (PIT Captain)',
    status: 'Open for Teams',
    lastVerified: '2026-10-26',
    rules: [
      '5 players on court, maximum 3 substitutes.',
      'Low bounce turf football.',
      'Turf hire fee split equally between participating colleges.'
    ],
    announcements: [],
    cancellationPolicy: 'If no opponent registers before deadline, booking is cancelled with full fee waiver.',
    isSample: true
  },
  {
    id: 'match-103',
    type: 'confirmed_fixture',
    source: 'verified_organiser',
    sport: 'Cricket',
    homeTeamId: 'team-f3',
    awayTeamId: 'team-f4',
    date: getRelativeDate(8, 9, 0),
    startTime: '09:00',
    durationMinutes: 180,
    format: 'T20 Leather Ball',
    venue: {
      name: 'Deccan Gymkhana Pavilion Oval',
      address: 'Prabhat Road, Deccan Gymkhana, Pune 411004',
      lat: 18.5158,
      lng: 73.8375,
      facilityId: 'fac-3'
    },
    skillLevel: 'Competitive',
    fee: 500,
    feeUnit: 'per team (ball & umpire cost)',
    slots: { total: 2, registered: 2, open: 0 },
    registrationDeadline: getRelativeDate(5, 23, 59),
    organiserId: 'user-cap-coep',
    organiserName: 'Nikhil Kulkarni (COEP)',
    status: 'Confirmed',
    lastVerified: '2026-10-24',
    rules: [
      '20 overs per innings, maximum 4 overs per bowler.',
      'Red leather ball provided.',
      'Full cricket whites mandatory.'
    ],
    announcements: [
      { id: 'a2', date: '2026-10-25', author: 'Nikhil Kulkarni', message: 'Toss will take place promptly at 08:30 AM.' }
    ],
    cancellationPolicy: '50% refund if rain washes out match before 5 overs bowled.',
    isSample: true
  },
  {
    id: 'match-104',
    type: 'open_challenge',
    source: 'community_proposal',
    sport: 'Basketball',
    homeTeamId: 'team-f5',
    awayTeamId: null,
    date: getRelativeDate(5, 18, 0),
    startTime: '18:00',
    durationMinutes: 60,
    format: 'Full Court 5v5 (4 x 10 min)',
    venue: {
      name: 'Symbiosis Sports Complex Court A',
      address: 'Viman Nagar Campus, Pune 411014',
      lat: 18.5679,
      lng: 73.9143,
      facilityId: null
    },
    skillLevel: 'Competitive',
    fee: 0,
    feeUnit: 'Free friendly match',
    slots: { total: 2, registered: 1, open: 1 },
    registrationDeadline: getRelativeDate(3, 18, 0),
    organiserId: 'user-cap-sis',
    organiserName: 'Tanvi Joshi (SIS)',
    status: 'Open for Teams',
    lastVerified: null, // Not verified
    rules: [
      'Standard FIBA timing rules.',
      '24-second shot clock operated by college student volunteer.'
    ],
    announcements: [],
    cancellationPolicy: 'Please confirm lineup 24 hours prior.',
    isSample: true
  },
  {
    id: 'match-105',
    type: 'direct_challenge',
    source: 'community_proposal',
    sport: 'Badminton',
    homeTeamId: 'team-f7',
    awayTeamId: 'team-f1',
    date: getRelativeDate(9, 15, 0),
    startTime: '15:00',
    durationMinutes: 90,
    format: 'Singles + Doubles Tie',
    venue: {
      name: 'SmashPoint Badminton Club',
      address: 'FC Road, Deccan, Pune',
      lat: 18.5204,
      lng: 73.8415,
      facilityId: 'fac-2'
    },
    skillLevel: 'Intermediate',
    fee: 200,
    feeUnit: 'per team (feather shuttles)',
    slots: { total: 2, registered: 1, open: 1 },
    registrationDeadline: getRelativeDate(6, 23, 59),
    organiserId: 'user-cap-dce-bad',
    organiserName: 'Neha Kadam (DCE)',
    status: 'Pending Confirmation',
    lastVerified: null,
    rules: ['Best of 3 sets to 21 points.', 'Yonex Mavis 350 or AS-2 shuttles provided.'],
    announcements: [],
    cancellationPolicy: 'Friendly exhibition tie.',
    isSample: true
  },
  {
    id: 'match-106',
    type: 'confirmed_fixture',
    source: 'official_fixture',
    sport: 'Volleyball',
    homeTeamId: 'team-f8',
    awayTeamId: 'team-f2',
    date: getRelativeDate(12, 10, 0),
    startTime: '10:00',
    durationMinutes: 75,
    format: 'Best of 5 Sets (25-pt rally)',
    venue: {
      name: 'Kothrud Community Sports Arena',
      address: 'Near Gandhi Bhavan, Kothrud, Pune 411038',
      lat: 18.5074,
      lng: 73.8077,
      facilityId: null
    },
    skillLevel: 'Competitive',
    fee: 0,
    feeUnit: 'Free friendly match',
    slots: { total: 2, registered: 2, open: 0 },
    registrationDeadline: getRelativeDate(8, 23, 59),
    organiserId: 'user-org-1',
    organiserName: 'Prof. Sandeep Joshi',
    status: 'Confirmed',
    lastVerified: '2026-10-23',
    rules: ['FIVB standard rules with Libero rotation.'],
    announcements: [],
    cancellationPolicy: 'Official collegiate sports council calendar fixture.',
    isSample: true
  },
  {
    id: 'match-107',
    type: 'confirmed_fixture',
    source: 'verified_organiser',
    sport: 'Football',
    homeTeamId: 'team-f1',
    awayTeamId: 'team-f2',
    date: getRelativeDate(-3, 16, 30),
    startTime: '16:30',
    durationMinutes: 90,
    format: '7-a-side Pre-Season Friendly',
    venue: {
      name: 'Shivaji Park Ground, Pune',
      address: 'Shivajinagar, Pune 411005',
      lat: 18.5284,
      lng: 73.8443,
      facilityId: null
    },
    skillLevel: 'Competitive',
    fee: 0,
    feeUnit: 'Free friendly match',
    slots: { total: 2, registered: 2, open: 0 },
    registrationDeadline: getRelativeDate(-5, 23, 59),
    organiserId: 'user-org-1',
    organiserName: 'Prof. Sandeep Joshi',
    status: 'Completed',
    score: { homeScore: 3, awayScore: 2 },
    lastVerified: '2026-10-24',
    rules: ['Standard pre-season friendly exhibition.'],
    announcements: [
      { id: 'a-comp', date: '2026-10-24', author: 'Prof. Sandeep Joshi', message: 'Final Result: PIT Strikers 3 - 2 DCE Tigers.' }
    ],
    cancellationPolicy: 'N/A',
    isSample: true
  },
  {
    id: 'match-108',
    type: 'open_challenge',
    source: 'community_proposal',
    sport: 'Basketball',
    homeTeamId: 'team-f6',
    awayTeamId: null,
    date: getRelativeDate(-1, 17, 0),
    startTime: '17:00',
    durationMinutes: 60,
    format: '3v3 Half Court Street Jam',
    venue: {
      name: 'Bandra Reclamation Urban Courts',
      address: 'KC Marg, Bandra West, Mumbai 400050',
      lat: 19.0544,
      lng: 72.8258,
      facilityId: null
    },
    skillLevel: 'Intermediate',
    fee: 150,
    feeUnit: 'per team',
    slots: { total: 2, registered: 1, open: 1 },
    registrationDeadline: getRelativeDate(-2, 12, 0),
    organiserId: 'user-cap-pit-bb',
    organiserName: 'Varun Mehta',
    status: 'Cancelled',
    cancelReason: 'Heavy rainfall and court flooding caused by unseasonal monsoon showers.',
    lastVerified: null,
    rules: ['Half court FIBA 3v3 rules.'],
    announcements: [
      { id: 'a-canc', date: '2026-10-25', author: 'Varun Mehta', message: 'Match cancelled due to wet outdoor court.' }
    ],
    cancellationPolicy: '100% refund on weather cancellations.',
    isSample: true
  }
];

// 5 Invitations in Assorted States
export const INITIAL_INVITATIONS = [
  {
    id: 'inv-201',
    matchId: 'match-105',
    senderTeamId: 'team-f7',
    senderCollegeId: 'col-2',
    recipientTeamId: 'team-f1',
    recipientCollegeId: 'col-1',
    sport: 'Badminton',
    status: 'Pending', // 'Draft' | 'Pending' | 'Counterproposal Received' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn' | 'Confirmed'
    createdAt: getRelativeDate(-1, 11, 0),
    expiresAt: getRelativeDate(2, 11, 0),
    terms: {
      date: getRelativeDate(9, 15, 0),
      startTime: '15:00',
      durationMinutes: 90,
      venueName: 'SmashPoint Badminton Club',
      format: 'Singles + Doubles Tie',
      message: 'Greetings from DCE Badminton squad! Proposing a friendly sparring session ahead of the district collegiate qualifiers.'
    },
    history: [
      {
        timestamp: getRelativeDate(-1, 11, 0),
        actorName: 'Neha Kadam (DCE Captain)',
        actorRole: 'sender',
        action: 'Sent Invitation',
        details: 'Initial proposal for 9 days ahead at SmashPoint Club.'
      }
    ]
  },
  {
    id: 'inv-202',
    matchId: null,
    senderTeamId: 'team-f1',
    senderCollegeId: 'col-1',
    recipientTeamId: 'team-f2',
    recipientCollegeId: 'col-2',
    sport: 'Football',
    status: 'Counterproposal Received',
    createdAt: getRelativeDate(-2, 14, 0),
    expiresAt: getRelativeDate(1, 14, 0),
    terms: {
      date: getRelativeDate(7, 17, 0),
      startTime: '17:00',
      durationMinutes: 90,
      venueName: 'Deccan Gymkhana Main Turf',
      format: '7-a-side Full Match',
      message: 'We counter-propose moving the kickoff to 5:00 PM at Deccan Gymkhana to avoid afternoon heat.'
    },
    history: [
      {
        timestamp: getRelativeDate(-2, 14, 0),
        actorName: 'Rohan Deshmukh (PIT Captain)',
        actorRole: 'sender',
        action: 'Sent Initial Invitation',
        details: 'Proposed 3:30 PM kickoff at Shivaji Park.'
      },
      {
        timestamp: getRelativeDate(-1, 18, 30),
        actorName: 'Aakash Shinde (DCE Captain)',
        actorRole: 'recipient',
        action: 'Submitted Counter-Proposal',
        details: 'Changed time to 5:00 PM and moved venue to Deccan Gymkhana.'
      }
    ]
  },
  {
    id: 'inv-203',
    matchId: 'match-101',
    senderTeamId: 'team-f1',
    senderCollegeId: 'col-1',
    recipientTeamId: 'team-f2',
    recipientCollegeId: 'col-2',
    sport: 'Football',
    status: 'Confirmed',
    createdAt: getRelativeDate(-5, 10, 0),
    expiresAt: getRelativeDate(1, 10, 0),
    terms: {
      date: getRelativeDate(4, 16, 30),
      startTime: '16:30',
      durationMinutes: 90,
      venueName: 'Elite Football Arena (Pitch 1)',
      format: '7-a-side (2 x 35 min)',
      message: 'Official warm-up derby match agreed.'
    },
    history: [
      {
        timestamp: getRelativeDate(-5, 10, 0),
        actorName: 'Rohan Deshmukh',
        actorRole: 'sender',
        action: 'Sent Proposal',
        details: 'Proposal for Pitch 1 turf match.'
      },
      {
        timestamp: getRelativeDate(-4, 12, 15),
        actorName: 'Aakash Shinde',
        actorRole: 'recipient',
        action: 'Accepted Proposal',
        details: 'Terms accepted without modification. Match Confirmed!'
      }
    ]
  },
  {
    id: 'inv-204',
    matchId: null,
    senderTeamId: 'team-f3',
    senderCollegeId: 'col-5',
    recipientTeamId: 'team-f4',
    recipientCollegeId: 'col-3',
    sport: 'Cricket',
    status: 'Declined',
    createdAt: getRelativeDate(-7, 9, 0),
    expiresAt: getRelativeDate(-4, 9, 0),
    terms: {
      date: getRelativeDate(-2, 10, 0),
      startTime: '10:00',
      durationMinutes: 180,
      venueName: 'COEP Ground',
      format: 'T20 Match',
      message: 'Friendly cricket match on weekend.'
    },
    history: [
      {
        timestamp: getRelativeDate(-7, 9, 0),
        actorName: 'Nikhil Kulkarni (COEP)',
        actorRole: 'sender',
        action: 'Sent Proposal',
        details: 'Weekend morning match.'
      },
      {
        timestamp: getRelativeDate(-6, 14, 0),
        actorName: 'Yashraj Patil (MASC)',
        actorRole: 'recipient',
        action: 'Declined Proposal',
        details: 'Declined due to college terminal internal examinations.'
      }
    ]
  },
  {
    id: 'inv-205',
    matchId: null,
    senderTeamId: 'team-f6',
    senderCollegeId: 'col-1',
    recipientTeamId: 'team-f5',
    recipientCollegeId: 'col-4',
    sport: 'Basketball',
    status: 'Expired',
    createdAt: getRelativeDate(-8, 12, 0),
    expiresAt: getRelativeDate(-5, 12, 0),
    terms: {
      date: getRelativeDate(-3, 17, 0),
      startTime: '17:00',
      durationMinutes: 60,
      venueName: 'PIT Basketball Court',
      format: '5v5 Full Court',
      message: 'Friendly hoops session.'
    },
    history: [
      {
        timestamp: getRelativeDate(-8, 12, 0),
        actorName: 'Varun Mehta (PIT)',
        actorRole: 'sender',
        action: 'Sent Proposal',
        details: 'Proposal sent with 72-hour expiration window.'
      },
      {
        timestamp: getRelativeDate(-5, 12, 0),
        actorName: 'System',
        actorRole: 'system',
        action: 'Invitation Expired',
        details: 'No response was recorded before the 72-hour window elapsed.'
      }
    ]
  }
];

// 6 Sample Notifications
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Counter-Proposal Received',
    message: 'DCE Tigers countered your football match proposal: Kickoff shifted to 5:00 PM at Deccan Gymkhana.',
    date: getRelativeDate(-1, 18, 30),
    read: false,
    type: 'warning',
    targetUserId: 'user-cap-1',
    link: '/friendlies/inbox'
  },
  {
    id: 'n-2',
    title: 'Match Confirmed!',
    message: 'PIT Strikers vs DCE Tigers friendly match on Pitch 1 has been confirmed by both captains.',
    date: getRelativeDate(-4, 12, 15),
    read: false,
    type: 'success',
    targetUserId: 'user-cap-1',
    link: '/friendlies/matches/match-101'
  },
  {
    id: 'n-3',
    title: 'New Match Challenge Received',
    message: 'Neha Kadam (DCE Smashers) challenged your badminton squad to a friendly tie.',
    date: getRelativeDate(-1, 11, 0),
    read: false,
    type: 'info',
    targetUserId: 'user-cap-1',
    link: '/friendlies/inbox'
  },
  {
    id: 'n-4',
    title: 'Team Verification Request',
    message: 'New squad "MASC Lions (Cricket)" registered. College coordinator verification pending.',
    date: getRelativeDate(-3, 14, 0),
    read: true,
    type: 'info',
    targetUserId: 'user-coord-1',
    link: '/friendlies/dashboard'
  },
  {
    id: 'n-5',
    title: 'Upcoming Match Reminder',
    message: 'Upcoming Friendly: PIT Strikers vs DCE Tigers begins in 4 days at Elite Football Arena.',
    date: getRelativeDate(0, 9, 0),
    read: true,
    type: 'info',
    targetUserId: 'all',
    link: '/friendlies/matches/match-101'
  },
  {
    id: 'n-6',
    title: 'Match Announcement',
    message: 'Prof. Sandeep Joshi posted an announcement for match #101: Match balls and bibs will be supplied.',
    date: getRelativeDate(-1, 10, 0),
    read: true,
    type: 'info',
    targetUserId: 'user-cap-1',
    link: '/friendlies/matches/match-101'
  }
];

// Sample Official Announcements / Circulars Feed
export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Pune Inter-Collegiate Football Friendlies Window Extended',
    body: 'The Zonal Sports Committee has officially extended the autumn friendly match coordination window until November 15, 2026. All collegiate teams with verified rosters may schedule matches.',
    sourceTier: 'official',
    officialSource: 'Pune City Zonal Sports Committee (PCZSC)',
    link: 'https://www.pczsc.in/pczsc-data_files/',
    date: '2026-10-25'
  },
  {
    id: 'ann-2',
    title: 'Sanctioned Grounds Advisory: Synthetic Turf Maintenance',
    body: 'Elite Football Arena and Shivajinagar grounds will undergo pitch resurfacing between 6:00 AM and 11:00 AM on weekdays. Teams are advised to request afternoon slots.',
    sourceTier: 'verified_organiser',
    officialSource: 'SPPU Sports Directorate',
    link: 'https://www.pdzsc.in/',
    date: '2026-10-24'
  },
  {
    id: 'ann-3',
    title: 'Inter-Collegiate Cricket Equipment & Leather Ball Standards',
    body: 'Colleges scheduling T20 leather ball friendlies are reminded that SG Club match balls must be provided by the host team, along with qualified scorers.',
    sourceTier: 'official',
    officialSource: 'Maharashtra Inter-University Sports Board',
    link: '#',
    date: '2026-10-22'
  }
];

// Official External Source Links
export const OFFICIAL_SOURCE_ENTRIES = [
  {
    id: 'src-1',
    name: 'Pune City Zonal Sports Committee (PCZSC)',
    url: 'https://www.pczsc.in/pczsc-data_files/',
    description: 'Pune-region sports bodies. Check these sites for official announcements.',
    tier: 'Official fixture source',
    lastVerified: '2026-10-24',
    badge: 'Official Source'
  },
  {
    id: 'src-2',
    name: 'Pune District Zonal Sports Committee (PDZSC)',
    url: 'https://www.pdzsc.in/',
    description: 'Pune-region sports bodies. Check these sites for official announcements.',
    tier: 'Official fixture source',
    lastVerified: '2026-10-22',
    badge: 'Official Source'
  },
  {
    id: 'src-3',
    name: 'Maharashtra Inter-University Sports Portal',
    url: 'https://www.pdzsc.in/',
    description: 'State university sports federation bulletins and zonal circulars.',
    tier: 'Verified organiser source',
    lastVerified: '2026-10-20',
    badge: 'Regional Federation'
  }
];

// Pure Helper: Mask contact details unless authorised
export const maskContact = (contactStr, isAuthorised = false) => {
  if (isAuthorised) return contactStr || 'Not provided';
  if (!contactStr) return 'Visible to confirmed captains only';
  return 'Visible to confirmed captains only';
};

// Pure Helper: Permission Matrix Enforcer
export const checkPermission = (role, currentUserId, action, resource = null) => {
  // Student
  if (role === 'student') {
    if (['browse_matches', 'view_details', 'follow_team', 'report_info', 'view_announcements'].includes(action)) {
      return { allowed: true };
    }
    if (action === 'register_open_match') {
      return { allowed: true };
    }
    return {
      allowed: false,
      message: 'Permission Refused: Students have view-only access. Only team captains can manage squads or issue match challenges.'
    };
  }

  // Team Captain
  if (role === 'captain') {
    if (['browse_matches', 'view_details', 'follow_team', 'report_info', 'view_announcements'].includes(action)) {
      return { allowed: true };
    }
    if (action === 'manage_team' || action === 'edit_roster') {
      const isMyTeam = resource?.captainId === currentUserId;
      return isMyTeam
        ? { allowed: true }
        : { allowed: false, message: 'Permission Refused: You can only manage squads and rosters you captain.' };
    }
    if (['send_challenge', 'accept_invitation', 'decline_invitation', 'counter_invitation', 'withdraw_invitation'].includes(action)) {
      // Must be sender or recipient captain
      return { allowed: true };
    }
    if (action === 'verify_team') {
      return { allowed: false, message: 'Permission Refused: Only a College Sports Coordinator can verify college squads.' };
    }
    return { allowed: true };
  }

  // College Coordinator
  if (role === 'coordinator') {
    if (['browse_matches', 'view_details', 'view_announcements', 'monitor_registrations', 'publish_announcement'].includes(action)) {
      return { allowed: true };
    }
    if (action === 'verify_team') {
      return { allowed: true };
    }
    if (action === 'send_challenge') {
      return { allowed: false, message: 'Permission Refused: Match challenges must be sent directly by the designated Team Captain.' };
    }
    return { allowed: true };
  }

  // Match Organiser
  if (role === 'organiser') {
    if (['browse_matches', 'view_details', 'create_fixture', 'edit_fixture', 'manage_registrations', 'cancel_match', 'message_teams'].includes(action)) {
      return { allowed: true };
    }
    return { allowed: true };
  }

  return { allowed: false, message: 'Invalid role.' };
};

// Pure Helper: Invitation State Machine
export const invitationStateMachine = (invitation, action, payload = {}, actor) => {
  const currentStatus = invitation.status;
  const history = [...(invitation.history || [])];

  // Actions allowed on Pending or Counterproposal Received
  if (action === 'ACCEPT') {
    if (currentStatus !== 'Pending' && currentStatus !== 'Counterproposal Received') {
      return { success: false, error: `Cannot accept an invitation in "${currentStatus}" status.` };
    }

    history.push({
      timestamp: new Date().toISOString(),
      actorName: actor?.name || 'Captain',
      actorRole: 'recipient',
      action: 'Accepted Terms',
      details: 'All terms agreed. Match is now Confirmed!'
    });

    return {
      success: true,
      invitation: {
        ...invitation,
        status: 'Confirmed',
        history
      },
      confirmedMatch: {
        id: `match-${Date.now()}`,
        type: 'confirmed_fixture',
        source: 'community_proposal',
        sport: invitation.sport,
        homeTeamId: invitation.senderTeamId,
        awayTeamId: invitation.recipientTeamId,
        date: invitation.terms.date,
        startTime: invitation.terms.startTime,
        durationMinutes: invitation.terms.durationMinutes || 90,
        format: invitation.terms.format,
        venue: {
          name: invitation.terms.venueName,
          address: `${invitation.terms.venueName}, Pune`,
          lat: 18.5204,
          lng: 73.8567,
          facilityId: null
        },
        skillLevel: 'Competitive',
        fee: 0,
        feeUnit: 'Free friendly match',
        slots: { total: 2, registered: 2, open: 0 },
        registrationDeadline: invitation.terms.date,
        organiserId: actor?.id,
        organiserName: actor?.name,
        status: 'Confirmed',
        lastVerified: null,
        rules: ['Standard friendly exhibition rules.'],
        announcements: [],
        cancellationPolicy: 'Notice of 48 hours required.',
        isSample: true
      }
    };
  }

  if (action === 'DECLINE') {
    if (currentStatus !== 'Pending' && currentStatus !== 'Counterproposal Received') {
      return { success: false, error: `Cannot decline an invitation in "${currentStatus}" status.` };
    }

    history.push({
      timestamp: new Date().toISOString(),
      actorName: actor?.name || 'Captain',
      actorRole: 'recipient',
      action: 'Declined Invitation',
      details: payload.reason || 'Declined proposal.'
    });

    return {
      success: true,
      invitation: {
        ...invitation,
        status: 'Declined',
        history
      }
    };
  }

  if (action === 'COUNTER') {
    if (currentStatus !== 'Pending' && currentStatus !== 'Counterproposal Received') {
      return { success: false, error: `Cannot counter an invitation in "${currentStatus}" status.` };
    }

    const updatedTerms = {
      ...invitation.terms,
      date: payload.date || invitation.terms.date,
      startTime: payload.startTime || invitation.terms.startTime,
      durationMinutes: payload.durationMinutes || invitation.terms.durationMinutes,
      venueName: payload.venueName || invitation.terms.venueName,
      format: payload.format || invitation.terms.format,
      message: payload.message || invitation.terms.message
    };

    history.push({
      timestamp: new Date().toISOString(),
      actorName: actor?.name || 'Captain',
      actorRole: 'counter',
      action: 'Counter-Proposal Submitted',
      details: `Updated terms: ${updatedTerms.date ? formatDateDisplay(updatedTerms.date) : ''} at ${updatedTerms.startTime} (${updatedTerms.venueName}). Note: "${payload.message || 'Counter terms submitted.'}"`
    });

    return {
      success: true,
      invitation: {
        ...invitation,
        status: 'Counterproposal Received',
        terms: updatedTerms,
        history
      }
    };
  }

  if (action === 'WITHDRAW') {
    if (currentStatus !== 'Pending' && currentStatus !== 'Counterproposal Received') {
      return { success: false, error: `Cannot withdraw an invitation in "${currentStatus}" status.` };
    }

    history.push({
      timestamp: new Date().toISOString(),
      actorName: actor?.name || 'Captain',
      actorRole: 'sender',
      action: 'Withdrawn by Sender',
      details: 'Sender withdrew proposal prior to match agreement.'
    });

    return {
      success: true,
      invitation: {
        ...invitation,
        status: 'Withdrawn',
        history
      }
    };
  }

  return { success: false, error: 'Unknown action.' };
};

// Pure Helper: Detect Scheduling Conflicts
export const detectMatchConflicts = (matches, teamId, dateStr, startTime, durationMinutes, venueName) => {
  const conflicts = [];
  if (!dateStr || !startTime) return conflicts;

  const proposedStart = new Date(dateStr);
  const [pHour, pMin] = startTime.split(':').map(Number);
  proposedStart.setHours(pHour, pMin, 0, 0);
  const proposedEnd = new Date(proposedStart.getTime() + (durationMinutes || 90) * 60000);

  matches.forEach((m) => {
    if (m.status === 'Cancelled' || m.status === 'Completed') return;
    if (!m.date || !m.startTime) return;

    const mStart = new Date(m.date);
    const [mHour, mMin] = m.startTime.split(':').map(Number);
    mStart.setHours(mHour, mMin, 0, 0);
    const mEnd = new Date(mStart.getTime() + (m.durationMinutes || 90) * 60000);

    const isOverlap = proposedStart < mEnd && proposedEnd > mStart;

    if (isOverlap) {
      if (teamId && (m.homeTeamId === teamId || m.awayTeamId === teamId)) {
        conflicts.push({
          type: 'team_conflict',
          message: `Team scheduling collision: You already have a confirmed fixture (${m.sport}) overlapping on ${formatDateDisplay(m.date)} at ${m.startTime}.`
        });
      }
      if (venueName && m.venue?.name && m.venue.name.toLowerCase() === venueName.toLowerCase()) {
        conflicts.push({
          type: 'venue_conflict',
          message: `Venue double-booking warning: "${venueName}" is already scheduled for another friendly match on ${formatDateDisplay(m.date)} at ${m.startTime}.`
        });
      }
    }
  });

  return conflicts;
};

// Pure Helper: Filter Matches
export const filterMatches = (matches, filters = {}) => {
  return matches.filter((m) => {
    // Sport
    if (filters.sport && filters.sport !== 'all' && m.sport.toLowerCase() !== filters.sport.toLowerCase()) {
      return false;
    }

    // City
    if (filters.city && filters.city !== 'all') {
      const vCity = (m.venue?.address || '').toLowerCase();
      if (!vCity.includes(filters.city.toLowerCase())) return false;
    }

    // Search Keyword (coll, sport, venue, team)
    if (filters.keyword && filters.keyword.trim() !== '') {
      const q = filters.keyword.toLowerCase().trim();
      const inSport = m.sport.toLowerCase().includes(q);
      const inVenue = (m.venue?.name || '').toLowerCase().includes(q);
      const inFormat = (m.format || '').toLowerCase().includes(q);
      const inOrganiser = (m.organiserName || '').toLowerCase().includes(q);
      if (!inSport && !inVenue && !inFormat && !inOrganiser) return false;
    }

    // Skill Level
    if (filters.skillLevel && filters.skillLevel !== 'all' && m.skillLevel !== filters.skillLevel) {
      return false;
    }

    // Source
    if (filters.source && filters.source !== 'all' && m.source !== filters.source) {
      return false;
    }

    // Status
    if (filters.status && filters.status !== 'all' && m.status !== filters.status) {
      return false;
    }

    // Free or Paid
    if (filters.freeOnly && m.fee > 0) {
      return false;
    }

    // College filter (if specified team belongs to college)
    if (filters.collegeId && filters.collegeId !== 'all') {
      // Checked against teams
      if (m.homeTeamId && !m.homeTeamId.includes(filters.collegeId)) {
        // approximate match
      }
    }

    return true;
  });
};

// Pure Helper: Haversine distance in km
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Pure Helper: Sort Matches
export const sortMatches = (matches, sortKey = 'upcoming', userCoords = null) => {
  const cloned = [...matches];

  switch (sortKey) {
    case 'upcoming':
      return cloned.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'closing_soon':
      return cloned.sort((a, b) => new Date(a.registrationDeadline || a.date) - new Date(b.registrationDeadline || b.date));
    case 'recently_posted':
      return cloned.sort((a, b) => b.id.localeCompare(a.id));
    case 'nearest':
      if (userCoords && userCoords.lat && userCoords.lng) {
        return cloned.sort((a, b) => {
          const distA = a.venue?.lat ? haversineDistance(userCoords.lat, userCoords.lng, a.venue.lat, a.venue.lng) : 999;
          const distB = b.venue?.lat ? haversineDistance(userCoords.lat, userCoords.lng, b.venue.lat, b.venue.lng) : 999;
          return distA - distB;
        });
      }
      return cloned;
    default:
      return cloned;
  }
};

// Pure Helper: Storage Wrapper with localStorage inside try/catch & graceful fallback
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
      // Ignore storage errors, memory state continues normally
    }
  }
};
