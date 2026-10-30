/**
 * src/components/friendlies/feed/PostSkeleton.jsx
 *
 * Loading skeleton for post cards.
 */
import React from 'react';

function Shimmer({ className }) {
  return (
    <div
      className={`bg-[#1B2530] rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-[#151B23] border border-[#293442] rounded-2xl p-5 space-y-4" aria-busy="true" aria-label="Loading post">
      <div className="flex items-center gap-3 pb-3 border-b border-[#293442]/70">
        <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3.5 w-32" />
          <Shimmer className="h-2.5 w-48" />
        </div>
      </div>
      <div className="space-y-2.5">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
        <Shimmer className="h-3 w-2/3" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Shimmer className="h-3 w-28" />
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-16" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-[#293442]/70">
        <Shimmer className="h-8 w-24 rounded-xl" />
        <Shimmer className="h-8 w-16 rounded-xl" />
        <Shimmer className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}

export function FeedSkeletons({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  );
}

