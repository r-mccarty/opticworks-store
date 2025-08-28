import { Metadata } from "next"
import InstallGuideClient from "./InstallGuideClient"

export const metadata: Metadata = {
  title: "CyberShade IRX Tesla Model Y Installation Guide - OpticWorks",
  description: "Complete step-by-step installation guide for CyberShade IRX ceramic window tint on Tesla Model Y (2025+ Juniper). Professional results in under an hour.",
}

const installSteps = [
  {
    step: 1,
    title: "PREP THE GLASS",
    description: "Use the included professional-grade cleaning pads and low-tack dust removers for a perfectly clean surface. Our custom door skirt protects your interior from water.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzYjgyZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZjc2OGE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "10 minutes",
    tips: [
      "Work in shade, avoid direct sunlight",
      "Clean windows inside and out thoroughly", 
      "Use the included dust removal stickers for any particles"
    ]
  },
  {
    step: 2,
    title: "CLICK & SECURE",
    description: "Snap our patent-pending Door Latch Tool into place. It raises the window for full coverage and prevents the door from accidentally closing on it. No more fighting with floppy window gaskets.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjVjZjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "5 minutes",
    tips: [
      "Ensure the latch tool clicks securely into place",
      "Window should be held firmly in the up position",
      "Door will not close while tool is engaged"
    ]
  },
  {
    step: 3,
    title: "PEEL & PLACE",
    description: "Spray the window and the film with our pre-mixed slip solution. The pre-cut film peels easily from its backing and glides right into position. No trimming, no shrinking, no stress.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxMGI5ODI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTk2Njk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "15 minutes",
    tips: [
      "Wet hands and window generously with slip solution",
      "Peel liner slowly to avoid film stretching",
      "Film should slide easily for positioning"
    ]
  },
  {
    step: 4,
    title: "SQUEEGEE TO PERFECTION",
    description: "Use our 3D-printed, ergonomic hard card squeegee to push the solution out. The film locks into place, leaving a crystal-clear, bubble-free finish.",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmNTllMGI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNkYzI2MjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPgogICAgPC9zdmc+",
    duration: "15 minutes",
    tips: [
      "Work from center outward in overlapping strokes",
      "Use firm, consistent pressure",
      "Check edges for complete adhesion"
    ]
  }
]

const kitContents = [
  "2x Pre-cut, Pre-shrunk CyberShade IRX Front Window Films",
  "1x 3D-Printed OpticWorks Door Latch Tool",
  "1x OpticWorks Door Skirt Water Shield",
  "1x Pre-mixed Slip Solution Spray Bottle",
  "1x Distilled Water Rinse Bottle",
  "1x Professional Hard Card Squeegee",
  "1x Scotch-Brite™ Window Cleaning Pad",
  "2x Lint-Free Microfiber Cloths",
  "1x Set of Low-Tack Dust Removal Stickers",
  "1x Plastic Razor Tool for Cleaning",
  "Quick Start Guide with QR Code to Install Video"
]

import { TroubleshootingItem } from "@/types/installs"

const troubleshooting: TroubleshootingItem[] = [
  {
    problem: "Air bubbles under the film",
    solution: "Work bubbles toward the nearest edge using the squeegee with firm pressure. Small bubbles will disappear within 24-48 hours.",
    severity: "low"
  },
  {
    problem: "Film won't stick to the edge",
    solution: "Ensure the edge is completely clean and dry. Use the hard card to press firmly along the window seal.",
    severity: "medium"
  },
  {
    problem: "Film tears during application",
    solution: "Contact our support team immediately. We offer replacement film under our 'Oops Protection' program for a small shipping fee.",
    severity: "high"
  }
]

export default function CyberShadeIRXInstallGuidePage() {
  return (
    <InstallGuideClient
      installSteps={installSteps}
      kitContents={kitContents}
      troubleshooting={troubleshooting}
    />
  )
}