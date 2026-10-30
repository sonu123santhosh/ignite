import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Mail,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';

export default function RegisterTeam() {
  const navigate = useNavigate();
  const { colleges, teams, registerTeam } = useFriendlies();

  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Roster, 3: Review, 4: Result
  const [error, setError] = useState('');

  // Form Fields
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || 'col-1');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [sport, setSport] = useState('Football');
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [playerCount, setPlayerCount] = useState(7);
  const [preferredGround, setPreferredGround] = useState('');
  const [skillLevel, setSkillLevel] = useState('Competitive');

  // Dynamic Roster list
  const [roster, setRoster] = useState([
    { name: '', position: 'Captain', role: 'Captain' }
  ]);

  const [registeredResult, setRegisteredResult] = useState(null);

  const selectedCollege = colleges.find((c) => c.id === collegeId);

  // Sport player count rules
  const sportLimits = {
    Football: { min: 7, max: 18 },
    Cricket: { min: 11, max: 20 },
    Basketball: { min: 5, max: 12 },
    Volleyball: { min: 6, max: 14 },
    Badminton: { min: 2, max: 8 }
  };

  const handleAddPlayer = () => {
    setRoster([...roster, { name: '', position: 'Player', role: 'Player' }]);
  };

  const handleRemovePlayer = (idx) => {
    setRoster(roster.filter((_, i) => i !== idx));
  };

  const handleUpdatePlayer = (idx, field, val) => {
    const updated = [...roster];
    updated[idx][field] = val;
    setRoster(updated);
  };

  const validateStep = (step) => {
    setError('');

    if (step === 1) {
      if (!teamName.trim()) return 'Team name is required.';
      if (!captainName.trim()) return 'Captain name is required.';
      if (!captainPhone.trim()) return 'Captain phone contact is required.';
      if (!collegeEmail.trim()) return 'College institutional email is required.';

      // Email format check
      if (!collegeEmail.includes('@') || !collegeEmail.includes('.')) {
        return 'Please enter a valid email format.';
      }

      // Domain check simulation
      if (selectedCollege?.emailDomain) {
        if (!collegeEmail.toLowerCase().endsWith(selectedCollege.emailDomain)) {
          return `College email must belong to domain @${selectedCollege.emailDomain} for collegiate verification.`;
        }
      }

      // Duplicate check: team name in same college & sport
      const isDuplicate = teams.some(
        (t) =>
          t.collegeId === collegeId &&
          t.sport.toLowerCase() === sport.toLowerCase() &&
          t.name.toLowerCase() === teamName.trim().toLowerCase()
      );
      if (isDuplicate) {
        return `A squad named "${teamName}" already exists for ${selectedCollege?.name} in ${sport}.`;
      }

      // Min/Max players limit for sport
      const limits = sportLimits[sport] || { min: 2, max: 20 };
      if (Number(playerCount) < limits.min || Number(playerCount) > limits.max) {
        return `${sport} squad size must be between ${limits.min} and ${limits.max} players.`;
      }
    }

    if (step === 2) {
      // Validate roster length matches playerCount
      if (roster.length !== Number(playerCount)) {
        return `Roster has ${roster.length} entries, but Player Count was set to ${playerCount}. Please adjust roster or player count so they match.`;
      }

      // Check all player names are filled
      const emptyPlayer = roster.some((p) => !p.name.trim());
      if (emptyPlayer) {
        return 'Please enter names for all players on the squad roster.';
      }
    }

    return '';
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateStep(2);
    if (err) {
      setError(err);
      return;
    }

    const res = registerTeam({
      collegeId: selectedCollege?.id,
      collegeName: selectedCollege?.name,
      name: teamName,
      sport,
      captainName,
      captainPhone,
      captainEmail: collegeEmail,
      preferredHomeGround: preferredGround,
      skillLevel,
      roster
    });

    if (res.success) {
      setRegisteredResult(res.team);
      setCurrentStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#FFFFFF] pb-24">
      {/* Top Bar */}
      <div className="bg-[#0c1629]/90 border-b border-sky-500/20 py-4 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/friendlies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
          <span className="text-xs text-slate-400">
            Collegiate Squad Registration
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Step tracker */}
        {currentStep < 4 && (
          <div className="bg-[#0c1629]/80 border border-sky-500/20 p-4 sm:p-5 rounded-2xl mb-8 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Squad Info' },
                { num: 2, label: 'Roster' },
                { num: 3, label: 'Review' }
              ].map((st) => (
                <div key={st.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep > st.num
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                        : currentStep === st.num
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white ring-4 ring-sky-500/30 shadow-md shadow-sky-500/30'
                        : 'bg-[#070d1a]/80 text-slate-500 border border-sky-500/20'
                    }`}
                  >
                    {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                      currentStep === st.num ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Squad Info */}
        {currentStep === 1 && (
          <div className="bg-[#0c1629]/80 border border-sky-500/20 p-6 sm:p-8 rounded-2xl space-y-5 shadow-2xl backdrop-blur-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                1. Squad &amp; Captain Credentials
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide official collegiate affiliation and captain contact details.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    College / University *
                  </label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full p-3 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 outline-none cursor-pointer"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0c1629] text-white">
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Sport
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full p-3 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 outline-none cursor-pointer"
                  >
                    <option value="Football" className="bg-[#0c1629] text-white">Football</option>
                    <option value="Cricket" className="bg-[#0c1629] text-white">Cricket</option>
                    <option value="Basketball" className="bg-[#0c1629] text-white">Basketball</option>
                    <option value="Volleyball" className="bg-[#0c1629] text-white">Volleyball</option>
                    <option value="Badminton" className="bg-[#0c1629] text-white">Badminton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Team / Squad Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. PIT Strikers or DCE Tigers"
                  className="w-full p-3 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Captain Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="e.g. Rohan Deshmukh"
                    className="w-full p-3 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Captain Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="+91 98220 XXXXX"
                    className="w-full p-3 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  College Institutional Email * (Simulates Domain Verification)
                </label>
                <input
                  type="email"
                  required
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  placeholder={`captain@${selectedCollege?.emailDomain || 'college.edu.in'}`}
                  className="w-full p-3 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Required domain for {selectedCollege?.name}: <strong>@{selectedCollege?.emailDomain}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-sky-500/20">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Number of Players *
                  </label>
                  <input
                    type="number"
                    min={sportLimits[sport]?.min || 2}
                    max={sportLimits[sport]?.max || 20}
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white focus:border-sky-400 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Allowed: {sportLimits[sport]?.min} - {sportLimits[sport]?.max}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Preferred Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full p-2.5 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white focus:border-sky-400 outline-none cursor-pointer"
                  >
                    <option value="Competitive" className="bg-[#0c1629] text-white">Competitive (Collegiate)</option>
                    <option value="Intermediate" className="bg-[#0c1629] text-white">Intermediate (Club)</option>
                    <option value="Beginner" className="bg-[#0c1629] text-white">Beginner / Casual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                    Preferred Home Ground
                  </label>
                  <input
                    type="text"
                    value={preferredGround}
                    onChange={(e) => setPreferredGround(e.target.value)}
                    placeholder="e.g. College Main Oval"
                    className="w-full p-2.5 bg-[#070d1a]/80 border border-sky-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:border-sky-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Roster Editor */}
        {currentStep === 2 && (
          <div className="bg-[#0c1629]/80 border border-sky-500/20 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                  2. Squad Roster Lineup
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Add squad members. The count must match your entered Player Count ({playerCount}).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-400/30 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>Add Player</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {roster.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#070d1a]/80 border border-sky-500/20 rounded-xl flex items-center gap-3 text-xs"
                >
                  <span className="w-6 text-center text-sky-400/70 font-mono">#{idx + 1}</span>

                  <input
                    type="text"
                    required
                    value={p.name}
                    onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                    placeholder="Player full name"
                    className="flex-1 p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-white placeholder-slate-500 focus:border-sky-400 outline-none"
                  />

                  <input
                    type="text"
                    value={p.position}
                    onChange={(e) => handleUpdatePlayer(idx, 'position', e.target.value)}
                    placeholder="Position (e.g. Striker)"
                    className="w-32 p-2 bg-[#0c1629] border border-sky-500/30 rounded-lg text-white placeholder-slate-500 focus:border-sky-400 outline-none"
                  />

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="bg-[#0c1629]/80 border border-sky-500/20 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl backdrop-blur-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                3. Review Squad Registration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Please verify details. New squads start as Unverified until approved by your College Coordinator.
              </p>
            </div>

            <div className="p-5 bg-[#070d1a]/80 border border-sky-500/20 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">College:</span>
                <span className="font-bold text-white">{selectedCollege?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Squad Name:</span>
                <span className="font-bold text-sky-400">{teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sport &amp; Skill:</span>
                <span className="font-semibold text-white">{sport} &bull; {skillLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Captain:</span>
                <span className="font-semibold text-white">{captainName} ({captainPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roster Count:</span>
                <span className="font-bold text-emerald-400">{roster.length} registered players</span>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong className="block mb-0.5 font-bold">Coordinator Verification Rule:</strong>
                Submitting this form records the team in <em>Pending Verification</em>. Your college sports coordinator must approve the roster before official match challenges can be issued.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result Screen */}
        {currentStep === 4 && registeredResult && (
          <div className="bg-[#0c1629]/90 border border-sky-500/30 p-8 sm:p-12 rounded-2xl text-center space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-sky-500/15 border border-sky-400 text-sky-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(56,189,248,0.3)]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Registration Submitted &bull; Verification Pending
              </span>
              <h2 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-white">
                {registeredResult.name}
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your squad has been submitted. It is now visible to your College Coordinator for official roster validation.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/friendlies/teams"
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all"
              >
                View Teams Directory
              </Link>
              <Link
                to="/friendlies"
                className="px-5 py-2.5 bg-sky-500/10 text-sky-200 border border-sky-400/30 font-semibold text-xs rounded-xl hover:bg-sky-500/20 transition-all"
              >
                Browse Matches
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentStep === 1 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'bg-[#070d1a]/80 text-white border border-sky-500/20 hover:bg-sky-500/10'
              }`}
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:from-sky-400 hover:to-blue-500 flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Submit for Verification</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
