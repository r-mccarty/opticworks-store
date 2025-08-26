// API stubs for future Supabase integration
// These functions will be replaced with actual Supabase calls when backend is implemented

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  bodyStyle: string;
  generation?: string; // e.g., "Gen 1", "Gen 2", "Facelift"
  trim?: string; // e.g., "Standard", "Performance", "Plaid"
}

export interface VehicleMake {
  id: string;
  name: string;
  logo?: string;
  popular: boolean;
}

export interface ProductCompatibility {
  productId: string;
  vehicleId: string;
  compatibility: 'perfect' | 'good' | 'difficult' | 'incompatible';
  installationDifficulty: 'beginner' | 'intermediate' | 'professional';
  notes?: string;
  specificIssues?: string[];
  alternativeProducts?: string[];
  installationTime?: string; // e.g., "30-45 minutes"
  requiredTools?: string[];
}

export interface CompatibilityResult {
  vehicle: Vehicle;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
  compatibility: ProductCompatibility;
  recommendations: {
    recommended: boolean;
    reasons: string[];
    alternatives?: Array<{
      productId: string;
      productName: string;
      price: number;
      whyBetter: string;
    }>;
  };
}

// Stub data for demonstration - will be replaced with Supabase queries
const stubVehicleMakes: VehicleMake[] = [
  { id: 'tesla', name: 'Tesla', popular: true },
  { id: 'bmw', name: 'BMW', popular: true },
  { id: 'mercedes', name: 'Mercedes-Benz', popular: true },
  { id: 'audi', name: 'Audi', popular: true },
  { id: 'porsche', name: 'Porsche', popular: true },
  { id: 'lexus', name: 'Lexus', popular: true },
  { id: 'acura', name: 'Acura', popular: false },
  { id: 'infiniti', name: 'Infiniti', popular: false },
  { id: 'cadillac', name: 'Cadillac', popular: false },
  { id: 'genesis', name: 'Genesis', popular: false }
];

const stubVehicles: Record<string, Vehicle[]> = {
  'tesla': [
    { id: 'tesla-model-y-2020', year: 2020, make: 'Tesla', model: 'Model Y', bodyStyle: 'SUV', generation: 'Gen 1' },
    { id: 'tesla-model-y-2021', year: 2021, make: 'Tesla', model: 'Model Y', bodyStyle: 'SUV', generation: 'Gen 1' },
    { id: 'tesla-model-y-2022', year: 2022, make: 'Tesla', model: 'Model Y', bodyStyle: 'SUV', generation: 'Gen 1' },
    { id: 'tesla-model-y-2023', year: 2023, make: 'Tesla', model: 'Model Y', bodyStyle: 'SUV', generation: 'Gen 1' },
    { id: 'tesla-model-y-2024', year: 2024, make: 'Tesla', model: 'Model Y', bodyStyle: 'SUV', generation: 'Gen 1' },
    { id: 'tesla-model-y-2025', year: 2025, make: 'Tesla', model: 'Model Y', bodyStyle: 'SUV', generation: 'Gen 2 (Juniper)' },
    { id: 'tesla-model-3-2024', year: 2024, make: 'Tesla', model: 'Model 3', bodyStyle: 'Sedan', generation: 'Highland' },
    { id: 'tesla-model-s-2024', year: 2024, make: 'Tesla', model: 'Model S', bodyStyle: 'Sedan', generation: 'Refresh' }
  ],
  'bmw': [
    { id: 'bmw-3-series-2024', year: 2024, make: 'BMW', model: '3 Series', bodyStyle: 'Sedan', generation: 'G20' },
    { id: 'bmw-x3-2024', year: 2024, make: 'BMW', model: 'X3', bodyStyle: 'SUV', generation: 'G01' },
    { id: 'bmw-x5-2024', year: 2024, make: 'BMW', model: 'X5', bodyStyle: 'SUV', generation: 'G05' }
  ]
};

