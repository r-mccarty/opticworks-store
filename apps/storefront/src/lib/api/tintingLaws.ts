// API stubs for future Supabase integration
// These functions will be replaced with actual Supabase calls when backend is implemented

export interface TintingLaw {
  state: string;
  stateCode: string;
  frontWindshield: {
    allowedVlt: string;
    restrictions: string;
  };
  frontSideWindows: {
    minVlt: number;
    maxVlt: number;
    restrictions?: string;
  };
  backSideWindows: {
    minVlt: number;
    maxVlt: number;
    restrictions?: string;
  };
  rearWindow: {
    minVlt: number;
    maxVlt: number;
    restrictions?: string;
  };
  reflectivity: {
    metallic: boolean;
    maxReflection?: number;
  };
  colors: {
    allowed: string[];
    restricted: string[];
  };
  medicalExemptions: boolean;
  penalties: {
    firstOffense: string;
    repeatOffense: string;
  };
  lastUpdated: string;
}

export interface ComplianceCheck {
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Stub data for demonstration - will be replaced with Supabase query
const stubTintingLaws: Record<string, TintingLaw> = {
  'CA': {
    state: 'California',
    stateCode: 'CA',
    frontWindshield: {
      allowedVlt: '70%',
      restrictions: 'Non-reflective tint allowed on top 4 inches'
    },
    frontSideWindows: {
      minVlt: 70,
      maxVlt: 100,
      restrictions: 'Must allow 70% or more light transmission'
    },
    backSideWindows: {
      minVlt: 0,
      maxVlt: 100,
      restrictions: 'Any darkness allowed if vehicle has dual side mirrors'
    },
    rearWindow: {
      minVlt: 0,
      maxVlt: 100,
      restrictions: 'Any darkness allowed'
    },
    reflectivity: {
      metallic: false,
      maxReflection: 0
    },
    colors: {
      allowed: ['clear', 'gray', 'brown', 'bronze'],
      restricted: ['red', 'amber', 'yellow']
    },
    medicalExemptions: true,
    penalties: {
      firstOffense: '$25 fine',
      repeatOffense: 'Up to $200 fine'
    },
    lastUpdated: '2024-01-15'
  },
  'TX': {
    state: 'Texas',
    stateCode: 'TX',
    frontWindshield: {
      allowedVlt: '70%',
      restrictions: 'Non-reflective tint allowed on top 5 inches'
    },
    frontSideWindows: {
      minVlt: 25,
      maxVlt: 100,
      restrictions: 'Must allow 25% or more light transmission'
    },
    backSideWindows: {
      minVlt: 25,
      maxVlt: 100,
      restrictions: 'Must allow 25% or more light transmission'
    },
    rearWindow: {
      minVlt: 25,
      maxVlt: 100,
      restrictions: 'Must allow 25% or more light transmission'
    },
    reflectivity: {
      metallic: true,
      maxReflection: 25
    },
    colors: {
      allowed: ['clear', 'gray', 'brown', 'bronze', 'neutral'],
      restricted: ['red', 'blue', 'amber']
    },
    medicalExemptions: true,
    penalties: {
      firstOffense: '$20-$25 fine',
      repeatOffense: 'Up to $275 fine'
    },
    lastUpdated: '2024-01-15'
  },
  'FL': {
    state: 'Florida',
    stateCode: 'FL',
    frontWindshield: {
      allowedVlt: '70%',
      restrictions: 'Non-reflective tint allowed on top 6 inches'
    },
    frontSideWindows: {
      minVlt: 28,
      maxVlt: 100,
      restrictions: 'Must allow 28% or more light transmission'
    },
    backSideWindows: {
      minVlt: 15,
      maxVlt: 100,
      restrictions: 'Must allow 15% or more light transmission'
    },
    rearWindow: {
      minVlt: 15,
      maxVlt: 100,
      restrictions: 'Must allow 15% or more light transmission'
    },
    reflectivity: {
      metallic: true,
      maxReflection: 25
    },
    colors: {
      allowed: ['clear', 'gray', 'brown', 'bronze', 'neutral'],
      restricted: ['red', 'amber', 'yellow']
    },
    medicalExemptions: true,
    penalties: {
      firstOffense: 'Non-moving violation',
      repeatOffense: 'Up to $1000 fine'
    },
    lastUpdated: '2024-01-15'
  },
  'NY': {
    state: 'New York',
    stateCode: 'NY',
    frontWindshield: {
      allowedVlt: '70%',
      restrictions: 'Non-reflective tint allowed on top 6 inches'
    },
    frontSideWindows: {
      minVlt: 70,
      maxVlt: 100,
      restrictions: 'Must allow 70% or more light transmission'
    },
    backSideWindows: {
      minVlt: 70,
      maxVlt: 100,
      restrictions: 'Must allow 70% or more light transmission'
    },
    rearWindow: {
      minVlt: 70,
      maxVlt: 100,
      restrictions: 'Must allow 70% or more light transmission'
    },
    reflectivity: {
      metallic: false,
      maxReflection: 0
    },
    colors: {
      allowed: ['clear', 'gray', 'brown', 'bronze'],
      restricted: ['red', 'amber', 'yellow', 'blue']
    },
    medicalExemptions: true,
    penalties: {
      firstOffense: '$75-$150 fine',
      repeatOffense: 'Up to $375 fine'
    },
    lastUpdated: '2024-01-15'
  }
};

/**
 * Fetch tinting laws for a specific state
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function fetchTintingLaws(stateCode: string): Promise<TintingLaw | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('tinting_laws')
  //   .select('*')
  //   .eq('state_code', stateCode.toUpperCase())
  //   .single();
  
  return stubTintingLaws[stateCode.toUpperCase()] || null;
}

/**
 * Get all available states with tinting law data
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function fetchAvailableStates(): Promise<Array<{code: string; name: string}>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('tinting_laws')
  //   .select('state_code, state')
  //   .order('state');
  
  return Object.values(stubTintingLaws).map(law => ({
    code: law.stateCode,
    name: law.state
  }));
}

/**
 * Check if a specific VLT percentage complies with state laws
 * TODO: Replace with actual Supabase function when backend is implemented
 */
export async function checkTintCompliance(
  stateCode: string, 
  vltPercentage: number,
  windowType: 'front-side' | 'back-side' | 'rear'
): Promise<ComplianceCheck> {
  const laws = await fetchTintingLaws(stateCode);
  
  if (!laws) {
    return {
      isCompliant: false,
      violations: ['State data not available'],
      recommendations: ['Contact local DMV for current laws'],
      riskLevel: 'medium'
    };
  }

  const violations: string[] = [];
  const recommendations: string[] = [];
  let isCompliant = true;

  const windowLaws = windowType === 'front-side' 
    ? laws.frontSideWindows
    : windowType === 'back-side'
    ? laws.backSideWindows
    : laws.rearWindow;

  // Check VLT compliance
  if (vltPercentage < windowLaws.minVlt) {
    isCompliant = false;
    violations.push(`${vltPercentage}% VLT is below minimum required ${windowLaws.minVlt}%`);
    recommendations.push(`Consider ${windowLaws.minVlt}% or higher VLT for legal compliance`);
  }

  if (vltPercentage > windowLaws.maxVlt) {
    isCompliant = false;
    violations.push(`${vltPercentage}% VLT exceeds maximum allowed ${windowLaws.maxVlt}%`);
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (violations.length > 0) {
    const difference = windowLaws.minVlt - vltPercentage;
    if (difference > 30) {
      riskLevel = 'high';
    } else if (difference > 10) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }
  }

  return {
    isCompliant,
    violations,
    recommendations: recommendations.length > 0 ? recommendations : [
      `${vltPercentage}% VLT appears to comply with ${laws.state} regulations for ${windowType.replace('-', ' ')} windows`
    ],
    riskLevel
  };
}

/**
 * Search tinting laws by partial state name
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function searchTintingLaws(searchTerm: string): Promise<TintingLaw[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const searchLower = searchTerm.toLowerCase();
  
  return Object.values(stubTintingLaws).filter(law => 
    law.state.toLowerCase().includes(searchLower) ||
    law.stateCode.toLowerCase().includes(searchLower)
  );
}