import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import { useTrials } from '../../context/TrialsContext';
import TrialsRoleSwitcher from '../../components/trials/TrialsRoleSwitcher';
import { SPORTS_CATEGORIES, getRelativeDate } from '../../data/trialsData';

export default function OrganiserCreateTrial() {
  const navigate = useNavigate();
  const { createTrial, activeUser } = useTrials();

  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    sport: 'Football',
    discipline: '11-a-side Football',
    organisationType: 'College',
    description: '',
    trialType: 'Varsity Team Selection',
    skillLevel: 'Competitive',
    competitionCategory: 'Inter-Collegiate Tournament',
    venue: '',
    address: '',
    city: 'Pune',
    trialDate: getRelativeDate(14),
    reportingTime: '06:30 AM',
    startTime: '07:30 AM',
    endTime: '12:00 PM',
    duration: '1 Day',
    minAge: 17,
    maxAge: 25,
    genderEligibility: 'All',
    eligibilityCriteria: [
      'Currently enrolled or prospective student athlete.',
      'Prior district or college playing experience.'
    ],
    requiredEquipment: [
      'Sport-specific footwear and attire.',
      'Personal water bottle.'
    ],
    entryFee: 0,
    additionalCharges: 'None',
    applicationDeadline: getRelativeDate(8),
    maxCapacity: 60,
    requiredDocuments: [
      { name: 'Recent Passport Photo', mandatory: true, type: 'Image (JPG/PNG)' },
      { name: 'Original Age / Identity Proof (Aadhaar/Passport)', mandatory: true, type: 'PDF / Image' },
      { name: 'Sports Participation Certificate', mandatory: false, type: 'PDF' }
    ]
  });

  const [newCriterion, setNewCriterion] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    setFormData((prev) => ({
      ...prev,
      eligibilityCriteria: [...prev.eligibilityCriteria, newCriterion.trim()]
    }));
    setNewCriterion('');
  };

  const handleRemoveCriterion = (idx) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityCriteria: prev.eligibilityCriteria.filter((_, i) => i !== idx)
    }));
  };

  const handleAddEquipment = () => {
    if (!newEquipment.trim()) return;
    setFormData((prev) => ({
      ...prev,
      requiredEquipment: [...prev.requiredEquipment, newEquipment.trim()]
    }));
    setNewEquipment('');
  };

  const handleRemoveEquipment = (idx) => {
    setFormData((prev) => ({
      ...prev,
      requiredEquipment: prev.requiredEquipment.filter((_, i) => i !== idx)
    }));
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setErrorMessage('Please provide a trial title and description.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.venue.trim() || !formData.address.trim()) {
        setErrorMessage('Please specify the venue name and full address.');
        return;
      }
      if (new Date(formData.trialDate) <= new Date()) {
        setErrorMessage('Trial date must be in the future.');
        return;
      }
    }
    if (step === 3) {
      if (Number(formData.minAge) > Number(formData.maxAge)) {
        setErrorMessage('Minimum age cannot be greater than maximum age.');
        return;
      }
    }
    if (step === 4) {
      if (new Date(formData.applicationDeadline) > new Date(formData.trialDate)) {
        setErrorMessage('Application deadline cannot be after the trial date.');
        return;
      }
      if (Number(formData.entryFee) < 0) {
        setErrorMessage('Entry fee cannot be negative.');
        return;
      }
    }
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handleSubmit = (publicationStatus = 'Published') => {
    const res = createTrial({ ...formData, publicationStatus });
    if (res.success) {
      navigate('/trials/organiser');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F7FA] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Role Switcher */}
        <TrialsRoleSwitcher />

        {/* Back Link */}
        <div>
          <Link
            to="/trials/organiser"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#00D4FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Organiser Dashboard</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-[#141B24] border border-[#293442] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
          {/* Header & Steps */}
          <div className="border-b border-[#293442] pb-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
                Trial Publishing Wizard
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Create & Publish Sports Trial
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Conducting Organisation: <strong className="text-white">{activeUser.organisationName}</strong>
              </p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {[
                { s: 1, l: '1. Basic' },
                { s: 2, l: '2. Venue' },
                { s: 3, l: '3. Eligibility' },
                { s: 4, l: '4. Fees' },
                { s: 5, l: '5. Documents' },
                { s: 6, l: '6. Review' }
              ].map((item) => (
                <div
                  key={item.s}
                  className={`text-center py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    step === item.s
                      ? 'bg-[#00D4FF] text-[#0B0F14] border-[#00D4FF]'
                      : step > item.s
                      ? 'bg-[#1B2530] text-[#00D4FF] border-[#00D4FF]/30'
                      : 'bg-[#0B0F14] text-slate-500 border-[#293442]'
                  }`}
                >
                  {item.l}
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

          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Step 1: Basic Trial Information
              </h2>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Trial Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. University Varsity Football Selection Trials 2026"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Sport *</label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value, discipline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  >
                    {SPORTS_CATEGORIES.filter(s => s.id !== 'all').map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Discipline / Format</label>
                  <input
                    type="text"
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    placeholder="e.g. 11-a-side Turf, T20 Leather Ball, Singles"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Organisation Type</label>
                  <select
                    value={formData.organisationType}
                    onChange={(e) => setFormData({ ...formData, organisationType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="College">College / University</option>
                    <option value="Club">Club / Youth Academy</option>
                    <option value="Sports Association">Sports Association</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Skill Level</label>
                  <select
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Competitive / Professional">Competitive / Professional</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Description & Purpose *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline selection purpose, squad size, scholarship availability, and what scouts will evaluate..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#00D4FF] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#33ddff] cursor-pointer"
                >
                  Continue to Venue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VENUE AND SCHEDULE */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Step 2: Venue & Schedule Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-300 block">Venue Facility Name *</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. MIT-WPU Main Sports Arena, Kothrud"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-300 block">Full Street Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Survey No. 124, Paud Road, Kothrud, Pune - 411038"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Trial Date *</label>
                  <input
                    type="date"
                    value={formData.trialDate}
                    onChange={(e) => setFormData({ ...formData, trialDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Reporting Time *</label>
                  <input
                    type="text"
                    value={formData.reportingTime}
                    onChange={(e) => setFormData({ ...formData, reportingTime: e.target.value })}
                    placeholder="e.g. 06:30 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Trial Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 1 Day (4 Hours)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#00D4FF] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#33ddff] cursor-pointer"
                >
                  Continue to Eligibility
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ELIGIBILITY & REQUIREMENTS */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Step 3: Age & Skill Eligibility
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Minimum Age *</label>
                  <input
                    type="number"
                    value={formData.minAge}
                    onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                    min="10"
                    max="50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Maximum Age *</label>
                  <input
                    type="number"
                    value={formData.maxAge}
                    onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                    min="10"
                    max="50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Gender Eligibility *</label>
                  <select
                    value={formData.genderEligibility}
                    onChange={(e) => setFormData({ ...formData, genderEligibility: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>
              </div>

              {/* Eligibility Criteria Dynamic List */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-300 block">Eligibility Criteria Items</label>
                <div className="space-y-2">
                  {formData.eligibilityCriteria.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F14] border border-[#293442]">
                      <span className="text-slate-200">{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(i)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    placeholder="Add specific rule or requirement..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCriterion}
                    className="px-3.5 py-2 rounded-xl bg-[#1B2530] text-[#00D4FF] font-bold border border-[#293442] cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#00D4FF] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#33ddff] cursor-pointer"
                >
                  Continue to Fees
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FEES & REGISTRATION */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Step 4: Fees & Capacity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Entry Fee (₹) *</label>
                  <input
                    type="number"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                    min="0"
                    placeholder="0 for Free Entry"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                  <span className="text-[10px] text-slate-500 block">Set ₹0 to advertise as Free Entry</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">Maximum Applicant Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                    min="10"
                    max="500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-300 block">Application Deadline *</label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#293442] text-white focus:outline-none focus:border-[#00D4FF]"
                  />
                  <span className="text-[10px] text-slate-500 block">Registration closes on this date at 11:59 PM</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#00D4FF] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#33ddff] cursor-pointer"
                >
                  Continue to Documents
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-4 text-xs">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Step 5: Configure Required Documents
              </h2>
              <p className="text-[#94A3B8]">
                Candidates will be prompted to attach scanned copies of these documents during application submission.
              </p>

              <div className="space-y-3">
                {formData.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#0B0F14] border border-[#293442] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#00D4FF]" />
                      <div>
                        <div className="font-bold text-white">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.type}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {doc.mandatory ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#00D4FF] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#33ddff] cursor-pointer"
                >
                  Review & Publish
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & PUBLISH */}
          {step === 6 && (
            <div className="space-y-6 text-xs">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Step 6: Preview & Confirm Publication
                </h2>
                <p className="text-[#94A3B8]">
                  Confirm your sports trial specifications before publishing to the SportLink discovery directory.
                </p>
              </div>

              {/* Preview Box */}
              <div className="bg-[#0B0F14] border border-[#293442] p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#293442] pb-2">
                  <span className="text-slate-500">Event Title:</span>
                  <span className="font-bold text-white text-sm">{formData.title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#293442] pb-2">
                  <span className="text-slate-500">Sport & Discipline:</span>
                  <span className="font-semibold text-[#00D4FF]">{formData.sport} • {formData.discipline}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#293442] pb-2">
                  <span className="text-slate-500">Venue & City:</span>
                  <span className="text-slate-300">{formData.venue}, {formData.city}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#293442] pb-2">
                  <span className="text-slate-500">Trial Date & Reporting:</span>
                  <span className="font-bold text-[#B6FF3B]">{formData.trialDate} ({formData.reportingTime})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Application Deadline:</span>
                  <span className="font-bold text-amber-400">{formData.applicationDeadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-3 rounded-xl bg-[#1B2530] text-slate-300 text-xs font-bold border border-[#293442]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('Draft')}
                  className="flex-1 py-3 rounded-xl bg-[#1B2530] hover:bg-[#253241] text-xs font-bold text-white border border-[#293442] uppercase tracking-wider"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('Published')}
                  className="flex-1 py-3 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-black text-xs uppercase tracking-wider hover:bg-[#a5ef28] shadow-lg shadow-[#B6FF3B]/10 cursor-pointer"
                >
                  Publish Trial Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
