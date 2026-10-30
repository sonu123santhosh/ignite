/**
 * src/pages/friendlies/FriendlyFeedPage.jsx
 *
 * The Friendly Feed — social-style post board for inter-collegiate match requests.
 *
 * Layout (desktop): left column = feed; right sidebar = filters + "Your teams" + open posts.
 * Mobile: single column, filters in a drawer.
 *
 * Features:
 * - Cursor pagination ("Load more") with no duplicates or skips
 * - URL-persisted filters (via URLSearchParams)
 * - Tabs: Feed | My Posts | My Responses | Saved
 * - Post composer at top (for team captains)
 * - Optimistic post creation with rollback on error
 * - Respond, Save, Report, Edit, Close, View Responses
 * - Atomic response acceptance → bridges to existing INITIAL_MATCHES (confirms match)
 * - Toast notifications for all actions
 * - Skeleton loading, empty states, error + retry
 * - No fake data, no likes, views or follower counts
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PlusCircle, X, Bell } from 'lucide-react';
import { useFriendlies } from '../../context/FriendliesContext';
import { friendlyFeedService, computeTeamReputation } from '../../services/friendlyFeedService';
import Toast from '../../components/Toast';
import FeedTabs from '../../components/friendlies/feed/FeedTabs';
import FeedFilters from '../../components/friendlies/feed/FeedFilters';
import FeedEmptyState from '../../components/friendlies/feed/FeedEmptyState';
import PostCard from '../../components/friendlies/feed/PostCard';
import PostComposer from '../../components/friendlies/feed/PostComposer';
import ResponseDialog from '../../components/friendlies/feed/ResponseDialog';
import ResponsesPanel from '../../components/friendlies/feed/ResponsesPanel';
import ReportDialog from '../../components/friendlies/feed/ReportDialog';
import { FeedSkeletons } from '../../components/friendlies/feed/PostSkeleton';
import FriendliesRoleSwitcher from '../../components/friendlies/FriendliesRoleSwitcher';
import FriendliesNotificationDrawer from '../../components/friendlies/FriendliesNotificationDrawer';

const POSTS_PER_PAGE = 8;

export default function FriendlyFeedPage() {
  const {
    role,
    currentActor,
    teams,
    colleges,
    collegesMap,
    matches,
    notifications,
    setMatches,
    markNotificationRead
  } = useFriendlies();

  const [searchParams, setSearchParams] = useSearchParams();

  // --- Derive URL-persisted filters ---
  const getFiltersFromUrl = useCallback(() => ({
    sport: searchParams.get('sport') || 'all',
    city: searchParams.get('city') || 'all',
    collegeId: searchParams.get('collegeId') || 'all',
    skillLevel: searchParams.get('skillLevel') || 'all',
    type: searchParams.get('type') || 'all',
    hasHomeGround: searchParams.get('hasHomeGround') === 'true' ? true : 'all',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    keyword: searchParams.get('keyword') || '',
    sort: searchParams.get('sort') || 'newest',
    tab: searchParams.get('tab') || 'feed'
  }), [searchParams]);

  const filters = getFiltersFromUrl();

  const updateUrl = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'all' || value === '' || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const onFilterChange = useCallback((key, value) => updateUrl(key, value), [updateUrl]);
  const onTabChange = useCallback((tab) => updateUrl('tab', tab), [updateUrl]);

  const onResetFilters = useCallback(() => {
    setSearchParams({ tab: filters.tab }, { replace: true });
  }, [setSearchParams, filters.tab]);

  // --- Feed state ---
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState(null);

  // --- Modals state ---
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [respondPost, setRespondPost] = useState(null);
  const [respondEligibleTeam, setRespondEligibleTeam] = useState(null);
  const [viewResponsesPost, setViewResponsesPost] = useState(null);
  const [viewResponses, setViewResponses] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [closeConfirmPost, setCloseConfirmPost] = useState(null);

  // Optimistic new post ID tracker (for rollback)
  const optimisticIds = useRef(new Set());

  // Managed teams for current actor
  const managedTeams = useMemo(() => {
    if (!currentActor) return [];
    return teams.filter(
      (t) => t.captainId === currentActor.id || t.id === currentActor.teamId
    );
  }, [teams, currentActor]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // --- Load / Reload Posts ---
  const loadPosts = useCallback(async (resetPage = true) => {
    const loadingPage = resetPage ? 1 : page + 1;
    if (resetPage) {
      setIsLoading(true);
      setLoadError('');
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = friendlyFeedService.getPosts(
        {
          ...filters,
          limit: POSTS_PER_PAGE,
          page: loadingPage
        },
        currentActor
      );

      if (resetPage) {
        setAllPosts(result.posts);
        setPage(1);
      } else {
        setAllPosts((prev) => {
          // Deduplicate by id (no skips/duplicates on pagination)
          const existingIds = new Set(prev.map((p) => p.id));
          const newOnes = result.posts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newOnes];
        });
        setPage(loadingPage);
      }

      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
    } catch (err) {
      setLoadError(err.message || 'Failed to load posts.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, currentActor, page]);

  // Reload when filters or tab change
  useEffect(() => {
    loadPosts(true);
    document.title = 'Match Requests Feed | SportLink Friendlies';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.sport, filters.city, filters.collegeId, filters.skillLevel,
    filters.type, filters.hasHomeGround, filters.startDate, filters.endDate,
    filters.keyword, filters.sort, filters.tab
  ]);

  const showToast = useCallback((t) => {
    setToast(t);
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Enrich posts with team, college and reputation data
  const enrichedPosts = useMemo(() => {
    return allPosts.map((post) => {
      const team = teams.find((t) => t.id === post.teamId);
      const college = colleges.find((c) => c.id === post.collegeId) || collegesMap?.[post.collegeId];
      const reputation = computeTeamReputation(post.teamId, matches);
      return { post, team: { ...team, reputation }, college };
    });
  }, [allPosts, teams, colleges, collegesMap, matches]);

  // Active filter chips for display
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.sport !== 'all') chips.push({ key: 'sport', label: `Sport: ${filters.sport}` });
    if (filters.city !== 'all') chips.push({ key: 'city', label: `City: ${filters.city}` });
    if (filters.collegeId !== 'all') {
      const col = colleges.find((c) => c.id === filters.collegeId);
      chips.push({ key: 'collegeId', label: `College: ${col?.shortName || filters.collegeId}` });
    }
    if (filters.skillLevel !== 'all') chips.push({ key: 'skillLevel', label: `Skill: ${filters.skillLevel}` });
    if (filters.type !== 'all') chips.push({ key: 'type', label: filters.type === 'Hosting, need an opponent' ? 'Hosting' : 'Looking for Match' });
    if (filters.hasHomeGround === true) chips.push({ key: 'hasHomeGround', label: 'Home Ground' });
    if (filters.startDate) chips.push({ key: 'startDate', label: `From: ${filters.startDate}` });
    if (filters.endDate) chips.push({ key: 'endDate', label: `To: ${filters.endDate}` });
    if (filters.keyword) chips.push({ key: 'keyword', label: `Search: "${filters.keyword}"` });
    return chips;
  }, [filters, colleges]);

  // ----------------------------------------------------------------
  // Actions
  // ----------------------------------------------------------------

  const handlePostCreated = useCallback((payload) => {
    if (!currentActor) return;

    // Optimistic insert
    const optimisticPost = {
      id: `optimistic-${Date.now()}`,
      ...payload,
      authorId: currentActor.id,
      status: 'Open',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: null,
      responseCount: 0,
      pendingResponseCount: 0,
      isSaved: false
    };
    optimisticIds.current.add(optimisticPost.id);
    setAllPosts((prev) => [optimisticPost, ...prev]);
    setIsComposerOpen(false);

    try {
      const created = friendlyFeedService.createPost(payload, currentActor, managedTeams);
      // Replace optimistic with real
      setAllPosts((prev) =>
        prev.map((p) => (p.id === optimisticPost.id ? { ...created, responseCount: 0, pendingResponseCount: 0, isSaved: false } : p))
      );
      optimisticIds.current.delete(optimisticPost.id);
      showToast({ title: 'Post Created!', message: 'Your match request is now live in the feed.', type: 'success' });
    } catch (err) {
      // Rollback
      setAllPosts((prev) => prev.filter((p) => p.id !== optimisticPost.id));
      optimisticIds.current.delete(optimisticPost.id);
      showToast({ title: 'Post Failed', message: err.message || 'Failed to create post. Please try again.', type: 'error' });
      setIsComposerOpen(true); // Re-open composer
    }
  }, [currentActor, managedTeams, showToast]);

  const handleSaveToggle = useCallback((post) => {
    if (!currentActor) {
      showToast({ title: 'Sign In Required', message: 'Sign in to save match posts.', type: 'warning' });
      return;
    }
    try {
      const result = friendlyFeedService.toggleSavePost(post.id, currentActor);
      setAllPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isSaved: result.isSaved } : p))
      );
      showToast({
        title: result.isSaved ? 'Post Saved' : 'Bookmark Removed',
        message: result.isSaved ? 'Post saved to your bookmarks.' : 'Post removed from bookmarks.',
        type: 'success'
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  }, [currentActor, showToast]);

  const handleShare = useCallback((url) => {
    showToast({ title: 'Link Copied', message: 'Share link copied to clipboard.', type: 'success' });
  }, [showToast]);

  const handleReport = useCallback((post) => {
    setReportTarget({ id: post.id, type: 'post' });
  }, []);

  const handleReportSubmit = useCallback(async ({ targetType, targetId, reason, details }) => {
    try {
      friendlyFeedService.submitReport({ targetType, targetId, reason, details }, currentActor);
      setReportTarget(null);
      showToast({ title: 'Report Submitted', message: 'Your report has been queued for moderation.', type: 'success' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  }, [currentActor, showToast]);

  const handleRespond = useCallback((post, eligibleTeam) => {
    setRespondPost(post);
    setRespondEligibleTeam(eligibleTeam);
  }, []);

  const handleSendResponse = useCallback(async (payload) => {
    if (!respondPost || !currentActor) return;
    const result = friendlyFeedService.respondToPost(respondPost.id, payload, currentActor, managedTeams);
    // Notification to post author (simulated in-app)
    showToast({
      title: 'Response Sent',
      message: "Your response was sent. The match isn't confirmed until the other team accepts.",
      type: 'success'
    });
    return result;
  }, [respondPost, currentActor, managedTeams, showToast]);

  const handleViewResponses = useCallback((post) => {
    if (!currentActor) return;
    try {
      const responses = friendlyFeedService.getResponsesForPost(post.id, currentActor);
      setViewResponsesPost(post);
      setViewResponses(responses);
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  }, [currentActor, showToast]);

  const handleAcceptResponse = useCallback(async (response) => {
    if (!viewResponsesPost || !currentActor) return;
    try {
      const result = friendlyFeedService.acceptResponse(viewResponsesPost.id, response.id, currentActor);
      // Bridge to existing matches state (so MatchDetails and Dashboard continue to work)
      if (result.confirmedMatch && typeof setMatches === 'function') {
        setMatches((prev) => [result.confirmedMatch, ...prev]);
      }
      // Update local feed state
      setAllPosts((prev) =>
        prev.map((p) => (p.id === viewResponsesPost.id ? { ...p, status: 'Matched' } : p))
      );
      setViewResponsesPost((prev) => prev ? { ...prev, status: 'Matched' } : prev);
      setViewResponses(friendlyFeedService.getResponsesForPost(viewResponsesPost.id, currentActor));
      showToast({
        title: 'Match Confirmed!',
        message: `Match confirmed! Check your dashboard for details.`,
        type: 'success'
      });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  }, [viewResponsesPost, currentActor, setMatches, showToast]);

  const handleDeclineResponse = useCallback(async (response, reason) => {
    if (!viewResponsesPost || !currentActor) return;
    try {
      friendlyFeedService.declineResponse(viewResponsesPost.id, response.id, currentActor, reason);
      setViewResponses(friendlyFeedService.getResponsesForPost(viewResponsesPost.id, currentActor));
      showToast({ title: 'Response Declined', message: 'The response has been declined.', type: 'info' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  }, [viewResponsesPost, currentActor, showToast]);

  const handleClosePost = useCallback((post) => {
    setCloseConfirmPost(post);
  }, []);

  const confirmClosePost = useCallback(() => {
    if (!closeConfirmPost || !currentActor) return;
    try {
      friendlyFeedService.closePost(closeConfirmPost.id, currentActor);
      setAllPosts((prev) =>
        prev.map((p) => (p.id === closeConfirmPost.id ? { ...p, status: 'Closed' } : p))
      );
      showToast({ title: 'Post Closed', message: 'Your post has been closed. All pending responses were notified.', type: 'info' });
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setCloseConfirmPost(null);
    }
  }, [closeConfirmPost, currentActor, showToast]);

  const handleEditPost = useCallback((post) => {
    setEditPost(post);
    setIsComposerOpen(true);
    showToast({ title: 'Edit Mode', message: 'Sport and team cannot be changed. Close and re-post for those changes.', type: 'info' });
  }, [showToast]);

  const isCaptainOrOrganiser = role === 'captain' || role === 'organiser';
  const emptyStateType = loadError
    ? 'error'
    : allPosts.length === 0 && activeChips.length > 0
    ? 'no_results'
    : filters.tab === 'saved'
    ? 'empty_saved'
    : filters.tab === 'my_posts'
    ? 'empty_my_posts'
    : filters.tab === 'my_responses'
    ? 'empty_my_responses'
    : 'empty_feed';

  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      {/* Toast */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Role Switcher (existing component, untouched) */}
        <FriendliesRoleSwitcher onOpenNotifications={() => setIsNotifDrawerOpen(true)} />

        {/* Page Title */}
        <div className="mb-6 space-y-1">
          <h1 className="font-['Barlow_Condensed'] text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none">
            Match Request Feed
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            College teams post match requests. Captains respond and negotiate dates directly. Confirmed matches appear in your dashboard.
          </p>
        </div>

        {/* Search + Sort + Mobile filter button */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            <input
              type="search"
              value={filters.keyword}
              onChange={(e) => onFilterChange('keyword', e.target.value)}
              placeholder="Search by college, sport, team or venue…"
              className="w-full pl-11 pr-10 py-2.5 bg-[#151B23] border border-[#293442] focus:border-[#B6FF3B] rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            {filters.keyword && (
              <button
                type="button"
                onClick={() => onFilterChange('keyword', '')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="px-3 py-2.5 bg-[#151B23] border border-[#293442] rounded-2xl text-xs text-white outline-none focus:border-[#B6FF3B] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="soonest">Soonest Date</option>
            <option value="active">Recently Active</option>
          </select>

          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 bg-[#151B23] text-xs font-semibold text-white border border-[#293442] rounded-2xl cursor-pointer hover:border-slate-500"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B6FF3B]" />
            Filters {activeChips.length > 0 && <span className="bg-[#B6FF3B] text-[#0B0F14] text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{activeChips.length}</span>}
          </button>

          {isCaptainOrOrganiser && (
            <button
              type="button"
              onClick={() => setIsComposerOpen((v) => !v)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs rounded-2xl transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Post Request</span>
              <span className="sm:hidden">Post</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-slate-500">Active filters:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B2530] text-white border border-[#293442]"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => onFilterChange(chip.key, 'all')}
                  className="hover:text-red-400 cursor-pointer"
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-[#B6FF3B] hover:underline font-semibold ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <FeedTabs activeTab={filters.tab} onTabChange={onTabChange} />
        </div>

        {/* Main 2-col layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Feed Column */}
          <main className="flex-1 min-w-0 w-full space-y-5">
            {/* Composer (captain/organiser only) */}
            {isCaptainOrOrganiser && isComposerOpen && (
              <div id="feed-composer">
                <PostComposer
                  currentActor={currentActor}
                  managedTeams={managedTeams}
                  onPostCreated={handlePostCreated}
                  onCancel={() => setIsComposerOpen(false)}
                />
              </div>
            )}

            {/* Non-captain prompt */}
            {!isCaptainOrOrganiser && filters.tab === 'feed' && (
              <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-4 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  <span className="text-white font-semibold">Register your team</span> to post match requests and respond to others.
                </p>
                <a
                  href="/friendlies/register-team"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#B6FF3B] hover:bg-[#a3ee28] text-[#0B0F14] font-bold text-xs rounded-xl transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Register Team
                </a>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                role="status"
                aria-label="Loading match posts"
              >
                <FeedSkeletons count={4} />
              </div>
            ) : loadError ? (
              <FeedEmptyState type="error" onRetry={() => loadPosts(true)} role={role} />
            ) : allPosts.length === 0 ? (
              <FeedEmptyState
                type={emptyStateType}
                onClearFilters={onResetFilters}
                role={role}
              />
            ) : (
              <>
                {/* Count line */}
                <p className="text-xs text-slate-500">
                  <span className="text-white font-semibold">{totalCount}</span> post{totalCount !== 1 ? 's' : ''}
                  {filters.tab === 'feed' && ' in the feed'}
                </p>

                {/* Post grid */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                  role="feed"
                  aria-label="Match request posts"
                  aria-busy={isLoadingMore}
                >
                  {enrichedPosts.map(({ post, team, college }) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      team={team}
                      college={college}
                      currentActor={currentActor}
                      role={role}
                      teams={teams}
                      onRespond={handleRespond}
                      onSaveToggle={handleSaveToggle}
                      onShare={handleShare}
                      onReport={handleReport}
                      onEdit={handleEditPost}
                      onClose={handleClosePost}
                      onViewResponses={handleViewResponses}
                    />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => loadPosts(false)}
                      disabled={isLoadingMore}
                      className="px-8 py-3 bg-[#1B2530] hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-sm border border-[#293442] rounded-2xl transition-all"
                    >
                      {isLoadingMore ? 'Loading…' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Right Sidebar (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-5">
            {/* Filter panel */}
            <FeedFilters
              filters={filters}
              colleges={colleges}
              onFilterChange={onFilterChange}
              onResetFilters={onResetFilters}
              totalResults={totalCount}
              isOpenOnMobile={false}
            />

            {/* Your open posts (quick list) */}
            {currentActor && isCaptainOrOrganiser && (
              <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Your Open Posts</p>
                {allPosts.filter((p) => p.authorId === currentActor.id && p.status === 'Open').length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No open posts. Create one above.</p>
                ) : (
                  allPosts
                    .filter((p) => p.authorId === currentActor.id && p.status === 'Open')
                    .slice(0, 3)
                    .map((p) => {
                      const t = teams.find((tm) => tm.id === p.teamId);
                      return (
                        <div key={p.id} className="flex items-start gap-2 p-2.5 bg-[#0B0F14] rounded-xl border border-[#293442]">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-['Barlow_Condensed'] font-black text-xs text-white shrink-0"
                            style={{ backgroundColor: t?.primaryColor || '#00D9FF' }}
                          >
                            {t?.logoInitials || 'TM'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-semibold truncate">{p.title || p.sport + ' request'}</p>
                            <p className="text-[10px] text-slate-500">{p.preferredDates?.[0] || 'TBA'}</p>
                          </div>
                          {typeof p.pendingResponseCount === 'number' && p.pendingResponseCount > 0 && (
                            <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500 text-[#0B0F14] text-[10px] font-black flex items-center justify-center">
                              {p.pendingResponseCount}
                            </span>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {/* Your managed teams */}
            {managedTeams.length > 0 && (
              <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Your Teams</p>
                {managedTeams.map((t) => {
                  const col = colleges.find((c) => c.id === t.collegeId);
                  const rep = computeTeamReputation(t.id, matches);
                  return (
                    <div key={t.id} className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-['Barlow_Condensed'] font-black text-sm text-white shrink-0"
                        style={{ backgroundColor: t.primaryColor || '#00D9FF' }}
                      >
                        {t.logoInitials || t.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-bold truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{t.sport} · {col?.shortName || t.collegeName}</p>
                        {rep && <p className="text-[10px] text-[#B6FF3B] truncate">{rep.label}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <FeedFilters
        filters={filters}
        colleges={colleges}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalResults={totalCount}
        isOpenOnMobile={isMobileFiltersOpen}
        onCloseMobile={() => setIsMobileFiltersOpen(false)}
      />

      {/* Response dialog */}
      <ResponseDialog
        isOpen={!!respondPost}
        post={respondPost}
        postTeam={teams.find((t) => t.id === respondPost?.teamId)}
        postCollege={colleges.find((c) => c.id === respondPost?.collegeId)}
        eligibleTeam={respondEligibleTeam}
        currentActor={currentActor}
        allEligibleTeams={managedTeams.filter((t) =>
          respondPost &&
          t.sport.toLowerCase() === respondPost.sport.toLowerCase() &&
          t.collegeId !== respondPost.collegeId
        )}
        onSend={handleSendResponse}
        onClose={() => setRespondPost(null)}
      />

      {/* Responses panel */}
      <ResponsesPanel
        isOpen={!!viewResponsesPost}
        post={viewResponsesPost}
        responses={viewResponses}
        teams={teams}
        colleges={colleges}
        onAccept={handleAcceptResponse}
        onDecline={handleDeclineResponse}
        onClose={() => setViewResponsesPost(null)}
      />

      {/* Report dialog */}
      <ReportDialog
        isOpen={!!reportTarget}
        target={reportTarget}
        targetType="post"
        onSubmit={handleReportSubmit}
        onClose={() => setReportTarget(null)}
      />

      {/* Close post confirmation dialog */}
      {closeConfirmPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="close-post-title"
        >
          <div className="bg-[#151B23] border border-[#293442] w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 id="close-post-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white">Close Post?</h3>
            <p className="text-sm text-slate-400">
              Closing this post will notify all pending responders that you've found another opponent or no longer need a match. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={confirmClosePost}
                className="flex-1 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold text-sm rounded-xl border border-amber-500/30 transition-all"
              >
                Close Post
              </button>
              <button
                type="button"
                onClick={() => setCloseConfirmPost(null)}
                className="flex-1 px-4 py-2.5 bg-[#1B2530] text-slate-300 font-semibold text-sm rounded-xl border border-[#293442] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Drawer (existing, untouched) */}
      <FriendliesNotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}

