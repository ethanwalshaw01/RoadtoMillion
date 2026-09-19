import type { SVGProps } from 'react'

export type IconName =
  | 'truck'
  | 'pin'
  | 'flag'
  | 'clock'
  | 'star'
  | 'shield'
  | 'shield-check'
  | 'check'
  | 'x'
  | 'chevron-down'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-left'
  | 'bell'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'phone'
  | 'chat'
  | 'tag'
  | 'eye'
  | 'broadcast'
  | 'bolt'
  | 'users'
  | 'wrench'
  | 'fuel'
  | 'key'
  | 'car'
  | 'bike'
  | 'van'
  | 'search'
  | 'filter'
  | 'sort'
  | 'plus'
  | 'minus'
  | 'upload'
  | 'trash'
  | 'info'
  | 'warning'
  | 'compass'
  | 'radar'
  | 'wallet'
  | 'trophy'
  | 'share'
  | 'refresh'
  | 'send'
  | 'sparkle'
  | 'crosshair'
  | 'settings'
  | 'logout'
  | 'user'
  | 'document'
  | 'grid'
  | 'list'
  | 'volume'
  | 'volume-off'
  | 'history'

const PATHS: Record<IconName, JSX.Element> = {
  truck: (
    <>
      <path d="M3 7h10v8H3zM13 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="1.8" />
      <circle cx="17" cy="17" r="1.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
  flag: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8L12 3.5z" />,
  shield: <path d="M12 3l7 2.6v5.2c0 4.6-3 8.3-7 10.2-4-1.9-7-5.6-7-10.2V5.6L12 3z" />,
  'shield-check': (
    <>
      <path d="M12 3l7 2.6v5.2c0 4.6-3 8.3-7 10.2-4-1.9-7-5.6-7-10.2V5.6L12 3z" />
      <path d="M8.8 12l2.2 2.2 4.3-4.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  'arrow-right': <path d="M4 12h16m-6-6l6 6-6 6" />,
  'arrow-left': <path d="M20 12H4m6-6l-6 6 6 6" />,
  bell: (
    <>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  chat: <path d="M4 5h16v11H9l-5 4V5z" />,
  tag: (
    <>
      <path d="M3 12V4h8l9 9-8 8-9-9z" />
      <circle cx="7.5" cy="8.5" r="1.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  broadcast: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.5 18.5a9 9 0 0 1 0-13M18.5 5.5a9 9 0 0 1 0 13" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5a3 3 0 0 1 0 6M21 20a5.5 5.5 0 0 0-4.5-5.4" />
    </>
  ),
  wrench: <path d="M14.5 3.5a5 5 0 0 0-5.7 6.8L3 16l3 3 5.8-5.8a5 5 0 0 0 6.7-5.7l-3 3-2.5-.5-.5-2.5 3-3z" />,
  fuel: (
    <>
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M5 21h10M6 11h8M15 9l3-1v8a1.5 1.5 0 0 0 3 0V9l-2-2" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="14" r="4.5" />
      <path d="M11.5 10.5L20 2m-3 3l2.5 2.5M14.5 7.5L17 10" />
    </>
  ),
  car: (
    <>
      <path d="M4 16l2-6a2 2 0 0 1 1.9-1.4h8.2A2 2 0 0 1 18 10l2 6M3 16h18v3H3z" />
      <circle cx="7.5" cy="19" r="1.5" />
      <circle cx="16.5" cy="19" r="1.5" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="M6 16l4-7h4l4 7M10 9l-1.5-3H6M14 9l2 7" />
    </>
  ),
  van: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />,
  sort: <path d="M4 7h16M7 12h10M10 17h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  upload: <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 10v4M12 17v.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12l6-6" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13v4H5a2 2 0 0 1-2-2zM3 7v10a2 2 0 0 0 2 2h16V9H5a2 2 0 0 1-2-2z" />
      <circle cx="17" cy="14" r="1" />
    </>
  ),
  trophy: <path d="M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4m-4 2h8" />,
  share: (
    <>
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 11l8-4M8 13l8 4" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 0 1-14.5 4.6M4 12a8 8 0 0 1 14.5-4.6M4 5v4h4M20 19v-4h-4" />,
  send: <path d="M3 11l18-8-8 18-2-8-8-2z" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM5 17l.8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8L5 17z" />,
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5l1.6 2.6 3-.6.6 3 2.6 1.6-1.2 2.9 1.2 2.9-2.6 1.6-.6 3-3-.6L12 21.5l-1.6-2.6-3 .6-.6-3-2.6-1.6 1.2-2.9L4.2 9.1l2.6-1.6.6-3 3 .6L12 2.5z" />
    </>
  ),
  logout: <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  document: <path d="M6 3h8l5 5v13H6V3zM14 3v5h5M9 13h6M9 17h6" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  list: <path d="M4 6h16M4 12h16M4 18h16" />,
  volume: <path d="M4 10v4h3l4 4V6L7 10H4zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />,
  'volume-off': <path d="M4 10v4h3l4 4V6L7 10H4zM16 9l5 6M21 9l-5 6" />,
  history: <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5M12 8v4l3 2" />,
}

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  strokeWidth?: number
}

export default function Icon({ name, size = 18, strokeWidth = 1.8, className = '', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
