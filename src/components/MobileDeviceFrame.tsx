import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Store, ShieldCheck, UserCheck, Smartphone, Monitor } from 'lucide-react';
import { UserRole } from '../types';

interface MobileDeviceFrameProps {
  deviceMode: 'desktop' | 'ios' | 'android';
  onDeviceModeChange: (mode: 'desktop' | 'ios' | 'android') => void;
  userRole?: UserRole;
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  deviceMode,
  onDeviceModeChange,
  children,
}) => {
  if (deviceMode === 'desktop') {
    return <>{children}</>;
  }

  const isIOS = deviceMode === 'ios';

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-6 px-2 sm:px-4 flex flex-col items-center justify-start text-white">
      {/* Device Toolbar Switcher */}
      <div className="mb-4 bg-[#111] border border-white/10 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-3 text-xs text-white/70 shadow-2xl">
        <span className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-white" />
          Simulator:
        </span>
        <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onDeviceModeChange('ios')}
            className={`px-3 py-1 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
              isIOS ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            iOS (iPhone 16 Pro)
          </button>
          <button
            onClick={() => onDeviceModeChange('android')}
            className={`px-3 py-1 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
              !isIOS ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            Android (Pixel 9 Pro)
          </button>
        </div>
        <button
          onClick={() => onDeviceModeChange('desktop')}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider transition-colors ml-2 cursor-pointer"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit to Desktop</span>
        </button>
      </div>

      {/* Realistic Mobile Device Container */}
      <div
        className={`w-full max-w-[420px] h-[860px] max-h-[92vh] bg-[#0A0A0A] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative border-[10px] ${
          isIOS ? 'border-[#222]' : 'border-[#262626]'
        }`}
      >
        {/* Status Bar */}
        <div className="bg-[#0A0A0A] text-white px-7 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold font-mono shrink-0 z-50 border-b border-white/5">
          <span>9:41</span>

          {/* Dynamic Island / Camera Notch */}
          {isIOS ? (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ml-auto mr-2" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-black mx-auto border border-white/10" />
          )}

          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A] relative pb-10">
          {children}
        </div>

        {/* Bottom Gesture / Home Bar */}
        <div className="bg-[#0A0A0A] pt-2 pb-3 flex justify-center shrink-0 border-t border-white/10 z-50">
          {isIOS ? (
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          ) : (
            <div className="flex items-center justify-around w-full max-w-[200px] text-white/40">
              <div className="w-3 h-3 rounded-full border-2 border-white/40" />
              <div className="w-3 h-3 border-2 border-white/40 rounded-xs" />
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-white/40" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
