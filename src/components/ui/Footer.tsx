import Link from "next/link"

import { SolarLogo } from "../../../public/SolarLogo"
import { siteConfig } from "@/app/siteConfig"

const CURRENT_YEAR = new Date().getFullYear()

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: siteConfig.baseLinks.howItWorks },
      { label: "Features", href: siteConfig.baseLinks.features },
      { label: "Comparison", href: siteConfig.baseLinks.comparison },
    ],
  },
  {
    title: "Builders",
    links: [
      { label: "Getting started", href: siteConfig.baseLinks.gettingStarted },
      { label: "Documentation", href: siteConfig.baseLinks.documentation },
      { label: "Architecture", href: "/docs/architecture.md" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: siteConfig.baseLinks.about },
      { label: "Community", href: siteConfig.baseLinks.community },
      { label: "Email team@optic.works", href: "mailto:team@optic.works" },
    ],
  },
]

const socialLinks = [
  { label: "Twitter", href: siteConfig.external.twitter },
  { label: "GitHub", href: siteConfig.external.github },
  { label: "YouTube", href: siteConfig.external.youtube },
]

export default function Footer() {
  return (
    <footer className="px-4 pb-12 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-10 shadow-[0_40px_140px_-80px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-md space-y-4">
            <Link href={siteConfig.baseLinks.home} className="inline-flex items-center gap-3 text-slate-900">
              <SolarLogo className="w-20" />
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">OpticWorks Sensing</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              OpticWorks builds privacy-first sensing hardware and software that understands presence with mmWave intelligence and transparent analytics.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {socialLinks.map((item) => (
                <Link key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{section.title}</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-slate-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs uppercase tracking-[0.3em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {CURRENT_YEAR} OpticWorks. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/docs/INFRASTRUCTURE_HETZNER_CF.md" className="hover:text-slate-900">
              Infrastructure runbook
            </Link>
            <Link href="/docs/STATE_MANAGEMENT.md" className="hover:text-slate-900">
              State management
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
