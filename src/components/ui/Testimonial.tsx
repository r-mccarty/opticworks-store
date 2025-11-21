export default function Testimonial() {
  return (
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-slate-950 to-black text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(140,123,255,0.15),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(92,225,230,0.12),transparent_45%)]" />
      <div className="relative z-10 grid gap-10 p-10 lg:grid-cols-[1fr_0.9fr] lg:p-16">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Trusted by Home Assistant power users
          </p>
          <blockquote className="text-2xl leading-normal text-balance sm:text-3xl">
            “The first mmWave sensor that behaves like a well-prompted model: quiet, intentional, and fully explainable. The debug text sensor reads like a trace log.”
          </blockquote>
          <div className="space-y-1 text-white/80">
            <p className="text-lg font-semibold text-white">Sasha Monroe</p>
            <p className="text-sm">Home Assistant Moderator</p>
          </div>
        </div>
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">Live HA dashboard</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-white/60">binary_sensor.bed_occupied</p>
              <p className="text-2xl font-mono text-emerald-300">ON</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-white/60">presence_state_reason</p>
              <p className="font-mono text-amber-200">DEBOUNCING_OFF → PRESENT</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-white/60">last_high_confidence_at</p>
              <p className="font-mono text-sky-200">03:18:29</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-white/60">abs_clear_delay_remaining</p>
              <p className="font-mono text-emerald-200">23.7 s</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-white/80">
            <p className="text-white/50">log:</p>
            <p className="mt-2">{`03:18:29  z=3.7 < k_off → start abs_clear_delay`}</p>
            <p>{`03:18:59  delay met → DEBOUNCING_OFF`}</p>
            <p>{`03:19:04  timer met → IDLE`}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
