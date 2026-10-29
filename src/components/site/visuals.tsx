/**
 * "Optical Superposition" visual vocabulary: overlapping signals, registration
 * marks, layered geometry. All decorative SVG, aria-hidden unless captioned by a
 * <figure>. Motion is CSS-only and disabled under prefers-reduced-motion (globals.css).
 */
import { cx } from "@/lib/utils"

const ringRadii = (count: number, step: number, start = 6) =>
  Array.from({ length: count }, (_, i) => start + i * step)

/** Crosshair-in-circle registration mark. */
export function RegistrationMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 28 28" width={size} height={size} className={className} fill="none">
      <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="1" />
      <path d="M14 0v28M0 14h28" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/**
 * Hero field: two sets of concentric rings, offset and slowly drifting, whose
 * interference produces a moiré: literally a superposition of two signals.
 */
export function SuperpositionField({ className }: { className?: string }) {
  const radii = ringRadii(46, 8.5)
  return (
    <svg aria-hidden viewBox="0 0 800 800" className={cx("h-full w-full", className)} fill="none">
      <defs>
        <radialGradient id="sf-fade" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="sf-mask">
          <rect width="800" height="800" fill="url(#sf-fade)" />
        </mask>
      </defs>
      <g mask="url(#sf-mask)">
        <g stroke="var(--color-text-subtle)" strokeWidth="0.75" opacity="0.55">
          {radii.map((r) => (
            <circle key={`a${r}`} cx="400" cy="400" r={r} />
          ))}
        </g>
        <g
          stroke="var(--color-amber)"
          strokeWidth="0.75"
          opacity="0.7"
          className="animate-drift [transform-box:fill-box] [transform-origin:center]"
        >
          {radii.map((r) => (
            <circle key={`b${r}`} cx="436" cy="384" r={r} />
          ))}
        </g>
      </g>
      {/* registration annotations */}
      <g stroke="var(--color-line-strong)" strokeWidth="1">
        <path d="M400 40v40M400 720v40M40 400h40M720 400h40" />
        <circle cx="400" cy="400" r="5" />
        <path d="M436 384m-5 0h10m-5-5v10" stroke="var(--color-amber)" />
      </g>
      <g fill="var(--color-text-subtle)" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.5">
        <text x="412" y="420">REF A</text>
        <text x="448" y="372" fill="var(--color-amber)">
          REF B
        </text>
        <text x="40" y="60">Δ 36.0 / −16.0</text>
      </g>
    </svg>
  )
}

/**
 * Front-elevation schematic of a compact vertical machining center.
 * Generic illustration only: no dimensions, not derived from the prototype CAD.
 */
export function VmcSchematic({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 600 520" className={cx("h-full w-full", className)} fill="none">
      {/* offset ghost layer (superposition) */}
      <g stroke="var(--color-amber)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5" transform="translate(10 -8)">
        <rect x="90" y="40" width="420" height="440" rx="2" />
      </g>
      <g stroke="var(--color-text-muted)" strokeWidth="1.25" strokeLinejoin="round">
        {/* enclosure */}
        <rect x="90" y="40" width="420" height="440" rx="2" strokeOpacity="0.6" />
        <path d="M110 120h380v300H110z" strokeOpacity="0.35" />
        {/* base */}
        <path d="M150 430h300v30H150z" />
        {/* column */}
        <path d="M330 110h70v320h-70z" />
        {/* head + spindle */}
        <path d="M250 170h110v80H250z" />
        <path d="M280 250h40v34h-40z" />
        <path d="M290 284h20l-6 34h-8z" stroke="var(--color-amber)" />
        {/* table + saddle */}
        <path d="M170 360h250v16H170z" />
        <path d="M220 376h150v22H220z" />
        <path d="M200 398h190v32H200z" />
        {/* workpiece */}
        <path d="M265 336h70v24h-70z" stroke="var(--color-amber)" />
      </g>
      {/* axis annotations */}
      <g stroke="var(--color-amber)" strokeWidth="1">
        <path d="M530 170v90m0 0-5-8m5 8 5-8" />
        <path d="M170 492h120m0 0-8-5m8 5-8 5" />
      </g>
      <g fill="var(--color-text-subtle)" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.5">
        <text x="540" y="220">Z</text>
        <text x="300" y="507">X</text>
        <text x="372" y="102">COLUMN</text>
        <text x="170" y="164">SPINDLE · ISO20</text>
        <text x="430" y="372">TABLE</text>
        <text x="100" y="32">ENCLOSURE</text>
      </g>
      <g stroke="var(--color-line-strong)" strokeWidth="1">
        <path d="M60 20h20M70 10v20M520 500h20M530 490v20" />
      </g>
    </svg>
  )
}

