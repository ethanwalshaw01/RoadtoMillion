# RoadtoMillion — Recovr

A sample UI for a car recovery bidding marketplace. Customers post a
breakdown job, verified recovery drivers bid on it in real time with a
fixed price and ETA, and the customer picks the bid that works best for
them (price, speed, or rating). A simplified driver-side board is also
included so you can see the other half of the marketplace.

This is a front-end demo — all data (jobs, bids, drivers) is simulated
in-memory, there's no backend.

## Stack

React + TypeScript + Vite + Tailwind CSS + React Router.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Key flows:

- **Home** — landing page / pitch
- **Request Recovery** — post a job as a customer
- **Job page** — watch simulated bids arrive live, sort by price / ETA /
  rating, accept one
- **Confirmed page** — simulated live tracker for the accepted job
- **Driver Board** — browse open jobs and place a bid as a recovery driver

## Build

```bash
npm run build
```
