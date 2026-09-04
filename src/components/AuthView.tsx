import React, { useState, useEffect } from 'react';
import { Store, UserCheck, ShieldCheck, KeyRound, AlertCircle, Check, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api, setStoredToken } from '../api';
import { User } from '../types';
import { validateName, validateEmail, validatePassword, validateAddress } from '../validation';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [activeMode, setActiveMode] = useState<'login' | 'signup'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Demo accounts
  const [demoAccounts, setDemoAccounts] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    api.getDemoAccounts()
      .then((data) => setDemoAccounts(data))
      .catch((err) => console.error('Failed to load demo credentials:', err));
  }, []);

  // Validation indicators for signup
  const nameLength = name.trim().length;
  const nameValid = nameLength >= 20 && nameLength <= 60;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passLength = password.length >= 8 && password.length <= 16;
  const passUpper = /[A-Z]/.test(password);
  const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const addressLength = address.trim().length;
  const addressValid = addressLength > 0 && addressLength <= 400;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      setError(nameCheck.message || 'Name validation failed');
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.message || 'Email validation failed');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setError(passCheck.message || 'Password validation failed');
      return;
    }

    const addrCheck = validateAddress(address);
    if (!addrCheck.valid) {
      setError(addrCheck.message || 'Address validation failed');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        password,
      });

      setSuccessMsg('Account registered successfully! Logging you in...');
      setStoredToken(res.token);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (accountType: 'admin' | 'storeOwner' | 'normalUser') => {
    if (!demoAccounts || !demoAccounts[accountType]) return;
    const creds = demoAccounts[accountType];
    setEmail(creds.email);
    setPassword(creds.password);
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login({ email: creds.email, password: creds.password });
      setStoredToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-black shadow-2xl mb-3">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">
            Store Rating Platform
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-sm mx-auto font-medium">
            Single unified login for Administrators, Store Owners, and Normal Community Users
          </p>
        </div>

        {/* Quick Demo Logins Pill Box */}
        <div className="bg-[#111] rounded-2xl p-4 border border-white/10 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Demo Personas
            </span>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Instant switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              id="demo-login-admin"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              id="demo-login-owner"
              onClick={() => handleQuickDemoLogin('storeOwner')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Store Owner</span>
            </button>
            <button
              type="button"
              id="demo-login-normal"
              onClick={() => handleQuickDemoLogin('normalUser')}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Normal User</span>
            </button>
          </div>
        </div>

        {/* Main Auth Container */}
        <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#161616] p-1.5 rounded-2xl mb-6 border border-white/10">
            <button
              id="auth-mode-login-tab"
              type="button"
              onClick={() => {
                setActiveMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeMode === 'login'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              id="auth-mode-signup-tab"
              type="button"
              onClick={() => {
                setActiveMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeMode === 'signup'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign Up (Normal User)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {activeMode === 'login' ? (
            /* ==========================================
               LOGIN FORM
               ========================================== */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
                  Email Address
                </label>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs pr-10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="pt-3 text-center text-white/50 text-[11px]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveMode('signup')}
                  className="text-white font-black hover:underline cursor-pointer uppercase tracking-wider ml-1"
                >
                  Register as Normal User
                </button>
              </div>
            </form>
          ) : (
            /* ==========================================
               SIGNUP FORM (NORMAL USER)
               ========================================== */
            <form onSubmit={handleSignup} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Full Name</label>
                  <span className={`text-[10px] font-mono ${nameValid ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                    {nameLength}/60 (20–60 chars)
                  </span>
                </div>
                <input
                  id="signup-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Alexandra Montgomery Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Email Address</label>
                  {email.length > 0 && (
                    <span className={`text-[10px] ${emailValid ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                      {emailValid ? 'Valid email format' : 'Invalid email'}
                    </span>
                  )}
                </div>
                <input
                  id="signup-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. alexandra.smith@personamail.org"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs font-medium font-mono"
                />
              </div>

              {/* Password with live rules */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Password</label>
                  <span className="text-[10px] text-white/40">8–16 chars, 1 uppercase, 1 special</span>
                </div>
                <div className="relative">
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Must meet strict security criteria"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs pr-10 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password validation indicators */}
                <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                  <span className={`px-2 py-0.5 rounded-md border ${passLength ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/10 text-white/40'}`}>
                    {passLength ? '✓' : '•'} 8–16 chars
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border ${passUpper ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/10 text-white/40'}`}>
                    {passUpper ? '✓' : '•'} 1 Uppercase
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border ${passSpecial ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/10 text-white/40'}`}>
                    {passSpecial ? '✓' : '•'} 1 Special (!@#$%)
                  </span>
                </div>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Physical Address</label>
                  <span className={`text-[10px] font-mono ${addressValid ? 'text-emerald-400' : 'text-white/40'}`}>
                    {addressLength}/400 max
                  </span>
                </div>
                <textarea
                  id="signup-address-input"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="e.g. 742 Evergreen Terrace Residential Court, Springfield, IL 62704"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 resize-none text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                id="signup-submit-btn"
                disabled={isLoading || !nameValid || !emailValid || !passLength || !passUpper || !passSpecial || !addressValid}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="pt-3 text-center text-white/50 text-[11px]">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setActiveMode('login')}
                  className="text-white font-black hover:underline cursor-pointer uppercase tracking-wider ml-1"
                >
                  Log in to your account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
