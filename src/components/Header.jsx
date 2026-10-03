/**
 * Header.jsx
 *
 * App title and one-line value proposition. Kept intentionally minimal so the
 * form (the primary action) stays above the fold on a 375px-wide phone.
 */
export default function Header() {
  return (
    <header className="mb-6 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        Navi Mumbai · Civic help
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Navi Mumbai Civic Router
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
        Tell us the problem. We&rsquo;ll tell you who to complain to.
      </p>
    </header>
  );
}
