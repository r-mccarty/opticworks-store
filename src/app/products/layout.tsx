import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bed Presence Sensor Lineup",
  description:
    "Explore the OpticWorks Presence Lab catalog—hardware kits, developer editions, and dashboards that make bed occupancy detection reliable.",
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
