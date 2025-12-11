import type { Metadata } from "next"
import localFont from "next/font/local"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/ui/Footer"
import { MenuBar } from "@/components/menu-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "./siteConfig"

// Define Barlow font
const barlowFont = localFont({
  src: [
    {
      path: "../../public/fonts/barlow-latin-400-normal-7fa387951673abf164b13dd1b45c70e3.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/barlow-latin-500-normal-50adbbfa3bfe480bf4246ff5bad7ad06.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/barlow-latin-700-normal-dd5b2912dbf896310865c1e9ac85ab41.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-barlow",
  display: "swap",
})

// Define Colfax font
const colfaxFont = localFont({
  src: [
    {
      path: "../../public/fonts/ColfaxWebRegular-ffe8279204a8eb350c1a8320336a8e1a.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ColfaxWebMedium-5cd963f45f4bd8647a4e41a58ca9c4d3.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-colfax",
  display: "swap",
})

const monoFont = GeistMono


const featureFont = localFont({
  src: [
    {
      path: "../../public/fonts/FeatureFlatHeadline.c189951b.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../../public/fonts/FeatureFlatText-Bold.4f87c9cd.otf",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-feature",
  display: "swap",
})

const featureCondensedFont = localFont({
  src: [
    {
      path: "../../public/fonts/FeatureFlatCond-Regular.a6231343.woff2",
      weight: "400", // Corresponds to Regular
      style: "normal",
    },
    {
      path: "../../public/fonts/FeatureFlatCond-Medium.595cb47e.woff2",
      weight: "500", // Corresponds to Medium
      style: "normal",
    },
    // Add other CONDENSED weights/styles if you have them
  ],
  variable: "--font-feature-condensed", // Distinct variable name
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["Marketing", "Database", "Software"],
  authors: [
    {
      name: "yourname",
      url: "",
    },
  ],
  creator: "yourname",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@yourname",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${barlowFont.variable} ${colfaxFont.variable} ${monoFont.variable} ${featureFont.variable} ${featureCondensedFont.variable}`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen overflow-x-hidden scroll-auto bg-[var(--optic-bg)] font-colfax text-white antialiased selection:bg-amber-200/20 selection:text-amber-300">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-70" aria-hidden>
          <div className="absolute inset-x-0 top-[-20%] mx-auto h-[520px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,153,0,0.22),_transparent_62%)] blur-[160px]" />
          <div className="absolute inset-y-10 left-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_60%)] blur-[130px]" />
          <div className="absolute inset-y-32 right-[-14%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,153,0,0.18),_transparent_60%)] blur-[140px]" />
        </div>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <MenuBar />
          {children}
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
