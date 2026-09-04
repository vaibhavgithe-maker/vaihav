import React from 'react';
import { User, Store, Star, Mail, MapPin, ShieldCheck, UserCheck, X, Calendar } from 'lucide-react';
import { User as UserType } from '../types';
import { StarRating } from './StarRating';

interface UserDetailsModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const isStoreOwner = user.role === 'store_owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative my-8 animate-in fade-in zoom-in-95 text-white">
        <button
          id="close-user-details-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-black text-xl border border-white/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">User Profile</h2>
            <div className="mt-1.5">
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <ShieldCheck className="w-3 h-3" /> System Administrator
                </span>
              )}
              {user.role === 'store_owner' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Store className="w-3 h-3" /> Store Owner
                </span>
              )}
              {user.role === 'normal' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  <UserCheck className="w-3 h-3" /> Normal User
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Name */}
          <div className="bg-[#161616] p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-1">
              Full Legal Name
            </span>
            <p className="text-sm font-black text-white">{user.name}</p>
          </div>

          {/* Email */}
          <div className="bg-[#161616] p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-1">
              Email Address
            </span>
            <p className="text-sm font-medium text-white font-mono flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-white/40" />
              {user.email}
            </p>
          </div>

          {/* Address */}
          <div className="bg-[#161616] p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-1">
              Physical Address
            </span>
            <p className="text-xs text-white/80 leading-relaxed flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
              {user.address}
            </p>
          </div>

          {/* If the user is a Store Owner, their rating should also be displayed */}
          {isStoreOwner && (
            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-400" /> Store Owner Rating
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                  Owned Store
                </span>
              </div>

              {user.store ? (
                <div className="space-y-2 mt-2">
                  <p className="font-black text-white text-base">{user.store.name}</p>
                  <div className="flex items-center gap-3">
                    <StarRating
                      value={user.store.avgRating !== null ? Math.round(user.store.avgRating) : 0}
                      readOnly
                      size="sm"
                    />
                    <span className="text-sm font-black text-amber-400">
                      {user.store.avgRating !== null ? `${user.store.avgRating} / 5` : 'No ratings yet'}
                    </span>
                    <span className="text-xs text-white/40">
                      ({user.store.totalRatings} {user.store.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-white/60 text-xs">
                  <p>No store currently associated with this store owner.</p>
                  <p className="text-white/40 mt-0.5">Rating: Not Applicable (Unassigned)</p>
                </div>
              )}
            </div>
          )}

          {user.createdAt && (
            <div className="text-[10px] font-mono text-white/40 flex items-center gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              Registered on {new Date(user.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            id="close-user-details-footer-btn"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
