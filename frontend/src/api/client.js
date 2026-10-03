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

const API_URL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT_MS = 20_000; // client-side guard (backend enforces 8s on the AI call)
const DEMO_DELAY_MS = 900; // small "thinking" delay for mock responses

function isContractResponse(data) {
  return Boolean(
    data &&
      typeof data.category === 'string' &&
      typeof data.location === 'string' &&
      ['low', 'medium', 'high'].includes(data.urgency) &&
      data.authority &&
      ['name', 'department', 'phone', 'portal_url', 'portal_name'].every(
        (key) => typeof data.authority[key] === 'string',
      ) &&
      typeof data.letter === 'string' &&
      Array.isArray(data.timeline) &&
      data.timeline.every(
        (step) =>
          typeof step.step === 'string' &&
          Number.isInteger(step.day_offset) &&
          typeof step.description === 'string',
      ) &&
      typeof data.needs_followup === 'boolean',
  );
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
 * @param {{ text: string, image_base64?: string|null, language?: string }} params
 * @returns {Promise<{ data: object, demo: boolean, source: string }>}
 */
export async function submitComplaint({ text, image_base64 = null, language = 'en' } = {}) {
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
      console.warn('[client] Live API unavailable, using demo response:', error.message);
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