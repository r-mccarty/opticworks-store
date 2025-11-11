import Link from "next/link"

import { PageHeader } from "@/components/shared/PageHeader"

const phases = [
  {
    name: 'Before you begin',
    items: [
      'Home Assistant running with ESPHome integration installed',
      'Workspace with access to the bed for placement tests',
      'USB-C cable for flashing the ESP32 firmware',
    ],
  },
  {
    name: 'Hardware assembly',
    items: [
      'Mount LD2410 sensor above the bed (1-3ft) using the provided bracket',
      'Connect VCC, GND, TX, and RX between the LD2410 and ESP32',
      'Power on and confirm sensor telemetry inside ESPHome logs',
    ],
  },
  {
    name: 'Software setup',
    items: [
      'Clone the OpticWorks sensing repository',
      'Flash the ESPHome firmware with your WiFi credentials',
      'Deploy the Cloudflare Worker BFF (pnpm run deploy:worker)',
      'Provision the Hetzner backend with the automation script (pnpm run deploy:hetzner)',
    ],
  },
]

const calibrationSteps = [
  'Use the in-app decision inspector to record five minutes of “empty bed” data.',
  'Apply the recommended baseline preset for your bed size (Queen, King, Twin).',
  'Invite a sleeper to lie down and stay still. Confirm z-score stability remains above the “present” threshold.',
  'Trigger the first automation in Home Assistant using the provided blueprint.',
]

const helpfulLinks = [
  {
    label: 'Full build guide',
    href: 'https://github.com/opticworks/opticworks-sensing/blob/main/docs/getting-started-guide.md',
  },
  { label: 'ESPHome configuration', href: 'https://github.com/opticworks/opticworks-sensing/tree/main/firmware' },
  { label: 'Worker deployment script', href: 'https://github.com/opticworks/opticworks-sensing/tree/main/workers' },
  { label: 'Hetzner provisioning', href: 'https://github.com/opticworks/opticworks-sensing/tree/main/infrastructure' },
]

export default function GettingStartedPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="getting started"
        title="Build the bed presence sensor in under two hours"
        description="Follow the guided workflow to assemble the hardware, flash the firmware, and deploy the Worker-powered backend."
      />
      <section className="space-y-8">
        {phases.map((phase) => (
          <article key={phase.name} className="rounded-3xl border border-slate-100 bg-white/90 p-8">
            <h2 className="text-xl font-semibold text-slate-900">{phase.name}</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {phase.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-900" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="rounded-[2.5rem] border border-emerald-200 bg-emerald-50/80 p-10">
        <h2 className="text-xl font-semibold text-emerald-900">Initial calibration</h2>
        <ol className="mt-4 space-y-3 text-sm text-emerald-900">
          {calibrationSteps.map((step, index) => (
            <li key={step}>
              <span className="font-semibold">Step {index + 1}.</span> {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-emerald-700">
          Need deeper guidance? The full calibration walkthrough is in docs/getting-started-guide.md.
        </p>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
        <h2 className="text-xl font-semibold">Helpful resources</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/80">
          {helpfulLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="underline decoration-dotted underline-offset-4">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
