import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'

export default function CountUp({
  to,
  format = (n) => Math.round(n).toLocaleString('en-GB'),
  duration = 1.2,
  className = '',
}: {
  to: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [value, setValue] = useState(0)

  const [forced, setForced] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setForced(true), 1400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!inView && !forced) return
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [inView, forced, to, duration])

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {format(value)}
    </span>
  )
}
