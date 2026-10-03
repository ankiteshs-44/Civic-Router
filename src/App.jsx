import React, { useState, useRef } from 'react';
import { submitComplaint } from './api/client.js';
import { useLanguage } from './i18n/LanguageContext.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import Header from './components/Header.jsx';
import ComplaintForm from './components/ComplaintForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import MyComplaints from './components/MyComplaints.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import ErrorBox from './components/ErrorBox.jsx';
import SkeletonResult from './components/SkeletonResult.jsx';
import { CompassIcon, ShieldLockIcon } from './components/Icons.jsx';
import { loadComplaints, saveComplaint, deleteComplaint, clearComplaints } from './utils/storage.js';

function AppContent() {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState('new');
  const [result, setResult] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(loadComplaints);
  const [formKey, setFormKey] = useState(0);
  const lastSubmissionRef = useRef(null);

  async function handleRouting({ text, image_base64 }) {
    lastSubmissionRef.current = { text, image_base64 };
    setError('');
    setBusy(true);
    try {
      const response = await submitComplaint({ text, image_base64, language });
      setResult(response.data);
      setComplaintText(text);
      setDemo(response.demo);
      setSaved(saveComplaint({ text, result: response.data }));
      setFormKey((current) => current + 1);
    } catch (submitError) {
      setError(submitError.message || t('error.title'));
    } finally {
      setBusy(false);
    }
  }

  function handleRetry() {
    if (lastSubmissionRef.current) {
      handleRouting(lastSubmissionRef.current);
    }
  }

  function openSaved(item) {
    setResult(item.result);
    setComplaintText(item.text);
    setDemo(false);
    setError('');
    setTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function removeSaved(id) {
    setSaved(deleteComplaint(id));
  }

  function removeAllSaved() {
    setSaved(clearComplaints());
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <OfflineBanner />
      <Header activeTab={tab} onTabChange={setTab} savedCount={saved.length} />

      <main id="main-content" tabIndex="-1" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {tab === 'mine' ? (
          <MyComplaints
            items={saved}
            onOpen={openSaved}
            onDelete={removeSaved}
            onClear={removeAllSaved}
            onNewComplaint={() => setTab('new')}
          />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            
            {/* Left Column: Form & Privacy info (sticky on desktop) */}
            <div className="lg:sticky lg:top-20 space-y-4">
              <section
                aria-labelledby="intake-heading"
                className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-colors sm:p-7 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-5">
                  <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    NMMC · Citizen Router
                  </span>
                  <h2 id="intake-heading" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl dark:text-white">
                    {t('home.heading')}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">
                    {t('home.description')}
                  </p>
                </div>

                <ComplaintForm key={formKey} onSubmit={handleRouting} busy={busy} />

                {error && <ErrorBox message={error} onRetry={handleRetry} />}

                <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                  <ShieldLockIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                  <p>{t('home.privacy')}</p>
                </div>
              </section>
            </div>

            {/* Right Column: Results / Skeleton / Empty state */}
            <section aria-live="polite" className="min-w-0">
              {busy ? (
                <SkeletonResult />
              ) : result ? (
                <ResultCard result={result} complaintText={complaintText} demo={demo} />
              ) : (
                <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                    <CompassIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                    Your municipal route will appear here
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Submit an issue or tap any 1-tap preset to identify the department, generate a formal complaint letter, and receive escalation reminders.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200/80 bg-white px-4 py-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('footer.disclaimer')}</span>
          <span className="font-semibold text-slate-400 dark:text-slate-500">Navi Mumbai Municipal Corporation</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
