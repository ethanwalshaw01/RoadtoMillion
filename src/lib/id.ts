const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function uid(prefix = '') {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}${Date.now().toString(36)}${rand}`
}

/** Short human-readable job reference, e.g. RCV-7K3Q. */
export function jobRef() {
  let s = ''
  for (let i = 0; i < 4; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return `RCV-${s}`
}
