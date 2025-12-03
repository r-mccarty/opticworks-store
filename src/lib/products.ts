// PRODUCT IMAGES STATUS:
// - Using gradient placeholders for consistent layout testing
// - TODO: Upload real product images to R2 and replace with actual URLs
// - See R2-PRODUCT-IMAGES.md for upload guide and commands
// - R2 base URL: https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/

import { getProductImage } from "./gradients"

export interface ProductSpecification {
  label: string
  value: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  description: string
  badge?: string
  vlt?: string
  // Medusa variant ID for cart integration (set by transformMedusaProduct)
  medusaVariantId?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: "sensor" | "bundle" | "accessory" | "software"
  badge?: string
  specifications: ProductSpecification[]
  highlights?: string[]
  keyBenefits?: Array<{
    title: string
    description: string
  }>
  heroIntro?: {
    headline: string
    subheading: string
  }
  inStock: boolean
  featured?: boolean
  variants?: ProductVariant[]
  reviews?: {
    rating: number
    count: number
  }
  installGuide?: string
  // Medusa variant ID for cart integration
  variantId?: string
}

export const products: Product[] = [
  {
    id: "bed-presence-sensor-kit",
    name: "Bed Presence Sensor Kit",
    description:
      "Complete mmWave hardware + presence engine stack tuned for Home Assistant. Ships flashed, calibrated, and ready for dependable automations.",
    price: 239,
    originalPrice: 259,
    image: getProductImage("presence-kit"),
    category: "sensor",
    badge: "Flagship",
    heroIntro: {
      headline: "Stop detecting motion. Start understanding presence.",
      subheading:
        "The Bed Presence Sensor kit combines a 60GHz mmWave module, ESP32 gateway, and our 4-state statistical presence engine so lights never shut off while you’re sleeping.",
    },
    keyBenefits: [
      {
        title: "4-State Presence Engine",
        description:
          "Temporal filtering plus hysteresis ensures the binary sensor only toggles when presence is deliberate.",
      },
      {
        title: "Absolute Clear Delay",
        description:
          "Remembers the last high-confidence reading for 30 seconds so perfectly still sleepers stay counted.",
      },
      {
        title: "Privacy-First Hardware",
        description:
          "mmWave detects that someone is there, not who. Processing happens locally on the ESP32.",
      },
      {
        title: "Live Tuning Dashboard",
        description:
          "Expose every threshold, debounce, and debug string directly in Home Assistant.",
      },
    ],
    specifications: [
      { label: "Sensor Suite", value: "60GHz mmWave (still energy focus)" },
      { label: "Processor", value: "ESP32-S3 w/ Wi-Fi + BLE" },
      { label: "Detection Zone", value: "Up to 3.2m w/ focused bed cone" },
      { label: "Presence Engine", value: "4-state FSM + z-score analysis" },
      { label: "Absolute Clear Delay", value: "30s default (tunable)" },
      { label: "Power", value: "USB-C 5V (cable included)" },
      { label: "Warranty", value: "2 years hardware / Oops Protection" },
    ],
    // Default variant ID for products without variant selection
    variantId: "variant_01KBF0WRDCT61JD4HHH2PGDHAK", // Single Bed Kit
    variants: [
      {
        id: "bed-presence-sensor-kit-single",
        name: "Single Bed Kit",
        price: 239,
        description: "Everything you need for one bed zone.",
        badge: "Most popular",
        medusaVariantId: "variant_01KBF0WRDCT61JD4HHH2PGDHAK",
      },
      {
        id: "bed-presence-sensor-kit-duo",
        name: "Dual Bed Pack",
        price: 449,
        description: "Two synchronized sensors for primary + guest rooms.",
        medusaVariantId: "variant_01KBF0WRDCFRQ6NSMTKX7TZAF7",
      },
      {
        id: "bed-presence-sensor-kit-studio",
        name: "Studio + Dev Pack",
        price: 525,
        description: "Adds a breakout board, USB-UART dev cable, and beta firmware access.",
        medusaVariantId: "variant_01KBF0WRDCNYGF0PW9YH9RHZD0",
      },
    ],
    reviews: {
      rating: 4.97,
      count: 312,
    },
    installGuide: "/install-guides/bed-presence-sensor",
    inStock: true,
    featured: true,
  },
  {
    id: "presence-sensor-duo-pack",
    name: "Presence Sensor Duo Pack",
    description:
      "Two Bed Presence Sensors plus synchronized automations for multi-room deployments. Ships with offset mounting jig for bunk or split beds.",
    price: 449,
    originalPrice: 478,
    image: getProductImage("presence-duo"),
    category: "bundle",
    badge: "Bundle",
    specifications: [
      { label: "Contents", value: "2x sensors + 2x enclosures + 2x USB-C cables" },
      { label: "Sync Engine", value: "Shared HA blueprint for multi-bed logic" },
      { label: "Detection Mode", value: "Coordinated still-energy analysis" },
      { label: "Lead Time", value: "Ships in 3 business days" },
    ],
    highlights: [
      "Perfect for master + guest rooms",
      "Pre-calibrated to avoid crosstalk",
      "Includes automation blueprint",
    ],
    variantId: "variant_01KBF0WRDDVB0FTPFWRYSEG34H", // Duo Pack Standard
    inStock: true,
    featured: true,
  },
  {
    id: "presence-developer-edition",
    name: "Presence Engine Developer Edition",
    description:
      "For tinkerers who want deeper insight. Breakout headers, serial console, and beta firmware channel for experimenting with new detection ideas.",
    price: 329,
    image: getProductImage("presence-dev"),
    category: "sensor",
    badge: "Developer",
    specifications: [
      { label: "Debug Outputs", value: "UART + USB-C + logic analyzer pads" },
      { label: "Firmware Access", value: "Weekly beta builds + OTA toggles" },
      { label: "Included Sensors", value: "Bed Presence Sensor + sandbox module" },
      { label: "Support", value: "Private Discord lab channel" },
    ],
    variantId: "variant_01KBF0WRDDHTX28ZQCRET1SCB3", // Developer Edition Standard
    inStock: true,
  },
  {
    id: "presence-dashboard-pack",
    name: "Home Assistant Dashboard Pack",
    description:
      "Pre-built Lovelace dashboards, helper templates, and automations that expose state reasons, z-score charts, and tuning controls.",
    price: 59,
    image: getProductImage("presence-dashboard"),
    category: "software",
    specifications: [
      { label: "Format", value: "YAML + dashboard JSON" },
      { label: "Requirements", value: "Home Assistant 2024.12+" },
      { label: "Delivery", value: "Instant download" },
      { label: "License", value: "Household / lab unlimited" },
    ],
    highlights: [
      "Live chart of z_still vs thresholds",
      "Number sliders for debounce + delays",
      "Template sensors for automations",
    ],
    variantId: "variant_01KBF0WRDDQVRR03GPYR79Z86P", // Dashboard Pack Standard
    inStock: true,
  },
  {
    id: "presence-enclosure-pack",
    name: "Magnetic Enclosure + Mount Pack",
    description:
      "3D-printed magnetic enclosure with adjustable tilt bracket, bed-rail clips, and adhesive pads for stealth installs.",
    price: 79,
    image: getProductImage("presence-enclosure"),
    category: "accessory",
    specifications: [
      { label: "Materials", value: "Matte black PETG + TPU feet" },
      { label: "Mount Options", value: "Magnetic, clip, adhesive" },
      { label: "Cable Management", value: "Integrated USB-C path" },
      { label: "Compatibility", value: "All Bed Presence Sensor SKUs" },
    ],
    variantId: "variant_01KBF0WRDEZ9G74RKE409QA33C", // Enclosure Pack Standard
    inStock: true,
  },
  {
    id: "presence-spare-sensor",
    name: "Spare mmWave Sensor Module",
    description:
      "Individual still-energy mmWave module for labs, redundancy, or advanced automations outside of the bedroom.",
    price: 119,
    image: getProductImage("presence-spare"),
    category: "sensor",
    specifications: [
      { label: "Sensor", value: "60GHz FMCW w/ still-energy focus" },
      { label: "Interface", value: "UART / I2C breakouts" },
      { label: "Firmware", value: "Ships flashed w/ presence engine" },
      { label: "Use Cases", value: "Office chairs, nurseries, occupancy cues" },
    ],
    variantId: "variant_01KBF0WRDE69PZG3GJ77EFM9EP", // Spare Sensor Standard
    inStock: true,
  },
  {
    id: "presence-lab-support",
    name: "Reliability Lab Subscription",
    description:
      "Join our Reliability Lab to get monthly firmware drops, guided tuning sessions, and early access to experimental engine features.",
    price: 19,
    image: getProductImage("presence-lab"),
    category: "software",
    specifications: [
      { label: "Format", value: "Monthly subscription" },
      { label: "Includes", value: "Beta firmware, office hours, Discord" },
      { label: "Cancel Anytime", value: "Self-service via portal" },
    ],
    highlights: [
      "Ask engineers about your automations",
      "Stress test new state-machine ideas",
      "Share dashboards with the community",
    ],
    variantId: "variant_01KBF0WRDE3YM3G8HKEPK07HPV", // Lab Subscription Standard
    inStock: true,
  },
]
