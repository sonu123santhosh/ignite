import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Upload,
  Image as ImageIcon,
  Users,
  Calendar,
  Layers,
  Settings2,
  Shield,
  Edit2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  leagueService,
  SPORT_PRESETS,
  getPresetForSport,
  LEAGUE_TEAM_LIMITS,
  parseAndValidateTeamCount,
  validateTeamNames
} from '../../../services/leagueService';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';

const DRAFT_STORAGE_KEY = 'sportlink_league_wizard_draft_v1';

export default function CreateLeague({
  currentDemoUser,
  _tournamentRole = 'organiser'
}) {
  const navigate = useNavigate();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Session
  const session = useMemo(() => ({
    user: currentDemoUser,
    token: `token-${currentDemoUser?.id || 'demo'}`
  }), [currentDemoUser]);

  // Load draft from sessionStorage if present
  const savedDraft = useMemo(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Safe fallback
    }
    return null;
  }, []);

  // Wizard Step: 1 = League Details, 2 = Team Registration, 3 = Review & Create
  const [step, setStep] = useState(savedDraft?.step || 1);

  // Idempotency Key per wizard session
  const [idempotencyKey] = useState(() => {
    return savedDraft?.idempotencyKey || `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  });

  // Step 1: League Details State
  const [name, setName] = useState(savedDraft?.name || '');
  const [hasTouchedName, setHasTouchedName] = useState(false);

  const [sport, setSport] = useState(savedDraft?.sport || 'Football');
  const [description, setDescription] = useState(savedDraft?.description || '');
  const [logo, setLogo] = useState(savedDraft?.logo || '');
  const [logoPreview, setLogoPreview] = useState(savedDraft?.logoPreview || '');

  // Raw team count string state so typing doesn't fight the user
  const [rawTeamCount, setRawTeamCount] = useState(savedDraft?.rawTeamCount !== undefined ? String(savedDraft.rawTeamCount) : '4');
  const [hasTouchedTeamCount, setHasTouchedTeamCount] = useState(false);

  const [format, setFormat] = useState(savedDraft?.format || 'single round-robin');
  const [startDate, setStartDate] = useState(savedDraft?.startDate || todayStr);
  const [endDate, setEndDate] = useState(savedDraft?.endDate || '');
  const [rulesText, setRulesText] = useState(
    savedDraft?.rulesText || 'Standard round-robin league. 3 points for win, 1 point for draw.'
  );
  const [scoringPresetKey, setScoringPresetKey] = useState(savedDraft?.scoringPresetKey || 'football');
  const [pointsWin, setPointsWin] = useState(savedDraft?.pointsWin ?? 3);
  const [pointsDraw, setPointsDraw] = useState(savedDraft?.pointsDraw ?? 1);
  const [pointsLoss, setPointsLoss] = useState(savedDraft?.pointsLoss ?? 0);
  const [drawsAllowed, setDrawsAllowed] = useState(savedDraft?.drawsAllowed ?? true);
  const [volleyball32Mode, setVolleyball32Mode] = useState(savedDraft?.volleyball32Mode ?? false);
  const [scoreLabel, setScoreLabel] = useState(savedDraft?.scoreLabel || 'Goals');
  const [visibility, setVisibility] = useState(savedDraft?.visibility || 'public via link');
  const [tieBreakOrder] = useState(savedDraft?.tieBreakOrder || ['points', 'headToHead', 'diff', 'scored', 'alpha']);

  // Step 2: Teams State: Array of { name, captainName, captainContact }
  const [teams, setTeams] = useState(() => {
    if (savedDraft?.teams && Array.isArray(savedDraft.teams) && savedDraft.teams.length >= LEAGUE_TEAM_LIMITS.MIN) {
      return savedDraft.teams;
    }
    // Default 4 empty team slots
    return [
      { name: '', captainName: '', captainContact: '' },
      { name: '', captainName: '', captainContact: '' },
      { name: '', captainName: '', captainContact: '' },
      { name: '', captainName: '', captainContact: '' }
    ];
  });
  const [hasTouchedTeams, setHasTouchedTeams] = useState(false);

  // Confirmation Modal State when decreasing team count would discard entered data
  const [showTruncateConfirm, setShowTruncateConfirm] = useState(false);
  const [pendingTruncateCount, setPendingTruncateCount] = useState(null);

  // Status & Feedback State
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DOM Refs for accessibility and focus management
  const nameInputRef = useRef(null);
  const teamCountInputRef = useRef(null);
  const firstTeamInputRef = useRef(null);

  useEffect(() => {
    document.title = `Create Your League (Step ${step} of 3) | SportLink`;
  }, [step]);

  // Persist draft to sessionStorage on every change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const draftData = {
          step,
          idempotencyKey,
          name,
          sport,
          description,
          logo,
          logoPreview,
          rawTeamCount,
          format,
          startDate,
          endDate,
          rulesText,
          scoringPresetKey,
          pointsWin,
          pointsDraw,
          pointsLoss,
          drawsAllowed,
          volleyball32Mode,
          scoreLabel,
          visibility,
          tieBreakOrder,
          teams
        };
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      }
    } catch {
      // Safe fallback
    }
  }, [
    step,
    idempotencyKey,
    name,
    sport,
    description,
    logo,
    logoPreview,
    rawTeamCount,
    format,
    startDate,
    endDate,
    rulesText,
    scoringPresetKey,
    pointsWin,
    pointsDraw,
    pointsLoss,
    drawsAllowed,
    volleyball32Mode,
    scoreLabel,
    visibility,
    tieBreakOrder,
    teams
  ]);

  const clearDraft = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Safe fallback
    }
  };

  // ─── VALIDATIONS ─────────────────────────────────────────────────────────────

  // Step 1: Team count validation using authoritative parser
  const teamCountValidation = useMemo(() => {
    return parseAndValidateTeamCount(rawTeamCount);
  }, [rawTeamCount]);

  // Step 1: General name validation
  const isNameValid = useMemo(() => {
    const trimmed = name.trim();
    return trimmed.length >= 3 && trimmed.length <= 60;
  }, [name]);

  // Step 1: Date validations
  const isStartDateValid = useMemo(() => {
    if (!startDate) return false;
    return new Date(startDate).getTime() >= new Date(todayStr).getTime();
  }, [startDate, todayStr]);

  const isEndDateValid = useMemo(() => {
    if (!endDate) return true;
    return new Date(endDate).getTime() >= new Date(startDate).getTime();
  }, [endDate, startDate]);

  const isStep1Valid = isNameValid && teamCountValidation.valid && isStartDateValid && isEndDateValid;

  // Step 2: Team names validation using authoritative parser
  const targetTeamCount = teamCountValidation.valid ? teamCountValidation.value : teams.length;
  const teamNamesValidation = useMemo(() => {
    return validateTeamNames(teams, targetTeamCount);
  }, [teams, targetTeamCount]);

  const isStep2Valid = teamNamesValidation.valid;

  // Current step validity & helper hint text for disabled Next button
  const isCurrentStepValid = step === 1 ? isStep1Valid : step === 2 ? isStep2Valid : true;

  const stepHint = useMemo(() => {
    if (step === 1) {
      if (!isNameValid) return 'Enter a league name (3-60 characters)';
      if (!teamCountValidation.valid) return `Enter a valid team count (${LEAGUE_TEAM_LIMITS.MIN}-${LEAGUE_TEAM_LIMITS.MAX})`;
      if (!isStartDateValid) return 'Start date cannot be in the past';
      if (!isEndDateValid) return 'End date cannot be earlier than start date';
      return '';
    }
    if (step === 2) {
      if (!isStep2Valid) return `Enter unique, non-empty names for all ${targetTeamCount} teams`;
      return '';
    }
    return '';
  }, [step, isNameValid, teamCountValidation.valid, isStartDateValid, isEndDateValid, isStep2Valid, targetTeamCount]);

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

  // ─── TEAM INPUT UPDATES ──────────────────────────────────────────────────────

  const handleTeamChange = (index, field, value) => {
    setTeams((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setHasTouchedTeams(true);
  };

  // ─── STEP NAVIGATION HANDLERS ────────────────────────────────────────────────

  const handleStep1Next = () => {
    setHasTouchedName(true);
    setHasTouchedTeamCount(true);
    setError(null);

    if (!isStep1Valid) {
      if (!isNameValid && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (!teamCountValidation.valid && teamCountInputRef.current) {
        teamCountInputRef.current.focus();
      }
      return;
    }

    const parsedCount = teamCountValidation.value;

    // Check if team count changed
    if (teams.length > parsedCount) {
      // Count decreased: check if discarded teams have data entered
      const hasDiscardedData = teams.slice(parsedCount).some((t) => t.name.trim().length > 0);
      if (hasDiscardedData) {
        setPendingTruncateCount(parsedCount);
        setShowTruncateConfirm(true);
        return;
      } else {
        // Safely truncate blank slots
        setTeams(teams.slice(0, parsedCount));
      }
    } else if (teams.length < parsedCount) {
      // Count increased: add empty slots
      const expanded = [...teams];
      for (let i = teams.length; i < parsedCount; i++) {
        expanded.push({ name: '', captainName: '', captainContact: '' });
      }
      setTeams(expanded);
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmTruncate = () => {
    if (pendingTruncateCount !== null) {
      setTeams(teams.slice(0, pendingTruncateCount));
      setPendingTruncateCount(null);
      setShowTruncateConfirm(false);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelTruncate = () => {
    setPendingTruncateCount(null);
    setShowTruncateConfirm(false);
  };

  const handleStep2Next = () => {
    setHasTouchedTeams(true);
    setError(null);

    if (!isStep2Valid) {
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (step === 1) handleStep1Next();
    else if (step === 2) handleStep2Next();
  };

  // Keyboard navigation: Enter on Step 1 or Step 2 triggers Next if step is valid
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (isCurrentStepValid && !isSubmitting) {
        handleNext();
      }
    }
  };

  // ─── FINAL SUBMISSION ────────────────────────────────────────────────────────

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    // Re-verify Step 1 & Step 2 before submitting
    if (!isStep1Valid || !isStep2Valid) {
      setError('Please review and correct invalid fields before submitting.');
      return;
    }

    const plannedCountNum = teamCountValidation.value;

    const payload = {
      idempotencyKey,
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
      visibility,
      // Atomically register all teams with the league
      teams: teams.map((t) => ({
        name: t.name.trim(),
        captainName: (t.captainName || '').trim(),
        captainContact: (t.captainContact || '').trim()
      }))
    };

    try {
      setIsSubmitting(true);
      const res = leagueService.createLeague(session, payload);

      // Clear draft on successful creation
      clearDraft();

      if (res.warning) {
        setToast({
          title: 'League Created (Notice)',
          message: res.warning,
          type: 'warning'
        });
      }

      // Navigate to the newly created league view
      setTimeout(() => {
        navigate(`/tournaments/your-league/${res.data.id}`, {
          state: { newlyCreated: true }
        });
      }, res.warning ? 1200 : 200);
    } catch (err) {
      setError(err.message || 'Failed to create league. Please check your data and retry.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    clearDraft();
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pb-28 sm:pb-32">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal for Discarding Teams Data */}
      {showTruncateConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-truncate-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 id="confirm-truncate-title" className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
                Discard Extra Teams?
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Decreasing team count to <strong className="text-white">{pendingTruncateCount}</strong> will remove Team {pendingTruncateCount + 1} to Team {teams.length}, which already contain entered data. Are you sure you want to discard them?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={cancelTruncate}>
                Cancel
              </Button>
              <Button type="button" variant="crimson" size="sm" onClick={confirmTruncate}>
                Discard &amp; Proceed
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header Sticky Bar */}
      <div className="bg-[#141B24]/90 border-b border-[#293442] py-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            to="/tournaments/your-league"
            onClick={handleCancel}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#c6ff3d] transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[#c6ff3d] rounded p-1"
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
        {/* Title & Wizard Step Progress */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6ff3d]/15 border border-[#c6ff3d]/35 text-[#c6ff3d] text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>League Creator Wizard</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-[#c6ff3d]">Step {step} of 3</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-300">
                {step === 1 ? 'League Details' : step === 2 ? 'Team Registration' : 'Review & Create'}
              </span>
            </div>
          </div>

          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            {step === 1 && '1. Configure League Details'}
            {step === 2 && '2. Register Participating Teams'}
            {step === 3 && '3. Review & Launch League'}
          </h1>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="3">
            <div className={`h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-[#c6ff3d]' : 'bg-[#293442]'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-[#c6ff3d]' : 'bg-[#293442]'}`} />
            <div className={`h-1.5 rounded-full transition-colors ${step >= 3 ? 'bg-[#c6ff3d]' : 'bg-[#293442]'}`} />
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div role="alert" className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown} className="space-y-8">
          {/* ═══════════════════════════════════════════════════════════════════
              STEP 1: LEAGUE DETAILS
             ═══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Section 1: Basic Information */}
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-[#293442] pb-3 flex items-center justify-between">
                  <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                    General Information
                  </h2>
                  <span className="text-xs text-slate-500">Required fields *</span>
                </div>

                <div className="space-y-4">
                  {/* League Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="league-name-input" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                      League Name * (3 to 60 characters)
                    </label>
                    <input
                      ref={nameInputRef}
                      id="league-name-input"
                      type="text"
                      required
                      minLength={3}
                      maxLength={60}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setHasTouchedName(true);
                      }}
                      onBlur={() => setHasTouchedName(true)}
                      placeholder="e.g. Pune Weekend Super League 2026"
                      aria-invalid={hasTouchedName && !isNameValid}
                      aria-describedby={hasTouchedName && !isNameValid ? 'league-name-error' : undefined}
                      className={`w-full px-4 py-3 bg-[#1B2530] border rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors ${
                        hasTouchedName && !isNameValid ? 'border-rose-500 focus:border-rose-400' : 'border-[#293442] focus:border-[#c6ff3d]'
                      }`}
                    />
                    {hasTouchedName && !isNameValid && (
                      <p id="league-name-error" role="alert" aria-live="polite" className="text-xs text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>League name must be between 3 and 60 characters.</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sport */}
                    <div className="space-y-1.5">
                      <label htmlFor="league-sport-select" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Sport *
                      </label>
                      <select
                        id="league-sport-select"
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

                    {/* Format */}
                    <div className="space-y-1.5">
                      <label htmlFor="league-format-select" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                        Competition Format *
                      </label>
                      <select
                        id="league-format-select"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none cursor-pointer"
                      >
                        <option value="single round-robin">Single Round-Robin (Every pair plays 1 match)</option>
                        <option value="double round-robin">Double Round-Robin (Home &amp; Away, 2 legs)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label htmlFor="league-desc-input" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                      Description &amp; About (Optional)
                    </label>
                    <textarea
                      id="league-desc-input"
                      rows={2}
                      maxLength={500}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Share a brief overview of the league, participating colleges or clubs, and expectations."
                      className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white placeholder-slate-500 outline-none resize-none"
                    />
                  </div>

                  {/* Logo Upload */}
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
                    Teams Capacity &amp; Timeline
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Number of Teams */}
                  <div className="space-y-1.5">
                    <label htmlFor="league-team-count-input" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                      Number of Teams ({LEAGUE_TEAM_LIMITS.MIN} - {LEAGUE_TEAM_LIMITS.MAX}) *
                    </label>
                    <input
                      ref={teamCountInputRef}
                      id="league-team-count-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={rawTeamCount}
                      onChange={(e) => {
                        setRawTeamCount(e.target.value);
                        setHasTouchedTeamCount(true);
                      }}
                      onBlur={() => setHasTouchedTeamCount(true)}
                      aria-invalid={hasTouchedTeamCount && !teamCountValidation.valid}
                      aria-describedby={hasTouchedTeamCount && !teamCountValidation.valid ? 'team-count-error' : 'team-count-hint'}
                      className={`w-full px-4 py-3 bg-[#1B2530] border rounded-2xl text-sm text-white font-mono font-bold outline-none transition-colors ${
                        hasTouchedTeamCount && !teamCountValidation.valid ? 'border-rose-500 focus:border-rose-400' : 'border-[#293442] focus:border-[#c6ff3d]'
                      }`}
                    />
                    {hasTouchedTeamCount && !teamCountValidation.valid ? (
                      <p id="team-count-error" role="alert" aria-live="polite" className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{teamCountValidation.error}</span>
                      </p>
                    ) : (
                      <span id="team-count-hint" className="text-[10px] text-slate-500 block">
                        Enter between {LEAGUE_TEAM_LIMITS.MIN} and {LEAGUE_TEAM_LIMITS.MAX} teams for the schedule.
                      </span>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="league-start-date" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                      Start Date *
                    </label>
                    <input
                      id="league-start-date"
                      type="date"
                      required
                      min={todayStr}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="league-end-date" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                      End Date (Optional)
                    </label>
                    <input
                      id="league-end-date"
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1B2530] border border-[#293442] focus:border-[#c6ff3d] rounded-2xl text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="league-rules-input" className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Match Rules &amp; Competition Regulations
                  </label>
                  <textarea
                    id="league-rules-input"
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
                      Sport Preset &amp; Table Scoring Rules
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
                      Points for Draw
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
                      Score Unit Label
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
              </div>

              {/* Section 4: Visibility & Sharing */}
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-[#293442] pb-3">
                  <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                    Visibility &amp; Permissions
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
                      Anyone with your private unguessable share link can view the live fixtures, scores, and standings in read-only mode.
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
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 2: TEAM REGISTRATION
             ═══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-[#293442] pb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                      Participating Teams ({teams.length} Teams)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter each participating squad. Team names must be unique within the league.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c6ff3d]/15 text-[#c6ff3d] border border-[#c6ff3d]/30">
                    {teams.filter((t) => t.name.trim().length > 0).length} of {teams.length} Entered
                  </span>
                </div>

                {/* Team Names Validation Summary */}
                {hasTouchedTeams && !teamNamesValidation.valid && teamNamesValidation.summary && (
                  <div role="alert" aria-live="polite" className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{teamNamesValidation.summary}</span>
                  </div>
                )}

                {/* List of N Team Input Cards */}
                <div className="space-y-4">
                  {teams.map((team, index) => {
                    const fieldError = hasTouchedTeams ? teamNamesValidation.errors[index] : null;

                    return (
                      <div
                        key={index}
                        className={`p-4 sm:p-5 rounded-2xl bg-[#1B2530] border transition-all ${
                          fieldError ? 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-[#293442] hover:border-slate-600'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#293442]/60">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-xl bg-[#0B0F14] border border-[#293442] flex items-center justify-center font-mono font-bold text-xs text-[#c6ff3d]">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                              Team {index + 1} *
                            </span>
                          </div>
                          {team.name.trim().length > 0 && !fieldError && (
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valid</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                          {/* Team Name */}
                          <div className="space-y-1">
                            <label htmlFor={`team-name-input-${index}`} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                              Team / Club Name * (1 to 40 characters)
                            </label>
                            <input
                              ref={index === 0 ? firstTeamInputRef : undefined}
                              id={`team-name-input-${index}`}
                              type="text"
                              required
                              maxLength={40}
                              value={team.name}
                              onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                              placeholder={`e.g. Squad ${index + 1}`}
                              aria-invalid={Boolean(fieldError)}
                              aria-describedby={fieldError ? `team-error-${index}` : undefined}
                              className={`w-full px-3.5 py-2.5 bg-[#0B0F14] border rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors ${
                                fieldError ? 'border-rose-500 focus:border-rose-400' : 'border-[#293442] focus:border-[#c6ff3d]'
                              }`}
                            />
                            {fieldError && (
                              <p id={`team-error-${index}`} role="alert" aria-live="polite" className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                <span>{fieldError}</span>
                              </p>
                            )}
                          </div>

                          {/* Captain Name (Optional) */}
                          <div className="space-y-1">
                            <label htmlFor={`team-captain-input-${index}`} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                              Captain / Manager Name (Optional)
                            </label>
                            <input
                              id={`team-captain-input-${index}`}
                              type="text"
                              maxLength={60}
                              value={team.captainName || ''}
                              onChange={(e) => handleTeamChange(index, 'captainName', e.target.value)}
                              placeholder="e.g. Captain / Coach"
                              className="w-full px-3.5 py-2.5 bg-[#0B0F14] border border-[#293442] focus:border-[#c6ff3d] rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 3: REVIEW & CREATE
             ═══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-[#293442] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                      Review &amp; Finalize
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Confirm league specifications and registered teams before launch.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c6ff3d]/15 text-[#c6ff3d] border border-[#c6ff3d]/30">
                    Ready to Launch
                  </span>
                </div>

                {/* Card 1: League Overview */}
                <div className="p-5 rounded-2xl bg-[#1B2530] border border-[#293442] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#293442]/60">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <Trophy className="w-4 h-4 text-[#c6ff3d]" />
                      <span>League Overview</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#c6ff3d] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">League Name:</span>
                      <strong className="text-white text-sm font-['Barlow_Condensed'] uppercase tracking-wide block truncate">
                        {name}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Sport &amp; Format:</span>
                      <strong className="text-white block">
                        {sport} &bull; {format === 'double round-robin' ? 'Double RR (2 legs)' : 'Single RR (1 leg)'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Start &amp; End Dates:</span>
                      <strong className="text-white block">
                        {startDate} {endDate ? `to ${endDate}` : ''}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Visibility:</span>
                      <strong className="text-white capitalize block">
                        {visibility}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card 2: Scoring & Rules */}
                <div className="p-5 rounded-2xl bg-[#1B2530] border border-[#293442] space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#293442]/60">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <Settings2 className="w-4 h-4 text-[#c6ff3d]" />
                      <span>Scoring Rules ({scoringPresetKey} preset)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#c6ff3d] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Rules</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span>Win: <strong className="text-white font-mono">{pointsWin} pts</strong></span>
                    <span>Draw: <strong className="text-white font-mono">{drawsAllowed ? `${pointsDraw} pts` : 'No Draws'}</strong></span>
                    <span>Loss: <strong className="text-white font-mono">{pointsLoss} pts</strong></span>
                    <span>Score Label: <strong className="text-white">{scoreLabel}</strong></span>
                  </div>
                </div>

                {/* Card 3: Registered Teams */}
                <div className="p-5 rounded-2xl bg-[#1B2530] border border-[#293442] space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#293442]/60">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                      <Users className="w-4 h-4 text-[#c6ff3d]" />
                      <span>Registered Teams ({teams.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#c6ff3d] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Teams</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {teams.map((team, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] flex items-center gap-2.5 text-xs"
                      >
                        <span className="w-6 h-6 rounded-lg bg-[#141B24] border border-[#293442] flex items-center justify-center font-mono font-bold text-[11px] text-[#c6ff3d] shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <strong className="text-white block truncate">{team.name}</strong>
                          {team.captainName && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              Captain: {team.captainName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STICKY WIZARD FOOTER (ALWAYS RENDERED, NEVER CLIPPED)
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="pt-6 border-t border-[#293442] flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 bg-[#141B24]/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl z-20 border border-[#293442] shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
            {/* Left Action: Back or Cancel */}
            <div>
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleBack}
                  className="min-h-[44px] px-6 text-xs font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Back</span>
                </Button>
              ) : (
                <Link
                  to="/tournaments/your-league"
                  onClick={handleCancel}
                  className="min-h-[44px] inline-flex items-center text-xs text-slate-400 hover:text-white font-semibold transition-colors px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 rounded"
                >
                  Cancel
                </Link>
              )}
            </div>

            {/* Right Action: Next or Create */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 w-full sm:w-auto">
              {!isCurrentStepValid && stepHint && (
                <span
                  id="wizard-next-hint"
                  className="text-[11px] text-amber-300/90 font-medium text-center sm:text-right"
                >
                  {stepHint}
                </span>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!isCurrentStepValid}
                  aria-disabled={!isCurrentStepValid}
                  aria-describedby={!isCurrentStepValid ? 'wizard-next-hint' : undefined}
                  onClick={handleNext}
                  className="w-full sm:w-auto min-h-[44px] px-8 font-black uppercase tracking-wider text-xs shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  aria-disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="w-full sm:w-auto min-h-[44px] px-8 font-black uppercase tracking-wider text-xs shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating League...' : `Create League (${teams.length} Teams)`}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
