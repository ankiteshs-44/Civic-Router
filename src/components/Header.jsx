import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { EmblemIcon, SunIcon, MoonIcon, FolderIcon } from './Icons.jsx';

export default function Header({ activeTab, onTabChange, savedCount = 0 }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-blue-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        {t('a11y.skipToContent')}
      </a>

      <header className="relative z-30 md:sticky md:top-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          
          {/* Logo & Civic Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-md ring-2 ring-blue-500/20 dark:from-blue-600 dark:to-indigo-800">
              <EmblemIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">NMMC · Navi Mumbai</span>
              </div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                {t('app.title')}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Controls: Language, Theme & Navigation */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Language Selector */}
            <div
              role="group"
              aria-label="Choose language"
              className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-inner dark:border-slate-700 dark:bg-slate-800"
            >
              {languages.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  aria-pressed={language === code}
                  className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-bold transition focus-ring ${
                    language === code
                      ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t('theme.toggle')}
              title={t('theme.toggle')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isDark ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5 text-slate-600" />}
            </button>

            {/* Tabs */}
            <nav aria-label="Main navigation" className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onTabChange('new')}
                aria-current={activeTab === 'new' ? 'page' : undefined}
                className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-bold transition focus-ring sm:text-sm ${
                  activeTab === 'new'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {t('tabs.new')}
              </button>
              <button
                type="button"
                onClick={() => onTabChange('mine')}
                aria-current={activeTab === 'mine' ? 'page' : undefined}
                className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition focus-ring sm:text-sm ${
                  activeTab === 'mine'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <span>{t('tabs.mine')}</span>
                {savedCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
