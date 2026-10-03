# Navi Mumbai Civic Router — Comprehensive Frontend Audit

**Date:** October 3, 2026  
**Auditor:** Senior Frontend Engineer & UI/UX Lead  
**Scope:** Architecture, Usability, Visual Hierarchy, Accessibility (WCAG 2.1 AA), Mobile Responsiveness, Internationalization, and Performance.  
**Tested Viewports:** Mobile (375 × 812), Tablet (768 × 1024), Desktop (1440 × 900) across Light and Dark system preferences.  
**Screenshots Archive:** `./screenshots/audit/`

---

## Executive Summary

The **Navi Mumbai Civic Router** provides foundational civic complaint categorization and escalation guidance for citizens of Navi Mumbai (NMMC). While core business logic (mock fallback, multi-language context, local storage persistence, and .ics generation) exists, the current frontend suffers from visual deficits (flat, template-like aesthetics, awkward emoji icons), critical feature omissions (missing offline banner, non-functional retry button, absence of dark mode styling), accessibility gaps (sub-44px touch targets, missing skip link, incomplete ARIA roles), and high-friction UX (no 1-tap example scenarios, raw code-like letter formatting).

---

## Audit Findings Matrix

| ID | Category | Finding Description | Severity | Impact Area |
|---|---|---|---|---|
| **BUG-01** | Functionality | Missing `favicon.ico` triggers HTTP 404 console error on every reload | **High** | Console / Performance |
| **BUG-02** | Functionality | Error state displays raw message without a functional "Retry" action button despite `error.retry` i18n key existing | **High** | Error Recovery |
| **BUG-03** | Functionality | No offline banner or network status listener; offline state leaves users unaware of sync status | **High** | Reliability / Offline |
| **BUG-04** | Theming | Complete lack of Dark Mode implementation; system `prefers-color-scheme: dark` displays blinding white UI | **High** | Visual / System Preferences |
| **UX-01** | UX Friction | No 1-tap complaint presets/examples on the main form; users must manually type complex civic text for demos | **High** | Demo / Conversion |
| **UX-02** | Visual Polish | Primary UI icons rely on raw emojis (`⌖`, `📷`, `🎙️`, `🧭`, `🔒`, `☎`, `📂`) violating professional design standards | **High** | Trust & Brand |
| **UX-03** | Visual Polish | Complaint letter is rendered inside an unstyled raw `<pre>` monospaced code block rather than an official formal letter template | **Medium** | Civic Authority / Readability |
| **UX-04** | Mobile Feel | Language picker buttons and card action buttons have tap target heights below 44px (28px - 32px) | **High** | Mobile Ergonomics (WCAG 2.5.5) |
| **UX-05** | Responsiveness | On desktop (1440px), the left column (form) sits rigidly at the top while the right column (results) stretches >2000px, creating unbalanced white void | **Medium** | Desktop Layout / Eye Flow |
| **UX-06** | UX Polish | Voice input lacks active visual feedback (no waveform animation, audio pulse, or duration timer) | **Medium** | Interactive Feedback |
| **UX-07** | UX Polish | Photo attachment lacks drag-and-drop support, thumbnail zoom modal, or file size validation animation | **Medium** | Media Input |
| **A11Y-01** | Accessibility | No "Skip to main content" link for keyboard and screen reader users | **Medium** | WCAG 2.4.1 (Bypass Blocks) |
| **A11Y-02** | Accessibility | Inconsistent focus rings; tab navigation across form controls and action buttons lacks high-visibility 3px rings | **High** | WCAG 2.4.7 (Focus Visible) |
| **A11Y-03** | Accessibility | Insufficient color contrast on secondary labels (`text-slate-500` on slate-50 backgrounds tests under 4.3:1) | **Medium** | WCAG 1.4.3 (Contrast Minimum) |
| **A11Y-04** | Accessibility | Language switch does not update document `lang` attribute or announce language change to assistive technology | **Medium** | WCAG 3.1.2 (Language of Parts) |
| **PERF-01** | Performance | Absence of skeleton loading states during complaint submission; button spinner is solitary indicator | **Medium** | Perceived Performance |
| **DEV-01** | Developer Exp | `npm run dev` in repository root does not concurrently launch both backend and frontend services | **High** | Developer Workflow |

