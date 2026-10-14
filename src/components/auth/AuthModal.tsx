import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login',
}) => {
  const { login, signup, loginWithGoogle, loginWithYahoo, resetPassword, oauthConfigNotice, clearOauthNotice, isFirebaseActive } = useAuth();
  const { theme } = useTheme();

  const [view, setView] = useState<'login' | 'signup' | 'forgot'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (view === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await signup(email, password, displayName);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else if (view === 'login') {
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } else if (view === 'forgot') {
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset link sent to your email.');
      } else {
        setErrorMsg(res.error || 'Failed to dispatch password reset.');
      }
    }
  };

  const handleOAuth = async (provider: 'google' | 'yahoo') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    const res = provider === 'google' ? await loginWithGoogle() : await loginWithYahoo();
    setLoading(false);
    if (res.success) {
      onClose();
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-[440px] rounded-[32px] p-8 shadow-2xl transition-all border ${
          theme === 'dark'
            ? 'bg-[#12131a] border-white/10 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(168,85,247,0.15)]'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition ${
            theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]' : 'text-gray-500 hover:text-gray-900 hover:bg-slate-100'
          }`}
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.4)] mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Your Account'}
            {view === 'forgot' && 'Reset Password'}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {view === 'login' && 'Sign in to access your personal smart home hub.'}
            {view === 'signup' && 'Register to manage customized appliance presets and history.'}
            {view === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Firebase Config Notice / OAuth Guidance Alert */}
        {oauthConfigNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-pink-400 mt-0.5" />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span>{oauthConfigNotice}</span>
              <button 
                onClick={clearOauthNotice}
                className="block mt-1 font-semibold text-pink-400 hover:underline"
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        )}

        {/* Error / Success feedback */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {view === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium mb-1 text-gray-400">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                    theme === 'dark' 
                      ? 'bg-[#181a24] border-white/10 text-white placeholder-gray-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                  theme === 'dark' 
                    ? 'bg-[#181a24] border-white/10 text-white placeholder-gray-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {view !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-gray-400">Password</label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                    theme === 'dark' 
                      ? 'bg-[#181a24] border-white/10 text-white placeholder-gray-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {view === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium mb-1 text-gray-400">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                    theme === 'dark' 
                      ? 'bg-[#181a24] border-white/10 text-white placeholder-gray-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-xs shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {view === 'login' && 'Sign In to Home'}
                  {view === 'signup' && 'Create Account'}
                  {view === 'forgot' && 'Send Reset Email'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* OAuth Dividers & Genuine Buttons */}
        {view !== 'forgot' && (
          <div className="mt-5">
            <div className="relative flex items-center justify-center mb-4">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`} />
              <span className={`absolute px-3 text-[10px] uppercase font-mono tracking-wider ${
                theme === 'dark' ? 'bg-[#12131a] text-gray-500' : 'bg-white text-gray-400'
              }`}>
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Genuine Google OAuth */}
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-medium transition active:scale-98 ${
                  theme === 'dark'
                    ? 'bg-[#191a24] hover:bg-[#222433] border-white/10 text-gray-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                aria-label={isFirebaseActive ? "Sign in with Google" : "Requires Firebase OAuth config in .env.local"}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              {/* Genuine Yahoo OAuth */}
              <button
                type="button"
                onClick={() => handleOAuth('yahoo')}
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-medium transition active:scale-98 ${
                  theme === 'dark'
                    ? 'bg-[#191a24] hover:bg-[#222433] border-white/10 text-gray-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                aria-label={isFirebaseActive ? "Sign in with Yahoo" : "Requires Firebase OAuth config in .env.local"}
              >
                <span className="font-bold text-[#6001d2] text-sm font-sans tracking-tight">Y!</span>
                <span>Yahoo</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switchers */}
        <div className="mt-6 text-center text-xs">
          {view === 'login' && (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setView('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}

          {view === 'signup' && (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          {view === 'forgot' && (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Remember your credentials?{' '}
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
