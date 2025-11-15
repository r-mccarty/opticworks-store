"use client"

import { useMemo, useState, type ComponentType, type ReactNode } from "react"
import { motion } from "framer-motion"
import { Activity, Layers, Radar, Waves } from "lucide-react"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InstallationPhase {
  title: string
  subtitle: string
  icon: ComponentType<{ className?: string }>
  points: string[]
}

interface KnowledgeSection {
  id: string
  eyebrow: string
  title: string
  content: ReactNode
}

const heroHighlights = [
  {
    label: "Calibration",
    value: "60 seconds",
    description: "Baseline capture with our z-score engine ensures the bed's still energy is perfectly mapped.",
  },
  {
    label: "Confidence",
    value: ">0.85",
    description: "Presence state is stabilized by adaptive hysteresis so automations never flicker or fail.",
  },
  {
    label: "Integrations",
    value: "Home Assistant + Matter",
    description: "Expose binary sensors, change reasons, and tuning controls with zero reflashing required.",
  },
]

const installationPhases: InstallationPhase[] = [
  {
    title: "Stage & Align",
    subtitle: "Mount the capsule and align the mmWave field", 
    icon: Layers,
    points: [
      "Snap the magnetic enclosure to the bracket and fasten it 18\" from the headboard, centered beneath the mattress.",
      "If you have an adjustable base, clip the enclosure to the moving rail to keep orientation locked-in.",
      "Confirm the radar window is parallel with the mattress — millimeter precision matters for stillness detection.",
    ],
  },
  {
    title: "Power & Route",
    subtitle: "Deliver pristine power and shielded data",
    icon: Waves,
    points: [
      "Run the braided USB-C lead along the frame using the adhesive strain-relief clips provided.",
      "Seat the cable into the ESP32 hub and connect to a 5V supply capable of 2A to avoid brown-outs during Wi-Fi bursts.",
      "Dress any excess cable inside the enclosure to keep the install invisible from every viewing angle.",
    ],
  },
  {
    title: "Baseline",
    subtitle: "Teach the sensor your version of \"empty\"",
    icon: Radar,
    points: [
      "Open Home Assistant → Integrations → OpticWorks Presence and launch the baseline capture sequence.",
      "Leave the bed untouched for a full 60 seconds while the adaptive filter computes the still-energy offset.",
      "Observe the live z-score trace in the dashboard — it should fall and stabilize between -0.2 and 0.2.",
    ],
  },
  {
    title: "Validate",
    subtitle: "Confirm absolute confidence before shipping automations",
    icon: Activity,
    points: [
      "Lie down naturally. The presence confidence should rise above 0.85 within 2 seconds.",
      "Stay perfectly still for 45 seconds to ensure Absolute Clear Delay holds state and prevents false clears.",
      "Leave the bed. After ~30 seconds the sensor should gracefully return to the Idle state without chatter.",
    ],
  },
]

const timelineSteps = [
  {
    title: "1. Mount the enclosure",
    description:
      "Attach the magnetic enclosure to the included bracket and secure it 18\" from the headboard, centered under the mattress. Adjustable bases can use the clip mounts.",
  },
  {
    title: "2. Route power + data",
    description:
      "Connect the USB-C cable to the ESP32 hub, then tuck the cable along the bed frame using the adhesive clips. Plug into a 5V power supply.",
  },
  {
    title: "3. Capture baseline",
    description:
      "Open Home Assistant → Integrations → OpticWorks Presence and start the baseline. Leave the bed empty for 60 seconds to record the still-energy offset.",
  },
  {
    title: "4. Validate confidence",
    description:
      "Lie on the bed and watch the console for presence confidence > 0.85. Stay still for 45 seconds to confirm Absolute Clear Delay behavior.",
  },
]

const quickChecks = [
  "Sensor mounted under bed rail",
  "USB-C cable strain relieved",
  "Baseline captured with empty bed",
  "Presence flips to Occupied within 2 seconds",
  "Clear delay holds for 30 seconds after getting up",
]

