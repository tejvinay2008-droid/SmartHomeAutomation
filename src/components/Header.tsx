import React, { useState } from 'react';
import { 
  Mic, 
  Bell, 
  RefreshCw, 
  Trash2, 
  ChevronDown, 
  Sun, 
  Moon, 
  LogOut, 
  Settings,
  LogIn 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenVoiceModal: () => void;
  onResetDemo: () => void;
  onClearHistory: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoiceModal,
  onResetDemo,
  onClearHistory,
  onOpenProfile,
  onOpenAuth,
  unreadCount = 2,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = user?.displayName || 'Sarah M.';

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 pt-2 border-b border-white/[0.08] dark:border-white/[0.06] border-slate-200">
      <div>
        <h1 className="text-3xl md:text-4xl font-normal tracking-tight dark:text-white/95 text-slate-900">
          Good morning, <span className="font-medium dark:text-white text-purple-700">{displayName.split(' ')[0]}.</span>
        </h1>
        <div className="flex items-center gap-3 mt-1 text-sm font-medium dark:text-gray-400 text-slate-500">
          <span>
            Outside <strong className="text-[#f59e0b] font-semibold">27°C</strong>
          </span>
          <span className="text-gray-500">•</span>
          <span>
            Inside <strong className="text-[#38bdf8] font-semibold">22°C</strong>
          </span>
          <span className="text-gray-500">•</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Home Secure
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-auto">
        {/* Instant Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full dark:bg-[#1b1c24] dark:hover:bg-[#252733] bg-slate-100 hover:bg-slate-200 text-gray-500 dark:text-gray-400 dark:hover:text-white hover:text-slate-900 transition border dark:border-white/5 border-slate-300 active:scale-95"
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition hover:rotate-90 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-purple-600 transition -rotate-12 duration-300" />
          )}
        </button>

        {/* Reset Demo button */}
        <button
          onClick={onResetDemo}
          className="p-2.5 rounded-full dark:bg-[#1b1c24] dark:hover:bg-[#252733] bg-slate-100 hover:bg-slate-200 text-gray-500 dark:text-gray-400 dark:hover:text-white hover:text-slate-900 transition border dark:border-white/5 border-slate-300 active:scale-95 group relative"
          aria-label="Reset demo states and appliances"
        >
          <RefreshCw className="w-4 h-4 transition group-hover:rotate-180 duration-500" />
          <span className="sr-only">Reset Demo</span>
        </button>

        {/* Prominent Microphone Trigger */}
        <button
          onClick={onOpenVoiceModal}
          id="mic-voice-btn"
          className="relative group flex items-center justify-center p-3 rounded-full bg-gradient-to-tr from-[#222430] to-[#2a2c3a] dark:from-[#222430] dark:to-[#2a2c3a] hover:from-[#312a45] hover:to-[#432d5e] border border-purple-500/40 text-purple-300 hover:text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_28px_rgba(236,72,153,0.45)] transition-all duration-300 active:scale-95"
          aria-label="Open Voice Command Assistant"
        >
          <Mic className="w-5 h-5 text-pink-300 group-hover:text-pink-200 transition" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 rounded-full dark:bg-[#1b1c24] dark:hover:bg-[#252733] bg-slate-100 hover:bg-slate-200 text-gray-500 dark:text-gray-400 dark:hover:text-white hover:text-slate-900 transition border dark:border-white/5 border-slate-300 relative active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#1b1c24]" />
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 border ${
              theme === 'dark' ? 'bg-[#1b1c26] border-white/10 text-gray-300' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-semibold">
                <span>SYSTEM ALERTS</span>
                <span className="text-purple-400">All caught up</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-100'}`}>
                  <p className="font-medium">Motion sensor active</p>
                  <p className="text-gray-400 text-[11px]">Office motion detected at normal threshold.</p>
                </div>
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-100'}`}>
                  <p className="font-medium">HVAC optimization</p>
                  <p className="text-gray-400 text-[11px]">Thermostat set to 22°C based on morning schedule.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Pill */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2.5 py-1.5 px-3 rounded-full border transition active:scale-98 ${
                theme === 'dark' 
                  ? 'bg-[#1b1c24] hover:bg-[#242633] border-white/5' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <img
                src={
                  user.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                }
                alt={user.displayName || 'Resident'}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-400/50"
              />
              <span className="text-sm font-medium dark:text-gray-200 text-slate-800 max-w-[90px] truncate">
                {user.displayName || 'Resident'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showProfileMenu && (
              <div className={`absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl p-2 z-50 text-xs border ${
                theme === 'dark' ? 'bg-[#1b1c26] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="font-semibold truncate">{user.displayName || 'Resident'}</p>
                  <p className="text-gray-400 text-[11px] truncate">{user.email || 'Local User'}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {user.providerId}
                  </span>
                </div>

                <div className="pt-1 space-y-1">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition ${
                      theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/[0.05]' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-purple-400" />
                    <span>Account & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onResetDemo();
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition ${
                      theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-white/[0.05]' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                    <span>Reset Demo Preset</span>
                  </button>

                  <button
                    onClick={() => {
                      onClearHistory();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Activity History</span>
                  </button>

                  <div className="pt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
