import React, { useEffect, useState } from 'react';
import { WifiOffIcon, CheckIcon } from './Icons.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function OfflineBanner() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 4000);
      return () => clearTimeout(timer);
    }
    function handleOffline() {
      setIsOffline(true);
      setJustReconnected(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (justReconnected) {
    return (
      <aside
        role="status"
        aria-live="polite"
        className="w-full bg-emerald-600 px-4 py-2 text-center text-xs font-bold text-white shadow-sm transition-all"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <CheckIcon className="h-4 w-4" />
          <span>{t('offline.reconnected') || 'Connection restored. Live routing is active.'}</span>
        </div>
      </aside>
    );
  }

  if (!isOffline) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="w-full border-b border-amber-300 bg-amber-500 px-4 py-2 text-center text-xs font-bold text-slate-950 shadow-sm dark:border-amber-700 dark:bg-amber-600 dark:text-white"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        <WifiOffIcon className="h-4 w-4 shrink-0 text-slate-950 dark:text-white" />
        <span>{t('offline.banner') || 'You are currently offline. You can still prepare complaints; local demo routing is active.'}</span>
      </div>
    </aside>
  );
}
