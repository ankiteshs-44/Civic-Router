import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { downloadICS } from '../utils/ics.js';

function formatDate(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + Number(offset || 0));
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function ResultCard({ result, complaintText, demo }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const urgency = ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'unknown';
  const timeline = Array.isArray(result.timeline) ? result.timeline : [];
  let portalUrl = '';
  try {
    const parsedPortalUrl = new URL(result.authority?.portal_url);
    if (parsedPortalUrl.protocol === 'https:') portalUrl = parsedPortalUrl.toString();
  } catch {
    portalUrl = '';
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied('failed');
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <article className="space-y-5">
      {demo && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <span className="font-bold">{t('demo.badge')}</span>
          <span>{t('demo.tip')}</span>
        </div>
      )}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t('result.categoryLabel')}</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{result.category}</h2>
          </div>
          <span className={`urgency-badge urgency-${urgency}`}>{t(`urgency.${urgency}`)}</span>
        </div>
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('result.locationLabel')}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{result.location || 'Location not specified'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('result.reportedIssue')}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-700">{complaintText}</p>
          </div>
        </div>
        {result.needs_followup && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-bold">{t('result.followupTitle')}</p>
            <p className="mt-1">{t('result.followupBody')}</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t('result.authorityLabel')}</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{result.authority?.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{result.authority?.department}</p>
        {urgency === 'high' && <p className="mt-3 text-xs font-semibold text-rose-700">{t('result.trustedEmergency')}</p>}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a href={`tel:${String(result.authority?.phone || '').replace(/[^\d+]/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800">
            <span aria-hidden="true">☎</span>{t('result.callNow')} · {result.authority?.phone}
          </a>
          {portalUrl ? (
            <a href={portalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
              {t('result.openPortal')}<span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              Portal link unavailable
            </span>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">{result.authority?.portal_name}</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">{t('result.letterTitle')}</h3>
          <button type="button" onClick={copyLetter} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            {copied === 'failed' ? t('result.copyFailed') : copied ? t('result.copied') : t('result.copyLetter')}
          </button>
        </div>
        <pre className="letter-box mt-4 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{result.letter}</pre>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">{t('timeline.title')}</h3>
          <button type="button" onClick={() => downloadICS(result)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            {t('timeline.downloadIcs')}
          </button>
        </div>
        {timeline.length ? (
          <ol className="mt-5">
            {timeline.map((step, index) => (
              <li key={`${step.step}-${index}`} className="timeline-item relative pb-6 pl-8 last:pb-0">
                <span className="timeline-dot absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-700" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{formatDate(step.day_offset)} · {step.day_offset === 0 ? t('timeline.today') : `${t('result.day')} ${step.day_offset}`}</p>
                <h4 className="mt-1 text-sm font-bold text-slate-900">{step.step}</h4>
                <p className="mt-1 text-sm leading-5 text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        ) : <p className="mt-4 text-sm text-slate-500">{t('result.timelineEmpty')}</p>}
      </section>
    </article>
  );
}
