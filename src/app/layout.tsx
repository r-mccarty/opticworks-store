import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

import { GoogleAnalytics } from "@/components/GoogleAnalytics"
import { SiteFooter } from "@/components/site/SiteFooter"
import { SiteHeader } from "@/components/site/SiteHeader"
import { siteConfig } from "./siteConfig"

const colfax = localFont({
  src: [
    { path: "../../public/fonts/ColfaxWebRegular-ffe8279204a8eb350c1a8320336a8e1a.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/ColfaxWebMedium-5cd963f45f4bd8647a4e41a58ca9c4d3.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-colfax",
  display: "swap",
})

const barlow = localFont({
  src: [
    { path: "../../public/fonts/barlow-latin-400-normal-7fa387951673abf164b13dd1b45c70e3.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/barlow-latin-500-normal-50adbbfa3bfe480bf4246ff5bad7ad06.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // "./" resolves to each route's own path, giving every page a self-canonical URL.
  alternates: {
    canonical: "./",
  },
  title: {
    default: `${siteConfig.name}: intelligent instruments for manufacturing and imaging`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.company.name, url: siteConfig.url }],
  creator: siteConfig.company.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    siteName: siteConfig.name,
    title: siteConfig.tagline,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.tagline,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f0e0d",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${colfax.variable} ${barlow.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-text antialiased">
        <GoogleAnalytics measurementId="G-ZVKN68R4Y7" />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-amber focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}
