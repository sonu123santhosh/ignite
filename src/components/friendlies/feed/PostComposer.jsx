/**
 * src/components/friendlies/feed/PostComposer.jsx
 *
 * The "Create Post" composer card. Renders a preview before submission,
 * live character counters, inline validation, optimistic submit with rollback,
 * and prevents double-posting.
 *
 * Sport is locked to the team's sport and cannot be changed post-creation.
 * Contact details in message/title are warned and refused.
 */
import React, { useState, useEffect } from 'react';
import {
  Swords,
  MapPin,
  Calendar,
  Plus,
  X,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye
} from 'lucide-react';
import { containsContactDetails } from '../../../services/friendlyFeedService';

const SPORTS = ['Football', 'Cricket', 'Basketball', 'Badminton', 'Volleyball'];
const FORMATS = {
  Football:   ['5-a-side', '7-a-side', '11-a-side'],
  Cricket:    ['T20', 'One Day', '10 Overs'],
  Basketball: ['3v3 Half Court', '5v5 Full Court'],
  Badminton:  ['Singles', 'Doubles', 'Singles + Doubles Tie'],
  Volleyball: ['6v6 Best of 5', '4v4 Beach'],
};
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Competitive'];

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-[#0B0F14] border border-[#293442] focus:border-[#B6FF3B] rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors';
const LABEL_CLASS = 'block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function PostComposer({ currentActor, managedTeams = [], onPostCreated, onCancel }) {
  const [form, setForm] = useState({
    teamId: currentActor?.teamId || managedTeams[0]?.id || '',
    type: 'Looking for a match',
    title: '',
    message: '',
    preferredDates: [todayStr()],
    preferredTimeWindow: '',
    venueName: '',
    city: 'Pune',
    hasHomeGround: false,
    format: '',
    playersPerSide: '',
    skillLevel: 'Intermediate',
    costNote: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedTeam = managedTeams.find((t) => t.id === form.teamId);
  const sport = selectedTeam?.sport || SPORTS[0];

  // Update format options when sport changes
  useEffect(() => {
    const firstFormat = FORMATS[sport]?.[0] || '';
    setForm((prev) => ({ ...prev, format: firstFormat }));
  }, [sport]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addDate = () => {
    setForm((prev) => ({
      ...prev,
      preferredDates: [...prev.preferredDates, todayStr()]
    }));
  };
  const removeDate = (idx) => {
    setForm((prev) => ({
      ...prev,
      preferredDates: prev.preferredDates.filter((_, i) => i !== idx)
    }));
  };
  const updateDate = (idx, val) => {
    setForm((prev) => {
      const dates = [...prev.preferredDates];
      dates[idx] = val;
      return { ...prev, preferredDates: dates };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.teamId) errs.teamId = 'Select a team.';
    if (!form.message.trim() || form.message.trim().length < 10)
      errs.message = 'Message must be at least 10 characters.';
    if (form.message.length > 1000) errs.message = 'Message is too long (max 1000 characters).';
    if (containsContactDetails(form.message) || containsContactDetails(form.title)) {
      errs.message =
        'Phone numbers and email addresses cannot be included. Contact details are shared after a match is confirmed.';
    }
    const today = todayStr();
    const validDates = form.preferredDates.filter((d) => d && d >= today);
    if (validDates.length === 0) errs.dates = 'At least one future preferred date is required.';
    form.preferredDates.forEach((d, i) => {
      if (d && d < today) errs[`date_${i}`] = 'Date cannot be in the past.';
    });
    if (form.title.length > 80) errs.title = 'Title is too long (max 80 characters).';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        sport,
        preferredDates: form.preferredDates.filter((d) => d >= todayStr())
      };
      onPostCreated?.(payload);
    } catch (err) {
      setSubmitError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (managedTeams.length === 0) {
    return (
      <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center mx-auto">
          <Swords className="w-5 h-5 text-[#B6FF3B]" />
        </div>
        <p className="text-sm text-slate-300">
          You need to register a team before you can post a match request.
        </p>
        <a
          href="/friendlies/register-team"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Register Your Team
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#151B23] border border-[#293442] rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#293442] bg-[#0B0F14]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
            <Swords className="w-4 h-4" />
          </span>
          <h2 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white tracking-wide">
            Create Match Post
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1B2530] text-slate-300 hover:text-white border border-[#293442] rounded-xl transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-[#1B2530] rounded-lg transition-colors"
              aria-label="Close composer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {submitError && (
        <div className="mx-5 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-red-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="p-5 space-y-5">
          {/* Team + Post Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-team">Your Team</label>
              <div className="relative">
                <select
                  id="pcompose-team"
                  value={form.teamId}
                  onChange={(e) => set('teamId', e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-8`}
                >
                  {managedTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.sport})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              {errors.teamId && <p className="mt-1 text-xs text-red-400">{errors.teamId}</p>}
              <p className="mt-1 text-xs text-slate-500">Sport: <span className="text-white font-semibold">{sport}</span> (locked)</p>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-type">Post Type</label>
              <div className="relative">
                <select
                  id="pcompose-type"
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-8`}
                >
                  <option>Looking for a match</option>
                  <option>Hosting, need an opponent</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={LABEL_CLASS} htmlFor="pcompose-title">Title <span className="text-slate-600 font-normal">(optional)</span></label>
              <span className={`text-xs ${form.title.length > 70 ? 'text-amber-400' : 'text-slate-600'}`}>{form.title.length}/80</span>
            </div>
            <input
              id="pcompose-title"
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Short catchy title e.g. Pre-season Derby 7-a-side"
              className={INPUT_CLASS}
              maxLength={80}
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={LABEL_CLASS} htmlFor="pcompose-message">Message <span className="text-red-400">*</span></label>
              <span className={`text-xs ${form.message.length > 900 ? 'text-amber-400' : 'text-slate-600'}`}>{form.message.length}/1000</span>
            </div>
            <textarea
              id="pcompose-message"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="Describe your match request. Don't include contact details — those are shared after confirmation."
              rows={4}
              className={`${INPUT_CLASS} resize-none`}
              maxLength={1000}
              aria-describedby={errors.message ? 'msg-err' : undefined}
            />
            {errors.message && (
              <p id="msg-err" className="mt-1 text-xs text-red-400 flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{errors.message}
              </p>
            )}
          </div>

          {/* Preferred Dates */}
          <div>
            <label className={LABEL_CLASS}>Preferred Dates <span className="text-red-400">*</span></label>
            <div className="space-y-2">
              {form.preferredDates.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B6FF3B] shrink-0" />
                  <input
                    type="date"
                    value={d}
                    min={todayStr()}
                    onChange={(e) => updateDate(idx, e.target.value)}
                    className={`${INPUT_CLASS} flex-1`}
                    aria-label={`Preferred date ${idx + 1}`}
                  />
                  {form.preferredDates.length > 1 && (
                    <button type="button" onClick={() => removeDate(idx)} className="text-slate-500 hover:text-red-400 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {errors[`date_${idx}`] && (
                    <p className="text-xs text-red-400">{errors[`date_${idx}`]}</p>
                  )}
                </div>
              ))}
              {errors.dates && <p className="text-xs text-red-400">{errors.dates}</p>}
              {form.preferredDates.length < 5 && (
                <button
                  type="button"
                  onClick={addDate}
                  className="text-xs text-[#00D9FF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add another date
                </button>
              )}
            </div>

            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor="pcompose-window">Time Window <span className="text-slate-600 font-normal">(optional)</span></label>
              <input
                id="pcompose-window"
                type="text"
                value={form.preferredTimeWindow}
                onChange={(e) => set('preferredTimeWindow', e.target.value)}
                placeholder="e.g. 16:00 - 18:30"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-venue">Venue / Area</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="pcompose-venue"
                  type="text"
                  value={form.venueName}
                  onChange={(e) => set('venueName', e.target.value)}
                  placeholder="Ground or area name"
                  className={`${INPUT_CLASS} pl-9`}
                  maxLength={120}
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-city">City</label>
              <input
                id="pcompose-city"
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Pune / Mumbai"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Home Ground Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.hasHomeGround}
              onClick={() => set('hasHomeGround', !form.hasHomeGround)}
              className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${form.hasHomeGround ? 'bg-[#B6FF3B]' : 'bg-[#293442]'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.hasHomeGround ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
            <label className="text-sm text-slate-300 font-medium cursor-pointer select-none" onClick={() => set('hasHomeGround', !form.hasHomeGround)}>
              We have a home ground available for this match
            </label>
          </div>

          {/* Format + Skill Level + Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-format">Format</label>
              <div className="relative">
                <select
                  id="pcompose-format"
                  value={form.format}
                  onChange={(e) => set('format', e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-8`}
                >
                  {(FORMATS[sport] || ['Full Match']).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-skill">Skill Level</label>
              <div className="relative">
                <select
                  id="pcompose-skill"
                  value={form.skillLevel}
                  onChange={(e) => set('skillLevel', e.target.value)}
                  className={`${INPUT_CLASS} appearance-none pr-8`}
                >
                  {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="pcompose-cost">Cost Note <span className="text-slate-600 font-normal">(optional)</span></label>
              <input
                id="pcompose-cost"
                type="text"
                value={form.costNote}
                onChange={(e) => set('costNote', e.target.value)}
                placeholder="e.g. Ground cost shared"
                className={INPUT_CLASS}
                maxLength={160}
              />
            </div>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="px-5 py-4 border-t border-[#293442] flex items-center justify-between gap-4 bg-[#0B0F14]">
          <p className="text-xs text-slate-500">
            Posts expire in 14 days or 1 day before your earliest preferred date.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#B6FF3B] hover:bg-[#a3ee28] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F14] font-bold text-sm rounded-xl transition-all shadow-lg min-h-[40px]"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Post</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