const stubCompatibilityData: Record<string, ProductCompatibility> = {
  'cybershade-irx-tesla-model-y_tesla-model-y-2025': {
    productId: 'cybershade-irx-tesla-model-y',
    vehicleId: 'tesla-model-y-2025',
    compatibility: 'perfect',
    installationDifficulty: 'beginner',
    notes: 'Precision pre-cut specifically for 2025+ Model Y Juniper generation',
    installationTime: '30-45 minutes',
    requiredTools: ['Included squeegee', 'Included spray bottle', 'Microfiber cloth']
  },
  'cybershade-irx-tesla-model-y_tesla-model-y-2024': {
    productId: 'cybershade-irx-tesla-model-y',
    vehicleId: 'tesla-model-y-2024',
    compatibility: 'good',
    installationDifficulty: 'intermediate',
    notes: '2024 Model Y has slightly different window curves - minor trimming may be required',
    specificIssues: ['May require minor edge trimming for perfect fit'],
    installationTime: '45-60 minutes',
    requiredTools: ['Included squeegee', 'Included spray bottle', 'Microfiber cloth', 'Precision knife']
  },
  'cybershade-irx-35_tesla-model-y-2025': {
    productId: 'cybershade-irx-35',
    vehicleId: 'tesla-model-y-2025',
    compatibility: 'difficult',
    installationDifficulty: 'professional',
    notes: 'Generic film requires custom cutting and advanced installation techniques',
    specificIssues: [
      'Requires custom cutting to fit Tesla Model Y windows',
      'Complex curves need professional heat gun technique',
      'No pre-marked installation guides'
    ],
    alternativeProducts: ['cybershade-irx-tesla-model-y'],
    installationTime: '2-3 hours',
    requiredTools: ['Professional squeegee set', 'Heat gun', 'Precision cutting tools', 'Templates']
  }
};

