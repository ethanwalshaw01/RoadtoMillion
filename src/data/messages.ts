import type { IssueType, Urgency } from '../types'

export const BID_MESSAGES: Record<'calm' | 'urgent', string[]> = {
  calm: [
    "On it. I'll keep you posted as I get closer.",
    'Fully equipped for this one, ready when you are.',
    'Nearby already, can divert straight over.',
    'Flatbed on board, will keep the car off the ground the whole way.',
    'Just finishing a drop nearby, can be with you shortly.',
    'Happy to take you and passengers in the cab.',
  ],
  urgent: [
    'Dropping current job, prioritising you now.',
    'Closest unit to you. Can move fast.',
    'Emergency kit on board, leaving the depot now.',
    'I know that stretch well, will approach from the safe side.',
    'Blue-light trained, will get you off the carriageway first.',
  ],
}

export function pickBidMessage(urgency: Urgency) {
  const list = urgency === 'Emergency' ? BID_MESSAGES.urgent : BID_MESSAGES.calm
  return list[Math.floor(Math.random() * list.length)]!
}

export const INCLUDES_BY_ISSUE: Record<IssueType, string[]> = {
  'Flat tyre': ['Tyre swap on site', 'Tow if no spare'],
  "Won't start": ['Jump start attempt', 'Tow to garage'],
  'Accident recovery': ['Flatbed', 'Debris clear', 'Passenger transport'],
  'Ran out of fuel': ['10L emergency fuel', 'Fuel cost extra'],
  'Wrong fuel': ['Fuel drain', 'Tank flush', 'Disposal'],
  'Stuck / off-road': ['Winch recovery', 'Tow to road'],
  'Engine failure': ['Flatbed', 'Tow to garage'],
  Overheating: ['Coolant top-up', 'Tow if needed'],
  'Locked out': ['Non-destructive entry', 'No damage guarantee'],
  Other: ['Assessment on site'],
}

/** Canned driver replies for the in-job chat, chosen by keyword. */
export function driverReplyFor(text: string, driverName: string): string {
  const t = text.toLowerCase()
  const first = driverName.split(' ')[0]
  if (/(eta|how long|when|far)/.test(t)) return `Should be with you in a few minutes, traffic is moving. ${first}`
  if (/(safe|hard shoulder|barrier|scared|worried)/.test(t)) return 'Stay behind the barrier if you can and keep hazards on. Nearly there.'
  if (/(kids|child|dog|passenger|people)/.test(t)) return 'No problem, there is room in the cab for everyone. Dog is fine too.'
  if (/(price|cost|pay|card|cash)/.test(t)) return 'Price is fixed at what you accepted. Card or cash on completion, whichever suits.'
  if (/(thank|cheers|great|brilliant)/.test(t)) return 'No worries at all. See you shortly.'
  if (/(where|location|find|which)/.test(t)) return 'I have the pin from the job. If you can see a marker post number, send it over and I will confirm.'
  if (/(keys|key)/.test(t)) return 'Keep the keys with you, I only need them once I have the vehicle on the bed.'
  const generic = [
    'Got it, thanks for letting me know.',
    'Understood. Will update you when I am close.',
    'Thanks. Sit tight, on my way.',
  ]
  return generic[Math.floor(Math.random() * generic.length)]!
}

/** Canned customer replies when the signed-in user is the driver. */
export function customerReplyFor(text: string): string {
  const t = text.toLowerCase()
  if (/(eta|minutes|min|on my way|leaving)/.test(t)) return 'Thank you, I will be by the car with the hazards on.'
  if (/(safe|barrier)/.test(t)) return 'Yes, we are behind the barrier and out of the vehicle.'
  if (/(keys|key)/.test(t)) return 'I have the keys with me.'
  if (/(arriv|here|pulling up)/.test(t)) return 'I can see you. Silver estate, hazards on.'
  const generic = ['Great, thanks.', 'Okay, understood.', 'Thanks for the update.']
  return generic[Math.floor(Math.random() * generic.length)]!
}

export const RATING_TAGS = ['Fast arrival', 'Friendly', 'Careful with vehicle', 'Kept me updated', 'Fair price', 'Well equipped']

export const CANCEL_REASONS = [
  'Fixed it myself',
  'Got help elsewhere',
  'Bids too expensive',
  'Posted by mistake',
  'Other',
]
