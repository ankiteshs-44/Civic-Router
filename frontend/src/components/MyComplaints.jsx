import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function MyComplaints({ items, onOpen, onDelete, onClear }) {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">{t('mine.localLabel')}</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{t('mine.title')}</h2>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={onClear} className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">
            {t('common.clearAll')}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mb-4 text-4xl" aria-hidden="true">📂</div>
          <p className="font-semibold text-slate-700">{t('mine.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{item.result?.category || 'Civic complaint'}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">{item.result?.urgency || 'unknown'}</span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-700">{item.text}</p>
                <p className="mt-1 text-xs text-slate-500">{t('mine.savedOn')} {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.savedAt))}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => onOpen(item)} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800">{t('mine.view')}</button>
                <button type="button" onClick={() => onDelete(item.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">{t('mine.delete')}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
