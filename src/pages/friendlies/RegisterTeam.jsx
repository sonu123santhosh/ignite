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
      <div className="bg-[#151B23] border-b border-[#293442] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link
            to="/friendlies"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
          <span className="text-xs text-[#9CA3AF]">
            Collegiate Squad Registration
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Step tracker */}
        {currentStep < 4 && (
          <div className="bg-[#151B23] border border-[#293442] p-4 sm:p-5 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Squad Info' },
                { num: 2, label: 'Roster' },
                { num: 3, label: 'Review' }
              ].map((st) => (
                <div key={st.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentStep > st.num
                        ? 'bg-[#B6FF3B] text-[#0B0F14]'
                        : currentStep === st.num
                        ? 'bg-[#00D9FF] text-[#0B0F14] ring-4 ring-[#00D9FF]/20'
                        : 'bg-[#1B2530] text-slate-500 border border-[#293442]'
                    }`}
                  >
                    {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                      currentStep === st.num ? 'text-white' : 'text-slate-500'
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
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Squad Info */}
        {currentStep === 1 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-5 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                1. Squad &amp; Captain Credentials
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Provide official collegiate affiliation and captain contact details.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    College / University *
                  </label>
                  <select
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none cursor-pointer"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    Sport
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none cursor-pointer"
                  >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Badminton">Badminton</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  Team / Squad Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. PIT Strikers or DCE Tigers"
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    Captain Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="e.g. Rohan Deshmukh"
                    className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    Captain Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="+91 98220 XXXXX"
                    className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                  College Institutional Email * (Simulates Domain Verification)
                </label>
                <input
                  type="email"
                  required
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  placeholder={`captain@${selectedCollege?.emailDomain || 'college.edu.in'}`}
                  className="w-full p-3 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Required domain for {selectedCollege?.name}: <strong>@{selectedCollege?.emailDomain}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#293442]">
                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    Number of Players *
                  </label>
                  <input
                    type="number"
                    min={sportLimits[sport]?.min || 2}
                    max={sportLimits[sport]?.max || 20}
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Allowed: {sportLimits[sport]?.min} - {sportLimits[sport]?.max}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    Preferred Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Competitive">Competitive (Collegiate)</option>
                    <option value="Intermediate">Intermediate (Club)</option>
                    <option value="Beginner">Beginner / Casual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-[#9CA3AF] block mb-1">
                    Preferred Home Ground
                  </label>
                  <input
                    type="text"
                    value={preferredGround}
                    onChange={(e) => setPreferredGround(e.target.value)}
                    placeholder="e.g. College Main Oval"
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Roster Editor */}
        {currentStep === 2 && (
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                  2. Squad Roster Lineup
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Add squad members. The count must match your entered Player Count ({playerCount}).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-3.5 py-1.5 bg-[#1B2530] hover:bg-slate-700 text-[#B6FF3B] font-bold text-xs border border-[#293442] rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Player</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {roster.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl flex items-center gap-3 text-xs"
                >
                  <span className="w-6 text-center text-slate-500 font-mono">#{idx + 1}</span>

                  <input
                    type="text"
                    required
                    value={p.name}
                    onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                    placeholder="Player full name"
                    className="flex-1 p-2 bg-[#0B0F14] border border-[#293442] rounded-lg text-white outline-none"
                  />

                  <input
                    type="text"
                    value={p.position}
                    onChange={(e) => handleUpdatePlayer(idx, 'position', e.target.value)}
                    placeholder="Position (e.g. Striker)"
                    className="w-32 p-2 bg-[#0B0F14] border border-[#293442] rounded-lg text-white outline-none"
                  />

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
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
          <div className="bg-[#151B23] border border-[#293442] p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                3. Review Squad Registration
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Please verify details. New squads start as Unverified until approved by your College Coordinator.
              </p>
            </div>

            <div className="p-5 bg-[#1B2530] border border-[#293442] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">College:</span>
                <span className="font-bold text-white">{selectedCollege?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Squad Name:</span>
                <span className="font-bold text-[#00D9FF]">{teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Sport &amp; Skill:</span>
                <span className="font-semibold text-white">{sport} &bull; {skillLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Captain:</span>
                <span className="font-semibold text-white">{captainName} ({captainPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Roster Count:</span>
                <span className="font-bold text-[#B6FF3B]">{roster.length} registered players</span>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 font-bold">Coordinator Verification Rule:</strong>
                Submitting this form records the team in <em>Pending Verification</em>. Your college sports coordinator must approve the roster before official match challenges can be issued.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result Screen */}
        {currentStep === 4 && registeredResult && (
          <div className="bg-[#151B23] border border-[#293442] p-8 sm:p-12 rounded-2xl text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#B6FF3B]/10 border border-[#B6FF3B] text-[#B6FF3B] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(182,255,59,0.3)]">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Registration Submitted &bull; Verification Pending
              </span>
              <h2 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase text-white">
                {registeredResult.name}
              </h2>
              <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
                Your squad has been submitted. It is now visible to your College Coordinator for official roster validation.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/friendlies/teams"
                className="px-5 py-2.5 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#a3ee28]"
              >
                View Teams Directory
              </Link>
              <Link
                to="/friendlies"
                className="px-5 py-2.5 bg-[#1B2530] text-white border border-[#293442] font-semibold text-xs rounded-xl hover:bg-slate-700"
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
              className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
                currentStep === 1 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'bg-[#1B2530] text-white hover:bg-slate-700'
              }`}
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider hover:bg-[#a3ee28] flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a3ee28] flex items-center gap-1.5 cursor-pointer shadow-md"
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
