import React from 'react';
import { Store, ShieldCheck, UserCheck, KeyRound, LogOut, Smartphone, Monitor } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
  deviceMode: 'desktop' | 'ios' | 'android';
  onDeviceModeChange: (mode: 'desktop' | 'ios' | 'android') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenPasswordModal,
  deviceMode,
  onDeviceModeChange,
}) => {
  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case 'store_owner':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Store className="w-3 h-3" />
            Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <UserCheck className="w-3 h-3" />
            Normal User
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black shadow-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tighter italic text-white">
                  STORE.OS
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-[0.25em] text-white/40 border border-white/15 px-2 py-0.5 rounded-full">
                  Platform
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 hidden sm:block font-medium">
                Autonomous Store Rating Engine
              </p>
            </div>
          </div>

          {/* Device Mockup Switcher for Reviewers (Desktop / iOS / Android) */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
            <button
              id="device-desktop-btn"
              onClick={() => onDeviceModeChange('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              id="device-ios-btn"
              onClick={() => onDeviceModeChange('ios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                deviceMode === 'ios'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iOS</span>
            </button>
            <button
              id="device-android-btn"
              onClick={() => onDeviceModeChange('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                deviceMode === 'android'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-white max-w-[200px] truncate" title={user.name}>
                {user.name}
              </span>
              <div className="mt-1">{getRoleBadge()}</div>
            </div>

            <div className="sm:hidden">{getRoleBadge()}</div>

            {/* Password Update Button */}
            <button
              id="nav-change-password-btn"
              onClick={onOpenPasswordModal}
              title="Update Password"
              className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all border border-white/10 cursor-pointer"
              aria-label="Change Password"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              id="nav-logout-btn"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
