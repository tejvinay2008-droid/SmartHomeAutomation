import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Trash2, 
  LogOut, 
  Sun, 
  Moon, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateDisplayName, changePassword, deleteAccount, resetPassword } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !user) return null;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!displayName.trim()) {
      setStatusMsg({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    setLoading(true);
    const res = await updateDisplayName(displayName.trim());
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Display name updated successfully.' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update name.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    const res = await changePassword(newPassword);
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  const handleSendResetEmail = async () => {
    if (!user.email) return;
    setStatusMsg(null);
    setLoading(true);
    const res = await resetPassword(user.email);
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Password reset email sent.' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to send reset email.' });
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const res = await deleteAccount();
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete account.' });
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div 
        className={`relative w-full max-w-xl rounded-[32px] p-6 sm:p-8 shadow-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-[#12131a] border-white/10 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.15)]'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition ${
            theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]' : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100'
          }`}
          aria-label="Close profile modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Identity Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
          <div className="relative">
            <img
              src={
                user.photoURL ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80'
              }
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/40 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#12131a] flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight">{user.displayName || 'Resident'}</h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-2 mt-0.5`}>
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email || 'Anonymous Session'}</span>
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Provider: {user.providerId}
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                ID: {user.uid.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-3 border-b border-white/[0.06] text-xs">
          <button
            onClick={() => { setActiveTab('profile'); setStatusMsg(null); }}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => { setActiveTab('appearance'); setStatusMsg(null); }}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              activeTab === 'appearance'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Theme & Appearance
          </button>
          <button
            onClick={() => { setActiveTab('security'); setStatusMsg(null); }}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Security & Access
          </button>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div className={`my-4 p-3 rounded-2xl text-xs flex items-start gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <span className="flex-1">{statusMsg.text}</span>
          </div>
        )}

        {/* TAB 1: PROFILE INFO */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateName} className="py-4 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full rounded-2xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                  theme === 'dark' 
                    ? 'bg-[#181a24] border-white/10 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">Account Created</label>
              <input
                type="text"
                disabled
                value={new Date(user.createdAt).toLocaleString()}
                className={`w-full rounded-2xl py-2.5 px-4 text-xs opacity-60 border ${
                  theme === 'dark' ? 'bg-[#181a24] border-white/10 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition shadow active:scale-95 disabled:opacity-50"
              >
                Save Profile Changes
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-gray-300 hover:text-white transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: APPEARANCE & THEME SWITCHING */}
        {activeTab === 'appearance' && (
          <div className="py-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Theme Preferences</h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                Choose your preferred visual presentation. Instant switching without reloading.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                    themeMode === 'dark'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-semibold">Dark Mode</span>
                  <span className="text-[10px] text-gray-500 font-mono">Luxury Charcoal</span>
                </button>

                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                    themeMode === 'light'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-700 dark:text-purple-200 ring-2 ring-purple-500/30'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-semibold">Light Mode</span>
                  <span className="text-[10px] text-gray-500 font-mono">Crisp Slate</span>
                </button>

                {/* System Mode */}
                <button
                  type="button"
                  onClick={() => setThemeMode('system')}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                    themeMode === 'system'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Laptop className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-semibold">System Default</span>
                  <span className="text-[10px] text-gray-500 font-mono">Auto Follow OS</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-400 flex items-center justify-between">
              <span>Active Render Theme:</span>
              <span className="font-mono uppercase font-semibold text-purple-400">{theme}</span>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & DANGER ZONE */}
        {activeTab === 'security' && (
          <div className="py-4 space-y-5">
            {/* Change Password */}
            {user.providerId === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-3 pb-4 border-b border-white/[0.06]">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Update Account Password</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={`w-full rounded-2xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                        theme === 'dark' ? 'bg-[#181a24] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-2xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                        theme === 'dark' ? 'bg-[#181a24] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    disabled={loading || !newPassword}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition disabled:opacity-40"
                  >
                    Save New Password
                  </button>

                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}

            {/* Danger Zone: Account Deletion */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone: Account Deletion</span>
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Permanently delete your profile and all associated appliance preferences, activity logs, and voice automation history.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-rose-500/30 space-y-2">
                  <p className="text-xs text-rose-300 font-semibold">
                    Are you completely sure? This action cannot be reversed.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                    >
                      Confirm Permanent Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
