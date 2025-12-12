import {
  RiGithubFill,
  RiSlackFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from "@remixicon/react"
import Link from "next/link"

import { siteConfig } from "@/app/siteConfig"
import { SolarLogo } from "../../../public/SolarLogo"

const CURRENT_YEAR = new Date().getFullYear()

const sections = [
  {
    title: "Products",
    items: [
      { label: "Presence Sensor Kit", href: "/products/bed-presence-sensor-kit" },
      { label: "Presence Duo Pack", href: "/products/presence-sensor-duo-pack" },
      { label: "Developer Edition", href: "/products/presence-developer-edition" },
      { label: "Mounts & Enclosures", href: "/products/presence-enclosure-pack" },
      { label: "Accessories", href: siteConfig.baseLinks.store },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Presence Engine", href: siteConfig.baseLinks.products },
      { label: "Automation OS", href: "https://docs.optic.works", external: true },
      { label: "Install Guides", href: siteConfig.baseLinks.installGuides },
      { label: "API & Docs", href: "https://docs.optic.works", external: true },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Contact", href: siteConfig.baseLinks.supportContact },
      { label: "Order Status", href: siteConfig.baseLinks.supportOrders },
      { label: "Billing", href: siteConfig.baseLinks.supportBilling },
      { label: "Warranty & Returns", href: siteConfig.baseLinks.supportWarranty },
      { label: "FAQ", href: siteConfig.baseLinks.supportFaq },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Compliance", href: siteConfig.baseLinks.supportLegal },
      { label: "Privacy Policy", href: siteConfig.baseLinks.supportPrivacy },
      { label: "Terms of Service", href: siteConfig.baseLinks.supportTerms },
    ],
  },
] as const

const Footer = () => {
  return (
    <footer id="footer" className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <SolarLogo className="w-20 text-foreground" />
            <span className="sr-only">{siteConfig.name}</span>
          </Link>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Real‑time presence sensing and spatial visualization for modern
            homes, labs, and automation builders.
          </p>

          <div className="mt-5 flex items-center gap-1">
            <Link
              href="https://twitter.com/opticworks"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="OpticWorks on X"
            >
              <RiTwitterXFill className="size-5" />
            </Link>
            <Link
              href="https://youtube.com/@opticworks"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="OpticWorks on YouTube"
            >
              <RiYoutubeFill className="size-5" />
            </Link>
            <Link
              href="https://github.com/opticworks"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="OpticWorks on GitHub"
            >
              <RiGithubFill className="size-5" />
            </Link>
            <Link
              href={siteConfig.baseLinks.supportContact}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="OpticWorks community"
            >
              <RiSlackFill className="size-5" />
            </Link>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            &copy; {CURRENT_YEAR} OpticWorks LLC
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <Link
              href={siteConfig.baseLinks.supportPrivacy}
              className="hover:text-foreground"
            >
              Privacy
            </Link>
            <span className="mx-2">•</span>
            <Link
              href={siteConfig.baseLinks.supportTerms}
              className="hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-3 lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="text-muted-foreground transition-colors hover:text-foreground"
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

