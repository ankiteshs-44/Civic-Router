import Spinner from './Spinner.jsx';

/**
 * ComplaintForm.jsx
 *
 * The primary input surface:
 *   - a textarea for the plain-language complaint,
 *   - three tappable example chips that fill the textarea, and
 *   - a submit button that is disabled until the text is at least 5 characters.
 *
 * While a request is in flight the button is disabled and a spinner with the
 * "Analyzing your complaint..." message is shown underneath.
 *
 * @param {object} props
 * @param {string} props.value      - current complaint text (controlled)
 * @param {(text: string) => void} props.onChange - update the complaint text
 * @param {() => void} props.onSubmit - called when the form is submitted
 * @param {boolean} [props.isLoading] - true while the complaint is being routed
 */

// Minimum number of characters (after trimming) required to enable submit.
const MIN_LENGTH = 5;

// Ready-made examples so users can try the app in one tap.
const EXAMPLES = [
  'Drain overflowing near Sector 4, Vashi',
  'Streetlight not working on Palm Beach Road since a week',
  'Cars parked illegally outside Vashi railway station',
];

export default function ComplaintForm({ value, onChange, onSubmit, isLoading = false }) {
  const isTooShort = value.trim().length < MIN_LENGTH;
  const isDisabled = isTooShort || isLoading;

  function handleSubmit(event) {
    event.preventDefault();
    if (isDisabled) return;
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <label htmlFor="complaint" className="block text-sm font-semibold text-slate-800">
        Describe the problem
      </label>
      <p className="mt-1 text-xs text-slate-500">
        Plain language is fine — no need for official terms.
      </p>

      <textarea
        id="complaint"
        name="complaint"
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isLoading}
        placeholder="e.g. Drain overflowing near Sector 4, Vashi"
        className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:bg-slate-50 disabled:text-slate-500"
      />

      <div className="mt-3">
        <span className="text-xs font-medium text-slate-500">Try an example:</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange(example)}
              disabled={isLoading}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-5 w-full rounded-xl bg-teal-600 px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        Find the right authority
      </button>

      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-teal-50 px-4 py-4 text-teal-700"
        >
          <Spinner className="h-5 w-5" />
          <span className="text-sm font-medium">Analyzing your complaint...</span>
        </div>
      )}
    </form>
  );
}
