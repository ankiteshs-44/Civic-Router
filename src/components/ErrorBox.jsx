/**
 * ErrorBox.jsx
 *
 * Friendly, non-technical failure state shown when routing a complaint fails.
 * Offers a single, obvious recovery action: Retry.
 *
 * @param {object} props
 * @param {string} [props.message] - optional technical detail (shown subtly)
 * @param {() => void} props.onRetry - re-runs the last complaint
 */
export default function ErrorBox({ message, onRetry }) {
  return (
    <section
      role="alert"
      className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-red-800">
            We couldn&rsquo;t route your complaint
          </h2>
          <p className="mt-1 text-sm text-red-700">
            Something went wrong on our side. Please check your connection and try again.
          </p>
          {message ? (
            <p className="mt-2 break-words text-xs text-red-500/90">{message}</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Retry
      </button>
    </section>
  );
}