/**
 * Fetch all available vehicle makes
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function fetchVehicleMakes(): Promise<VehicleMake[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('vehicle_makes')
  //   .select('*')
  //   .order('popular', { ascending: false })
  //   .order('name');
  
  return stubVehicleMakes.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Fetch vehicle models for a specific make and year range
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function fetchVehicleModels(
  makeId: string, 
  startYear?: number, 
  endYear?: number
): Promise<Vehicle[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // TODO: Replace with Supabase call
  // const query = supabase
  //   .from('vehicles')
  //   .select('*')
  //   .eq('make_id', makeId);
  
  // if (startYear) query.gte('year', startYear);
  // if (endYear) query.lte('year', endYear);
  
  // const { data, error } = await query.order('year', { ascending: false });
  
  const vehicles = stubVehicles[makeId] || [];
  
  return vehicles.filter(vehicle => {
    if (startYear && vehicle.year < startYear) return false;
    if (endYear && vehicle.year > endYear) return false;
    return true;
  }).sort((a, b) => b.year - a.year);
}

/**
 * Check compatibility between a product and vehicle
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function checkProductCompatibility(
  vehicleId: string, 
  productId: string
): Promise<CompatibilityResult | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Find vehicle
  const vehicle = Object.values(stubVehicles)
    .flat()
    .find(v => v.id === vehicleId);
  
  if (!vehicle) return null;
  
  // TODO: Replace with Supabase call
  // const { data: compatibilityData, error } = await supabase
  //   .from('product_compatibility')
  //   .select(`
  //     *,
  //     products(id, name, image, price)
  //   `)
  //   .eq('vehicle_id', vehicleId)
  //   .eq('product_id', productId)
  //   .single();
  
  const compatibilityKey = `${productId}_${vehicleId}`;
  const compatibility = stubCompatibilityData[compatibilityKey];
  
  if (!compatibility) {
    // Return generic compatibility if no specific data exists
    return {
      vehicle,
      product: {
        id: productId,
        name: 'Generic Product',
        image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=400&fit=crop',
        price: 189
      },
      compatibility: {
        productId,
        vehicleId,
        compatibility: 'good',
        installationDifficulty: 'intermediate',
        notes: 'Standard compatibility - may require minor adjustments',
        installationTime: '1-2 hours'
      },
      recommendations: {
        recommended: true,
        reasons: ['Universal compatibility', 'Good value option']
      }
    };
  }
  
  // Determine recommendations
  const isRecommended = compatibility.compatibility === 'perfect' || compatibility.compatibility === 'good';
  const reasons = [];
  const alternatives = [];
  
  switch (compatibility.compatibility) {
    case 'perfect':
      reasons.push('Perfect fit guaranteed', 'Designed specifically for this vehicle', 'Easy installation');
      break;
    case 'good':
      reasons.push('Good compatibility', 'Minor adjustments may be needed');
      break;
    case 'difficult':
      reasons.push('Requires advanced installation skills', 'May need custom cutting');
      if (compatibility.alternativeProducts) {
        alternatives.push({
          productId: 'cybershade-irx-tesla-model-y',
          productName: 'CyberShade IRX™ Tesla Model Y Kit',
          price: 149.99,
          whyBetter: 'Pre-cut specifically for your vehicle - perfect fit guaranteed'
        });
      }
      break;
    case 'incompatible':
      reasons.push('Not compatible with this vehicle', 'Different window specifications required');
      break;
  }
  
  return {
    vehicle,
    product: {
      id: productId,
      name: productId === 'cybershade-irx-tesla-model-y' ? 'CyberShade IRX™ Tesla Model Y Kit' : 'CyberShade IRX 35% VLT',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=400&fit=crop',
      price: productId === 'cybershade-irx-tesla-model-y' ? 149.99 : 189
    },
    compatibility,
    recommendations: {
      recommended: isRecommended,
      reasons,
      alternatives: alternatives.length > 0 ? alternatives : undefined
    }
  };
}

/**
 * Get recommended products for a specific vehicle
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function getRecommendedProducts(vehicleId: string): Promise<CompatibilityResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('product_compatibility')
  //   .select(`
  //     *,
  //     products(*)
  //   `)
  //   .eq('vehicle_id', vehicleId)
  //   .in('compatibility', ['perfect', 'good'])
  //   .order('compatibility')
  //   .order('installation_difficulty');
  
  const productIds = ['cybershade-irx-tesla-model-y', 'cybershade-irx-35'];
  const results = [];
  
  for (const productId of productIds) {
    const result = await checkProductCompatibility(vehicleId, productId);
    if (result && result.recommendations.recommended) {
      results.push(result);
    }
  }
  
  return results.sort((a, b) => {
    const compatibilityOrder = { perfect: 0, good: 1, difficult: 2, incompatible: 3 };
    return compatibilityOrder[a.compatibility.compatibility] - compatibilityOrder[b.compatibility.compatibility];
  });
}

/**
 * Search vehicles by make, model, or year
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function searchVehicles(query: string): Promise<Vehicle[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // TODO: Replace with Supabase full-text search
  // const { data, error } = await supabase
  //   .from('vehicles')
  //   .select('*')
  //   .or(`make.ilike.%${query}%,model.ilike.%${query}%,year.eq.${parseInt(query) || 0}`)
  //   .order('year', { ascending: false })
  //   .limit(20);
  
  const allVehicles = Object.values(stubVehicles).flat();
  const queryLower = query.toLowerCase();
  
  return allVehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(queryLower) ||
    vehicle.model.toLowerCase().includes(queryLower) ||
    vehicle.year.toString().includes(query) ||
    vehicle.bodyStyle.toLowerCase().includes(queryLower)
  ).slice(0, 20);
}

/**
 * Get installation difficulty statistics
 * TODO: Replace with actual Supabase analytics query when backend is implemented
 */
export async function getInstallationAnalytics(): Promise<{
  totalCompatibilities: number;
  perfectFits: number;
  difficultInstallations: number;
  averageDifficulty: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with Supabase analytics query
  const compatibilities = Object.values(stubCompatibilityData);
  
  return {
    totalCompatibilities: compatibilities.length,
    perfectFits: compatibilities.filter(c => c.compatibility === 'perfect').length,
    difficultInstallations: compatibilities.filter(c => c.installationDifficulty === 'professional').length,
    averageDifficulty: 'intermediate'
  };
}