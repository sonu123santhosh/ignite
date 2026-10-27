import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Check,
  ShieldCheck,
  Calendar,
  MapPin,
  ChevronRight,
  Printer,
  Sparkles
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialsRoleSwitcher from '../../components/trials/TrialsRoleSwitcher';
import TrialReceiptModal from '../../components/trials/TrialReceiptModal';

export default function TrialApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trials, activeUser, applyForTrial } = useTrials();

  const trial = trials.find((t) => t.id === id) || trials[0];

  // Steps: 1 (Eligibility) -> 2 (Details) -> 3 (Documents) -> 4 (Review) -> 5 (Confirmed)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [confirmedEligibility, setConfirmedEligibility] = useState(false);
  const [formData, setFormData] = useState({
    athleteName: activeUser?.name || '',
    athleteEmail: activeUser?.email || '',
    athletePhone: activeUser?.phone || '',
    athleteAge: activeUser?.age || 18,
    athleteGender: activeUser?.gender || 'Male',
    athleteCity: activeUser?.city || 'Pune',
    position: activeUser?.position || '',
    experienceLevel: activeUser?.experience || 'Competitive (2-4 years)',
    previousAchievements: '',
    sportsStats: '',
    emergencyContact: '+91 98221 44555 (Parent / Guardian)',
    guardianConsent: false,
    uploadedDocuments: [
      { name: 'Profile_Photo.jpg', type: 'image/jpeg', size: '210 KB' },
      { name: 'Identity_Proof_Aadhaar.pdf', type: 'application/pdf', size: '750 KB' },
      { name: 'Sports_Certificate.pdf', type: 'application/pdf', size: '1.2 MB' }
    ]
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  if (!trial) {
    return (
      <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-28 pb-20 px-4 text-center">
        <h2 className="text-xl font-bold text-white">Trial not found</h2>
        <Link to="/trials" className="text-[#B6FF3B] underline text-sm mt-4 inline-block">
          Back to Directory
        </Link>
      </div>
    );
  }

  const isMinor = Number(formData.athleteAge) < 18;

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1 && !confirmedEligibility) {
      setErrorMessage('Please confirm that you meet the specified age and skill eligibility criteria.');
      return;
    }
    if (currentStep === 2) {
      if (!formData.athleteName || !formData.athleteEmail || !formData.athletePhone) {
        setErrorMessage('Please complete all required contact information.');
        return;
      }
    }
    if (currentStep === 3) {
      if (isMinor && !formData.guardianConsent) {
        setErrorMessage('Parent or legal guardian consent is mandatory for applicants under 18.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleFinalSubmit = () => {
    const res = applyForTrial(trial.id, formData);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to submit application.');
      return;
    }
    setSubmittedApplication(res.application);
    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Role Switcher */}
        <TrialsRoleSwitcher />

        {/* Back Link */}
        <div>
          <Link
            to={`/trials/${trial.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#B6FF3B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {trial.title}</span>
          </Link>
        </div>

        {/* Application Container */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          {/* Header & Step Tracker */}
          <div className="border-b border-[#293442] pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
                  Official Application Portal
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {trial.title}
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Conducted by <strong className="text-white">{trial.organisationName}</strong> • {trial.trialDate}
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#0B0F14] text-[#B6FF3B] border border-[#293442] self-start sm:self-auto font-bold">
                {trial.isFree ? 'FREE ENTRY' : `₹${trial.entryFee} ENTRY`}
              </span>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { step: 1, label: '1. Eligibility' },
                { step: 2, label: '2. Athlete Info' },
                { step: 3, label: '3. Documents' },
                { step: 4, label: '4. Review' }
              ].map((s) => (
                <div
                  key={s.step}
                  className={`text-center py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    currentStep === s.step
                      ? 'bg-[#B6FF3B] text-[#0B0F14] border-[#B6FF3B]'
                      : currentStep > s.step
                      ? 'bg-[#1B2530] text-[#B6FF3B] border-[#B6FF3B]/30'
                      : 'bg-[#0B0F14] text-slate-500 border-[#293442]'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: CHECK ELIGIBILITY */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  Step 1: Check Eligibility & Rules
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Carefully review the criteria set by the trial director. Unqualified applicants will not be permitted into match evaluation.
                </p>
              </div>

              <div className="bg-[#0B0F14] border border-[#293442] p-5 rounded-2xl space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#293442]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">Age Range</span>
                    <strong className="text-white text-sm">{trial.minAge} to {trial.maxAge} Years</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">Gender Category</span>
                    <strong className="text-white text-sm">{trial.genderEligibility} Candidates</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-300 block uppercase text-[10px]">
                    Eligibility Criteria:
                  </span>
                  <ul className="space-y-2">
                    {trial.eligibilityCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#B6FF3B] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#293442] space-y-1">
                  <span className="font-bold text-slate-300 block uppercase text-[10px]">
                    Required Equipment:
                  </span>
                  <p className="text-slate-400">{trial.requiredEquipment.join(', ')}</p>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#1B2530] border border-[#293442] cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedEligibility}
                  onChange={(e) => setConfirmedEligibility(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#B6FF3B] mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-relaxed">
                  I confirm that I meet the age eligibility ({trial.minAge}–{trial.maxAge} years), skill level, and agree to present original government and sports documents at the venue.
                </span>
              </label>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!confirmedEligibility}
                  className="px-6 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Continue to Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ATHLETE INFORMATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  Step 2: Athlete Information & Sporting Profile
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Pre-filled from your SportLink profile. Ensure your contact details and sporting statistics are accurate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Full Athlete Name *</label>
                  <input
                    type="text"
                    value={formData.athleteName}
                    onChange={(e) => setFormData({ ...formData, athleteName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Contact Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.athletePhone}
                    onChange={(e) => setFormData({ ...formData, athletePhone: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Email Address *</label>
                  <input
                    type="email"
                    value={formData.athleteEmail}
                    onChange={(e) => setFormData({ ...formData, athleteEmail: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Current Age (Years) *</label>
                  <input
                    type="number"
                    value={formData.athleteAge}
                    onChange={(e) => setFormData({ ...formData, athleteAge: e.target.value })}
                    min={trial.minAge}
                    max={trial.maxAge}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Playing Position / Discipline</label>
                  <input
                    type="text"
                    value={formData.position}
                    placeholder="e.g. Central Midfielder, Opening Batsman, Singles"
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Experience Level</label>
                  <input
                    type="text"
                    value={formData.experienceLevel}
                    placeholder="e.g. 4 years (District / College level)"
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-300 block">Previous Tournament Achievements</label>
                  <textarea
                    value={formData.previousAchievements}
                    onChange={(e) => setFormData({ ...formData, previousAchievements: e.target.value })}
                    placeholder="List tournaments played, awards won, representative honors..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-300 block">Sporting Statistics & Highlights</label>
                  <input
                    type="text"
                    value={formData.sportsStats}
                    placeholder="e.g. 24 Matches | 6 Goals | 14 Assists | Best 100m Time: 11.2s"
                    onChange={(e) => setFormData({ ...formData, sportsStats: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#B6FF3B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all cursor-pointer"
                >
                  Continue to Documents
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTS & MINOR CONSENT */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  Step 3: Document Uploads & Minor Consent
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Upload digital copies of required certificates. SportLink secures your documents and only shares them with verified trial organizers.
                </p>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Simulated Document Repository (Pre-Loaded from Profile)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.uploadedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#0B0F14] border border-[#293442] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-[#00D4FF] shrink-0" />
                        <span className="text-white font-medium truncate">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-2">✓ Attached</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minor Guardian Consent Checkbox (Triggers if Age < 18) */}
              {isMinor && (
                <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Parent / Legal Guardian Consent Mandatory (Under 18)</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    As an athlete under 18 years of age, participation requires written declaration from your parent or guardian.
                  </p>
                  <div className="space-y-2 text-xs">
                    <label className="font-bold text-amber-200 block">Parent / Guardian Contact Information</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="e.g. Suresh Deshmukh (+91 98234 66121)"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F14] border border-amber-500/40 text-white focus:outline-none"
                    />
                  </div>
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.guardianConsent}
                      onChange={(e) => setFormData({ ...formData, guardianConsent: e.target.checked })}
                      className="w-4 h-4 rounded accent-amber-400 mt-0.5 cursor-pointer"
                    />
                    <span className="text-xs text-amber-100">
                      My parent / legal guardian has approved my registration for this trial and will provide signed physical consent at the venue.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all cursor-pointer"
                >
                  Review Application
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW APPLICATION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  Step 4: Review Application Summary
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Please verify all submitted details. Once submitted, changes can only be made prior to the application deadline.
                </p>
              </div>

              <div className="bg-[#0B0F14] border border-[#293442] p-5 rounded-2xl space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#293442]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">Candidate</span>
                    <strong className="text-white text-sm">{formData.athleteName} ({formData.athleteAge} yrs)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">Position & Experience</span>
                    <strong className="text-white text-sm">{formData.position || 'General'} • {formData.experienceLevel}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#293442]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">Trial Date & Reporting</span>
                    <strong className="text-[#B6FF3B] text-sm">{trial.trialDate} ({trial.reportingTime})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">Venue</span>
                    <strong className="text-white text-sm">{trial.venue}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Attached Documents:</span>
                  <span className="font-bold text-[#00D4FF]">{formData.uploadedDocuments.length} Verified Files</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-6 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-lg shadow-[#B6FF3B]/10 cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESSFUL SUBMISSION */}
          {currentStep === 5 && submittedApplication && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#B6FF3B] font-bold">
                  Registration Confirmed
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Application Submitted Successfully!
                </h2>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                  Your reference ID is <strong className="text-white font-mono">{submittedApplication.id}</strong>. The conducting organisation will review your credentials and issue shortlist passes.
                </p>
              </div>

              {/* Pass Card Preview */}
              <div className="max-w-md mx-auto bg-[#0B0F14] border border-[#293442] p-5 rounded-2xl text-left space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#293442] pb-2">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="font-bold text-[#B6FF3B]">{trial.trialDate} ({trial.reportingTime})</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#293442] pb-2">
                  <span className="text-slate-400">Venue:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{trial.venue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Receipt Pass No:</span>
                  <span className="font-mono text-[#00D4FF] font-bold">{submittedApplication.receiptNumber}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsReceiptOpen(true)}
                  className="px-5 py-3 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-white border border-[#293442] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#00D4FF]" />
                  <span>Download Application Receipt</span>
                </button>

                <Link
                  to="/trials/dashboard"
                  className="px-6 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] transition-all shadow-md shadow-[#B6FF3B]/10"
                >
                  Track in My Trials Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Pass Receipt Modal */}
      {isReceiptOpen && submittedApplication && (
        <TrialReceiptModal
          application={submittedApplication}
          trial={trial}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
}
