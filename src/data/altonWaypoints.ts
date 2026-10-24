/**
 * Contacts on the Alton Bay survey map: public landmarks, placed by their OpenStreetMap positions,
 * each with a line on the readout when the crosshair finds it. Keep them to public places.
 */
export interface Waypoint {
  name: string
  lat: number
  lon: number
  note: string
}

export const WAYPOINTS: Waypoint[] = [
  { name: 'Sandy Point', lat: 43.48203, lon: -71.24002, note: "A point of land on the bay's west shore." },
  { name: 'Seaplane base · B18', lat: 43.4776, lon: -71.237, note: 'Seaplanes in summer; an ice runway on the frozen bay in winter.' },
  { name: 'Alton Bay bandstand', lat: 43.47398, lon: -71.23602, note: 'The bandstand on the waterfront, at the head of the bay.' },
  { name: 'Alton town beach', lat: 43.47145, lon: -71.23367, note: "The town's beach, at the foot of the bay." },
  { name: 'Alton Bay post office', lat: 43.47018, lon: -71.23565, note: 'The point this survey is pinned to the earth by.' },
  { name: 'Merrymeeting River', lat: 43.4677, lon: -71.2346, note: 'Runs north into the bay from the south.' },
]
