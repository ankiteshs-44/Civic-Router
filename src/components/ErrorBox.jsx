import React from 'react';
import { AlertCircleIcon, RefreshIcon } from './Icons.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function ErrorBox({ message, onRetry }) {
  const { t } = useLanguage();

  return (
    <div
      role="alert"
      className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-950 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
    >
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-rose-900 dark:text-rose-100">{t('error.title')}</h4>
          <p className="mt-1 text-xs leading-5 text-rose-800 dark:text-rose-300">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:bg-rose-600 dark:hover:bg-rose-500"
              >
                <RefreshIcon className="h-3.5 w-3.5" />
                <span>{t('error.retry')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
