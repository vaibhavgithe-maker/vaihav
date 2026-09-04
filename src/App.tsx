import React, { useState, useEffect } from 'react';
import { User } from './types';
import { api, getStoredToken, clearStoredToken } from './api';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { NormalUserView } from './components/NormalUserView';
import { StoreOwnerView } from './components/StoreOwnerView';
import { AdminView } from './components/AdminView';
import { UpdatePasswordModal } from './components/UpdatePasswordModal';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'ios' | 'android'>('desktop');

  // Verify stored session on boot
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }

    api.getMe()
      .then((res) => {
        setCurrentUser(res.user);
      })
      .catch((err) => {
        console.warn('Session expired or invalid:', err);
        clearStoredToken();
        setCurrentUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    setCurrentUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">Platform Boot</div>
        <p className="text-xl font-black tracking-tighter italic">STORE.OS</p>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-white selection:text-black">
      {currentUser ? (
        <>
          <Navbar
            user={currentUser}
            onLogout={handleLogout}
            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
          />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {currentUser.role === 'admin' && <AdminView />}
            {currentUser.role === 'store_owner' && <StoreOwnerView />}
            {currentUser.role === 'normal' && <NormalUserView />}
          </main>
          <UpdatePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSuccess={() => {}}
          />
        </>
      ) : (
        <AuthView onLoginSuccess={(user) => setCurrentUser(user)} />
      )}
    </div>
  );

  return (
    <MobileDeviceFrame
      deviceMode={deviceMode}
      onDeviceModeChange={setDeviceMode}
      userRole={currentUser?.role}
    >
      {content}
    </MobileDeviceFrame>
  );
}
