/**
 * storage.js
 *
 * Tiny localStorage-backed store for previously generated complaints, so users
 * don't lose their letters. Each entry: { id, savedAt, text, result }.
 */

const STORAGE_KEY = 'civic.complaints';

/** Safely read the stored array (never throws). */
export function loadComplaints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist the array (never throws). */
function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/**
 * Save a complaint and return the updated list.
 * @param {{ text: string, result: object }} params
 * @returns {Array} updated list
 */
export function saveComplaint({ text, result }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    text: String(text ?? ''),
    result,
  };
  const items = [entry, ...loadComplaints()].slice(0, 50); // cap at 50
  persist(items);
  return items;
}

/**
 * Delete one complaint by id and return the updated list.
 * @param {string} id
 */
export function deleteComplaint(id) {
  const items = loadComplaints().filter((item) => item.id !== id);
  persist(items);
  return items;
}

/** Remove all saved complaints. */
export function clearComplaints() {
  persist([]);
  return [];
}

export default { loadComplaints, saveComplaint, deleteComplaint, clearComplaints };