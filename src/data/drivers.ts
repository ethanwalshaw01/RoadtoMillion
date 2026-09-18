import { REQUIRED_DOCUMENTS, type Driver, type DriverDocument } from '../types'

function verifiedDocs(expiryOffsets: number[]): DriverDocument[] {
  return REQUIRED_DOCUMENTS.map((kind, i) => ({
    kind,
    status: 'verified',
    fileName: `${kind.toLowerCase().replace(/ /g, '-')}.pdf`,
    expiresOn: offsetDate(expiryOffsets[i % expiryOffsets.length]),
    uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  }))
}

function offsetDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

export const DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Marcus Ellery',
    company: 'Apex Roadside Recovery',
    rating: 4.9,
    jobsCompleted: 1284,
    initials: 'ME',
    accent: '#c17a3d',
    verified: true,
    fleet: ['Car', 'SUV / 4x4', 'Van'],
    documents: verifiedDocs([210, 340, 95, 480, 150]),
  },
  {
    id: 'd2',
    name: 'Priya Nadarajah',
    company: 'Nightowl Towing Co.',
    rating: 4.7,
    jobsCompleted: 842,
    initials: 'PN',
    accent: '#4a7391',
    verified: true,
    fleet: ['Car', 'Motorbike'],
    documents: verifiedDocs([300, 180, 400, 260, 90]),
  },
  {
    id: 'd3',
    name: 'Dale Foster',
    company: 'Foster & Sons Recovery',
    rating: 4.5,
    jobsCompleted: 2310,
    initials: 'DF',
    accent: '#5f8f6e',
    verified: true,
    fleet: ['Car', 'Van', 'Light Truck', 'SUV / 4x4'],
    documents: verifiedDocs([120, 500, 210, 40, 330]),
  },
  {
    id: 'd4',
    name: 'Sasha Mills',
    company: 'QuickTow Rapid Response',
    rating: 4.8,
    jobsCompleted: 651,
    initials: 'SM',
    accent: '#b6595a',
    verified: false,
    fleet: ['Car', 'Motorbike', 'SUV / 4x4'],
    documents: [
      { kind: 'Motor Trade Insurance', status: 'verified', fileName: 'motor-trade-insurance.pdf', expiresOn: offsetDate(200), uploadedAt: Date.now() },
      { kind: 'Goods in Transit Insurance', status: 'pending', fileName: 'goods-in-transit.pdf', uploadedAt: Date.now() - 1000 * 60 * 60 * 4 },
      { kind: 'Public Liability Insurance', status: 'expired', fileName: 'public-liability-2023.pdf', expiresOn: offsetDate(-12) },
      { kind: 'Driving Licence', status: 'verified', fileName: 'driving-licence.pdf', expiresOn: offsetDate(600) },
      { kind: 'DBS Check', status: 'missing' },
    ],
  },
  {
    id: 'd5',
    name: 'Ollie Bramwell',
    company: 'Bramwell Breakdown & Recovery',
    rating: 4.95,
    jobsCompleted: 3021,
    initials: 'OB',
    accent: '#af8a3f',
    verified: true,
    fleet: ['Car', 'Van', 'SUV / 4x4', 'Light Truck'],
    documents: verifiedDocs([365, 250, 140, 410, 70]),
  },
  {
    id: 'd6',
    name: 'Grace Odinaka',
    company: 'Northline Vehicle Recovery',
    rating: 4.6,
    jobsCompleted: 498,
    initials: 'GO',
    accent: '#8a6a8f',
    verified: true,
    fleet: ['Car', 'Van'],
    documents: verifiedDocs([280, 190, 350, 100, 220]),
  },
]