---

## Detailed Section Breakdown

### 1. Header & Navigation
- **Issue:** Navigation tabs ("New Complaint", "My Complaints") and Language Toggle ("English", "हिंदी", "मराठी") are clustered without clear distinction between app mode and localization.
- **Visuals:** Generic border styling, no backdrop blur or elevation on scroll.
- **Fix:** Build an official civic header with NMMC emblem SVG, clear high-contrast language pill segment, badge indicator for saved complaints count, and theme toggle (Light / Dark / System).

### 2. Complaint Intake Form
- **Issue:** Textarea lacks clear character guidance; hint text wraps awkwardly against character counter on small screens.
- **Missing Demo Boosters:** 4 categorized quick-fill scenario cards (Water Leakage, Road Pothole, Streetlight Outage, Garbage Overflow) to let reviewers test the router in 1 tap.
- **Media Controls:** File upload button should be an accessible dropzone with camera capture and instant thumbnail preview with zoom/delete.
- **Voice Input:** Needs pulsing audio visualizer state when listening.

### 3. Result Display & Authority Card
- **Issue:** Result cards appear as a disconnected vertical stack of plain rounded white boxes.
- **Emergency Helpline:** High-urgency alerts should have a prominent emergency header with high-contrast alert styling.
- **Authority Routing:** Department contact details, ward offices, and direct portal links need verified badge status, SVG phone and external link icons, and click-to-call verification.
- **Letter Generator:** Needs to look like a stamped municipal document with clean typography, printable styling, and a toast-enabled "Copy Letter" button.
- **Timeline:** Escalation steps need visual connector tracks, active/pending indicators, real calendar dates formatted per locale, and single-click .ics calendar reminder download.

### 4. My Complaints Archive
- **Issue:** Empty state is a plain dashed box with a folder emoji.
- **Improvement:** Provide rich empty state with guidance, status tags for saved complaints, date formatting, and filter/search capabilities.

### 5. Network, Offline & Error States
- **Issue:** Disconnecting network displays no notice until user attempts an action.
- **Fix:** Global offline status pill banner with auto-reconnect detection; rich error cards with exact failure reasons and retry buttons.

---

## Implementation Roadmap (Priority Order)

1. **Phase 1: Architecture & Dev Workflow**
   - Provide root script so `npm run dev` starts all services (backend on 8000 + frontend on 5173).
   - Fix `favicon.ico` 404 and console warnings.
   - Ensure clean build (`npm run build`) and preview.
2. **Phase 2: Design System & Styling (ui-ux-pro-max)**
   - Configure Tailwind dark mode (`darkMode: 'class'`), Atkinson Hyperlegible / Inter typography, and civic palette (`#1E40AF`, `#0D9488`, `#16A34A`).
   - Implement dark mode toggle with system preference persistence.
   - Replace all emojis with crisp, lightweight SVG icons.
3. **Phase 3: Demo-Critical & Mobile Polish**
   - Add 1-tap quick scenario presets (Drainage, Streetlight, Pothole, Garbage).
   - Refactor Complaint Letter into an official municipal document format with copy toast.
   - Implement skeleton loading states for results.
   - Ensure 44px touch targets and safe-area padding.
4. **Phase 4: Features & Reliability**
   - Add offline detection banner (`navigator.onLine` listener).
   - Implement ErrorBox with retry action.
   - Audio waveform animation for voice recognition.
   - Image preview modal and drag-and-drop file upload.
5. **Phase 5: Accessibility & Verification**
   - WCAG 2.1 AA audit, skip links, aria-labels, focus rings.
   - Capture verification screenshots, generate `SCREENSHOT_REPORT.md`, run Lighthouse audit.