const hardwareInventory = [
  {
    name: "ESP32 Core",
    description: "M5Stack Basic or equivalent with Wi-Fi + BLE",
    cost: "$15–$30",
    notes: "Acts as the secure hub running the OpticWorks Presence firmware profile.",
  },
  {
    name: "LD2410 mmWave Module",
    description: "24GHz radar tuned for still-body detection",
    cost: "$8–$15",
    notes: "Delivers the ultra-fine motion data that powers our 4-state decision engine.",
  },
  {
    name: "USB-C Cable",
    description: "Braided, 1.5m minimum",
    cost: "$3–$5",
    notes: "Used for power and provisioning; rated for sustained current with minimal voltage drop.",
  },
  {
    name: "Jumper Harness",
    description: "4× female-to-female for UART",
    cost: "$2–$5",
    notes: "TX↔RX must cross over; keep runs short for noise immunity.",
  },
]

const placementEssentials = [
  {
    label: "Height",
    detail: "1–3 feet above the mattress plane",
    note: "Keeps the radar lobe tight to the sleep surface while avoiding mattress springs.",
  },
  {
    label: "Position",
    detail: "Centerline of the primary sleeper",
    note: "Balanced coverage ensures equal fidelity for each side of the bed.",
  },
  {
    label: "Angle",
    detail: "Perpendicular to the mattress",
    note: "Prevents the beam from catching walls or dressers that cause ghost returns.",
  },
  {
    label: "Avoid",
    detail: "HVAC vents, mirrored wardrobes, power supplies",
    note: "Thermals and reflections introduce noise the adaptive filter has to fight.",
  },
]

const calibrationFlow = {
  procedure: [
    "Ensure the bed is completely empty — no people, pets, or weighted blankets.",
    "Home Assistant → Developer Tools → Services → esphome.bed_presence_detector_calibrate_start_baseline.",
    "Let the countdown finish (60 seconds). Do not touch or sit on the bed.",
    "Monitor the \"Presence Change Reason\" sensor for \"baseline_captured\" to confirm success.",
  ],
  verification: [
    "Get into bed and relax. binary_sensor.bed_occupied should turn ON within 3–5 seconds.",
    "Exit the bed and wait 30–40 seconds. The sensor should fall back to OFF with no oscillation.",
    "Record the z-score span (k_on to k_off) to inform any future tuning adjustments.",
  ],
}

const telemetryEntities = [
  {
    name: "binary_sensor.bed_occupied",
    description: "Primary automation trigger. Reflects Occupied/Idle states with hysteresis applied.",
  },
  {
    name: "text_sensor.presence_state_reason",
    description: "Verbose telemetry containing z-score, timers, and the active state machine branch.",
  },
  {
    name: "text_sensor.presence_change_reason",
    description: "Last cause of transition — e.g., on:threshold_exceeded, off:debounce_elapsed.",
  },
]

const tuningControls = [
  {
    label: "k_on",
    value: "9.0 (default)",
    description: "Z-score threshold to declare Occupied. Raise if you need more certainty, lower if detections feel slow.",
  },
  {
    label: "k_off",
    value: "4.0 (default)",
    description: "Z-score threshold to clear Occupied. Lowering increases sensitivity to stillness.",
  },
  {
    label: "on_debounce_ms",
    value: "3000",
    description: "Duration the high signal must persist before flipping to Occupied.",
  },
  {
    label: "off_debounce_ms",
    value: "5000",
    description: "Hold time for the low signal prior to clearing the bed.",
  },
  {
    label: "absolute_clear_delay_ms",
    value: "30000",
    description: "Minimum dwell period before we allow an OFF transition after a strong presence event.",
  },
]

const diagnostics = [
  {
    title: "Device never appears in Home Assistant",
    steps: [
      "Confirm Wi-Fi credentials in secrets.yaml — network and password must match casing.",
      "Make sure the ESP32 joined your main VLAN, not a guest SSID that blocks discovery.",
      "Run esphome logs bed-presence-detector.yaml to inspect provisioning output in real time.",
    ],
  },
  {
    title: "binary_sensor stays OFF",
    steps: [
      "Rerun the baseline procedure with the bed completely empty.",
      "Verify the enclosure is within the 1–3 ft height band and still centered.",
      "Inspect TX/RX wiring — they must be crossed and powered strictly at 3.3V.",
      "Check the z-score from presence_state_reason. If it never rises above k_on, reposition the module.",
    ],
  },
  {
    title: "Clears while someone is sleeping",
    steps: [
      "Increase absolute_clear_delay_ms to 60000. If needed, extend to 120000 for extra stillness buffering.",
      "Lower k_off to 3.0 to keep the hysteresis wider in low-motion scenarios.",
    ],
  },
  {
    title: "Rapid ON/OFF flapping",
    steps: [
      "Raise k_on to 10.0 and lower k_off to 3.0 to widen hysteresis.",
      "Increase on/off debounce to 5000ms and 8000ms respectively to smooth noise.",
      "Check jumper connections and cable routing for interference or loose pins.",
    ],
  },
]

