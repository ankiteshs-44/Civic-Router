import { useEffect, useRef, useState } from 'react';

/**
 * ResultCard.jsx
 *
 * Renders the structured routing response returned by submitComplaint():
 *   - category + urgency badges (red / amber / green),
 *   - the detected location,
 *   - the responsible authority (name + department),
 *   - a big "Call now" button (tel: link) and an "Open complaint portal" button,
 *   - the formal complaint letter in a bordered box with a "Copy letter" button.
 *
 * @param {object} props
 * @param {object} props.result - response object following the README JSON contract
 */

// How long the "Copied!" confirmation stays visible (ms).
const COPIED_RESET_MS = 2000;

// Urgency -> colour tokens. Unknown values fall back to a neutral grey badge.
const URGENCY_STYLES = {
  high: {
    label: 'High urgency',
    badge: 'bg-red-100 text-red-700 ring-red-600/20',
    dot: 'bg-red-500',
  },
  medium: {
    label: 'Medium urgency',
    badge: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low urgency',
    badge: 'bg-green-100 text-green-700 ring-green-600/20',
    dot: 'bg-green-500',
  },
  unknown: {
    label: 'Urgency unknown',
    badge: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    dot: 'bg-slate-400',
  },
};

function getUrgencyStyle(urgency) {
  const key = String(urgency || '').toLowerCase();
  return URGENCY_STYLES[key] || URGENCY_STYLES.unknown;
}

/**
 * Copy text to the clipboard, falling back to a hidden textarea +
 * document.execCommand for browsers without the async Clipboard API.
 * @param {string} text
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

export default function ResultCard({ result }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const resetTimer = useRef(null);

  // Clear any pending "Copied!" timer when the card unmounts.
  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  if (!result) return null;

  const authority = result.authority || {};
  const urgency = getUrgencyStyle(result.urgency);

  async function handleCopy() {
    try {
      await copyToClipboard(result.letter || '');
      setCopyFailed(false);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopyFailed(false), COPIED_RESET_MS);
    }
  }

  return (
    <section className="mt-6 space-y-4">
      {/* Summary card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20">
            {result.category}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${urgency.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
            {urgency.label}
          </span>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Location
            </p>
            <p className="text-sm font-medium text-slate-800">
              {result.location || 'Not detected'}
            </p>
          </div>
        </div>

        {/* Authority */}
        <div className="mt-4 flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-6h6v6" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Complain to
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {authority.name || 'Unknown authority'}
            </p>
            {authority.department ? (
              <p className="text-sm text-slate-600">{authority.department}</p>
            ) : null}
          </div>
        </div>

        {/* Primary actions */}
        <div className="mt-5 space-y-3">
          {authority.phone ? (
            <a
              href={`tel:${authority.phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
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
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call now
            </a>
          ) : null}

          {authority.portal_url ? (
            <a
              href={authority.portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
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
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
              Open complaint portal
            </a>
          ) : null}

          {authority.portal_name ? (
            <p className="text-center text-xs text-slate-500">{authority.portal_name}</p>
          ) : null}
        </div>
      </div>

      {/* Formal letter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">Your complaint letter</h2>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            {copied ? (
              <>
                <svg
                  className="h-4 w-4 text-teal-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Copied!
              </>
            ) : copyFailed ? (
              'Copy failed'
            ) : (
              'Copy letter'
            )}
          </button>
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700">
            {result.letter}
          </pre>
        </div>
      </div>
    </section>
  );
}
