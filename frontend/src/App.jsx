import { useState } from 'react';
import { submitComplaint } from './api/client.js';
import { useLanguage } from './i18n/LanguageContext.jsx';
import Header from './components/Header.jsx';
import ComplaintForm from './components/ComplaintForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import MyComplaints from './components/MyComplaints.jsx';
import { loadComplaints, saveComplaint, deleteComplaint, clearComplaints } from './utils/storage.js';

export default function App() {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState('new');
  const [result, setResult] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(loadComplaints);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit({ text, image_base64 }) {
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

  function openSaved(item) {
    setResult(item.result);
    setComplaintText(item.text);
    setDemo(false);
    setError('');
    setTab('new');
  }

  function removeSaved(id) {
    setSaved(deleteComplaint(id));
  }

  function removeAllSaved() {
    setSaved(clearComplaints());
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header activeTab={tab} onTabChange={setTab} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {tab === 'mine' ? (
          <MyComplaints items={saved} onOpen={openSaved} onDelete={removeSaved} onClear={removeAllSaved} />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">NMMC · Navi Mumbai</p>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('home.heading')}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  {t('home.description')}
                </p>
              </div>
              <ComplaintForm key={formKey} onSubmit={handleSubmit} busy={busy} />
              {error && (
                <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <strong>{t('error.title')}:</strong> {error}
                </div>
              )}
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                <span aria-hidden="true" className="text-base">🔒</span>
                <p>{t('home.privacy')}</p>
              </div>
            </section>
            <section aria-live="polite" className="min-w-0">
              {result ? (
                <ResultCard result={result} complaintText={complaintText} demo={demo} />
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-3xl">🧭</div>
                  <h3 className="text-lg font-bold text-slate-800">Your route will appear here</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Submit a civic issue to see its category, responsible authority, formal letter and follow-up timeline.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500">
        {t('footer.disclaimer')}
      </footer>
    </div>
  );
}
