import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { FolderIcon, TrashIcon, ArrowRightIcon } from './Icons.jsx';

export default function MyComplaints({ items, onOpen, onDelete, onClear, onNewComplaint }) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-4xl" aria-labelledby="my-complaints-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700 dark:text-teal-400">
            {t('mine.localLabel')}
          </p>
          <h2 id="my-complaints-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {t('mine.title')}
          </h2>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-50 focus-ring dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            <span>{t('common.clearAll')}</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center sm:p-14 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <FolderIcon className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {t('mine.empty')}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            When you route an issue, a copy of the formal municipal letter and calendar timeline is safely saved in your local browser storage.
          </p>
          {onNewComplaint && (
            <button
              type="button"
              onClick={onNewComplaint}
              className="mt-6 inline-flex min-h-touch items-center gap-2 rounded-2xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 focus-ring dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              <span>{t('tabs.new')}</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:flex-row sm:items-center sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {item.result?.category || 'Civic complaint'}
                  </h3>
                  <span className={`urgency-badge urgency-${item.result?.urgency || 'unknown'}`}>
                    {item.result?.urgency || 'unknown'}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs text-slate-700 dark:text-slate-300">
                  {item.text}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  {t('mine.savedOn')}{' '}
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.savedAt))}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="inline-flex min-h-touch items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 focus-ring dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {t('mine.view')}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  aria-label={`${t('mine.delete')} ${item.result?.category || 'complaint'}`}
                  className="inline-flex min-h-touch items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus-ring dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/60 dark:hover:text-rose-300"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
