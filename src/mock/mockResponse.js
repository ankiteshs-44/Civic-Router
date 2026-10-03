/**
 * mockResponse.js
 *
 * Local demo responses used when the FastAPI backend is unreachable, so the UI
 * always works for demos. Each object follows the EXACT shared contract:
 *   { category, location, urgency, authority{...}, letter, timeline[], needs_followup }
 *
 * NOTE: phone numbers / portals here are ILLUSTRATIVE hackathon demo data.
 */

const drainOverflowMock = {
  category: 'Sewerage',
  location: 'Sector 4, Vashi, Navi Mumbai - 400703',
  urgency: 'high',
  authority: {
    name: 'Navi Mumbai Municipal Corporation (NMMC)',
    department: 'Sewerage & Drainage Department',
    phone: '1800-222-309',
    portal_url: 'https://www.nmmc.gov.in',
    portal_name: 'NMMC Online Grievance Redressal Portal',
  },
  letter: `To,
The Commissioner,
Navi Mumbai Municipal Corporation (NMMC),
Palm Beach Road, CBD Belapur,
Navi Mumbai - 400614

Subject: Complaint regarding continuous drain overflow in Sector 4, Vashi

Respected Sir/Madam,

I am writing to formally report a serious drainage problem in Sector 4, Vashi, Navi Mumbai. The storm-water drain near the Sector 4 market road has been overflowing continuously, and untreated sewage water has spilled onto the road.

This is a serious public-health and safety hazard, particularly for children and senior citizens. The stagnant water is a breeding ground for mosquitoes and increases the risk of water-borne diseases.

I therefore request the Corporation to kindly:
1. Deploy a drainage cleaning team immediately to clear the blockage.
2. Disinfect the affected area to prevent any disease outbreak.
3. Inspect and repair the damaged drain cover and pipeline.
4. Inform residents of the expected time of resolution.

Thanking you,

Yours faithfully,
[Your Full Name]
[Your Mobile Number]
[Your Address / Sector]
[Date]`,
  timeline: [
    { step: 'Complaint submitted', day_offset: 0, description: 'Your complaint is filed with the NMMC Grievance Redressal Portal / ward office.' },
    { step: 'Acknowledgement + ticket number', day_offset: 1, description: 'NMMC should acknowledge the complaint and share a complaint number.' },
    { step: 'Site inspection', day_offset: 3, description: 'Ward-level drainage staff inspect the site and record the blockage.' },
    { step: 'Reminder / escalation to Ward Officer', day_offset: 7, description: 'If the drain is still overflowing, send a written reminder to the Ward Officer.' },
    { step: 'Target resolution', day_offset: 15, description: 'Target date for clearing the drain and disinfecting the stretch.' },
  ],
  needs_followup: false,
};

const streetlightMock = {
  category: 'Electrical',
  location: 'Sector 12, Kharghar, Navi Mumbai',
  urgency: 'medium',
  authority: {
    name: 'Navi Mumbai Municipal Corporation (NMMC)',
    department: 'Electrical Department (Street Lighting)',
    phone: '022-27571002',
    portal_url: 'https://www.nmmc.gov.in',
    portal_name: 'NMMC Online Grievance Redressal Portal',
  },
  letter: `To,
The Commissioner,
Navi Mumbai Municipal Corporation (NMMC),
Navi Mumbai.

Subject: Complaint regarding non-functional street lights in Sector 12, Kharghar

Respected Sir/Madam,

Several street lights in Sector 12, Kharghar have not been working for over a week, leaving the stretch dark and unsafe for pedestrians, especially women and senior citizens.

I therefore request the Electrical Department to kindly:
1. Inspect and repair the faulty street lights.
2. Replace damaged lamps / cabling.
3. Confirm the lights are working after repair.

Thanking you,

Yours faithfully,
[Your Full Name]
[Your Mobile Number]
[Your Address / Sector]
[Date]`,
  timeline: [
    { step: 'Complaint submitted', day_offset: 0, description: 'Your complaint is filed with the NMMC portal / ward office.' },
    { step: 'Acknowledgement + reference number', day_offset: 1, description: 'The department acknowledges the complaint.' },
    { step: 'Site inspection', day_offset: 3, description: 'Electrical staff inspect the faulty street lights.' },
    { step: 'Repair', day_offset: 7, description: 'Target date for repairing / replacing the lights.' },
  ],
  needs_followup: false,
};

const illegalParkingMock = {
  category: 'Traffic',
  location: 'Sector 17, Vashi, Navi Mumbai',
  urgency: 'medium',
  authority: {
    name: 'Navi Mumbai Traffic Police',
    department: 'Traffic Control',
    phone: '022-27891000',
    portal_url: 'https://mumbaipolice.gov.in',
    portal_name: 'Mumbai Traffic Police Portal',
  },
  letter: `To,
The Deputy Commissioner of Police (Traffic),
Navi Mumbai Traffic Police,
Navi Mumbai.

Subject: Complaint regarding illegal parking causing congestion near Sector 17, Vashi

Respected Sir/Madam,

I wish to report persistent illegal parking near Sector 17, Vashi, which is causing severe traffic congestion and blocking access for emergency vehicles.

I therefore request the Traffic Police to kindly:
1. Deploy a towing van / patrol during peak hours.
2. Take action against repeat offenders under the Motor Vehicles Act.
3. Re-paint the "No Parking" zone markings for clarity.

Thanking you,

Yours faithfully,
[Your Full Name]
[Your Mobile Number]
[Your Address / Sector]
[Date]`,
  timeline: [
    { step: 'Complaint submitted', day_offset: 0, description: 'Your complaint is filed with the traffic control room / portal.' },
    { step: 'Acknowledgement + reference number', day_offset: 1, description: 'Traffic control acknowledges the complaint.' },
    { step: 'Spot visit by patrol', day_offset: 2, description: 'A traffic patrol visits the location during peak hours.' },
    { step: 'Enforcement drive', day_offset: 10, description: 'Target date for an enforcement / towing drive.' },
  ],
  needs_followup: false,
};

// Ordered: first match wins.
const MOCKS = [
  { keywords: ['drain', 'water', 'sewage', 'sewer', 'gutter', 'overflow', 'flood', 'manhole', 'नाला', 'गटार'], mock: drainOverflowMock },
  { keywords: ['light', 'streetlight', 'street light', 'lamp', 'bulb', 'dark', 'wire', 'बत्ती', 'वीज'], mock: streetlightMock },
];

/**
 * Pick the most relevant mock for a free-text complaint.
 * @param {string} text
 * @returns {object} a contract-shaped mock response
 */
export function pickMockByText(text = '') {
  const haystack = String(text).toLowerCase();
  const match = MOCKS.find(({ keywords }) => keywords.some((k) => haystack.includes(k)));
  return match ? match.mock : illegalParkingMock;
}

export const mockResponses = [drainOverflowMock, streetlightMock, illegalParkingMock];
export default mockResponses;