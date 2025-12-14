// PRODUCT IMAGES STATUS:
// - Using local stock placeholders for consistent layout testing
// - TODO: Upload real product images to R2 and replace with actual URLs
// - See R2-PRODUCT-IMAGES.md for upload guide and commands
// - R2 base URL: https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/

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
    id: "ow-1-dev-kit",
    name: "OpticWorks OW-1 Developer Kit",
    description:
      "Spatial sensing node with 60GHz mmWave radar, NPU acceleration, and Matter over Thread connectivity. Ships with USB-C cable and wall mount.",
    price: 89,
    image: "/images/stock/ow1-devkit-4x3.webp",
    category: "sensor",
    badge: "Pre-order",
    heroIntro: {
      headline: "The home that watches out for you.",
      subheading:
        "Tesla-like spatial awareness for Home Assistant. Presence sensing that visualizes your surroundings, infers intent locally, and makes automations feel obvious.",
    },
    keyBenefits: [
      {
        title: "Spatial Awareness",
        description:
          "Unlike PIR sensors that just see motion, the OW-1 sees people, pets, and posture in real time.",
      },
      {
        title: "Private by Design",
        description:
          "No cameras. No cloud. Low-resolution mmWave radar data is processed entirely on-device.",
      },
      {
        title: "Instant Response",
        description:
          "Sub-100ms latency means lights turn on before your foot hits the floor.",
      },
      {
        title: "Home Assistant Native",
        description:
          "Exposes entities for everything: occupancy coordinates, posture, and gesture recognition.",
      },
    ],
    specifications: [
      { label: "Sensor", value: "60GHz mmWave Radar" },
      { label: "Processor", value: "Dual-Core RISC-V + NPU" },
      { label: "Connectivity", value: "Matter over Thread" },
      { label: "Detection Range", value: "Up to 5 meters" },
      { label: "Tracking", value: "Up to 5 people simultaneously" },
      { label: "Power", value: "USB-C 5V (cable included)" },
      { label: "Warranty", value: "2 years hardware" },
    ],
    // Default variant ID for cart integration
    variantId: "variant_OW1_DEV_KIT",
    reviews: {
      rating: 4.97,
      count: 312,
    },
    inStock: true,
    featured: true,
  },
]
