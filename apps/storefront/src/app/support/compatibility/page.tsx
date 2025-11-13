"use client"

import { useState, useEffect } from "react"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RiCarLine,
  RiSearchLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiInformationLine,
  RiToolsLine,
  RiTimeLine,
  RiStarLine,
  RiCustomerService2Line,
  RiThumbUpLine
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"
import { 
  fetchVehicleMakes, 
  fetchVehicleModels, 
  checkProductCompatibility, 
  getRecommendedProducts,
  searchVehicles,
  type VehicleMake, 
  type Vehicle, 
  type CompatibilityResult 
} from "@/lib/api/compatibility"

export default function CompatibilityPage() {
  const [makes, setMakes] = useState<VehicleMake[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('cybershade-irx-tesla-model-y')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Vehicle[]>([])
  
  const [loading, setLoading] = useState(false)
  const [makesLoading, setMakesLoading] = useState(true)
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null)
  const [recommendations, setRecommendations] = useState<CompatibilityResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const products = [
    { 
      id: 'cybershade-irx-tesla-model-y', 
      name: 'CyberShade IRX™ Tesla Model Y Kit',
      description: 'Pre-cut kit specifically designed for Tesla Model Y'
    },
    { 
      id: 'cybershade-irx-35', 
      name: 'CyberShade IRX 35% VLT',
      description: 'Universal ceramic film - requires custom cutting'
    },
    { 
      id: 'cybershade-irx-20', 
      name: 'CyberShade IRX 20% VLT',
      description: 'Universal ceramic film - requires custom cutting'
    }
  ]

  // Load vehicle makes on mount
  useEffect(() => {
    fetchVehicleMakes()
      .then(setMakes)
      .catch(console.error)
      .finally(() => setMakesLoading(false))
  }, [])

  // Load vehicle models when make is selected
  useEffect(() => {
    if (selectedMake) {
      setVehiclesLoading(true)
      setSelectedVehicle('')
      setVehicles([])
      
      fetchVehicleModels(selectedMake, 2015) // Only show 2015+ vehicles
        .then(setVehicles)
        .catch(console.error)
        .finally(() => setVehiclesLoading(false))
    }
  }, [selectedMake])

  // Search vehicles when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchVehicles(searchQuery.trim())
        .then(setSearchResults)
        .catch(console.error)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleCompatibilityCheck = async () => {
    if (!selectedVehicle || !selectedProduct) {
      setError('Please select both a vehicle and product')
      return
    }

    setLoading(true)
    setError(null)
    setCompatibilityResult(null)
    setRecommendations([])

    try {
      const result = await checkProductCompatibility(selectedVehicle, selectedProduct)
      
      if (!result) {
        setError('Compatibility data not available for this combination')
        return
      }

      setCompatibilityResult(result)

      // Get recommendations for this vehicle
      const recs = await getRecommendedProducts(selectedVehicle)
      setRecommendations(recs.filter(r => r.product.id !== selectedProduct))
    } catch (err) {
      setError('Failed to check compatibility. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
    const vehicle = [...vehicles, ...searchResults].find(v => v.id === vehicleId)
    if (vehicle) {
      setSelectedMake(vehicle.make.toLowerCase())
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case 'perfect': return <RiCheckLine className="h-5 w-5 text-green-600" />
      case 'good': return <RiThumbUpLine className="h-5 w-5 text-blue-600" />
      case 'difficult': return <RiAlertLine className="h-5 w-5 text-yellow-600" />
      case 'incompatible': return <RiCloseLine className="h-5 w-5 text-red-600" />
      default: return <RiInformationLine className="h-5 w-5 text-gray-600" />
    }
  }

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'perfect': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'difficult': return 'bg-yellow-100 text-yellow-800'
      case 'incompatible': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'professional': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <RiCarLine className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Product Compatibility
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                Check if our tinting products are compatible with your vehicle and get personalized recommendations.
              </p>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Compatibility Checker Tool */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RiSearchLine className="h-6 w-6 text-indigo-600" />
                  <div>
                    <CardTitle className="text-2xl">Compatibility Checker</CardTitle>
                    <CardDescription>
                      Select your vehicle and product to check compatibility and installation requirements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vehicle Search */}
                <div>
                  <Label htmlFor="vehicleSearch">Quick Search</Label>
                  <Input
                    id="vehicleSearch"
                    placeholder="Search by make, model, or year (e.g., '2024 Tesla Model Y')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-sm">
                      {searchResults.slice(0, 5).map((vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() => handleVehicleSelect(vehicle.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-gray-600">{vehicle.bodyStyle} {vehicle.generation && `• ${vehicle.generation}`}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center text-gray-500">or</div>

                {/* Manual Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Vehicle Make</Label>
                    <Select 
                      value={selectedMake} 
                      onValueChange={setSelectedMake}
                      disabled={makesLoading}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={makesLoading ? "Loading makes..." : "Select make"} />
                      </SelectTrigger>
                      <SelectContent>
                        {makes.map((make) => (
                          <SelectItem key={make.id} value={make.id}>
                            <div className="flex items-center gap-2">
                              {make.name}
                              {make.popular && <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicle">Vehicle Model & Year</Label>
                    <Select 
                      value={selectedVehicle} 
                      onValueChange={setSelectedVehicle}
                      disabled={!selectedMake || vehiclesLoading}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={
                          !selectedMake 
                            ? "Select make first" 
                            : vehiclesLoading 
                              ? "Loading models..." 
                              : "Select model"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.model} {vehicle.bodyStyle}
                            {vehicle.generation && ` (${vehicle.generation})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Product Selection */}
                <div>
                  <Label htmlFor="product">Select Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">{product.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleCompatibilityCheck} 
                  disabled={loading || !selectedVehicle || !selectedProduct}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? 'Checking compatibility...' : 'Check Compatibility'}
                </Button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <RiAlertLine className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeDiv>

          {/* Compatibility Results */}
          {compatibilityResult && (
            <FadeDiv>
              <div className="space-y-6">
                {/* Main Result */}
                <Card className={`border-2 ${
                  compatibilityResult.recommendations.recommended 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCompatibilityIcon(compatibilityResult.compatibility.compatibility)}
                        <div>
                          <CardTitle className="text-xl">
                            {compatibilityResult.vehicle.year} {compatibilityResult.vehicle.make} {compatibilityResult.vehicle.model}
                          </CardTitle>
                          <CardDescription>
                            {compatibilityResult.product.name} - ${compatibilityResult.product.price}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getCompatibilityColor(compatibilityResult.compatibility.compatibility)}>
                          {compatibilityResult.compatibility.compatibility.charAt(0).toUpperCase() + 
                           compatibilityResult.compatibility.compatibility.slice(1)}
                        </Badge>
                        <Badge className={getDifficultyColor(compatibilityResult.compatibility.installationDifficulty)}>
                          {compatibilityResult.compatibility.installationDifficulty.charAt(0).toUpperCase() + 
                           compatibilityResult.compatibility.installationDifficulty.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Installation Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                      {compatibilityResult.compatibility.installationTime && (
                        <div className="flex items-center gap-3">
                          <RiTimeLine className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium">Install Time</div>
                            <div className="text-sm text-gray-600">{compatibilityResult.compatibility.installationTime}</div>
                          </div>
                        </div>
                      )}
                      
                      {compatibilityResult.compatibility.requiredTools && (
                        <div className="flex items-center gap-3">
                          <RiToolsLine className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="font-medium">Tools Needed</div>
                            <div className="text-sm text-gray-600">{compatibilityResult.compatibility.requiredTools.length} tools</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <RiStarLine className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Recommended</div>
                          <div className="text-sm text-gray-600">
                            {compatibilityResult.recommendations.recommended ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {compatibilityResult.compatibility.notes && (
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-800 mb-2">Installation Notes</h4>
                        <p className="text-blue-700 text-sm">{compatibilityResult.compatibility.notes}</p>
                      </div>
                    )}

                    {/* Issues */}
                    {compatibilityResult.compatibility.specificIssues && compatibilityResult.compatibility.specificIssues.length > 0 && (
                      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Potential Issues</h4>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          {compatibilityResult.compatibility.specificIssues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Our Assessment</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {compatibilityResult.recommendations.reasons.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Required Tools */}
                    {compatibilityResult.compatibility.requiredTools && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Required Tools:</h4>
                        <div className="flex flex-wrap gap-2">
                          {compatibilityResult.compatibility.requiredTools.map((tool, index) => (
                            <Badge key={index} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Alternative Recommendations */}
                {compatibilityResult.recommendations.alternatives && compatibilityResult.recommendations.alternatives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Better Alternatives</CardTitle>
                      <CardDescription>
                        These products may be a better fit for your vehicle
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {compatibilityResult.recommendations.alternatives.map((alt, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                              <h4 className="font-medium">{alt.productName}</h4>
                              <p className="text-sm text-gray-600 mb-2">{alt.whyBetter}</p>
                              <Badge className="bg-green-100 text-green-800">Better Match</Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${alt.price}</div>
                              <Button asChild size="sm" className="mt-2">
                                <Link href={`/products/${alt.productId}`}>View Product</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Other Recommendations */}
                {recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Other Compatible Products</CardTitle>
                      <CardDescription>
                        Additional products that work with your vehicle
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.slice(0, 4).map((rec, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                              {getCompatibilityIcon(rec.compatibility.compatibility)}
                              <h4 className="font-medium">{rec.product.name}</h4>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>${rec.product.price}</span>
                              <Badge className={getCompatibilityColor(rec.compatibility.compatibility)}>
                                {rec.compatibility.compatibility}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {rec.compatibility.installationTime && `${rec.compatibility.installationTime} install`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </FadeDiv>
          )}
        </FadeContainer>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600">
                  <RiCustomerService2Line className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Need Help Choosing?
                </h3>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Our product specialists can help you find the perfect tinting solution for your specific vehicle and needs.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    <Link href={siteConfig.baseLinks.supportContact + "?category=compatibility"}>
                      Get Expert Advice
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={siteConfig.baseLinks.products}>
                      Browse All Products
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>
    </main>
  )
}