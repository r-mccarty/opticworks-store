import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"

const CURRENT_YEAR = new Date().getFullYear()

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

const sections: { title: string; items: FooterLink[] }[] = [
  {
    title: "Product",
    items: [
      { label: "OW-1 Sensor", href: siteConfig.baseLinks.products },
      { label: "Integrations", href: "/#integrations" },
      { label: "Documentation", href: siteConfig.docsUrl, external: true },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Contact", href: siteConfig.baseLinks.supportContact },
      { label: "Install Guides", href: siteConfig.baseLinks.installGuides },
      { label: "FAQ", href: siteConfig.baseLinks.supportFaq },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: siteConfig.baseLinks.supportPrivacy },
      { label: "Terms of Service", href: siteConfig.baseLinks.supportTerms },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-neutral-950 py-12 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-6 text-sm md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-amber-500" />
            <span className="font-display text-lg font-bold text-white">
              OpticWorks
            </span>
            <span className="sr-only">{siteConfig.name}</span>
          </Link>

          <p className="mb-6 text-neutral-500">
            Spatial intelligence for the private home.
          </p>

          <address className="not-italic text-neutral-600">
            © {CURRENT_YEAR} {siteConfig.company.name}
            {siteConfig.company.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="mt-2 block transition-colors hover:text-amber-500"
            >
              {siteConfig.contact.email}
            </a>
          </address>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="mb-4 font-bold text-white">{section.title}</h4>
            <ul className="space-y-3 text-neutral-400">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="transition-colors hover:text-amber-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}

export default Footer
