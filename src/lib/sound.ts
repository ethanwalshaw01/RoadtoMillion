let ctx: AudioContext | null = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

/** Two-note chime, synthesised so the demo ships no audio assets. */
export function chime(kind: 'bid' | 'accept' | 'alert' = 'bid') {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') void c.resume().catch(() => undefined)
  const notes = kind === 'bid' ? [880, 1174] : kind === 'accept' ? [659, 880, 1318] : [440, 330]
  const now = c.currentTime
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, now + i * 0.11)
    gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.11 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.22)
    osc.connect(gain).connect(c.destination)
    osc.start(now + i * 0.11)
    osc.stop(now + i * 0.11 + 0.25)
  })
}
