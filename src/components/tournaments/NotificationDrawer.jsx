import React from 'react';
import { X, Bell, CheckCircle2, Info, AlertTriangle, Clock } from 'lucide-react';
import { formatTimeDisplay, formatDateDisplay } from '../../data/tournamentsData';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onMarkAsRead
}) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-drawer-title"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#141B24] border-l border-[#293442] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#293442] bg-[#0B0F14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 id="notif-drawer-title" className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                  Notifications
                </h2>
                <span className="text-xs text-[#94A3B8]">
                  {unreadCount} unread notification{unreadCount === 1 ? '' : 's'} (In-app demo)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-xs text-[#B6FF3B] hover:underline font-semibold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8] text-sm">
                No notifications to display.
              </div>
            ) : (
              notifications.map((item) => {
                const icon =
                  item.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : item.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-[#00D4FF] shrink-0" />
                  );

                return (
                  <div
                    key={item.id}
                    onClick={() => onMarkAsRead?.(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      !item.read
                        ? 'bg-[#1B2530] border-[#B6FF3B]/40 shadow-sm'
                        : 'bg-[#0B0F14]/70 border-[#293442] text-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-tight truncate">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-[#B6FF3B] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateDisplay(item.timestamp)} &bull; {formatTimeDisplay(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Notice footer */}
          <div className="p-3 bg-[#0B0F14] border-t border-[#293442] text-center text-[11px] text-[#94A3B8] italic">
            Email &amp; push delivery requires external notification service integration in production.
          </div>
        </div>
      </div>
    </div>
  );
}
