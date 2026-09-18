export default function RoadBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade" />
      <div
        className="absolute bottom-0 left-1/2 h-24 w-[1400px] -translate-x-1/2 rotate-[-2deg] bg-asphalt-800/60 opacity-60 blur-[1px]"
        aria-hidden
      >
        <div className="absolute inset-y-0 left-0 h-1.5 w-full animate-drift bg-road-lines opacity-70" />
      </div>
    </div>
  )
}
