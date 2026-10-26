/**
 * client.js
 *
 * Single entry point the UI uses to route a complaint.
 *
 * submitComplaint({ text, image_base64, language }):
 *   1. If VITE_API_URL is set, POST {VITE_API_URL}/complain.
 *   2. Otherwise — or if that call fails / times out — fall back to a local
 *      mock (chosen by keyword) and flag `demo: true` so the UI can show a
 *      "Demo Mode" badg
 *
 * Always resolves to: { data, demo, source } where `data` matches the shared
 * JSON contract.
 */

import { pickMockByText } from '../mock/mockResponse.js';

const rawApiUrl = import.meta.env.VITE_API_URL;
let API_URL = rawApiUrl;
if (typeof window !== 'undefined' && rawApiUrl) {
  if (window.location.hostname === '127.0.0.1' && rawApiUrl.includes('localhost')) {
    API_URL = rawApiUrl.replace('localhost', '127.0.0.1');
  } else if (window.location.hostname === 'localhost' && rawApiUrl.includes('127.0.0.1')) {
    API_URL = rawApiUrl.replace('127.0.0.1', 'localhost');
  }
}
const REQUEST_TIMEOUT_MS = 20_000; // client-side guard (backend enforces 8s on the AI call)
const DEMO_DELAY_MS = 900; // small "thinking" delay for mock responses

function isContractResponse(data) {
  if (!data || typeof data.category !== 'string' || typeof data.location !== 'string') {
    return false;
  }
  if (!['low', 'medium', 'high'].includes(data.urgency)) {
    return false;
  }
  if (!data.authority || !['name', 'department', 'phone', 'portal_url', 'portal_name'].every(
    (key) => typeof data.authority[key] === 'string',
  )) {
    return false;
  }
  if (typeof data.letter !== 'string' || typeof data.needs_followup !== 'boolean') {
    return false;
  }
  if (!Array.isArray(data.timeline) || !data.timeline.every(
    (step) =>
      typeof step.step === 'string' &&
      Number.isInteger(step.day_offset) &&
      typeof step.description === 'string',
  )) {
    return false;
  }
  if (!('problem_summary' in data) || typeof data.problem_summary !== 'string') {
    return false;
  }
  if (!Array.isArray(data.specific_details) || !Array.isArray(data.recommended_actions) || !Array.isArray(data.related_issues)) {
    return false;
  }
  if (data.location_source && !['text', 'user_input', 'gps', 'combined', 'unknown'].includes(data.location_source)) {
    return false;
  }
  if (data.location_confidence !== undefined && typeof data.location_confidence !== 'number') {
    return false;
  }
  return true;
}

/** fetch() with an AbortController-based timeout. */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve after `ms` milliseconds. */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Route a citizen's complaint.
 * @param {{ text: string, image_base64?: string|null, language?: string, location?: string|null, location_source?: string|null, latitude?: number|null, longitude?: number|null }} params
 * @returns {Promise<{ data: object, demo: boolean, source: string }>}
 */
export async function submitComplaint({
  text,
  image_base64 = null,
  language = 'en',
  location = null,
  location_source = null,
  latitude = null,
  longitude = null,
} = {}) {
  const cleanText = String(text ?? '').trim();
  if (!cleanText) {
    throw new Error('Complaint text is required.');
  }

  if (API_URL) {
    try {
      const response = await fetchWithTimeout(
        `${API_URL.replace(/\/+$/, '')}/complain`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            image_base64: image_base64 || null,
            language: language || 'en',
            location: location || null,
            location_source: location_source || null,
            latitude: Number.isFinite(latitude) ? latitude : null,
            longitude: Number.isFinite(longitude) ? longitude : null,
          }),
        },
        REQUEST_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!isContractResponse(data)) {
        throw new Error('API returned a response that does not match the complaint contract.');
      }
      const source = response.headers.get('X-Route-Source') || 'ai';
      return { data, demo: false, source };
    } catch (error) {
      // Network error, non-2xx, or timeout -> fall back to a demo response.
      console.info('[client] Using autonomous demo routing mode.');
    }
  }

  await delay(DEMO_DELAY_MS);
  const data = { ...pickMockByText(cleanText) };
  if (image_base64) {
    data.letter +=
      '\n\nEvidence: A photograph was attached to this complaint. ' +
      'Automated visual confirmation is not available in demo mode.';
  }
  return { data, demo: true, source: 'mock' };
}

export default submitComplaint;