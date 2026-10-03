import { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected photo.'));
    reader.readAsDataURL(file);
  });
}

export default function ComplaintForm({ onSubmit, busy }) {
  const { language, t } = useLanguage();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      event.target.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError('Photo must be 8 MB or smaller.');
      event.target.value = '';
      return;
    }
    try {
      setImage({ name: file.name, url: await readImage(file) });
    } catch (error) {
      setImageError(error.message);
    }
  }

  function toggleVoiceInput() {
    setVoiceError('');
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript || '';
      setText((current) => `${current}${current ? ' ' : ''}${spoken}`);
    };
    recognition.onerror = () => {
      setVoiceError('Voice input could not start. Check microphone permission and try again.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setVoiceError('Voice input could not start. Please try again.');
      setListening(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (text.trim().length < 5) return;
    await onSubmit({ text: text.trim(), image_base64: image?.url || null });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="complaint-text" className="mb-2 block text-sm font-bold text-slate-800">
        {t('form.label')}
      </label>
      <textarea
        id="complaint-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t('form.placeholder')}
        rows={6}
        maxLength={5000}
        required
        className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{t('form.hint')}</span>
        <span>{text.length}/5000</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
          aria-label={t('form.attachPhoto')}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <span aria-hidden="true">📷</span>{t('form.attachPhoto')}
        </button>
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
            listening ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          aria-pressed={listening}
        >
          <span aria-hidden="true">{listening ? '■' : '🎙️'}</span>
          {listening ? t('form.listening') : t('form.voice')}
        </button>
      </div>
      {image && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <img src={image.url} alt="Selected complaint evidence" className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{image.name || 'Attached photo'}</p>
            <p className="text-xs text-slate-500">{t('form.photoEvidence')}</p>
          </div>
          <button type="button" onClick={() => { setImage(null); if (fileRef.current) fileRef.current.value = ''; }} className="rounded-lg px-2 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50">
            {t('form.removePhoto')}
          </button>
        </div>
      )}
      {(imageError || voiceError) && <p role="alert" className="mt-2 text-xs text-rose-700">{imageError || voiceError}</p>}
      <button
        type="submit"
        disabled={busy || text.trim().length < 5}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? t('form.submitting') : t('form.submit')}
        {!busy && <span aria-hidden="true">→</span>}
      </button>
      {text.trim().length > 0 && text.trim().length < 5 && (
        <p className="mt-2 text-xs text-amber-700">{t('error.short')}</p>
      )}
    </form>
  );
}