/**
 * A fast signal sampled by a sequence of exposure frames: the idea of high-speed
 * imaging. Conceptual only.
 */
export function Mach1Schematic({ className }: { className?: string }) {
  const width = 600
  const mid = 210
  const path = Array.from({ length: 241 }, (_, i) => {
    const x = 30 + i * 2.25
    const t = i / 240
    const y = mid + Math.sin(t * Math.PI * 9) * 90 * Math.exp(-t * 1.6)
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  const frames = Array.from({ length: 16 }, (_, i) => 42 + i * 33)

  return (
    <svg aria-hidden viewBox={`0 0 ${width} 420`} className={cx("h-full w-full", className)} fill="none">
      <g stroke="var(--color-line-strong)" strokeWidth="1">
        <path d={`M30 ${mid}H${width - 30}`} strokeDasharray="2 6" />
      </g>
      <g stroke="var(--color-line)" strokeWidth="1">
        {frames.map((x) => (
          <rect key={x} x={x - 11} y="80" width="22" height="260" />
        ))}
      </g>
      <path d={path} stroke="var(--color-text-muted)" strokeWidth="1.25" />
      <g fill="var(--color-amber)">
        {frames.map((x) => {
          const t = (x - 30) / 540
          const y = mid + Math.sin(t * Math.PI * 9) * 90 * Math.exp(-t * 1.6)
          return <circle key={x} cx={x} cy={y} r="3.2" />
        })}
      </g>
      <g fill="var(--color-text-subtle)" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.5">
        <text x="30" y="372">t →</text>
        <text x="31" y="66">FRAME 01</text>
        <text x="450" y="66">FRAME 16</text>
      </g>
    </svg>
  )
}

/** Three registered layers (machines, sensing, software) offset like stacked exposures. */
export function PlatformLayers({ className }: { className?: string }) {
  const layers = [
    { y: 250, label: "MACHINES", sub: "Motion · tooling", tone: "var(--color-text-muted)" },
    { y: 160, label: "SENSING", sub: "Imaging · measurement", tone: "var(--color-text-muted)" },
    { y: 70, label: "SOFTWARE", sub: "Control · automation", tone: "var(--color-amber)" },
  ]
  return (
    <svg aria-hidden viewBox="0 0 600 400" className={cx("h-full w-full", className)} fill="none">
      {layers.map((layer, i) => {
        const dx = 20 + i * 20
        const rightX = dx + 360
        const midY = layer.y + 40
        return (
          <g key={layer.label}>
            <path
              d={`M${dx} ${midY} L${dx + 180} ${layer.y} L${rightX} ${midY} L${dx + 180} ${layer.y + 80} Z`}
              stroke={layer.tone}
              strokeWidth="1.25"
              fill={i === 2 ? "var(--color-amber-dim)" : "transparent"}
            />
            {/* Leader from the layer's right vertex to its label */}
            <path d={`M${rightX + 6} ${midY}H444`} stroke="var(--color-line-strong)" />
            <circle cx={rightX} cy={midY} r="2.5" fill={layer.tone} />
          </g>
        )
      })}
      <g stroke="var(--color-line-strong)" strokeDasharray="2 5">
        <path d="M200 110v240M240 110v240" />
      </g>
      <g fontFamily="var(--font-mono)" letterSpacing="1.5">
        {layers.map((layer) => (
          <g key={layer.label}>
            <text x="454" y={layer.y + 38} fill={layer.tone} fontSize="12">
              {layer.label}
            </text>
            <text x="454" y={layer.y + 56} fill="var(--color-text-subtle)" fontSize="10" letterSpacing="0.5">
              {layer.sub}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
