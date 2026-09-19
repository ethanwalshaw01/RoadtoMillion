import { useState } from 'react'
import type { JobRating } from '../types'
import { RATING_TAGS } from '../data/messages'
import RatingStars from './RatingStars'
import Chip from './ui/Chip'
import Button from './ui/Button'
import { Textarea } from './ui/Field'

export default function RatingForm({
  driverName,
  onSubmit,
}: {
  driverName: string
  onSubmit: (rating: Omit<JobRating, 'at'>) => void
}) {
  const [stars, setStars] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [comment, setComment] = useState('')

  const WORD = ['', 'Poor', 'Meh', 'Good', 'Great', 'Outstanding'][stars]

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <p className="eyebrow">Rate your recovery</p>
      <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-ink">How did {driverName.split(' ')[0]} do?</h3>
      <div className="mt-4 flex items-center gap-3">
        <RatingStars value={stars} onChange={setStars} size={30} />
        <span className="font-display text-base font-semibold uppercase tracking-wider text-ink-2">{WORD}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {RATING_TAGS.map((t) => (
          <Chip
            key={t}
            active={tags.includes(t)}
            onClick={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
          >
            {t}
          </Chip>
        ))}
      </div>
      <Textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything other customers should know? (optional)"
        className="mt-4"
      />
      <Button className="mt-4" block size="lg" icon="star" disabled={stars === 0} onClick={() => onSubmit({ stars, tags, comment: comment.trim() || undefined })}>
        Submit rating
      </Button>
    </div>
  )
}
