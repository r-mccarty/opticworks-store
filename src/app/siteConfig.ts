export const siteConfig = {
  name: "OpticWorks",
  url: "https://optic.works",
  tagline: "Expand what you can perceive. And what you can make.",
  description:
    "OpticWorks develops intelligent instruments for manufacturing, imaging, and the physical world: advanced hardware and software designed to bring ambitious engineering within reach.",
  company: {
    name: "OpticWorks, Inc.",
    addressLines: ["3077B Clairemont Dr. #201", "San Diego, CA 92117"],
  },
  contact: {
    email: "support@optic.works",
  },
  nav: [
    { label: "Products", href: "/products" },
    { label: "Platform", href: "/platform" },
    { label: "Technology", href: "/technology" },
    { label: "Journal", href: "/journal" },
    { label: "About", href: "/about" },
  ],
  baseLinks: {
    home: "/",
    products: "/products",
    platform: "/platform",
    technology: "/technology",
    journal: "/journal",
    journalFeed: "/journal/feed.xml",
    about: "/about",
    contact: "/contact",
    support: "/support",
    // Legal pages stay at their current URLs until the legal review (#126) is done;
    // /legal/privacy and /legal/terms redirect here temporarily (next.config.ts).
    privacy: "/support/legal/privacy",
    terms: "/support/legal/terms",
  },
}
