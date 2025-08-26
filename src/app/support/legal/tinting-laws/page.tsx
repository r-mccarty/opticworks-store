"use client"

import { useState, useEffect } from "react"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  RiMapPinLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiInformationLine,
  RiSearchLine,
  RiShieldCheckLine
} from "@remixicon/react"
import { fetchTintingLaws, fetchAvailableStates, checkTintCompliance, type TintingLaw, type ComplianceCheck } from "@/lib/api/tintingLaws"

// Note: Metadata cannot be exported from client components
// This page requires client-side functionality for the interactive features

const vltOptions = [
  { value: '5', label: '5% VLT (Limo Dark)', popular: true },
  { value: '15', label: '15% VLT (Dark)', popular: true },
  { value: '35', label: '35% VLT (Medium)', popular: true },
  { value: '50', label: '50% VLT (Light)' },
  { value: '70', label: '70% VLT (Very Light)' }
];

export default function TintingLawsPage() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedVlt, setSelectedVlt] = useState<string>('35');
  const [windowType, setWindowType] = useState<'front-side' | 'back-side' | 'rear'>('front-side');
  const [states, setStates] = useState<Array<{code: string; name: string}>>([]);
  const [tintingLaws, setTintingLaws] = useState<TintingLaw | null>(null);
  const [compliance, setCompliance] = useState<ComplianceCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available states on mount
  useEffect(() => {
    fetchAvailableStates().then(setStates).catch(console.error);
  }, []);

  // Load tinting laws when state is selected
  useEffect(() => {
    if (selectedState) {
      setLoading(true);
      setError(null);
      
      fetchTintingLaws(selectedState)
        .then((laws) => {
          setTintingLaws(laws);
          if (!laws) {
            setError('Tinting law data not available for this state');
          }
        })
        .catch((err) => {
          setError('Failed to load tinting laws');
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else {
      setTintingLaws(null);
      setCompliance(null);
    }
  }, [selectedState]);

  // Check compliance when VLT or window type changes
  useEffect(() => {
    if (selectedState && selectedVlt && windowType) {
      checkTintCompliance(selectedState, parseInt(selectedVlt), windowType)
        .then(setCompliance)
        .catch(console.error);
    }
  }, [selectedState, selectedVlt, windowType]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceIcon = (isCompliant: boolean) => {
    return isCompliant 
      ? <RiCheckLine className="h-5 w-5 text-green-600" />
      : <RiCloseLine className="h-5 w-5 text-red-600" />;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <RiMapPinLine className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Window Tinting Laws
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                Check tinting laws and VLT requirements for your state. Stay legal and avoid citations.
              </p>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Law Checker Tool */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RiSearchLine className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-2xl">Tinting Law Checker</CardTitle>
                    <CardDescription>
                      Select your state and tint specifications to check legal compliance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* State Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Choose a state...</option>
                    {states.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* VLT Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select VLT Percentage
                  </label>
                  <select
                    value={selectedVlt}
                    onChange={(e) => setSelectedVlt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    {vltOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Window Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Window Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'front-side', label: 'Front Side Windows' },
                      { value: 'back-side', label: 'Back Side Windows' },
                      { value: 'rear', label: 'Rear Window' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setWindowType(type.value as 'front-side' | 'back-side' | 'rear')}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          windowType === type.value
                            ? 'bg-orange-100 border-orange-300 text-orange-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>

          {/* Compliance Results */}
          {compliance && tintingLaws && (
            <FadeDiv>
              <Card className={`border-2 ${compliance.isCompliant ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getComplianceIcon(compliance.isCompliant)}
                      <CardTitle className={compliance.isCompliant ? 'text-green-800' : 'text-red-800'}>
                        {compliance.isCompliant ? 'Compliant' : 'Non-Compliant'}
                      </CardTitle>
                    </div>
                    <Badge className={getRiskColor(compliance.riskLevel)}>
                      {compliance.riskLevel.charAt(0).toUpperCase() + compliance.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compliance.violations.length > 0 && (
                      <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 flex items-center gap-2">
                          <RiAlertLine className="h-4 w-4" />
                          Violations
                        </h4>
                        <ul className="mt-2 text-sm text-red-700 space-y-1">
                          {compliance.violations.map((violation, index) => (
                            <li key={index}>• {violation}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                        <RiInformationLine className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1">
                        {compliance.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          )}

          {/* State Law Details */}
          {tintingLaws && (
            <FadeDiv>
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {tintingLaws.state} Tinting Laws
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date(tintingLaws.lastUpdated).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* VLT Requirements */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">VLT Requirements</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Front Windshield</div>
                          <div className="font-semibold">{tintingLaws.frontWindshield.allowedVlt}</div>
                          <div className="text-xs text-gray-500 mt-1">{tintingLaws.frontWindshield.restrictions}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Front Side Windows</div>
                          <div className="font-semibold">{tintingLaws.frontSideWindows.minVlt}%+ VLT</div>
                          {tintingLaws.frontSideWindows.restrictions && (
                            <div className="text-xs text-gray-500 mt-1">{tintingLaws.frontSideWindows.restrictions}</div>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Back Side Windows</div>
                          <div className="font-semibold">{tintingLaws.backSideWindows.minVlt}%+ VLT</div>
                          {tintingLaws.backSideWindows.restrictions && (
                            <div className="text-xs text-gray-500 mt-1">{tintingLaws.backSideWindows.restrictions}</div>
                          )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Rear Window</div>
                          <div className="font-semibold">{tintingLaws.rearWindow.minVlt}%+ VLT</div>
                          {tintingLaws.rearWindow.restrictions && (
                            <div className="text-xs text-gray-500 mt-1">{tintingLaws.rearWindow.restrictions}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Restrictions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Color Restrictions</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600">Allowed: </span>
                            <span className="text-sm">{tintingLaws.colors.allowed.join(', ')}</span>
                          </div>
                          {tintingLaws.colors.restricted.length > 0 && (
                            <div>
                              <span className="text-sm text-gray-600">Restricted: </span>
                              <span className="text-sm text-red-600">{tintingLaws.colors.restricted.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Other Rules</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            {tintingLaws.reflectivity.metallic ? (
                              <RiCheckLine className="h-4 w-4 text-green-600" />
                            ) : (
                              <RiCloseLine className="h-4 w-4 text-red-600" />
                            )}
                            Metallic/Reflective Tint {tintingLaws.reflectivity.metallic ? 'Allowed' : 'Prohibited'}
                          </div>
                          <div className="flex items-center gap-2">
                            {tintingLaws.medicalExemptions ? (
                              <RiCheckLine className="h-4 w-4 text-green-600" />
                            ) : (
                              <RiCloseLine className="h-4 w-4 text-red-600" />
                            )}
                            Medical Exemptions {tintingLaws.medicalExemptions ? 'Available' : 'Not Available'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Penalties */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Penalties</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">First Offense: </span>
                            <span>{tintingLaws.penalties.firstOffense}</span>
                          </div>
                          <div>
                            <span className="font-medium">Repeat Offense: </span>
                            <span>{tintingLaws.penalties.repeatOffense}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          )}

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tinting laws...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <RiAlertLine className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </FadeContainer>
      </section>

      {/* Disclaimer */}
      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="border-gray-200">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <RiShieldCheckLine className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Important Legal Disclaimer
                    </h3>
                    <div className="prose prose-sm text-gray-600">
                      <p>
                        The information provided here is for reference purposes only and may not reflect the most current laws. 
                        Tinting laws can change frequently and vary by jurisdiction.
                      </p>
                      <p className="font-medium text-gray-800 mt-4">
                        Always verify current tinting laws with your local DMV or law enforcement before installation.
                      </p>
                      <p className="mt-4">
                        OpticWorks is not responsible for citations or legal issues resulting from non-compliant tinting. 
                        Installation of any tint is at your own risk and responsibility.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>
    </main>
  )
}