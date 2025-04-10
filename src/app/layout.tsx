import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

import Footer from "@/components/ui/Footer"
import { NavBar } from "@/components/ui/Navbar"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${barlowFont.variable} ${colfaxFont.variable} ${featureFont.variable} ${featureCondensedFont.variable}`}>
      <body className="min-h-screen overflow-x-hidden scroll-auto bg-gray-50 antialiased selection:bg-orange-100 selection:text-orange-600">
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
