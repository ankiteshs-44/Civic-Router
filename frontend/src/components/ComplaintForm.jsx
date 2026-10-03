import React, { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import {
  CameraIcon,
  MicIcon,
  SquareIcon,
  TrashIcon,
  WaterIcon,
  RoadIcon,
  LightbulbIcon,
  TrashBinIcon,
  ArrowRightIcon,
} from './Icons.jsx';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected photo.'));
    reader.readAsDataURL(file);
  });
}

export default function ComplaintForm({ onSubmit, busy, initialText = '' }) {
  const { language, t } = useLanguage();
  const [text, setText] = useState(initialText);
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

  const presets = [
    { id: 'drainage', icon: WaterIcon, textKey: 'preset.drainage' },
    { id: 'pothole', icon: RoadIcon, textKey: 'preset.pothole' },
    { id: 'streetlight', icon: LightbulbIcon, textKey: 'preset.streetlight' },
    { id: 'garbage', icon: TrashBinIcon, textKey: 'preset.garbage' },
  ];

  async function handleFile(file) {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError('Photo must be under 8 MB in size.');
      return;
    }
    try {
      const url = await readImage(file);
      setImage({ name: file.name, url });
    } catch (error) {
      setImageError(error.message);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function toggleVoiceInput() {
    setVoiceError('');
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }[language] || 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const spoken = event.results?.[0]?.[0]?.transcript || '';
        setText((current) => `${current}${current ? ' ' : ''}${spoken}`);
      };
      recognition.onerror = () => {
        setVoiceError('Could not capture audio. Please ensure microphone access is permitted.');
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch {
      setVoiceError('Unable to activate speech recognition. Please try typing your issue.');
      setListening(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (text.trim().length < 5) return;
    await onSubmit({ text: text.trim(), image_base64: image?.url || null });
  }

  function handlePresetClick(presetKey) {
    const textVal = t(presetKey);
    setText(textVal);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative transition-colors ${isDragging ? 'ring-2 ring-blue-500 rounded-3xl' : ''}`}
    >
      {/* 1-Tap Quick Scenario Presets */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('form.presets')}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {presets.map(({ id, icon: Icon, textKey }) => (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => handlePresetClick(textKey)}
              className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-ring disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-slate-800 dark:hover:text-blue-400"
            >
              <Icon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="truncate">{t(textKey).split(' ')[0]} {t(textKey).split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="complaint-text" className="block text-sm font-bold text-slate-900 dark:text-white">
          {t('form.label')}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('form.hint')}
        </p>
      </div>

      <div className="relative mt-2">
        <textarea
          id="complaint-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('form.placeholder')}
          rows={5}
          maxLength={5000}
          required
          disabled={busy}
          className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
        />
        <div className="mt-1 flex items-center justify-between px-1 text-xs text-slate-400 dark:text-slate-500">
          <span>{text.trim().length >= 5 ? '✓ Ready to route' : `${5 - text.trim().length} chars needed`}</span>
          <span>{text.length}/5000</span>
        </div>
      </div>

      {/* Input Action Controls (Photo, Voice) */}
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
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
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <CameraIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          <span>{image ? 'Change Photo' : t('form.attachPhoto')}</span>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={toggleVoiceInput}
          className={`inline-flex min-h-touch items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition shadow-sm focus-ring ${
            listening
              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
          aria-pressed={listening}
        >
          {listening ? (
            <>
              <SquareIcon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span className="voice-wave inline-block h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-400" />
              <span>{t('form.listening')}</span>
            </>
          ) : (
            <>
              <MicIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span>{t('form.voice')}</span>
            </>
          )}
        </button>

        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            disabled={busy}
            className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear text
          </button>
        )}
      </div>

      {/* Image Preview Card */}
      {image && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
          <img
            src={image.url}
            alt="Uploaded complaint evidence preview"
            className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{image.name || 'Complaint Photo'}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{t('form.photoEvidence')}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setImage(null);
              if (fileRef.current) fileRef.current.value = '';
            }}
            aria-label={t('form.removePhoto')}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Errors */}
      {(imageError || voiceError) && (
        <div role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {imageError || voiceError}
        </div>
      )}

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={busy || text.trim().length < 5}
        className="mt-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
      >
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" />
            <span>{t('form.submitting')}</span>
          </>
        ) : (
          <>
            <span>{t('form.submit')}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </>
        )}
      </button>

      {text.trim().length > 0 && text.trim().length < 5 && (
        <p className="mt-2 text-center text-xs text-amber-700 dark:text-amber-400">{t('error.short')}</p>
      )}
    </form>
  );
}
