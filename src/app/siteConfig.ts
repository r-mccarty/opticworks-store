export const siteConfig = {
  name: "OpticWorks Sensing",
  url: "https://optic.works",
  description:
    "OpticWorks builds privacy-first smart home sensing hardware and software. Our bed presence sensor pairs mmWave intelligence with a Cloudflare Worker BFF and Hetzner backend for transparent automations.",
  baseLinks: {
    home: "/",
    howItWorks: "/how-it-works",
    features: "/features",
    gettingStarted: "/getting-started",
    documentation: "/documentation",
    comparison: "/comparison",
    community: "/community",
    about: "/about",
  },
  external: {
    github: "https://github.com/opticworks/opticworks-sensing",
    twitter: "https://twitter.com/opticworks",
    youtube: "https://youtube.com/@opticworks",
  },
}

export type SiteRoute = keyof typeof siteConfig.baseLinks
