'use client';

import { useEffect, useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { useRouter } from 'next/navigation';

// Session timeout in milliseconds (5 minutes)
const SESSION_TIMEOUT = 5 * 60 * 1000;

export function SessionTimeout() {
  const { clearWallet, isLoaded } = useWalletContext();
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [warningVisible, setWarningVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_TIMEOUT / 1000);

  // Reset timer on user activity
  const resetTimer = () => {
    setLastActivity(Date.now());
    setWarningVisible(false);
  };

  useEffect(() => {
    if (!isLoaded) return;

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Check inactivity every second
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
      
      setTimeLeft(Math.floor(remaining / 1000));

      // Show warning 60 seconds before timeout
      if (remaining < 60000 && remaining > 0) {
        setWarningVisible(true);
      }
      
      // Log out after inactivity
      if (elapsed >= SESSION_TIMEOUT) {
        clearWallet();
        router.push('/');
      }
    }, 1000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [lastActivity, clearWallet, router, isLoaded]);

  if (!isLoaded || !warningVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-md shadow-md max-w-sm">
      <h3 className="font-semibold text-yellow-800 mb-1">Session timeout warning</h3>
      <p className="text-yellow-700 text-sm mb-2">
        Your session will expire in {timeLeft} seconds due to inactivity.
      </p>
      <button 
        onClick={resetTimer}
        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
      >
        Stay logged in
      </button>
    </div>
  );
}