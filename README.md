# Recovr

A front-end demo of a live-bidding roadside recovery marketplace. Customers post
a breakdown, verified recovery drivers bid in real time with a fixed price and
ETA, and the customer picks whoever suits them on price, speed or rating. The
other half of the marketplace, the driver board, is fully playable too.

Everything is simulated in the browser. Drivers, bids, chat replies, the
marketplace's decisions on your bids and the "live" tracker are all fake, and
all state lives in `localStorage`, so a refresh keeps your jobs, bids,
messages and driver profile.

## What's in it

**Customer side**

- Three-step job wizard: vehicle and issue, location (with "use my location"
  and place suggestions), urgency, bidding window, optional price cap and
  contact number. A live price estimate updates as you go.
- Live bidding page with a countdown, activity feed (driver views, bids, price
  drops), smart / price / ETA / rating sort, card or comparison-table view,
  hide-and-restore bids, driver profile drawer (documents, fleet, equipment,
  reviews), extend the window when it expires, repost, cancel with a reason.
- Tracker with an animated route map, status stepper, in-job chat with canned
  replies, call sheet, share ETA, late-cancellation fee warning, confirm
  recovery, then a rating form with tags and a comment.
- My jobs: active and history tabs with spend and rating stats.

**Driver side**

- Online / offline toggle. While online, simulated customers post jobs to the
  board and other drivers bid on them.
- Radar view of open jobs around your depot, filters by fleet, urgency and
  distance, search and sort, plus a "my bids" tab with outcomes.
- Bid sheet with market hints (typical price, lowest rival bid, customer cap),
  one-tap undercut / match chips, ETA suggestions from drive time, inclusions
  and a message. The simulated customer then accepts or passes based on how
  competitive and how verified you are.
- Active job page: start driving, mark arrived, mark recovered, chat with the
  customer, then receive a rating.
- Account page: business profile, service radius, fleet and equipment,
  document uploads with expiry tracking and simulated review, bid defaults,
  earnings and win-rate stats.

**Everywhere**

- Night and day themes, reduced-motion preference, optional sound on activity.
- Notification bell with per-role unread counts, toasts for anything that
  happens while you're elsewhere.
- Mobile layouts for every page, including a collapsible radar on the board.
- Settings page with demo-data reset.

## Design

The UI is built around a "night dispatch" identity: an asphalt-dark default
theme with film grain, hi-vis amber for the customer side and beacon blue for
the driver side (swapped with one CSS variable), hazard-stripe accents,
perforated "ticket" job cards, viewfinder-bracket selection states, Barlow
Condensed signage type for headings and JetBrains Mono for every number.
All colours are RGB-triplet CSS variables, so Tailwind opacity modifiers work
in both themes.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, React Router (hash routing so it
works on any static host), Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

Sign in with any name, pick a side, and switch sides from the user menu at any
time. Jobs you post as a customer show up on the driver board, and bids you
place as a driver show up on your own job page.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # typecheck + production build to dist/
npm run lint     # eslint
npm run preview  # serve the production build
```
