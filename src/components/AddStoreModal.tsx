import React, { useState, useEffect } from 'react';
import { Store, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';
import { validateEmail, validateAddress } from '../validation';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreAdded: () => void;
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({ isOpen, onClose, onStoreAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState<string>('');
  const [availableOwners, setAvailableOwners] = useState<User[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch users who can be assigned as store owner
      setLoadingOwners(true);
      api.getAdminUsers()
        .then((users) => {
          // Filter store owners or any user who could become owner
          setAvailableOwners(users);
        })
        .catch((err) => console.error('Error fetching users for owner assignment:', err))
        .finally(() => setLoadingOwners(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const addressOk = address.trim().length > 0 && address.trim().length <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Store name is required');
      return;
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      setError(emailVal.message || 'Invalid email');
      return;
    }

    const addrVal = validateAddress(address);
    if (!addrVal.valid) {
      setError(addrVal.message || 'Invalid address');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createAdminStore({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId: ownerId || undefined,
      });

      setSuccessMsg('Store created successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        setName('');
        setEmail('');
        setAddress('');
        setOwnerId('');
        onStoreAdded();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-8 animate-in fade-in zoom-in-95 text-white">
        <button
          id="close-add-store-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add New Store</h2>
            <p className="text-xs text-white/50">Register a new retail location on the rating platform</p>
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
          {/* Store Name */}
          <div>
            <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
              Store Name
            </label>
            <input
              id="admin-store-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Blue Bottle Specialty Coffee & Roastery"
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs font-medium"
            />
          </div>

          {/* Store Email */}
          <div>
            <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
              Store Contact Email
            </label>
            <input
              id="admin-store-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. contact@bluebottleroasters.com"
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 text-xs font-medium font-mono"
            />
          </div>

          {/* Store Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-black text-white/70 uppercase text-[10px] tracking-[0.2em]">Physical Address</label>
              <span className={`text-[10px] font-mono ${addressOk ? 'text-emerald-400' : 'text-white/40'}`}>
                {address.length}/400 max
              </span>
            </div>
            <textarea
              id="admin-store-address-input"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="e.g. 315 Linden Street, Hayes Valley, San Francisco, CA 94102"
              className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 resize-none text-xs font-medium"
            />
          </div>

          {/* Assign Store Owner */}
          <div>
            <label className="block font-black text-white/70 uppercase text-[10px] tracking-[0.2em] mb-1.5">
              Assign Store Owner (Optional)
            </label>
            <select
              id="admin-store-owner-select"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 text-white bg-[#161616] focus:outline-none focus:border-white/50 text-xs font-medium"
            >
              <option value="">-- No Owner Assigned Yet --</option>
              {availableOwners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'store_owner' ? 'Store Owner' : u.role}) - {u.email}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-white/40 mt-1">
              Selecting a user will link this store to their account so they can access their store dashboard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              id="cancel-add-store-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-store-btn"
              disabled={isSubmitting || !name.trim() || !emailOk || !addressOk}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>Adding Store...</span>
                </>
              ) : (
                'Add Store'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
