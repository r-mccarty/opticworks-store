"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { siteConfig } from "@/app/siteConfig"
import { cx } from "@/lib/utils"
import { RegistrationMark } from "./visuals"

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <RegistrationMark size={20} className="text-amber" />
      <span className="text-[0.95rem] font-medium tracking-[0.02em] text-text">OpticWorks</span>
    </span>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="OpticWorks home" className="rounded-sm">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cx(
                "text-sm transition-colors hover:text-text",
                isActive(item.href) ? "text-text" : "text-text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={siteConfig.baseLinks.contact}
            className="rounded-sm border border-line-strong px-4 py-2 text-sm text-text transition-colors hover:border-amber hover:text-amber-strong"
          >
            Contact
          </Link>
        </nav>

        <button
          type="button"
          className="-mr-2 rounded-sm p-2 text-text md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        hidden={!open}
        className="border-t border-line bg-ink px-5 pb-6 md:hidden"
      >
        <ul className="divide-y divide-line">
          {[...siteConfig.nav, { label: "Contact", href: siteConfig.baseLinks.contact }].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex items-center justify-between py-4 text-lg text-text"
              >
                {item.label}
                <span aria-hidden className="text-text-subtle">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
