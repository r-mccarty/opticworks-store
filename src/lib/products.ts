// PRODUCT IMAGES STATUS:
// - Currently using placeholder.com URLs for immediate functionality
// - TODO: Upload real product images to R2 and replace URLs
// - See R2-PRODUCT-IMAGES.md for upload guide and commands
// - R2 base URL: https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: 'film' | 'kit' | 'tool' | 'accessory'
  badge?: string
  specifications: {
    vlt?: string // Visible Light Transmission
    thickness?: string
    heatRejection?: string
    uvRejection?: string
    warranty?: string
    coverage?: string
    difficulty?: 'Beginner' | 'Intermediate' | 'Professional'
  }
  inStock: boolean
  featured?: boolean
  variants?: Array<{
    id: string
    name: string
    price: number
    vlt: string
    description: string
  }>
  reviews?: {
    rating: number
    count: number
  }
  installGuide?: string
}

export const products: Product[] = [
  // Featured CyberShade IRX Tesla Model Y Kit
  {
    id: 'cybershade-irx-tesla-model-y',
    name: 'CyberShade IRX™ Tesla Model Y Kit (2025+ Juniper)',
    description: 'Professional tint. Foolproof DIY. Get a flawless, heat-blocking ceramic tint on your Model Y front windows in under an hour. Complete all-in-one kit with precision pre-cut film and revolutionary installation tools.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=400&fit=crop&crop=center',
    // TODO: Replace with R2 URL when uploaded:
    // image: 'https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/cybershade-irx-tesla-model-y.jpg',
    category: 'kit',
    badge: 'Featured',
    specifications: {
      vlt: '35% (Recommended)',
      thickness: '1.5 mil',
      heatRejection: 'Up to 99% IR',
      uvRejection: '99%',
      warranty: 'Lifetime',
      coverage: 'Front windows only',
      difficulty: 'Beginner'
    },
    variants: [
      {
        id: 'cybershade-irx-tesla-35',
        name: '35% VLT - Recommended',
        price: 149.99,
        vlt: '35%',
        description: 'Perfect balance of visibility and heat rejection. Legal in most states.'
      },
      {
        id: 'cybershade-irx-tesla-15',
        name: '15% VLT - Dark',
        price: 149.99,
        vlt: '15%',
        description: 'Maximum privacy and heat rejection. Check local laws.'
      },
      {
        id: 'cybershade-irx-tesla-5',
        name: '5% VLT - Limo',
        price: 149.99,
        vlt: '5%',
        description: 'Ultimate privacy. Professional appearance. Verify legality.'
      }
    ],
    reviews: {
      rating: 4.9,
      count: 124
    },
    installGuide: '/install-guides/cybershade-irx-tesla-model-y',
    inStock: true,
    featured: true
  },
  
  // Premium Films
  {
    id: 'cybershade-irx-35',
    name: 'CyberShade IRX 35% VLT',
    description: 'Our flagship ceramic window film with superior heat rejection and crystal-clear optics. Perfect for year-round comfort.',
    price: 189,
    originalPrice: 229,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=400&fit=crop&crop=center',
    // TODO: Replace with R2 URL when uploaded:
    // image: 'https://pub-7268d532bc454f39b3de3c39e3d5105b.r2.dev/products/cybershade-irx-35.jpg',
    category: 'film',
    badge: 'Best Seller',
    specifications: {
      vlt: '35%',
      thickness: '1.5 mil',
      heatRejection: '65%',
      uvRejection: '99%',
      warranty: 'Lifetime',
      coverage: '100 sq ft'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'cybershade-irx-20',
    name: 'CyberShade IRX 20% VLT',
    description: 'Darker ceramic film for maximum privacy and heat rejection. Professional-grade performance.',
    price: 199,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=400&fit=crop&crop=center',
    category: 'film',
    specifications: {
      vlt: '20%',
      thickness: '1.5 mil',
      heatRejection: '70%',
      uvRejection: '99%',
      warranty: 'Lifetime',
      coverage: '100 sq ft'
    },
    inStock: true,
    featured: true
  },
  
  // Vehicle Kits
  {
    id: 'tesla-model-y-kit',
    name: 'Tesla Model Y Complete Kit',
    description: 'Pre-cut window tinting kit specifically designed for Tesla Model Y. Includes all side and rear windows.',
    price: 299,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=400&fit=crop&crop=center',
    category: 'kit',
    badge: 'New',
    specifications: {
      vlt: '35% or 20%',
      thickness: '1.5 mil',
      heatRejection: '65%',
      uvRejection: '99%',
      warranty: '10 years',
      difficulty: 'Intermediate'
    },
    inStock: true,
    featured: true
  },
  {
    id: 'tesla-model-3-kit',
    name: 'Tesla Model 3 Complete Kit',
    description: 'Perfect-fit pre-cut kit for Tesla Model 3. Premium ceramic film with professional results.',
    price: 279,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
    category: 'kit',
    specifications: {
      vlt: '35% or 20%',
      thickness: '1.5 mil',
      heatRejection: '65%',
      uvRejection: '99%',
      warranty: '10 years',
      difficulty: 'Intermediate'
    },
    inStock: true
  },
  
  // DIY Kits
  {
    id: 'diy-starter-kit',
    name: 'DIY Beginner Tinting Kit',
    description: 'Everything you need to start tinting. Includes tools, film, and detailed installation guide.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center',
    category: 'kit',
    specifications: {
      vlt: '35%',
      thickness: '1.2 mil',
      heatRejection: '50%',
      uvRejection: '99%',
      warranty: '5 years',
      coverage: '50 sq ft',
      difficulty: 'Beginner'
    },
    inStock: true
  },
  {
    id: 'diy-professional-kit',
    name: 'DIY Professional Kit',
    description: 'Advanced DIY kit with premium ceramic film and professional-grade tools for experienced installers.',
    price: 399,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop&crop=center',
    category: 'kit',
    badge: 'Pro Choice',
    specifications: {
      vlt: 'Multiple options',
      thickness: '1.5 mil',
      heatRejection: '70%',
      uvRejection: '99%',
      warranty: 'Lifetime',
      coverage: '200 sq ft',
      difficulty: 'Professional'
    },
    inStock: true
  },
  
  // Professional Tools
  {
    id: 'precision-squeegee-set',
    name: 'Precision Squeegee Set',
    description: 'Professional-grade squeegees for bubble-free installation. Set of 4 different sizes.',
    price: 59,
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=400&h=400&fit=crop&crop=center',
    category: 'tool',
    specifications: {
      warranty: '2 years'
    },
    inStock: true
  },
  {
    id: 'heat-gun-pro',
    name: 'Professional Heat Gun',
    description: 'Variable temperature heat gun for film shaping and activation. Essential for professional results.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1606107557103-3da2b7142e4e?w=400&h=400&fit=crop&crop=center',
    category: 'tool',
    specifications: {
      warranty: '3 years'
    },
    inStock: true
  },
  
  // Accessories
  {
    id: 'slip-solution',
    name: 'Premium Slip Solution',
    description: 'Professional-grade installation solution for smooth film application and easy positioning.',
    price: 29,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
    category: 'accessory',
    specifications: {
      coverage: '50 installations'
    },
    inStock: true
  },
  {
    id: 'replacement-blades',
    name: 'Precision Cutting Blades',
    description: 'Ultra-sharp replacement blades for clean, precise cuts. Pack of 10.',
    price: 19,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=400&fit=crop&crop=center',
    category: 'accessory',
    specifications: {},
    inStock: true
  }
]

export const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'film', name: 'Window Films' },
  { id: 'kit', name: 'DIY Kits' },
  { id: 'tool', name: 'Professional Tools' },
  { id: 'accessory', name: 'Accessories' }
] as const