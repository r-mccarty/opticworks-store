import {
  RiGithubFill,
  RiSlackFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from "@remixicon/react"
import Link from "next/link"
import { SolarLogo } from "../../../public/SolarLogo"
import { siteConfig } from "@/app/siteConfig"
const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => {
  const sections = {
    products: {
      title: "Products",
      items: [
        { label: "Bed Presence Sensor Kit", href: "/products/bed-presence-sensor-kit" },
        { label: "Presence Sensor Duo Pack", href: "/products/presence-sensor-duo-pack" },
        { label: "Presence Engine Dev Edition", href: "/products/presence-developer-edition" },
        { label: "Dashboard Pack", href: "/products/presence-dashboard-pack" },
        { label: "Mount & Enclosure Pack", href: "/products/presence-enclosure-pack" },
        { label: "Accessories & Add-ons", href: siteConfig.baseLinks.store },
      ],
    },
    store: {
      title: "Store",
      items: [
        { label: "Shop All Products", href: siteConfig.baseLinks.store },
        { label: "New Arrivals", href: siteConfig.baseLinks.store },
        { label: "Best Sellers", href: siteConfig.baseLinks.store },
        { label: "Bundles & Deals", href: siteConfig.baseLinks.store },
        { label: "Shopping Cart", href: siteConfig.baseLinks.cart },
      ],
    },
    support: {
      title: "Customer Support",
      items: [
        { label: "Contact Us", href: siteConfig.baseLinks.supportContact },
        { label: "Order Status", href: siteConfig.baseLinks.supportOrders },
        { label: "Payment & Billing", href: siteConfig.baseLinks.supportBilling },
        { label: "Product Compatibility", href: siteConfig.baseLinks.supportCompatibility },
        { label: "Returns & Exchanges", href: siteConfig.baseLinks.supportWarranty },
        { label: "FAQ", href: siteConfig.baseLinks.supportFaq },
        { label: "Oops Protection", href: siteConfig.baseLinks.supportOops },
      ],
    },
    guides: {
      title: "Install Guides",
      items: [
        { label: "Calibration Videos", href: siteConfig.baseLinks.installGuides },
        { label: "Bed Presence Install", href: "/install-guides/bed-presence-sensor" },
        { label: "Step-by-Step Guide", href: siteConfig.baseLinks.installGuides },
        { label: "Troubleshooting", href: siteConfig.baseLinks.supportFaq },
        { label: "Integrator Playbooks", href: siteConfig.baseLinks.installGuides },
        { label: "Get Help", href: siteConfig.baseLinks.support },
      ],
    },
    legal: {
      title: "Legal & Compliance",
      items: [
        { label: "Presence Compliance", href: siteConfig.baseLinks.supportLegal },
        { label: "Privacy Policy", href: siteConfig.baseLinks.supportPrivacy },
        { label: "Terms of Service", href: siteConfig.baseLinks.supportTerms },
        { label: "Legal Support", href: siteConfig.baseLinks.supportLegal },
      ],
    },
  }

  return (
    <div className="px-4 xl:px-0 bg-cyber-black">
      <footer
        id="footer"
        className="relative mx-auto flex max-w-7xl flex-wrap pt-20 pb-12 border-t border-white/5"
      >
        {/* ASCII divider */}
        <div className="absolute top-0 left-0 right-0 h-px">
          <div className="font-mono text-xs text-white/10 tracking-widest overflow-hidden whitespace-nowrap">
            / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / /
          </div>
        </div>
        <div className="mr-auto flex w-full justify-between lg:w-fit lg:flex-col">
          <Link
            href="/"
            className="flex items-center font-medium text-white/70 select-none hover:text-white transition-colors sm:text-sm"
          >
            <SolarLogo className="ml-2 w-20" />
            <span className="sr-only">OpticWorks Logo (go home)</span>
          </Link>

          <div className="flex flex-col space-y-4 mt-6">
            {/* Social Icons */}
            <div className="flex items-center">
              <Link
                href="https://twitter.com/opticworks"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-amber-400"
              >
                <RiTwitterXFill className="size-5" />
              </Link>
              <Link
                href="https://youtube.com/@opticworks"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-amber-400"
              >
                <RiYoutubeFill className="size-5" />
              </Link>
              <Link
                href="https://github.com/opticworks"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-amber-400"
              >
                <RiGithubFill className="size-5" />
              </Link>
              <Link
                href={siteConfig.baseLinks.supportContact}
                className="rounded-lg p-2 text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-amber-400"
              >
                <RiSlackFill className="size-5" />
              </Link>
            </div>

            {/* Copyright */}
            <div className="ml-2 font-mono text-xs text-white/30">
              © {CURRENT_YEAR} OpticWorks LLC
            </div>

            {/* Legal Links */}
            <div className="ml-2 font-mono text-xs text-white/40">
              <Link
                href={siteConfig.baseLinks.supportPrivacy}
                className="hover:text-amber-400 transition-colors"
              >
                Privacy
              </Link>
              <span className="mx-2 text-white/20">{`//`}</span>
              <Link
                href={siteConfig.baseLinks.supportTerms}
                className="hover:text-amber-400 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Sections */}
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="mt-10 min-w-44 pl-2 lg:mt-0 lg:pl-0">
            <h3 className="mb-6 font-mono text-xs uppercase tracking-wider text-amber-400">
              + {section.title}
            </h3>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.label} className="text-sm">
                  <Link
                    href={item.href}
                    className="text-white/50 transition-colors duration-200 hover:text-white font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  )
}

export default Footer
