import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext"; // কন্টেক্সট ইমপোর্ট
import { Bell, User, Menu, X, Trash2 } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // গ্লোবাল নোটিফিকেশন স্টেট ব্যবহার
  const { notifications, markAsRead, clearAll } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClearAll = (e) => {
    e.stopPropagation();
    clearAll();
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <Bell
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Notifications
                  </h4>
                  <button onClick={() => setShowNotifications(false)}>
                    <X
                      size={16}
                      className="text-slate-400 hover:text-red-500"
                    />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 text-sm border-b border-slate-50 cursor-pointer transition-all ${
                          !n.isRead
                            ? "bg-emerald-50/40 hover:bg-emerald-50"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          {!n.isRead && (
                            <div className="mt-1.5 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                          )}
                          <p
                            className={`${!n.isRead ? "font-medium text-slate-900" : "text-slate-500"}`}
                          >
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No new notifications</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={handleClearAll}
                      className="w-full py-2 text-[11px] font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Trash2 size={12} /> Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md">
                <User size={18} strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none mb-1">
                  {user?.username || "User"}
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[100px]">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
