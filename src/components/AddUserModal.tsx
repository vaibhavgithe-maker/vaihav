import React, { useState } from 'react';
import { UserPlus, X, AlertCircle, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { validateName, validateEmail, validateAddress, validatePassword } from '../validation';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'normal' | 'admin' | 'store_owner'>('normal');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time rule checks
  const nameOk = name.trim().length >= 20 && name.trim().length <= 60;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const addressOk = address.trim().length > 0 && address.trim().length <= 400;
  const passLengthOk = password.length >= 8 && password.length <= 16;
  const passUpperOk = /[A-Z]/.test(password);
  const passSpecialOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameVal = validateName(name);
    if (!nameVal.valid) {
      setError(nameVal.message || 'Invalid name');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      setError(emailVal.message || 'Invalid email');
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.valid) {
      setError(passVal.message || 'Invalid password');
      return;
    }

    const addrVal = validateAddress(address);
    if (!addrVal.valid) {
      setError(addrVal.message || 'Invalid address');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAdminUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        address: address.trim(),
        role,
      });

      setSuccessMsg('User created successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        setName('');
        setEmail('');
        setPassword('');
        setAddress('');
        setRole('normal');
        onUserAdded();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-8 animate-in fade-in zoom-in-95 text-white">
        <button
          id="close-add-user-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add New User</h2>
            <p className="text-xs text-white/50">Register an Administrator, Normal User, or Store Owner</p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selection */}
          <div>
            <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
              Assigned Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Normal User' },
                { id: 'store_owner', label: 'Store Owner' },
                { id: 'admin', label: 'Admin User' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`py-2 px-2.5 rounded-xl font-black uppercase tracking-wider text-[11px] border text-center transition-all cursor-pointer ${
                    role === r.id
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-[#161616] text-white/60 border-white/10 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Full Name</label>
              <span className={`text-[10px] font-mono ${nameOk ? 'text-emerald-400 font-bold' : 'text-white/40'}`}>
                {name.length}/60 (20–60 chars)
              </span>
            </div>
            <input
              id="admin-user-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Jonathan Sterling Patterson (20–60 characters)"
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
              Email Address
            </label>
            <input
              id="admin-user-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. user.name@domain.com"
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs font-mono"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Password</label>
              <span className="text-[10px] text-white/40">8–16 chars, 1 uppercase, 1 special</span>
            </div>
            <div className="relative">
              <input
                id="admin-user-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Must include uppercase & symbol (e.g. AdminPass123!)"
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded-md border ${passLengthOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/10 text-white/40'}`}>
                {passLengthOk ? '✓' : '•'} 8–16 chars
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${passUpperOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/10 text-white/40'}`}>
                {passUpperOk ? '✓' : '•'} 1 Uppercase
              </span>
              <span className={`px-2 py-0.5 rounded-md border ${passSpecialOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/10 text-white/40'}`}>
                {passSpecialOk ? '✓' : '•'} 1 Special (!@#$%)
              </span>
            </div>
          </div>

          {/* Address Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Physical Address</label>
              <span className={`text-[10px] font-mono ${addressOk ? 'text-emerald-400' : 'text-white/40'}`}>
                {address.length}/400 max
              </span>
            </div>
            <textarea
              id="admin-user-address-input"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="e.g. 742 Evergreen Terrace, Springfield, IL 62704"
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              id="cancel-add-user-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-user-btn"
              disabled={isSubmitting || !nameOk || !emailOk || !addressOk || !passLengthOk || !passUpperOk || !passSpecialOk}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
