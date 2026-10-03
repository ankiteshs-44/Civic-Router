/**
 * Mock complaint responses for the "Civic Complaint Router for Navi Mumbai".
 *
 * Every object follows the SAME JSON contract the backend is expected to return:
 *
 * {
 *   category: string,
 *   location: string,
 *   urgency: "low" | "medium" | "high",
 *   authority: {
 *     name: string,
 *     department: string,
 *     phone: string,
 *     portal_url: string,
 *     portal_name: string
 *   },
 *   letter: string,   // formal, multi-line complaint letter
 *   timeline: [{ step: string, day_offset: number, description: string }]
 * }
 *
 * NOTE: phone numbers, portal URLs and officer designations here are ILLUSTRATIVE
 * demo data for a hackathon. Verify against official sources before real use.
 */

/* ------------------------------------------------------------------ *
 * 1. Drain / sewage overflow in Sector 4 -> NMMC
 * ------------------------------------------------------------------ */
export const drainOverflowMock = {
  category: 'Drainage / Sewage Overflow',
  location: 'Sector 4, Vashi, Navi Mumbai - 400703',
  urgency: 'high',
  authority: {
    name: 'Navi Mumbai Municipal Corporation (NMMC)',
    department: 'Solid Waste Management & Drainage Department',
    phone: '022-27571000',
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

I am writing to formally report a serious drainage problem in Sector 4, Vashi, Navi Mumbai. The storm-water drain near the Sector 4 market road has been overflowing continuously for the past three days. Untreated sewage water has spilled onto the road and is emitting a strong odour, making it difficult for residents, shopkeepers and pedestrians to move around.

This is a serious public-health and safety hazard, particularly for children and senior citizens. The stagnant water is a breeding ground for mosquitoes and increases the risk of water-borne diseases in the locality. Two-wheelers have also been skidding on the slippery stretch. The issue was reported verbally to the ward office but no action has been taken so far.

I therefore request the Corporation to kindly:
1. Deploy a drainage cleaning team immediately to clear the blockage.
2. Disinfect the affected area to prevent any disease outbreak.
3. Inspect and repair the damaged drain cover and pipeline.
4. Inform residents of the expected time of resolution.

I request you to acknowledge this complaint with a complaint/ticket number so that I can follow up.

Thanking you,

Yours faithfully,
[Your Full Name]
[Your Mobile Number]
[Your Address / Sector]
[Date]`,

  timeline: [
    {
      step: 'Complaint submitted',
      day_offset: 0,
      description: 'Your complaint is filed with the NMMC Grievance Redressal Portal / ward office.',
    },
    {
      step: 'Acknowledgement + ticket number',
      day_offset: 1,
      description: 'NMMC should acknowledge the complaint and share a complaint number. If not received, follow up on the helpline.',
    },
    {
      step: 'Site inspection',
      day_offset: 3,
      description: 'Ward-level drainage staff are expected to inspect the site and record the blockage.',
    },
    {
      step: 'Reminder / escalation to Ward Officer',
      day_offset: 7,
      description: 'If no work has started, send a written reminder to the Ward Officer quoting your ticket number.',
    },
    {
      step: 'Repair work executed',
      day_offset: 15,
      description: 'Target date for de-silting / repair of the drain and disinfection of the area.',
    },
    {
      step: 'Escalate to Municipal Commissioner',
      day_offset: 30,
      description: 'If unresolved, escalate in writing to the Municipal Commissioner / file an RTI to force a response.',
    },
  ],
};

/* ------------------------------------------------------------------ *
 * 2. Streetlight not working -> NMMC Electrical Department
 * ------------------------------------------------------------------ */
export const streetlightMock = {
  category: 'Street Lighting / Electrical',
  location: 'Sector 12, Kharghar, Navi Mumbai - 410210',
  urgency: 'medium',
  authority: {
    name: 'Navi Mumbai Municipal Corporation (NMMC)',
    department: 'Electrical Department (Street Lighting)',
    phone: '022-27571000',
    portal_url: 'https://www.nmmc.gov.in',
    portal_name: 'NMMC Online Grievance Redressal Portal',
  },
  letter: `To,
The Executive Engineer,
Electrical Department,
Navi Mumbai Municipal Corporation (NMMC),
CBD Belapur, Navi Mumbai - 400614

Subject: Complaint regarding non-functional streetlight in Sector 12, Kharghar

Respected Sir/Madam,

I wish to bring to your notice that the streetlight pole (Pole No. 27) on the road opposite the Sector 12 garden in Kharghar has not been functioning for the last five days. As a result, the entire stretch of road becomes completely dark after sunset.

The absence of lighting is a serious safety concern for residents, especially women, senior citizens and school-going children who use this road in the early morning and evening. It has also increased the risk of theft, chain-snatching and road accidents at this junction. The footpath crossing nearby is very difficult to see in the dark.

I therefore request the Electrical Department to kindly:
1. Inspect the pole and replace the faulty bulb / driver.
2. Check the connected circuit for loose wiring or a burnt fuse.
3. Restore lighting on the stretch at the earliest and confirm the repair.

I would be grateful if you could acknowledge this complaint with a ticket number.

Thanking you,

Yours faithfully,
[Your Full Name]
[Your Mobile Number]
[Your Address / Sector]
[Date]`,

  timeline: [
    {
      step: 'Complaint submitted',
      day_offset: 0,
      description: 'Your streetlight complaint is logged with the NMMC Electrical Department / grievance portal.',
    },
    {
      step: 'Acknowledgement + ticket number',
      day_offset: 1,
      description: 'The department should confirm receipt and assign a complaint number.',
    },
    {
      step: 'Electrician inspection',
      day_offset: 2,
      description: 'A lineman/electrician is expected to visit the pole and diagnose the fault.',
    },
    {
      step: 'Reminder to Junior Engineer',
      day_offset: 5,
      description: 'If the light is still off, send a reminder to the ward Junior Engineer (Electrical).',
    },
    {
      step: 'Repair completed',
      day_offset: 7,
      description: 'Target date for bulb / driver replacement and restoration of the streetlight.',
    },
    {
      step: 'Escalate to Executive Engineer',
      day_offset: 15,
      description: 'If unresolved, escalate in writing to the Executive Engineer (Electrical).',
    },
  ],
};

/* ------------------------------------------------------------------ *
 * 3. Illegal parking -> Navi Mumbai Traffic Police
 * ------------------------------------------------------------------ */
export const illegalParkingMock = {
  category: 'Traffic / Illegal Parking',
  location: 'Palm Beach Road, near Vashi Railway Station, Navi Mumbai',
  urgency: 'medium',
  authority: {
    name: 'Navi Mumbai Traffic Police',
    department: 'Traffic Control Branch, Navi Mumbai Police',
    phone: '022-27577000',
    portal_url: 'https://navimumbaipolice.gov.in',
    portal_name: 'Navi Mumbai Police Citizen Services Portal',
  },
  letter: `To,
The Deputy Commissioner of Police (Traffic),
Navi Mumbai Traffic Police,
Traffic Control Branch, Vashi,
Navi Mumbai - 400703

Subject: Complaint regarding illegal parking causing traffic congestion near Vashi Railway Station

Respected Sir/Madam,

I wish to lodge a complaint about persistent illegal parking on Palm Beach Road, near the Vashi Railway Station entrance. Every day, during morning and evening peak hours, several vehicles are parked on the carriageway and on the zebra crossing, reducing the usable width of the road.

This illegal parking causes severe traffic congestion, forces pedestrians and school children to walk on the road, and blocks access for ambulances and fire tenders. It also leads to frequent arguments and minor collisions in the area. Despite the "No Parking" signage, the practice continues unchecked.

I therefore request the Traffic Police to kindly:
1. Deploy a towing van / patrol at this location during peak hours.
2. Take action against repeat offenders under the Motor Vehicles Act.
3. Install bollards or re-paint the "No Parking" zone markings for clarity.
4. Consider a permanent traffic-management solution at this junction.

I request you to kindly take prompt action and acknowledge this complaint.

Thanking you,

Yours faithfully,
[Your Full Name]
[Your Mobile Number]
[Your Address / Sector]
[Date]`,

  timeline: [
    {
      step: 'Complaint submitted',
      day_offset: 0,
      description: 'Your illegal-parking complaint is filed with the Navi Mumbai Traffic Police control room / portal.',
    },
    {
      step: 'Acknowledgement + reference number',
      day_offset: 1,
      description: 'Traffic control should acknowledge the complaint and give you a reference number.',
    },
    {
      step: 'Spot visit by traffic patrol',
      day_offset: 2,
      description: 'A traffic patrol / towing van is expected to visit the location during peak hours.',
    },
    {
      step: 'Reminder to Traffic Inspector',
      day_offset: 5,
      description: 'If no action is seen, send a reminder to the Traffic Inspector of the concerned zone.',
    },
    {
      step: 'Enforcement drive',
      day_offset: 10,
      description: 'Target date for a sustained enforcement / towing drive at the spot.',
    },
    {
      step: 'Escalate to DCP (Traffic)',
      day_offset: 20,
      description: 'If unresolved, escalate in writing to the Deputy Commissioner of Police (Traffic).',
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Keyword matcher (used by src/api/complaintApi.js as a fallback)
 * ------------------------------------------------------------------ */

// Ordered list so that a specific match wins over the generic default.
const MOCKS = [
  { keywords: ['drain', 'water', 'sewage', 'sewer', 'gutter', 'overflow', 'flood'], mock: drainOverflowMock },
  { keywords: ['light', 'streetlight', 'street light', 'lamp', 'bulb', 'dark'], mock: streetlightMock },
];

/**
 * Pick the most relevant mock response for a free-text complaint.
 *
 * Matching is deliberately simple: lower-case the text and look for keywords.
 *  - drain / water / sewage ... -> drain overflow mock
 *  - light / lamp / dark ...    -> streetlight mock
 *  - anything else              -> illegal parking mock (default)
 *
 * @param {string} text - raw citizen complaint text
 * @returns {typeof drainOverflowMock} one of the three mock objects
 */
export function pickMockByText(text = '') {
  const haystack = String(text).toLowerCase();
  const match = MOCKS.find(({ keywords }) => keywords.some((k) => haystack.includes(k)));
  return match ? match.mock : illegalParkingMock;
}

// Convenience default export: the full set of mocks (handy for tests/demos).
export const mockResponses = [drainOverflowMock, streetlightMock, illegalParkingMock];
export default mockResponses;
