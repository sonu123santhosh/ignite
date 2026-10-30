import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  AlertCircle,
  Lock,
  Globe,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import {
  leagueService,
  SPORT_PRESETS,
  getPresetForSport
} from '../../../services/leagueService';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';

export default function CreateLeague({
  currentDemoUser,
  _tournamentRole = 'organiser'
}) {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Session
  const session = {
    user: currentDemoUser,
    token: `token-${currentDemoUser?.id || 'demo'}`
  };

  // Form State
  const [name, setName] = useState('');
  const [sport, setSport] = useState('Football');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [plannedTeamCount, setPlannedTeamCount] = useState(4);
  const [format, setFormat] = useState('single round-robin');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [rulesText, setRulesText] = useState('Standard round-robin league. 3 points for win, 1 point for draw.');
  const [scoringPresetKey, setScoringPresetKey] = useState('football');
  const [pointsWin, setPointsWin] = useState(3);
  const [pointsDraw, setPointsDraw] = useState(1);
  const [pointsLoss, setPointsLoss] = useState(0);
  const [drawsAllowed, setDrawsAllowed] = useState(true);
  const [volleyball32Mode, setVolleyball32Mode] = useState(false);
  const [scoreLabel, setScoreLabel] = useState('Goals');
  const [visibility, setVisibility] = useState('public via link');
  const [tieBreakOrder] = useState(['points', 'headToHead', 'diff', 'scored', 'alpha']);

  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Create a League | SportLink';
  }, []);

  // Update preset defaults when sport changes
  const handleSportChange = (newSport) => {
    setSport(newSport);
    const presetKey = getPresetForSport(newSport);
    setScoringPresetKey(presetKey);
    const def = SPORT_PRESETS[presetKey] || SPORT_PRESETS.football;
    setPointsWin(def.pointsWin);
    setPointsDraw(def.pointsDraw);
    setPointsLoss(def.pointsLoss);
    setDrawsAllowed(def.drawsAllowed);
    setScoreLabel(def.scoreLabel);
    if (def.volleyball32Mode !== undefined) {
      setVolleyball32Mode(def.volleyball32Mode);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files (PNG, JPG, SVG, WebP) are allowed for the league logo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target.result);
      setLogoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (name.trim().length < 3 || name.trim().length > 60) {
      setError('League name must be between 3 and 60 characters.');
      return;
    }

    if (new Date(startDate).getTime() < new Date(todayStr).getTime()) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    const plannedCountNum = Number(plannedTeamCount);
    if (plannedCountNum < 2 || plannedCountNum > 20) {
      setError('Planned number of teams must be between 2 and 20.');
      return;
    }

    const payload = {
      name: name.trim(),
      sport,
      description: description.trim(),
      logo,
      plannedTeamCount: plannedCountNum,
      format,
      startDate,
      endDate: endDate || null,
      rulesText: rulesText.trim(),
      scoringPreset: scoringPresetKey,
      scoringSettings: {
        pointsWin: Number(pointsWin),
        pointsDraw: Number(pointsDraw),
        pointsLoss: Number(pointsLoss),
        drawsAllowed,
        volleyball32Mode,
        scoreLabel
      },
      tieBreakOrder,
      visibility
    };

    try {
      setIsSubmitting(true);
      const res = leagueService.createLeague(session, payload);

      if (res.warning) {
        setToast({
          title: 'League Created (Notice)',
          message: res.warning,
          type: 'warning'
        });
      }

      // Send manager to "Add teams" on the new league
      setTimeout(() => {
        navigate(`/tournaments/your-league/${res.data.id}?tab=teams`, {
          state: { newlyCreated: true }
        });
      }, res.warning ? 1200 : 200);
    } catch (err) {
      setError(err.message || 'Failed to create league.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Bar */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            to="/tournaments/your-league"
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#c6ff3d] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Your League Hub</span>
          </Link>
          <div className="text-xs text-slate-400">
            Owner Persona: <strong className="text-white">{currentDemoUser?.name || 'Rahul Sharma'}</strong>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>League Creator Wizard</span>
          </div>
          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            Create Your League.
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-1">
            Configure format, sport presets, and scoring rules. After creation, you'll be directed to register your teams and generate the schedule.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#293442] pb-3 flex items-center justify-between">
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                1. General Information
              </h2>
              <span className="text-xs text-slate-500">Required fields *</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  League Name * (3 to 60 characters)
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pune Weekend Super League 2026"
                  className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Sport *
                  </label>
                  <select
                    value={sport}
                    onChange={(e) => handleSportChange(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="Football">Football</option>
                    <option value="Futsal">Futsal</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Hockey">Hockey</option>
                    <option value="Custom Sports">Custom Sports / Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Format *
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="single round-robin">Single Round-Robin (Every pair plays 1 match)</option>
                    <option value="double round-robin">Double Round-Robin (Home & Away, 2 legs)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Description &amp; About (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share a brief overview of the league, participating colleges or clubs, and expectations."
                  className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                />
              </div>

              {/* Logo Upload & Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  League Emblem / Logo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-14 h-14 rounded-2xl object-cover bg-[#0B0F14] border border-[#c6ff3d]/40 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#1B2530] border border-[#293442] flex items-center justify-center text-slate-500 shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-60" />
                    </div>
                  )}
                  <label className="px-4 py-2 bg-[#1B2530] hover:bg-slate-700 text-slate-200 border border-[#293442] rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogo('');
                        setLogoPreview('');
                      }}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Team Capacity & Dates */}
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#293442] pb-3">
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                2. Teams Capacity &amp; Timeline
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Planned Teams (2 - 20) *
                </label>
                <input
                  type="number"
                  required
                  min={2}
                  max={20}
                  value={plannedTeamCount}
                  onChange={(e) => setPlannedTeamCount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white font-mono font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 block">
                  Actual registered count drives the fixtures, never planned count.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Match Rules &amp; Competition Regulations
              </label>
              <textarea
                rows={3}
                maxLength={2000}
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                placeholder="Detail match durations, substitutions, overtime, tie-break protocols, or disciplinary rules."
                className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white placeholder-slate-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 3: Sport Presets & Scoring Settings */}
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#293442] pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                  3. Sport Preset &amp; Table Scoring Rules
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Presets lock automatically once the first match score is recorded.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c6ff3d]/15 text-[#c6ff3d] border border-[#c6ff3d]/30 uppercase">
                {scoringPresetKey} Preset
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Points for Win
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={pointsWin}
                  onChange={(e) => setPointsWin(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Points for Draw / Tie
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  disabled={!drawsAllowed}
                  value={drawsAllowed ? pointsDraw : 0}
                  onChange={(e) => setPointsDraw(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#1B2530] border border-[#293442] disabled:opacity-40 rounded-xl text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Points for Loss
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={pointsLoss}
                  onChange={(e) => setPointsLoss(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white font-mono font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Score Field Unit
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={scoreLabel}
                  onChange={(e) => setScoreLabel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-sm text-white font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={drawsAllowed}
                  onChange={(e) => setDrawsAllowed(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c6ff3d] bg-[#1B2530] border-[#293442] focus:ring-0"
                />
                <span>Allow Draws / Ties in this Sport</span>
              </label>

              {sport.toLowerCase().includes('volley') && (
                <label className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={volleyball32Mode}
                    onChange={(e) => setVolleyball32Mode(e.target.checked)}
                    className="w-4 h-4 rounded text-[#c6ff3d] bg-[#1B2530] border-[#293442] focus:ring-0"
                  />
                  <span>Volleyball 3-2 Bonus Points (3-0/3-1 win gives 3 pts; 3-2 win gives 2-1 pts)</span>
                </label>
              )}
            </div>

            {/* Tie-breaker priority display */}
            <div className="p-4 bg-[#1B2530] border border-[#293442] rounded-2xl space-y-1 text-xs text-[#94A3B8]">
              <span className="font-bold text-white block">Default Tie-Breaker Protocol:</span>
              <p className="text-[11px] text-slate-400">
                1. Points &rarr; 2. Head-to-Head &rarr; 3. Score Difference ({scoreLabel}) &rarr; 4. Scored ({scoreLabel}) &rarr; 5. Alphabetical.
              </p>
            </div>
          </div>

          {/* Section 4: Visibility & Sharing */}
          <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#293442] pb-3">
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                4. Visibility &amp; Permissions
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  visibility === 'public via link'
                    ? 'bg-[#c6ff3d]/10 border-[#c6ff3d] text-white shadow-sm'
                    : 'bg-[#1B2530] border-[#293442] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Globe className="w-4 h-4 text-[#c6ff3d]" />
                    <span>Public via Share Link (Recommended)</span>
                  </div>
                  <input
                    type="radio"
                    name="visibility"
                    value="public via link"
                    checked={visibility === 'public via link'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-4 h-4 text-[#c6ff3d]"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Anyone with your private unguessable share link can view the live fixtures, scores, and standings in read-only mode. Managers' private contacts remain hidden.
                </p>
              </label>

              <label
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  visibility === 'private'
                    ? 'bg-[#c6ff3d]/10 border-[#c6ff3d] text-white shadow-sm'
                    : 'bg-[#1B2530] border-[#293442] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Private (Managers Only)</span>
                  </div>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-4 h-4 text-[#c6ff3d]"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Only the owner and authorized co-managers can access this league. Hidden from public link views.
                </p>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#293442]">
            <Link
              to="/tournaments/your-league"
              className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Cancel
            </Link>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className="px-8 font-black uppercase tracking-wider text-xs shadow-xl"
            >
              {isSubmitting ? 'Creating League...' : 'Create League & Add Teams'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
