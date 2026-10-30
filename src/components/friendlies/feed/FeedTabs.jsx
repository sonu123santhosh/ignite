/**
 * src/components/friendlies/feed/FeedTabs.jsx
 *
 * Tab navigation for the social feed:
 *   Feed | My Posts | My Responses | Saved
 */
import React from 'react';
import { LayoutGrid, FileText, MessageSquare, Bookmark } from 'lucide-react';

const TABS = [
  { id: 'feed',         label: 'Feed',         Icon: LayoutGrid },
  { id: 'my_posts',     label: 'My Posts',     Icon: FileText },
  { id: 'my_responses', label: 'My Responses', Icon: MessageSquare },
  { id: 'saved',        label: 'Saved',        Icon: Bookmark },
];

export default function FeedTabs({ activeTab, onTabChange }) {
  return (
    <div
      className="flex items-center gap-1 bg-[#0B0F14] border border-[#293442] rounded-2xl p-1.5 overflow-x-auto scrollbar-none"
      role="tablist"
      aria-label="Feed tabs"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              isActive
                ? 'bg-[#B6FF3B] text-[#0B0F14] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#1B2530]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

