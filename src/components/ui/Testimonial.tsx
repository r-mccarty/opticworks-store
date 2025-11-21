export default function Testimonial() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_30px_120px_rgba(15,23,42,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.2),_transparent_60%)] blur-3xl" />
      <div className="relative z-10 grid gap-10 p-10 text-white lg:grid-cols-[1fr_0.8fr] lg:p-20">
        <div>
          <p className="mono-meta text-sm uppercase tracking-[0.25em] text-white/50 sm:tracking-[0.4em]">
            Trusted by Home Assistant power users
          </p>
          <blockquote className="mt-6 text-2xl leading-normal text-balance sm:text-3xl font-black tracking-[-0.02em]">
            “I&apos;ve tried every mmWave board out there. This is the first
            sensor that stays ON while I&apos;m reading in bed and instantly
            clears once I stand up. The debug text sensor makes it totally
            transparent.”
          </blockquote>
          <div className="mt-10 space-y-1 text-white/80">
            <p className="text-lg font-semibold text-white">Sasha Monroe</p>
            <p className="text-sm">Home Assistant Moderator</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 glass-panel">
          <p className="mono-meta text-xs uppercase tracking-[0.2em] text-white/50 sm:tracking-[0.35em]">
            Live HA Dashboard
          </p>
          <div className="mt-6 space-y-5 text-sm text-white/80">
            <div>
              <p className="text-white/60">binary_sensor.bed_occupied</p>
              <p className="text-2xl font-mono text-emerald-300">ON</p>
            </div>
            <div>
              <p className="text-white/60">text_sensor.presence_state_reason</p>
              <p className="font-mono text-amber-200">DEBOUNCING_OFF → PRESENT</p>
            </div>
            <div>
              <p className="text-white/60">debug.last_high_confidence_at</p>
              <p className="font-mono text-sky-200">03:18:29</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-xs text-white/80">
            <p>log:</p>
            <p className="mt-2">{`03:18:29  z=3.7 < k_off → start abs_clear_delay`}</p>
            <p>{`03:18:59  delay met → DEBOUNCING_OFF`}</p>
            <p>{`03:19:04  timer met → IDLE`}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
