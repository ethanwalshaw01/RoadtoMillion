import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Job } from '../types'
import { useJobs } from '../state/JobsContext'
import { clock } from '../lib/format'
import Modal from './ui/Modal'
import Avatar from './ui/Avatar'
import Icon from './ui/Icon'

const QUICK: Record<'customer' | 'driver', string[]> = {
  customer: ['What is your ETA?', 'We are behind the barrier, hazards on.', 'Two passengers and a dog with me.', 'Can I pay by card?'],
  driver: ['Leaving now, ETA as quoted.', 'Are you in a safe place?', 'Please have the keys ready.', 'Pulling up now, look for the flatbed.'],
}

export default function ChatDrawer({
  job,
  me,
  counterpart,
  onClose,
}: {
  job: Job
  me: 'customer' | 'driver'
  counterpart: { name: string; initials: string; color: string; subtitle: string }
  onClose: () => void
}) {
  const { messagesFor, sendMessage } = useJobs()
  const messages = messagesFor(job.id)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const lastCount = useRef(messages.length)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    if (messages.length > lastCount.current) setTyping(false)
    lastCount.current = messages.length
  }, [messages.length])

  function send(t: string) {
    const v = t.trim()
    if (!v) return
    sendMessage(job.id, me, v)
    setText('')
    // The other party is simulated when it isn't also "you"; hint that a reply is coming.
    setTyping(true)
    setTimeout(() => setTyping(false), 4200)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(text)
  }

  return (
    <Modal onClose={onClose} side eyebrow={job.ref} title={counterpart.name}>
      <div className="-mx-5 -mt-2 flex h-[calc(92vh-120px)] flex-col sm:-mx-6 sm:h-[calc(100vh-110px)]">
        <div className="flex items-center gap-3 border-b border-line px-5 pb-3 sm:px-6">
          <Avatar initials={counterpart.initials} color={counterpart.color} size={34} />
          <p className="text-xs text-ink-2">{counterpart.subtitle}</p>
        </div>

        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-5 py-4 sm:px-6">
          <p className="mx-auto max-w-xs text-center text-[11px] leading-relaxed text-ink-3">
            Messages are only visible to you and {counterpart.name.split(' ')[0]}. Share marker posts, landmarks or anything that helps them find you.
          </p>
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const mine = m.from === me
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${mine ? 'rounded-br-md bg-accent text-accent-ink' : 'rounded-bl-md bg-surface-2 text-ink'}`}>
                    <p>{m.text}</p>
                    <p className={`mt-0.5 text-right font-mono text-[10px] ${mine ? 'text-accent-ink/70' : 'text-ink-3'}`}>{clock(m.at)}</p>
                  </div>
                </motion.div>
              )
            })}
            {typing && (
              <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18 }}
                      className="h-1.5 w-1.5 rounded-full bg-ink-2"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-line bg-elev px-5 pb-4 pt-3 sm:px-6">
          <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {QUICK[me].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-line-strong bg-surface px-3 py-1 text-xs text-ink-2 transition-colors hover:border-accent/60 hover:text-ink"
              >
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="h-11 flex-1 rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink placeholder:text-ink-3"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!text.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-ink transition-opacity disabled:opacity-40"
            >
              <Icon name="send" size={18} />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  )
}
