import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"

const CURRENT_YEAR = new Date().getFullYear()

const sections = [
  {
    title: "Product",
    items: [
      { label: "OW-1 Sensor", href: siteConfig.baseLinks.products },
      { label: "Integrations", href: "/#integrations" },
      {
        label: "Home Assistant Add-on",
        href: "https://docs.optic.works",
        external: true,
      },
      { label: "Developer API", href: "https://docs.optic.works", external: true },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: siteConfig.baseLinks.support },
      { label: "Careers", href: siteConfig.baseLinks.supportContact },
      { label: "Privacy Policy", href: siteConfig.baseLinks.supportPrivacy },
      { label: "Contact", href: siteConfig.baseLinks.supportContact },
    ],
  },
  {
    title: "Social",
    items: [
      { label: "Twitter / X", href: "https://twitter.com/opticworks", external: true },
      { label: "GitHub", href: "https://github.com/opticworks", external: true },
      { label: "Discord", href: siteConfig.baseLinks.supportContact },
      { label: "YouTube", href: "https://youtube.com/@opticworks", external: true },
    ],
  },
] as const

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

          <div className="text-neutral-600">
            © {CURRENT_YEAR} OpticWorks Inc. <br />
            San Francisco, CA
          </div>
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
