import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function Header({ activeTab, onTabChange }) {
  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-xl text-white shadow-sm" aria-hidden="true">
            <span>⌖</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">{t('app.title')}</h1>
            <p className="text-xs text-slate-500 sm:text-sm">{t('app.tagline')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Choose language" className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {languages.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                  language === code ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <nav aria-label="Main navigation" className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onTabChange('new')}
              aria-current={activeTab === 'new' ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
                activeTab === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabs.new')}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('mine')}
              aria-current={activeTab === 'mine' ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm ${
                activeTab === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabs.mine')}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