const achievements = [
  "Fully functional bed presence sensor anchored to OpticWorks firmware",
  "Accurate stillness detection even during deep sleep or meditation",
  "Zero false positives from HVAC turbulence, pets, or hallway motion",
  "Complete transparency into decisioning via change reasons and z-scores",
  "Tuning controls surfaced in Home Assistant — no reflashing required",
  "Automations that honor true occupancy, not guesswork",
]

function MotionOrb({ className, duration, delay = 0 }: { className?: string; duration: number; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className={cn("absolute rounded-full blur-3xl opacity-60", className)}
      animate={{
        x: ["0%", "12%", "-8%", "6%", "0%"],
        y: ["0%", "-10%", "6%", "-4%", "0%"],
      }}
      transition={{ duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay }}
    />
  )
}

function PhaseCard({ phase, index }: { phase: InstallationPhase; index: number }) {
  const Icon = phase.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-slate-50">
          <Icon className="size-6" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phase {index + 1}</p>
          <h3 className="text-xl font-semibold text-slate-900">{phase.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{phase.subtitle}</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3 text-sm text-slate-600">
        {phase.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full bg-slate-900/10 text-slate-900">
              •
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function BedPresenceGuide() {
  const [activeSection, setActiveSection] = useState<string>("prepare")

  const knowledgeSections: KnowledgeSection[] = useMemo(
    () => [
      {
        id: "prepare",
        eyebrow: "Before you begin",
        title: "Prerequisites & orientation",
        content: (
          <div className="space-y-6 text-sm text-slate-600">
            <div>
              <h4 className="text-base font-semibold text-slate-900">Foundational requirements</h4>
              <ul className="mt-3 space-y-2 pl-4">
                <li>• Home Assistant installed and operating on your network</li>
                <li>• ESPHome integration enabled (dashboard or CLI)</li>
                <li>• 2 uninterrupted hours for mounting, wiring, and calibration</li>
                <li>• Comfortable handling low-voltage wiring and provisioning ESP32 hardware</li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Why this kit is different</h4>
              <ul className="mt-3 space-y-2 pl-4">
                <li>• <strong>Statistical intelligence:</strong> Adaptive z-score baselining with drift monitoring</li>
                <li>• <strong>Four-state verification:</strong> Idle → Micro-motion → Occupied → Clear Delay</li>
                <li>• <strong>Stillness detection:</strong> Comfortably tracks sleepers without body movement</li>
                <li>• <strong>Transparent decisions:</strong> Every transition is logged with human-readable reasons</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "software",
        eyebrow: "Software setup",
        title: "Provision firmware the OpticWorks way",
        content: (
          <div className="space-y-6 text-sm text-slate-600">
            <div>
              <h4 className="text-base font-semibold text-slate-900">ESPHome Dashboard — recommended</h4>
              <ol className="mt-3 space-y-2 list-decimal pl-5">
                <li>Open the ESPHome dashboard inside Home Assistant.</li>
                <li>
                  Clone the reference profile:
                  <code className="mx-2 rounded bg-slate-900/5 px-2 py-1 text-xs">git clone https://github.com/r-mccarty/bed-presence-sensor.git</code>
                </li>
                <li>Create a <code className="rounded bg-slate-900/5 px-1 py-0.5 text-xs">secrets.yaml</code> with Wi-Fi credentials.</li>
                <li>Select “NEW DEVICE”, choose the connected USB port, and allow compilation (5–10 minutes).</li>
                <li>Once flashed, the device advertises to Home Assistant automatically.</li>
              </ol>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">ESPHome CLI — for power users</h4>
              <div className="mt-3 space-y-2 rounded-2xl bg-slate-900/5 p-4 font-mono text-xs text-slate-700">
                <p>pip install esphome</p>
                <p>git clone https://github.com/r-mccarty/bed-presence-sensor.git</p>
                <p>cd bed-presence-sensor/esphome</p>
                <p># Create secrets.yaml with Wi-Fi credentials</p>
                <p>esphome run bed-presence-detector.yaml</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "calibration",
        eyebrow: "Calibration",
        title: "Capture the perfect baseline",
        content: (
          <div className="grid gap-8 text-sm text-slate-600 lg:grid-cols-2">
            <div>
              <h4 className="text-base font-semibold text-slate-900">Procedure</h4>
              <ol className="mt-3 space-y-2 list-decimal pl-5">
                {calibrationFlow.procedure.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Verification</h4>
              <ol className="mt-3 space-y-2 list-decimal pl-5">
                {calibrationFlow.verification.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        ),
      },
      {
        id: "telemetry",
        eyebrow: "Operational intelligence",
        title: "Understand the sensor's language",
        content: (
          <div className="grid gap-8 text-sm text-slate-600 lg:grid-cols-2">
            <div>
              <h4 className="text-base font-semibold text-slate-900">Primary entities</h4>
              <ul className="mt-3 space-y-3">
                {telemetryEntities.map((entity) => (
                  <li key={entity.name} className="rounded-2xl bg-slate-900/5 p-3">
                    <p className="font-semibold text-slate-900">{entity.name}</p>
                    <p className="mt-1 text-xs text-slate-600">{entity.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">Tuning controls</h4>
              <ul className="mt-3 space-y-3">
                {tuningControls.map((control) => (
                  <li key={control.label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>{control.label}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{control.value}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{control.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
      },
    ],
    []
  )

  const activeContent = knowledgeSections.find((section) => section.id === activeSection)

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <MotionOrb className="left-1/2 top-10 h-72 w-72 -translate-x-1/2 bg-indigo-500/40" duration={16} />
        <MotionOrb className="right-10 top-32 h-64 w-64 bg-emerald-500/30" duration={18} delay={2} />
        <MotionOrb className="left-[-6rem] top-64 h-80 w-80 bg-cyan-500/20" duration={20} delay={4} />
      </div>

      <section className="relative pt-32 pb-24">
        <FadeContainer className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <FadeDiv className="max-w-3xl">
            <Badge className="mb-6 border border-white/30 bg-white/10 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur">
              Install Guide · Presence Suite
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Bed Presence Sensor Installation
            </h1>
            <p className="mt-6 text-lg text-slate-200">
              Transform any bed into a privacy-first presence surface. This guide walks you from industrial design–grade mounting
              through calibration, telemetry literacy, and the subtle tuning that makes OpticWorks presence feel invisible —
              until you need it.
            </p>
          </FadeDiv>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {heroHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                  {highlight.label}
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">{highlight.value}</div>
                <p className="mt-3 text-sm text-slate-200/80">{highlight.description}</p>
                <span className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
              </motion.div>
            ))}
          </div>

          <motion.svg
            aria-hidden
            viewBox="0 0 600 400"
            className="pointer-events-none absolute right-0 top-10 hidden h-[340px] w-[460px] text-sky-300/50 lg:block"
          >
            <defs>
              <linearGradient id="hero-line" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(125, 211, 252, 0.2)" />
                <stop offset="50%" stopColor="rgba(165, 243, 252, 0.35)" />
                <stop offset="100%" stopColor="rgba(167, 139, 250, 0.4)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M20 200 Q200 40 320 200 T580 200"
              fill="none"
              stroke="url(#hero-line)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                pathLength: [0.6, 1, 0.8],
                pathOffset: [0.2, 0, 0.1],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
        </FadeContainer>
      </section>

      <section className="relative z-10 -mt-12 rounded-t-[48px] bg-white/95 pb-24 pt-20 text-slate-900 shadow-[0_-40px_120px_-80px_rgba(15,23,42,0.7)]">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeDiv className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Experience Blueprint</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Crafted installation flow</h2>
            <p className="mt-4 text-base text-slate-600">
              Each phase stacks engineering precision with spa-grade finish. Follow the progression for a flawless, invisible
              deployment that feels native to your bedroom architecture.
            </p>
          </FadeDiv>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {installationPhases.map((phase, index) => (
              <PhaseCard key={phase.title} phase={phase} index={index} />
            ))}
          </div>
        </FadeContainer>
      </section>

      <section className="relative z-10 bg-slate-50 py-24">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
            <Card className="border-slate-200 bg-white/90 shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Installation timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6">
                  <span className="absolute left-[1.125rem] top-1 h-full w-[2px] bg-gradient-to-b from-slate-900 via-indigo-500/40 to-transparent" />
                  <ul className="space-y-8">
                    {timelineSteps.map((step, index) => (
                      <motion.li
                        key={step.title}
                        className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.08 }}
                        viewport={{ once: true, amount: 0.4 }}
                      >
                        <span className="absolute -left-[39px] top-6 flex size-8 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-sm font-semibold text-white">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/90 shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-900">Launch checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                {quickChecks.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex size-6 flex-none items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-600">
                      ✓
                    </span>
                    <p>{item}</p>
                  </div>
                ))}
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  Expose <code className="rounded bg-emerald-100 px-1 py-0.5">presence_reason</code> and <code className="rounded bg-emerald-100 px-1 py-0.5">absolute_clear_timer</code> on your dashboard to observe the 4-state engine evolving in real time.
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeContainer>
      </section>

      <section className="relative z-10 bg-white py-24">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Hardware & physical architecture</h2>
              <p className="mt-4 text-base text-slate-600">
                Premium sensing demands premium placement. Assemble the kit below, then use the placement guide to tuck the
                hardware away without sacrificing fidelity.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {hardwareInventory.map((item) => (
                  <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{item.cost}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    <p className="mt-3 text-xs text-slate-500">{item.notes}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 p-8 text-slate-100 shadow-[0_40px_80px_-60px_rgba(15,23,42,0.7)]">
              <h3 className="text-xl font-semibold">Placement essentials</h3>
              <p className="mt-3 text-sm text-slate-300">
                Think like an industrial designer: you&apos;re creating an invisible halo that cradles the sleeper.
              </p>
              <dl className="mt-8 space-y-5">
                {placementEssentials.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">{item.label}</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">{item.detail}</dd>
                    <p className="mt-2 text-xs text-slate-200/70">{item.note}</p>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </FadeContainer>
      </section>

      <section className="relative z-10 bg-slate-900 py-24 text-slate-100">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Knowledge console</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Deep control without the guesswork</h2>
              <p className="mt-4 text-base text-slate-300">
                Tap through each capsule to unlock expertise for every phase — from prerequisites to telemetry nuance. The
                content below mirrors our in-house install playbooks.
              </p>
            </div>
            <div className="flex gap-3 rounded-full border border-white/10 bg-white/10 p-1 backdrop-blur">
              {knowledgeSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition",
                    activeSection === section.id
                      ? "bg-white text-slate-900 shadow-[0_10px_30px_-20px_rgba(148,163,184,1)]"
                      : "text-slate-200 hover:text-white"
                  )}
                >
                  {section.eyebrow}
                </button>
              ))}
            </div>
          </div>

          {activeContent && (
            <motion.div
              key={activeContent.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12 rounded-[40px] border border-white/10 bg-white/10 p-10 backdrop-blur-lg"
            >
              <h3 className="text-2xl font-semibold text-white">{activeContent.title}</h3>
              <div className="mt-6">{activeContent.content}</div>
            </motion.div>
          )}
        </FadeContainer>
      </section>

      <section className="relative z-10 bg-slate-50 py-24">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Diagnostics playbook</h2>
              <p className="mt-4 text-base text-slate-600">
                If something feels off, move methodically. Each scenario below contains the exact fixes our field engineering
                team runs through during concierge installs.
              </p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-xl">
              <div className="space-y-8">
                {diagnostics.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {item.steps.map((step) => (
                        <li key={step} className="flex gap-3">
                          <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full bg-slate-900/10 text-slate-900">
                            •
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeContainer>
      </section>

      <section className="relative z-10 bg-white py-24">
        <FadeContainer className="mx-auto max-w-5xl px-4 text-slate-900 sm:px-6">
          <Card className="border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white shadow-[0_50px_100px_-80px_rgba(15,23,42,1)]">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">What you&apos;ll unlock</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {achievements.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-100">
                  <span className="mt-1 inline-flex size-6 flex-none items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    ✓
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeContainer>
      </section>
    </main>
  )
}
