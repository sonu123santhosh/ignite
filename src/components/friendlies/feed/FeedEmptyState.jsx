/**
 * src/components/friendlies/feed/FeedEmptyState.jsx
 *
 * Context-sensitive empty and error states for the feed.
 */
import React from 'react';
import { Swords, Bookmark, MessageSquare, RefreshCw, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATES = {
  no_results: {
    Icon: Swords,
    title: 'No Posts Match',
    body: 'No match posts match your current filters. Try clearing some filters or create your own post.',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
  },
  empty_feed: {
    Icon: Swords,
    title: 'No Posts Yet',
    body: 'No match request posts yet. Be the first to post your team\'s match request!',
    iconColor: 'text-[#B6FF3B]',
    iconBg: 'bg-[#B6FF3B]/10 border-[#B6FF3B]/30',
  },
  empty_saved: {
    Icon: Bookmark,
    title: 'No Saved Posts',
    body: 'You haven\'t bookmarked any match posts yet. Save interesting posts to find them here later.',
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/10 border-slate-500/30',
  },
  empty_my_posts: {
    Icon: PlusCircle,
    title: 'No Posts Created',
    body: 'You haven\'t created any match request posts yet. Create a post to find your next opponent.',
    iconColor: 'text-[#B6FF3B]',
    iconBg: 'bg-[#B6FF3B]/10 border-[#B6FF3B]/30',
  },
  empty_my_responses: {
    Icon: MessageSquare,
    title: 'No Responses Sent',
    body: 'You haven\'t responded to any match posts yet. Browse the feed and respond to posts that interest you.',
    iconColor: 'text-[#00D9FF]',
    iconBg: 'bg-[#00D9FF]/10 border-[#00D9FF]/30',
  },
  error: {
    Icon: RefreshCw,
    title: 'Something Went Wrong',
    body: 'An error occurred while loading posts.',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10 border-red-500/30',
  }
};

export default function FeedEmptyState({
  type = 'empty_feed',
  onClearFilters,
  onRetry,
  role,
}) {
  const state = STATES[type] || STATES.empty_feed;
  const { Icon } = state;

  return (
    <div className="p-8 sm:p-16 text-center bg-[#151B23] border border-[#293442] rounded-2xl space-y-5 shadow-xl">
      <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${state.iconBg}`}>
        <Icon className={`w-7 h-7 ${state.iconColor}`} />
      </div>
      <div className="max-w-sm mx-auto space-y-2">
        <h3 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase text-white tracking-wide">
          {state.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{state.body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {type === 'no_results' && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2530] text-white border border-[#293442] text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B6FF3B]" /> Clear Filters
          </button>
        )}
        {type === 'error' && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B2530] text-white border border-[#293442] text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#B6FF3B]" /> Try Again
          </button>
        )}
        {(role === 'captain' || role === 'organiser') && (
          <button
            type="button"
            className="flex items-center gap-1.5 px-5 py-2 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-xl hover:bg-[#a3ee28] transition-colors"
            onClick={() => document.getElementById('feed-composer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Create a Post
          </button>
        )}
        {!['captain', 'organiser'].includes(role) && type !== 'no_results' && type !== 'error' && (
          <Link
            to="/friendlies/register-team"
            className="flex items-center gap-1.5 px-5 py-2 bg-[#B6FF3B] text-[#0B0F14] font-bold text-xs rounded-xl hover:bg-[#a3ee28] transition-colors"
          >
            <Swords className="w-3.5 h-3.5" /> Register Your Team
          </Link>
        )}
      </div>
    </div>
  );
}

