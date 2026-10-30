import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"
import { programs } from "@/content/programs"
import { Wordmark } from "./Wordmark"

const CURRENT_YEAR = new Date().getFullYear()

export function SiteFooter() {
  const { baseLinks, company, contact } = siteConfig
  const columns = [
    {
      title: "Programs",
      links: programs.map((program) => ({ label: program.name, href: `/products/${program.slug}` })),
    },
    {
      title: "Company",
      links: [
        { label: "Platform", href: baseLinks.platform },
        { label: "Technology", href: baseLinks.technology },
        { label: "Journal", href: baseLinks.journal },
        { label: "About", href: baseLinks.about },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "Contact", href: baseLinks.contact },
        { label: "Support", href: baseLinks.support },
        { label: "Privacy", href: baseLinks.privacy },
        { label: "Terms", href: baseLinks.terms },
      ],
    },
  ]

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Wordmark />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-text-muted">{siteConfig.tagline}</p>
          <address className="mt-8 text-sm not-italic leading-relaxed text-text-subtle">
            {company.name}
            {company.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a href={`mailto:${contact.email}`} className="mt-2 block text-text-muted hover:text-amber">
              {contact.email}
            </a>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="annotation">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-text-subtle sm:px-8">
          <span>
            © {CURRENT_YEAR} {company.name}
          </span>
          <span className="font-mono uppercase tracking-[0.12em]">Products shown are in development</span>
        </div>
      </div>
    </footer>
  )
}
