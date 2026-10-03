/**
 * ics.js
 *
 * Build and download an `.ics` (iCalendar) file with one all-day reminder per
 * timeline step. Dates are computed as TODAY + step.day_offset.
 */

/** Escape a string for the iCalendar text format (RFC 5545). */
function escapeICSText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Format a Date as a local all-day value: YYYYMMDD. */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/** Format a Date as a UTC timestamp: YYYYMMDDTHHMMSSZ. */
function formatStamp(date) {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/** Add `days` to a base date (returns a new Date). */
function addDays(base, days) {
  const next = new Date(base);
  next.setDate(next.getDate() + Number(days || 0));
  return next;
}

/**
 * Build the .ics file contents for a routing result.
 * @param {object} result - contract-shaped response
 * @returns {string} iCalendar text
 */
export function buildICS(result) {
  const now = new Date();
  const stamp = formatStamp(now);
  const location = result?.location || 'Navi Mumbai';
  const authority = result?.authority?.name || 'the concerned authority';
  const timeline = Array.isArray(result?.timeline) ? result.timeline : [];

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Navi Mumbai Civic Router//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  timeline.forEach((step, index) => {
    const start = addDays(now, step?.day_offset || 0);
    const summary = `[Civic] ${step?.step || `Step ${index + 1}`}`;
    const description =
      `${step?.description || ''}\n` +
      `Category: ${result?.category || 'Civic issue'} | Location: ${location}\n` +
      `Authority: ${authority}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:civic-${Date.now()}-${index}@navimumbai.router`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${formatDate(start)}`,
      `SUMMARY:${escapeICSText(summary)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      `LOCATION:${escapeICSText(location)}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT9H', // 9 hours before (i.e. 09:00 for a midnight all-day event)
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICSText(summary)}`,
      'END:VALARM',
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');
  // iCalendar uses CRLF line endings.
  return lines.join('\r\n');
}

/**
 * Trigger a browser download of the timeline as an .ics file.
 * @param {object} result - contract-shaped response
 * @param {string} [filename]
 */
export function downloadICS(result, filename = 'civic-timeline.ics') {
  const blob = new Blob([buildICS(result)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default buildICS;