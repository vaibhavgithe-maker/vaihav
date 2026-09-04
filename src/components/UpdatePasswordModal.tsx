import React, { useState } from 'react';
import { KeyRound, X, Check, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../api';
import { validatePassword } from '../validation';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const lengthOk = newPassword.length >= 8 && newPassword.length <= 16;
  const uppercaseOk = /[A-Z]/.test(newPassword);
  const specialOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword);
  const matchOk = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    const valResult = validatePassword(newPassword);
    if (!valResult.valid) {
      setError(valResult.message || 'Invalid new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.updatePassword({ currentPassword, newPassword });
      setSuccessMessage(res.message || 'Password updated successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative animate-in fade-in zoom-in-95 duration-200 text-white">
        <button
          id="close-password-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Update Password</h2>
            <p className="text-xs text-white/50">Secure your account with fresh credentials</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-password-input"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password-input"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs pr-10"
                placeholder="8–16 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Password Rules Checklist */}
            <div className="mt-2.5 p-3 rounded-xl bg-[#161616] border border-white/10 space-y-1.5 text-xs">
              <div className={`flex items-center gap-2 ${lengthOk ? 'text-emerald-400 font-semibold' : 'text-white/40'}`}>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${lengthOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                  {lengthOk ? '✓' : '•'}
                </div>
                <span>Length: 8 to 16 characters ({newPassword.length}/16)</span>
              </div>
              <div className={`flex items-center gap-2 ${uppercaseOk ? 'text-emerald-400 font-semibold' : 'text-white/40'}`}>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${uppercaseOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                  {uppercaseOk ? '✓' : '•'}
                </div>
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 ${specialOk ? 'text-emerald-400 font-semibold' : 'text-white/40'}`}>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${specialOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                  {specialOk ? '✓' : '•'}
                </div>
                <span>At least one special character (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1.5">
              Confirm New Password
            </label>
            <input
              id="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs"
              placeholder="Confirm new password"
            />
            {confirmPassword.length > 0 && !matchOk && (
              <p className="text-[11px] font-semibold text-rose-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              id="cancel-password-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-password-btn"
              disabled={isSubmitting || !lengthOk || !uppercaseOk || !specialOk || !matchOk}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Updating...</span>
                </>
              ) : (
                'Save Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
