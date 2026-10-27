import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Shield,
  Copy,
  Check,
  UserPlus,
  Trash2,
  Edit2,
  ArrowLeft,
  Trophy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import ConfirmDialog from '../components/tournaments/ConfirmDialog';
import Toast from '../components/Toast';

export default function TournamentTeams({
  sharedTournamentsState,
  setSharedTournamentsState,
  currentDemoUser,
  tournamentRole = 'captain'
}) {
  const navigate = useNavigate();
  const [activeTeamId, setActiveTeamId] = useState(
    sharedTournamentsState.teams?.[0]?.id || 'team-1'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState(null);

  // New Team Modal state
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSport, setNewTeamSport] = useState('Football');
  const [newTeamCity, setNewTeamCity] = useState('Pune');
  const [newTeamCollege, setNewTeamCollege] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  // Add Member Modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPosition, setNewMemberPosition] = useState('Player');
  const [newMemberRole, setNewMemberRole] = useState('Player');

  // Remove member confirm
  const [memberToRemove, setMemberToRemove] = useState(null);

  const activeTeam = sharedTournamentsState.teams.find((t) => t.id === activeTeamId);

  // Check if current user is captain of active team
  const isCaptainOfActiveTeam =
    activeTeam?.captainId === currentDemoUser?.id || tournamentRole === 'captain' || tournamentRole === 'organiser';

  const copyInviteLink = () => {
    const dummyLink = `https://demo.sportlink.in/join-team/${activeTeam?.id || 'team-1'}?invite=true`;
    navigator.clipboard?.writeText(dummyLink);
    setCopiedLink(true);
    setToast({
      title: 'Invite Link Copied',
      message: 'Demo link copied to clipboard. In production, this allows teammates to join roster.',
      type: 'info'
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Create new team
  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeamObj = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      sport: newTeamSport,
      city: newTeamCity,
      collegeOrOrg: newTeamCollege || 'Independent Club',
      description: newTeamDesc || 'Competitive sports club',
      captainId: currentDemoUser?.id || 'user-captain-1',
      captainName: currentDemoUser?.name || 'Rahul Sharma',
      logoInitials: newTeamName.slice(0, 2).toUpperCase(),
      members: [
        {
          id: `m-${Date.now()}`,
          name: currentDemoUser?.name || 'Rahul Sharma',
          email: currentDemoUser?.email || 'captain@demo.in',
          phone: currentDemoUser?.phone || '+91 98765 00000',
          position: 'Captain',
          role: 'Captain',
          invitationStatus: 'Joined'
        }
      ]
    };

    setSharedTournamentsState((prev) => ({
      ...prev,
      teams: [newTeamObj, ...prev.teams]
    }));

    setActiveTeamId(newTeamObj.id);
    setIsNewTeamModalOpen(false);
    setNewTeamName('');
    setToast({
      title: 'Squad Created',
      message: `${newTeamObj.name} has been created with you as Captain.`,
      type: 'success'
    });
  };

  // Add member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeTeam) return;

    const newMemberObj = {
      id: `m-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail || 'teammate@demo.in',
      phone: newMemberPhone || '+91 98220 00000',
      position: newMemberPosition,
      role: newMemberRole,
      invitationStatus: 'Pending'
    };

    setSharedTournamentsState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id === activeTeam.id
          ? { ...t, members: [...t.members, newMemberObj] }
          : t
      )
    }));

    setIsAddMemberModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setToast({
      title: 'Invitation Sent',
      message: `Invitation sent to ${newMemberObj.name}. Use Demo Tools to simulate acceptance.`,
      type: 'info'
    });
  };

  // Remove member
  const handleConfirmRemoveMember = () => {
    if (!memberToRemove || !activeTeam) return;

    if (memberToRemove.role === 'Captain') {
      setToast({
        title: 'Action Refused',
        message: 'A captain cannot be removed without first designating a new captain.',
        type: 'error'
      });
      setMemberToRemove(null);
      return;
    }

    setSharedTournamentsState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id === activeTeam.id
          ? {
              ...t,
              members: t.members.filter((m) => m.id !== memberToRemove.id)
            }
          : t
      )
    }));

    setToast({
      title: 'Member Removed',
      message: `${memberToRemove.name} was removed from the squad roster.`,
      type: 'info'
    });
    setMemberToRemove(null);
  };

  // Quick simulate acceptance for pending invite
  const handleQuickAcceptInvite = (memberId) => {
    setSharedTournamentsState((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id === activeTeam.id
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === memberId ? { ...m, invitationStatus: 'Joined' } : m
              )
            }
          : t
      )
    }));
    setToast({
      title: 'Invite Accepted (Simulated)',
      message: 'Teammate status updated to Joined.',
      type: 'success'
    });
  };

  // Find tournaments this team has registered in
  const teamParticipations = (sharedTournamentsState.registrations || []).filter(
    (r) => r.entrantId === activeTeam?.id
  );

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F7FA] pb-24">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header */}
      <div className="bg-[#141B24] border-b border-[#293442] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/tournaments"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#B6FF3B]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsNewTeamModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs hover:bg-[#a3ee28] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Squad</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-wide">
            Team Captain Squad Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Manage your rosters, assign captaincy roles, invite teammates, and register for tournaments.
          </p>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {sharedTournamentsState.teams.map((t) => {
            const isSelected = t.id === activeTeamId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTeamId(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#141B24] text-[#B6FF3B] border border-[#B6FF3B]/50 shadow-md'
                    : 'bg-[#1B2530] text-slate-400 hover:text-white border border-[#293442]'
                }`}
              >
                <div className="w-6 h-6 rounded-md bg-[#0B0F14] text-[#B6FF3B] flex items-center justify-center font-black text-[10px]">
                  {t.logoInitials}
                </div>
                <span>{t.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({t.sport})</span>
              </button>
            );
          })}
        </div>

        {activeTeam && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Squad Roster Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#141B24] border border-[#293442] p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#293442]">
                  <div>
                    <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
                      {activeTeam.name} Squad Roster
                    </h3>
                    <span className="text-xs text-[#94A3B8]">
                      {activeTeam.collegeOrOrg} &bull; {activeTeam.sport} &bull; {activeTeam.members?.length || 0} Members
                    </span>
                  </div>

                  {isCaptainOfActiveTeam && (
                    <button
                      type="button"
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-[#B6FF3B] font-bold text-xs border border-[#293442] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite Teammate</span>
                    </button>
                  )}
                </div>

                {/* Members table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#1B2530] border-b border-[#293442] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">Position</th>
                        <th className="py-2.5 px-3">Squad Role</th>
                        <th className="py-2.5 px-3">Status</th>
                        {isCaptainOfActiveTeam && <th className="py-2.5 px-3 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#293442]/60">
                      {activeTeam.members?.map((m) => (
                        <tr key={m.id} className="hover:bg-[#1B2530]/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{m.name}</div>
                            <div className="text-[11px] text-slate-500">{m.phone}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{m.position}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                m.role === 'Captain'
                                  ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30'
                                  : m.role === 'Vice-captain'
                                  ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {m.role === 'Captain' && <Shield className="w-3 h-3" />}
                              <span>{m.role}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                m.invitationStatus === 'Joined'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {m.invitationStatus}
                            </span>
                          </td>
                          {isCaptainOfActiveTeam && (
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {m.invitationStatus === 'Pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAcceptInvite(m.id)}
                                    className="px-2 py-1 text-[11px] font-semibold bg-[#1B2530] text-[#B6FF3B] hover:bg-[#B6FF3B] hover:text-[#0B0F14] rounded cursor-pointer"
                                    title="Simulate teammate accepting invite"
                                  >
                                    Accept (Demo)
                                  </button>
                                )}
                                {m.role !== 'Captain' && (
                                  <button
                                    type="button"
                                    onClick={() => setMemberToRemove(m)}
                                    className="p-1 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                                    aria-label={`Remove ${m.name}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tournament History for this squad */}
              <div className="bg-[#141B24] border border-[#293442] p-6 rounded-2xl space-y-4 shadow-xl">
                <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                  Tournament Participation History
                </h3>
                {teamParticipations.length === 0 ? (
                  <p className="text-xs text-[#94A3B8]">
                    This squad has not registered in any tournaments yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {teamParticipations.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-[#1B2530] border border-[#293442] rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{p.tournamentName}</span>
                          <span className="text-[11px] text-slate-400">Ref: {p.id}</span>
                        </div>
                        <span className="font-semibold text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-1 rounded-full border border-[#00D4FF]/30">
                          {p.registrationStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Invite link & Tournament submission */}
            <div className="space-y-6">
              {/* Copyable Invite Link Card */}
              <div className="bg-[#141B24] border border-[#293442] p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#B6FF3B]" />
                  <h4 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white">
                    Share Squad Invite Link
                  </h4>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Send this link to teammates to join the official roster and verify eligibility.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://sportlink.demo/join/${activeTeam.id}`}
                    className="w-full px-3 py-2 bg-[#0B0F14] border border-[#293442] rounded-xl text-xs text-slate-400 font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="p-2 rounded-xl bg-[#1B2530] border border-[#293442] text-slate-300 hover:text-white cursor-pointer"
                    aria-label="Copy squad link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#B6FF3B]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Enter Tournament CTA */}
              <div className="bg-gradient-to-br from-[#141B24] to-[#1B2530] border border-[#293442] p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h4 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white">
                    Submit Squad To Tournament
                  </h4>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Select a live tournament matching {activeTeam.sport} to initiate the registration stepper.
                </p>

                <Link
                  to="/tournaments"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs uppercase tracking-wider text-center block hover:bg-[#a3ee28] transition-colors"
                >
                  Find Matching Tournaments
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Squad */}
      {isNewTeamModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141B24] border border-[#293442] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Create New Sports Squad
            </h3>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Squad Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Pune Titans FC"
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Sport
                  </label>
                  <select
                    value={newTeamSport}
                    onChange={(e) => setNewTeamSport(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none cursor-pointer"
                  >
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newTeamCity}
                    onChange={(e) => setNewTeamCity(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  College / Organisation
                </label>
                <input
                  type="text"
                  value={newTeamCollege}
                  onChange={(e) => setNewTeamCollege(e.target.value)}
                  placeholder="e.g. Fergusson College / Independent Club"
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setIsNewTeamModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B6FF3B] text-[#0B0F14] rounded-xl hover:bg-[#a3ee28]"
                >
                  Create Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Invite Teammate */}
      {isAddMemberModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141B24] border border-[#293442] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white">
              Invite Teammate to Squad
            </h3>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Siddharth Roy"
                  className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Playing Position
                  </label>
                  <input
                    type="text"
                    value={newMemberPosition}
                    onChange={(e) => setNewMemberPosition(e.target.value)}
                    placeholder="e.g. Defender"
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-[#94A3B8] block mb-1">
                    Squad Role
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full p-2.5 bg-[#1B2530] border border-[#293442] rounded-xl text-xs text-white focus:border-[#B6FF3B] outline-none cursor-pointer"
                  >
                    <option value="Player">Player</option>
                    <option value="Vice-captain">Vice-captain</option>
                    <option value="Substitute">Substitute</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#293442]">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B6FF3B] text-[#0B0F14] rounded-xl hover:bg-[#a3ee28]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      {memberToRemove && (
        <ConfirmDialog
          isOpen={Boolean(memberToRemove)}
          title="Remove Teammate from Squad"
          message={`Are you sure you want to remove ${memberToRemove.name} from ${activeTeam.name}?`}
          confirmLabel="Remove Player"
          isDestructive={true}
          onConfirm={handleConfirmRemoveMember}
          onCancel={() => setMemberToRemove(null)}
        />
      )}
    </div>
  );
}
