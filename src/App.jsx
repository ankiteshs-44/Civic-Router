import { useCallback, useState } from 'react';
import Header from './components/Header.jsx';
import ComplaintForm from './components/ComplaintForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import ErrorBox from './components/ErrorBox.jsx';
import { submitComplaint } from './api/complaintApi.js';

/**
 * App.jsx
 *
 * Single-page, mobile-first shell. Layout is designed for a 375px-wide phone
 * first and simply centres itself (max-w-md) on larger screens.
 *
 * Flow:
 *   idle -> (submit) -> loading -> success (ResultCard) | error (ErrorBox -> Retry)
 */
export default function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastSubmitted, setLastSubmitted] = useState('');

  // Route a complaint and update the view state. Shared by submit and retry.
  const routeComplaint = useCallback(async (rawText) => {
    const value = String(rawText || '').trim();
    if (value.length < 5) return;

    setLastSubmitted(value);
    setStatus('loading');
    setError(null);

    try {
      const response = await submitComplaint(value);
      setResult(response);
      setStatus('success');
    } catch (err) {
      setError(err?.message || 'Unexpected error.');
      setStatus('error');
    }
  }, []);

  const handleSubmit = useCallback(() => {
    routeComplaint(text);
  }, [routeComplaint, text]);

  const handleRetry = useCallback(() => {
    routeComplaint(lastSubmitted || text);
  }, [routeComplaint, lastSubmitted, text]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-md px-4 pb-12 pt-8 sm:pt-12">
        <Header />

        <ComplaintForm
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          isLoading={status === 'loading'}
        />

        {status === 'error' && <ErrorBox message={error} onRetry={handleRetry} />}

        {status === 'success' && result && <ResultCard result={result} />}

        <footer className="mt-8 text-center text-xs text-slate-400">
          Demo data for a hackathon — verify phone numbers and portals before real use.
        </footer>
      </div>
    </div>
  );
}
