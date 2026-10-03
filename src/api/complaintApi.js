/**
 * complaintApi.js
 *
 * Single entry point the UI uses to turn a free-text complaint into a
 * structured routing response.
 *
 * Behaviour of submitComplaint(text):
 *   1. If VITE_API_URL is set, POST {VITE_API_URL}/complain with { text }.
 *   2. Otherwise — or if that call fails / times out after 15s — fall back to a
 *      mock response (selected by simple keyword matching) after a fake 1.2s delay.
 *
 * The response always follows the JSON contract documented in README.md.
 */

import { pickMockByText } from '../mock/mockResponse.js';

// Base URL of the backend API (empty string when the env var is not configured).
const API_URL = import.meta.env.VITE_API_URL;

// Fail fast: give the live backend at most 15 seconds to respond.
const REQUEST_TIMEOUT_MS = 15_000;

// Fake "thinking" delay used when serving a mock response.
const MOCK_DELAY_MS = 1_200;

/**
 * fetch() with an AbortController-based timeout.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve after `ms` milliseconds (used to simulate network latency). */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Return a mock response for the given text after a fake 1.2s delay.
 * @param {string} text
 * @returns {Promise<object>}
 */
async function getMockResponse(text) {
  await delay(MOCK_DELAY_MS);
  return pickMockByText(text);
}

/**
 * Route a citizen's plain-language complaint to the right authority.
 *
 * @param {string} text - e.g. "drain overflowing near sector 4"
 * @returns {Promise<object>} response matching the JSON contract
 */
export async function submitComplaint(text) {
  const cleanText = String(text ?? '').trim();

  // Guard: nothing to route.
  if (!cleanText) {
    throw new Error('Complaint text is required.');
  }

  // Live backend path.
  if (API_URL) {
    try {
      const response = await fetchWithTimeout(
        `${API_URL.replace(/\/+$/, '')}/complain`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
        },
        REQUEST_TIMEOUT_MS,
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Network error, non-2xx status or timeout -> silently fall back to mock.
      console.warn('[complaintApi] Live API unavailable, using mock response:', error.message);
    }
  }

  // Mock path (no API configured, or the live call failed).
  return getMockResponse(cleanText);
}

export default submitComplaint;