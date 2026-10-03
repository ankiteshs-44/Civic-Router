import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { downloadICS } from '../utils/ics.js';
import {
  PhoneIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  CalendarIcon,
  PrintIcon,
  AlertCircleIcon,
  EmblemIcon,
} from './Icons.jsx';

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
    if (parsedPortalUrl.protocol === 'https:' || parsedPortalUrl.protocol === 'http:') {
      portalUrl = parsedPortalUrl.toString();
    }
  } catch {
    portalUrl = '';
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied('failed');
      setTimeout(() => setCopied(false), 2200);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <article className="space-y-5">
      {/* Demo / Mock Notice */}
      {demo && (
        <div
          role="status"
          className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="font-extrabold uppercase tracking-wider">{t('demo.badge')}</span>
          </div>
          <span className="text-right text-[11px] opacity-90">{t('demo.tip')}</span>
        </div>
      )}

      {/* Category & Status Overview */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-colors sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {t('result.categoryLabel')}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {result.category}
            </h2>
          </div>
          <span className={`urgency-badge urgency-${urgency}`}>
            {urgency === 'high' && <AlertCircleIcon className="h-3.5 w-3.5" />}
            {t(`urgency.${urgency}`)}
          </span>
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('result.locationLabel')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {result.location || 'Navi Mumbai'}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('result.reportedIssue')}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
              {complaintText}
            </p>
          </div>
        </div>

        {result.needs_followup && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <div>
              <p className="font-bold">{t('result.followupTitle')}</p>
              <p className="mt-1 leading-relaxed">{t('result.followupBody')}</p>
            </div>
          </div>
        )}
      </section>

      {/* Authority & Action Card */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-colors sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t('result.authorityLabel')}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            ✓ Verified Authority
          </span>
        </div>

        <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
          {result.authority?.name}
        </h3>
        <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-400">
          {result.authority?.department}
        </p>

        {urgency === 'high' && (
          <div className="mt-3.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            ⚠️ {t('result.trustedEmergency')}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {result.authority?.phone ? (
            <a
              href={`tel:${String(result.authority.phone).replace(/[^\d+]/g, '')}`}
              className="inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl bg-teal-700 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-teal-800 focus-ring dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>{t('result.callNow')} · {result.authority.phone}</span>
            </a>
          ) : null}

          {portalUrl ? (
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>{t('result.openPortal')}</span>
              <ExternalLinkIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </a>
          ) : (
            <span className="inline-flex min-h-touch items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500">
              Portal link unavailable
            </span>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          {result.authority?.portal_name}
        </p>
      </section>

      {/* Official Grievance Letter */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-colors sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <EmblemIcon className="h-3.5 w-3.5" />
              <span>{t('result.officialDoc')}</span>
            </div>
            <h3 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
              {t('result.letterTitle')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label={t('result.print')}
              title={t('result.print')}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <PrintIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('result.print')}</span>
            </button>

            <button
              type="button"
              onClick={copyLetter}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold shadow-sm transition focus-ring ${
                copied === true
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : copied === 'failed'
                  ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {copied === true ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('result.copied')}</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-3.5 w-3.5" />
                  <span>{t('result.copyLetter')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Letter Container with Official Stationery Look */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-inner dark:border-slate-800 dark:bg-slate-950/50">
          <pre className="font-mono whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            {result.letter}
          </pre>
        </div>
      </section>

      {/* Escalation Timeline */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition-colors sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Escalation Protocol
            </p>
            <h3 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
              {t('timeline.title')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => downloadICS(result)}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('timeline.downloadIcs')}</span>
          </button>
        </div>

        {timeline.length ? (
          <ol className="mt-6">
            {timeline.map((step, index) => (
              <li key={`${step.step}-${index}`} className="timeline-item relative pb-6 pl-8 last:pb-0">
                <span
                  className={`timeline-dot absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 ${
                    index === 0
                      ? 'border-blue-100 bg-blue-700 ring-2 ring-blue-500/30 dark:border-blue-900/40 dark:bg-blue-500'
                      : 'border-slate-100 bg-slate-400 dark:border-slate-800 dark:bg-slate-600'
                  }`}
                  aria-hidden="true"
                />
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                  {formatDate(step.day_offset)} · {step.day_offset === 0 ? t('timeline.today') : `${t('result.day')} ${step.day_offset}`}
                </p>
                <h4 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {step.step}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t('result.timelineEmpty')}</p>
        )}
      </section>
    </article>
  );
}
