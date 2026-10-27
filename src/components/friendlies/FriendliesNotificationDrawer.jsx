import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFriendlies } from '../../context/FriendliesContext';
import { formatDateDisplay, formatTimeDisplay } from '../../data/friendliesData';

export default function FriendliesNotificationDrawer({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useFriendlies();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#151B23] border-l border-[#293442] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#293442] bg-[#0B0F14] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#B6FF3B]/10 text-[#B6FF3B]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase text-white tracking-wide">
                  Match Notifications
                </h3>
                <span className="text-xs text-[#9CA3AF]">
                  {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs text-[#B6FF3B] hover:underline font-semibold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-[#9CA3AF] text-xs">
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
                    <Info className="w-4 h-4 text-[#00D9FF] shrink-0" />
                  );

                return (
                  <div
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
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
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.title}
                          </h4>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-[#B6FF3B] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                          <span>{formatDateDisplay(item.date)}</span>
                          {item.link && (
                            <Link
                              to={item.link}
                              onClick={onClose}
                              className="text-[#00D9FF] hover:underline flex items-center gap-0.5 font-semibold"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-[#0B0F14] border-t border-[#293442] text-center text-[11px] text-[#9CA3AF] italic">
            In-app prototype alerts. Email &amp; SMS alerts require a real notification service in production.
          </div>
        </div>
      </div>
    </div>
  );
}
