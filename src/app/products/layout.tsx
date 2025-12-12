import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Presence Sensor Lineup",
  description:
    "Explore the OpticWorks Presence catalog—hardware kits, developer editions, and dashboards for real‑time spatial awareness.",
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
