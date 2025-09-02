import {
  RiGithubFill,
  RiSlackFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from "@remixicon/react"
import Link from "next/link"
import { OpticWorksLogo } from "../../../public/OpticWorksLogo"
import { siteConfig } from "@/app/siteConfig"
const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => {
  const sections = {
    products: {
      title: "Products",
      items: [
        { label: "CyberShade IRX", href: "/products/cybershade-irx-35" },
        { label: "Tesla Model Y Kits", href: "/products/cybershade-irx-tesla-model-y" },
        { label: "DIY Tinting Kits", href: siteConfig.baseLinks.store },
        { label: "Professional Tools", href: siteConfig.baseLinks.store },
        { label: "Accessories", href: siteConfig.baseLinks.store },
        { label: "Replacement Parts", href: siteConfig.baseLinks.store },
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
        { label: "Installation Videos", href: siteConfig.baseLinks.installGuides },
        { label: "Tesla Model Y Guide", href: "/install-guides/cybershade-irx-tesla-model-y" },
        { label: "Step-by-Step Guide", href: siteConfig.baseLinks.installGuides },
        { label: "Tips & Tricks", href: siteConfig.baseLinks.installGuides },
        { label: "Common Mistakes", href: siteConfig.baseLinks.supportFaq },
        { label: "Get Help", href: siteConfig.baseLinks.support },
      ],
    },
    legal: {
      title: "Legal & Compliance",
      items: [
        { label: "Tinting Laws", href: siteConfig.baseLinks.supportTintingLaws },
        { label: "Privacy Policy", href: siteConfig.baseLinks.supportPrivacy },
        { label: "Terms of Service", href: siteConfig.baseLinks.supportTerms },
        { label: "Legal Support", href: siteConfig.baseLinks.supportLegal },
      ],
    },
  }

  return (
    <div className="px-4 xl:px-0">
      <footer
        id="footer"
        className="relative mx-auto flex max-w-6xl flex-wrap pt-4"
      >
        {/* Vertical Lines */}
        <div className="pointer-events-none inset-0">
          {/* Left */}
          <div
            className="absolute inset-y-0 my-[-5rem] w-px"
            style={{
              maskImage: "linear-gradient(transparent, white 5rem)",
            }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-gray-300"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>

          {/* Right */}
          <div
            className="absolute inset-y-0 right-0 my-[-5rem] w-px"
            style={{
              maskImage: "linear-gradient(transparent, white 5rem)",
            }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-gray-300"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        </div>
        <svg
          className="mb-10 h-20 w-full border-y border-dashed border-gray-300 stroke-gray-300"
          // style={{
          //   maskImage:
          //     "linear-gradient(transparent, white 10rem, white calc(100% - 10rem), transparent)",
          // }}
        >
          <defs>
            <pattern
              id="diagonal-footer-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    stroke=""
                    strokeWidth="1"
                  />
                )
              })}
            </pattern>
          </defs>
          <rect
            stroke="none"
            width="100%"
            height="100%"
            fill="url(#diagonal-footer-pattern)"
          />
        </svg>
        <div className="mr-auto flex w-full justify-between lg:w-fit lg:flex-col">
          <Link
            href="/"
            className="flex items-center font-medium text-gray-700 select-none sm:text-sm"
          >
            <OpticWorksLogo className="ml-2 w-20" />

            <span className="sr-only">OpticWorks Logo (go home)</span>
          </Link>

          <div className="flex flex-col space-y-3">
            {/* Social Icons */}
            <div className="flex items-center">
              <Link
                href="https://twitter.com/opticworks"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiTwitterXFill className="size-5" />
              </Link>
              <Link
                href="https://youtube.com/@opticworks"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiYoutubeFill className="size-5" />
              </Link>
              <Link
                href="https://github.com/opticworks"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiGithubFill className="size-5" />
              </Link>
              <Link
                href={siteConfig.baseLinks.supportContact}
                className="rounded-sm p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900"
              >
                <RiSlackFill className="size-5" />
              </Link>
            </div>
            
            {/* Copyright */}
            <div className="ml-2 text-sm text-gray-700">
              &copy; {CURRENT_YEAR} OpticWorks LLC
            </div>
            
            {/* Legal Links */}
            <div className="ml-2 text-xs text-gray-600">
              <Link 
                href={siteConfig.baseLinks.supportPrivacy}
                className="hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="mx-2">•</span>
              <Link 
                href={siteConfig.baseLinks.supportTerms}
                className="hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Sections */}
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="mt-10 min-w-44 pl-2 lg:mt-0 lg:pl-0">
            <h3 className="mb-4 font-medium text-gray-900 sm:text-sm">
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.label} className="text-sm">
                  <Link
                    href={item.href}
                    className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
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
