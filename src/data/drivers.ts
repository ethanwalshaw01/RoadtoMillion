import {
  OPTIONAL_DOCUMENTS,
  REQUIRED_DOCUMENTS,
  type Driver,
  type DriverDocument,
  type DriverReview,
} from '../types'

function offsetDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

function verifiedDocs(expiryOffsets: number[], withOperator = false): DriverDocument[] {
  const kinds = withOperator ? [...REQUIRED_DOCUMENTS, ...OPTIONAL_DOCUMENTS] : REQUIRED_DOCUMENTS
  return kinds.map((kind, i) => ({
    kind,
    status: 'verified',
    required: REQUIRED_DOCUMENTS.includes(kind),
    fileName: `${kind.toLowerCase().replace(/ /g, '-')}.pdf`,
    expiresOn: offsetDate(expiryOffsets[i % expiryOffsets.length]!),
    uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * (40 + i * 7),
  }))
}

const r = (author: string, stars: number, text: string, daysAgo: number): DriverReview => ({
  author,
  stars,
  text,
  daysAgo,
})

export const DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Marcus Ellery',
    company: 'Apex Roadside Recovery',
    phone: '07700 900141',
    rating: 4.9,
    jobsCompleted: 1284,
    yearsOperating: 9,
    initials: 'ME',
    accent: '#c17a3d',
    verified: true,
    fleet: ['Car', 'SUV / 4x4', 'Van'],
    equipment: ['Flatbed', 'Winch', 'Jump pack', 'Tyre kit'],
    base: 'Theale',
    location: { x: 38, y: 44 },
    documents: verifiedDocs([210, 340, 95, 480, 150, 300], true),
    responseMinutes: 3,
    acceptanceRate: 0.61,
    reviews: [
      r('Hannah W.', 5, 'Arrived faster than the ETA, strapped the car down carefully. Would use again.', 2),
      r('Tom R.', 5, 'Calm and reassuring on a horrible night on the M4.', 9),
      r('Alex P.', 4, 'Good service, slightly late but kept me updated.', 21),
    ],
  },
  {
    id: 'd2',
    name: 'Priya Nadarajah',
    company: 'Nightowl Towing Co.',
    phone: '07700 900272',
    rating: 4.7,
    jobsCompleted: 842,
    yearsOperating: 5,
    initials: 'PN',
    accent: '#4a7391',
    verified: true,
    fleet: ['Car', 'Motorbike'],
    equipment: ['Spectacle lift', 'Motorbike cradle', 'Jump pack', 'Lockout kit'],
    base: 'Caversham',
    location: { x: 58, y: 30 },
    documents: verifiedDocs([300, 180, 400, 260, 90]),
    responseMinutes: 2,
    acceptanceRate: 0.54,
    reviews: [
      r('Dev S.', 5, 'Got my bike home without a scratch. Proper cradle, not a strap job.', 5),
      r('Lucy M.', 4, 'Quick to bid, quick to arrive.', 14),
    ],
  },
  {
    id: 'd3',
    name: 'Dale Foster',
    company: 'Foster & Sons Recovery',
    phone: '07700 900318',
    rating: 4.5,
    jobsCompleted: 2310,
    yearsOperating: 17,
    initials: 'DF',
    accent: '#5f8f6e',
    verified: true,
    fleet: ['Car', 'Van', 'Light Truck', 'SUV / 4x4', 'Campervan'],
    equipment: ['Flatbed', 'Winch', 'Fuel can', 'Fuel drain', 'Tyre kit'],
    base: 'Newbury',
    location: { x: 24, y: 62 },
    documents: verifiedDocs([120, 500, 210, 40, 330, 200], true),
    responseMinutes: 6,
    acceptanceRate: 0.48,
    reviews: [
      r('Gemma L.', 5, 'Only firm who could take our campervan. Brilliant.', 3),
      r('Ravi K.', 4, 'Old-school, no nonsense, fair price.', 11),
      r('Sophie T.', 4, 'Took a while to arrive but did a thorough job.', 30),
    ],
  },
  {
    id: 'd4',
    name: 'Sasha Mills',
    company: 'QuickTow Rapid Response',
    phone: '07700 900455',
    rating: 4.8,
    jobsCompleted: 651,
    yearsOperating: 3,
    initials: 'SM',
    accent: '#b6595a',
    verified: false,
    fleet: ['Car', 'Motorbike', 'SUV / 4x4'],
    equipment: ['Spectacle lift', 'Jump pack', 'Tyre kit', 'Lockout kit'],
    base: 'Bracknell',
    location: { x: 70, y: 66 },
    documents: [
      { kind: 'Motor Trade Insurance', status: 'verified', required: true, fileName: 'motor-trade-insurance.pdf', expiresOn: offsetDate(200), uploadedAt: Date.now() - 86400000 * 3 },
      { kind: 'Goods in Transit Insurance', status: 'pending', required: true, fileName: 'goods-in-transit.pdf', uploadedAt: Date.now() - 1000 * 60 * 60 * 4 },
      { kind: 'Public Liability Insurance', status: 'expired', required: true, fileName: 'public-liability-2024.pdf', expiresOn: offsetDate(-12) },
      { kind: 'Driving Licence', status: 'verified', required: true, fileName: 'driving-licence.pdf', expiresOn: offsetDate(600) },
      { kind: 'DBS Check', status: 'missing', required: true },
    ],
    responseMinutes: 1,
    acceptanceRate: 0.7,
    reviews: [
      r('Ben H.', 5, 'Fastest arrival I have ever had from a recovery firm.', 1),
      r('Nia F.', 5, 'Friendly and quick.', 8),
    ],
  },
  {
    id: 'd5',
    name: 'Ollie Bramwell',
    company: 'Bramwell Breakdown & Recovery',
    phone: '07700 900509',
    rating: 4.95,
    jobsCompleted: 3021,
    yearsOperating: 14,
    initials: 'OB',
    accent: '#af8a3f',
    verified: true,
    fleet: ['Car', 'Van', 'SUV / 4x4', 'Light Truck'],
    equipment: ['Flatbed', 'Spectacle lift', 'Winch', 'Jump pack', 'Tyre kit', 'Fuel can', 'Lockout kit'],
    base: 'Wokingham',
    location: { x: 64, y: 52 },
    documents: verifiedDocs([365, 250, 140, 410, 70, 380], true),
    responseMinutes: 2,
    acceptanceRate: 0.66,
    reviews: [
      r('Mia C.', 5, 'The gold standard. Turned up with everything and fixed it roadside.', 4),
      r('Jake O.', 5, 'Fixed price was exactly what I paid. No surprises.', 6),
      r('Farah A.', 5, 'Absolutely lovely, checked I was safe before anything else.', 18),
    ],
  },
  {
    id: 'd6',
    name: 'Grace Odinaka',
    company: 'Northline Vehicle Recovery',
    phone: '07700 900633',
    rating: 4.6,
    jobsCompleted: 498,
    yearsOperating: 4,
    initials: 'GO',
    accent: '#8a6a8f',
    verified: true,
    fleet: ['Car', 'Van'],
    equipment: ['Flatbed', 'Jump pack', 'Fuel can', 'Tyre kit'],
    base: 'Reading',
    location: { x: 46, y: 24 },
    documents: verifiedDocs([280, 190, 350, 100, 220]),
    responseMinutes: 4,
    acceptanceRate: 0.5,
    reviews: [
      r('Owen D.', 5, 'Clear pricing, no fuss.', 7),
      r('Chloe B.', 4, 'Good, but I had to chase for an ETA update.', 25),
    ],
  },
]

export const YOU_ID = 'you'

export function findSeedDriver(id: string) {
  return DRIVERS.find((d) => d.id === id)
}
