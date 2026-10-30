/**
 * src/components/friendlies/feed/PostCard.jsx
 * 
 * Social-feed post card rendering one FriendlyPost with real data only.
 * Handles "Read more" expansion, share, save, report overflow menu,
 * and Respond/Edit/Close/View Responses actions.
 * 
 * All server-provided user text is rendered as plain text to prevent XSS.
 * Times are rendered in viewer's local timezone from server timestamps.
 */
import React, { useState, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Swords,
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  MoreHorizontal,
  MessageSquare,
  Edit3,
  X as XIcon,
  ChevronDown,
  ChevronUp,
  Home,
  CreditCard,
  Trophy
} from 'lucide-react';
import FeedStatusBadge from './FeedStatusBadge';
import TeamAvatar from './TeamAvatar';

// Server timestamps → local-timezone relative time, with full date on hover
function relativeTime(isoStr) {
  if (!isoStr) return '';
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fullDatetime(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function expiryLine(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { text: 'Expired', urgent: true };
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return { text: 'Expires today', urgent: true };
  if (days === 1) return { text: 'Expires tomorrow', urgent: true };
  if (days <= 3) return { text: `Expires in ${days} days`, urgent: true };
  return { text: `Expires in ${days} days`, urgent: false };
}

const SPORT_COLORS = {
  Football:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Cricket:    { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  Basketball: { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  Badminton:  { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  Volleyball: { bg: 'bg-purple-500/15',  text: 'text-purple-400',  border: 'border-purple-500/30' },
};

const TAG_CLASS = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border';

export default function PostCard({
  post,
  team,
  college,
  currentActor,
  role,
  teams = [],          // All teams — used to determine eligibility
  onRespond,
  onSaveToggle,
  onShare,
  onReport,
  onEdit,
  onClose,
  onViewResponses,
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef(null);

  const isAuthor = currentActor && post.authorId === currentActor.id;
  const isOpen = post.status === 'Open';

  // Determine eligibility to Respond
  const eligibility = (() => {
    if (!currentActor) return { canRespond: false, reason: 'Sign in to respond' };
    if (!isOpen) return { canRespond: false, reason: `This post is ${post.status.toLowerCase()}` };
    if (isAuthor) return { canRespond: false, reason: 'Your own post' };

    const expiryMs = post.expiresAt ? new Date(post.expiresAt).getTime() - Date.now() : Infinity;
    if (expiryMs <= 0) return { canRespond: false, reason: 'This post has expired' };

    // Check if user manages any eligible team for this sport + different college
    const eligibleTeam = teams.find(
      (t) =>
        t.sport.toLowerCase() === post.sport.toLowerCase() &&
        t.collegeId !== post.collegeId &&
        (t.captainId === currentActor.id || t.id === currentActor.teamId)
    );

    if (!eligibleTeam) {
      const sameCollegeTeam = teams.find(
        (t) => t.sport.toLowerCase() === post.sport.toLowerCase() && t.collegeId === post.collegeId &&
          (t.captainId === currentActor.id || t.id === currentActor.teamId)
      );
      if (sameCollegeTeam) return { canRespond: false, reason: 'Inter-college matches only — you are from the same college' };
      return { canRespond: false, reason: `Register a ${post.sport} team to respond` };
    }

    return { canRespond: true, eligibleTeam };
  })();

  const expiry = expiryLine(post.expiresAt);
  const sportColors = SPORT_COLORS[post.sport] || { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };

  const MESSAGE_TRUNCATE = 200;
  const longMessage = post.message && post.message.length > MESSAGE_TRUNCATE;
  const displayMessage = longMessage && !expanded
    ? post.message.slice(0, MESSAGE_TRUNCATE) + '…'
    : post.message;

  const handleShare = () => {
    const url = `${window.location.origin}/friendlies/feed/${post.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    onShare?.(url);
  };

  return (
    <article
      className="bg-[#151B23] border border-[#293442] hover:border-[#B6FF3B]/40 rounded-2xl shadow-lg transition-all duration-200 flex flex-col group"
      aria-label={`Friendly post by ${team?.name || 'Unknown team'}: ${post.title || post.sport} match`}
    >
      {/* Top Strip: Team info + tags */}
      <div className="p-4 pb-3 border-b border-[#293442]/70">
        <div className="flex items-start gap-3">
          <TeamAvatar team={team} college={college} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate" title={team?.name}>
                  {team?.name || 'Unknown Team'}
                </p>
                <p className="text-xs text-slate-400 truncate" title={college?.name}>
                  {college?.name || team?.collegeName || 'College'}
                </p>
              </div>

              {/* Overflow menu */}
              <div className="relative shrink-0" ref={overflowRef}>
                <button
                  type="button"
                  onClick={() => setOverflowOpen((v) => !v)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1B2530] transition-colors"
                  aria-label="More options"
                  aria-expanded={overflowOpen}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {overflowOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-40 bg-[#1B2530] border border-[#293442] rounded-xl shadow-2xl z-40 overflow-hidden"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { handleShare(); setOverflowOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:bg-[#293442] hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share Link
                    </button>
                    {!isAuthor && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { onReport?.(post); setOverflowOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" /> Report Post
                      </button>
                    )}
                    {isAuthor && isOpen && (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => { onEdit?.(post); setOverflowOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:bg-[#293442] hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Post
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => { onClose?.(post); setOverflowOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <XIcon className="w-3.5 h-3.5" /> Close Post
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={`${TAG_CLASS} ${sportColors.bg} ${sportColors.text} ${sportColors.border}`}>
                <Swords className="w-3 h-3" />{post.sport}
              </span>
              <span className={`${TAG_CLASS} bg-[#1B2530] text-slate-300 border-[#293442]`}>
                {post.type === 'Hosting, need an opponent' ? 'Hosting' : 'Looking for Match'}
              </span>
              <span className={`${TAG_CLASS} bg-[#1B2530] text-slate-300 border-[#293442]`}>
                <Trophy className="w-3 h-3" />{post.skillLevel}
              </span>
              {post.status !== 'Open' && <FeedStatusBadge status={post.status} />}
            </div>
          </div>
        </div>
      </div>

      {/* Post Body */}
      <div className="p-4 space-y-3 flex-1">
        {post.title && (
          <h3 className="font-['Barlow_Condensed'] text-lg font-bold uppercase text-white leading-tight tracking-wide">
            {post.title}
          </h3>
        )}

        {/* Message (plain text, no HTML injection; whitespace-pre-wrap for linebreaks) */}
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
          {displayMessage}
        </p>
        {longMessage && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#00D9FF] hover:underline flex items-center gap-1 font-semibold"
            aria-expanded={expanded}
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
          </button>
        )}

        {/* Match Details Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
          {post.preferredDates && post.preferredDates.length > 0 && (
            <div className="flex items-start gap-1.5 text-xs text-slate-400 col-span-2">
              <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#B6FF3B]" />
              <span>
                <span className="text-white font-semibold">Preferred: </span>
                {post.preferredDates.join(' · ')}
                {post.preferredTimeWindow && <span className="ml-1 text-slate-500">({post.preferredTimeWindow})</span>}
              </span>
            </div>
          )}

          {post.venueName && (
            <div className="flex items-start gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#00D9FF]" />
              <span className="truncate" title={post.venueName}>{post.venueName}, {post.city}</span>
            </div>
          )}

          {post.format && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 shrink-0 text-purple-400" />
              <span>{post.format}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Home className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className={post.hasHomeGround ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
              {post.hasHomeGround ? 'Home ground available' : 'No ground yet'}
            </span>
          </div>

          {post.costNote && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 col-span-2">
              <CreditCard className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              <span>{post.costNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Timestamps, Expiry, Actions */}
      <div className="px-4 py-3 border-t border-[#293442]/70 space-y-3">
        {/* Time metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <time
            dateTime={post.createdAt}
            title={fullDatetime(post.createdAt)}
            aria-label={`Posted ${fullDatetime(post.createdAt)}`}
          >
            Posted {relativeTime(post.createdAt)}
          </time>

          {expiry && (
            <span className={expiry.urgent ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
              <Clock className="w-3 h-3 inline mr-1" />
              {expiry.text}
            </span>
          )}
        </div>

        {/* Author: response count */}
        {isAuthor && typeof post.responseCount === 'number' && (
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#B6FF3B]" />
            <span><span className="text-white font-bold">{post.responseCount}</span> response{post.responseCount !== 1 ? 's' : ''} received
              {post.pendingResponseCount > 0 && (
                <span className="ml-1 text-amber-400 font-semibold">({post.pendingResponseCount} pending)</span>
              )}
            </span>
          </div>
        )}

        {/* Reputation line: only when > 0 completed matches, from real data */}
        {team?.reputation && (
          <div className="text-[11px] text-slate-500">
            {team.reputation.label}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary Action: Respond or Author actions */}
          {!isAuthor && (
            eligibility.canRespond ? (
              <button
                type="button"
                onClick={() => onRespond?.(post, eligibility.eligibleTeam)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs transition-all shadow-sm min-h-[36px]"
              >
                <Swords className="w-3.5 h-3.5" />
                Respond
              </button>
            ) : isOpen ? (
              <span className="text-xs text-slate-500 italic px-1">
                {eligibility.reason}
              </span>
            ) : null
          )}

          {isAuthor && isOpen && (
            <button
              type="button"
              onClick={() => onViewResponses?.(post)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B2530] hover:bg-slate-700 text-white font-semibold text-xs border border-[#293442] transition-all min-h-[36px]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#B6FF3B]" />
              View Responses
            </button>
          )}

          {/* Save toggle */}
          <button
            type="button"
            onClick={() => onSaveToggle?.(post)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all min-h-[36px] ${
              post.isSaved
                ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] border-[#B6FF3B]/40 hover:bg-[#B6FF3B]/20'
                : 'bg-[#1B2530] text-slate-400 border-[#293442] hover:text-white hover:border-slate-500'
            }`}
            aria-label={post.isSaved ? 'Remove bookmark' : 'Save post'}
          >
            {post.isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{post.isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B2530] text-slate-400 hover:text-white border border-[#293442] hover:border-slate-500 text-xs font-semibold transition-all min-h-[36px]"
            aria-label="Copy share link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}

