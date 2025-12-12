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
      name: 'Presence Kit — Tesla Model Y',
      description: 'Vehicle‑specific spatial presence capsule with factory‑fit mounts.'
    },
    {
      id: 'cybershade-irx-35',
      name: 'Presence Kit — Universal Cabin',
      description: 'Universal mmWave presence module for most cabins and vans.'
    },
    {
      id: 'cybershade-irx-20',
      name: 'Presence Kit — Fleet / Clinic',
      description: 'High‑sensitivity pack for commercial installs and shared vehicles.'
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

  type CompatibilityLevel = "perfect" | "good" | "difficult" | "incompatible"
  type InstallationDifficulty = "beginner" | "intermediate" | "professional"

  const getCompatibilityIcon = (compatibility: CompatibilityLevel) => {
    switch (compatibility) {
      case 'perfect': return <RiCheckLine className="h-5 w-5 text-primary" />
      case 'good': return <RiThumbUpLine className="h-5 w-5 text-primary/80" />
      case 'difficult': return <RiAlertLine className="h-5 w-5 text-muted-foreground" />
      case 'incompatible': return <RiCloseLine className="h-5 w-5 text-destructive" />
      default: return <RiInformationLine className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getCompatibilityVariant = (compatibility: CompatibilityLevel) => {
    switch (compatibility) {
      case 'perfect': return 'default'
      case 'good': return 'secondary'
      case 'difficult': return 'outline'
      case 'incompatible': return 'destructive'
      default: return 'outline'
    }
  }

  const getDifficultyVariant = (difficulty: InstallationDifficulty) => {
    switch (difficulty) {
      case 'beginner': return 'secondary'
      case 'intermediate': return 'outline'
      case 'professional': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/40 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <RiCarLine className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl font-display">
                Vehicle Compatibility
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
                Confirm which presence kits fit your cabin, then follow the install notes for a stable spatial map.
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
                  <RiSearchLine className="h-6 w-6 text-primary" />
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
                    <div className="mt-2 rounded-md border border-border bg-card shadow-elevation-1">
                      {searchResults.slice(0, 5).map((vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() => handleVehicleSelect(vehicle.id)}
                          className="w-full border-b border-border/60 px-4 py-2 text-left transition-colors hover:bg-muted first:rounded-t-md last:rounded-b-md last:border-b-0"
                        >
                          <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">{vehicle.bodyStyle} {vehicle.generation && `• ${vehicle.generation}`}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center text-muted-foreground">or</div>

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
                              {make.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
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
                            <div className="text-sm text-muted-foreground">{product.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleCompatibilityCheck} 
                  disabled={loading || !selectedVehicle || !selectedProduct}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Checking compatibility...' : 'Check Compatibility'}
                </Button>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex items-start gap-3">
                      <RiAlertLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                      <p className="text-sm text-foreground">{error}</p>
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
                <Card
                  className={`border-2 ${
                    compatibilityResult.recommendations.recommended
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCompatibilityIcon(compatibilityResult.compatibility.compatibility as CompatibilityLevel)}
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
                        <Badge variant={getCompatibilityVariant(compatibilityResult.compatibility.compatibility as CompatibilityLevel)}>
                          {compatibilityResult.compatibility.compatibility.charAt(0).toUpperCase() + 
                           compatibilityResult.compatibility.compatibility.slice(1)}
                        </Badge>
                        <Badge variant={getDifficultyVariant(compatibilityResult.compatibility.installationDifficulty as InstallationDifficulty)}>
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
                          <RiTimeLine className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Install Time</div>
                            <div className="text-sm text-muted-foreground">{compatibilityResult.compatibility.installationTime}</div>
                          </div>
                        </div>
                      )}
                      
                      {compatibilityResult.compatibility.requiredTools && (
                        <div className="flex items-center gap-3">
                          <RiToolsLine className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Tools Needed</div>
                            <div className="text-sm text-muted-foreground">{compatibilityResult.compatibility.requiredTools.length} tools</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <RiStarLine className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Recommended</div>
                          <div className="text-sm text-muted-foreground">
                            {compatibilityResult.recommendations.recommended ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {compatibilityResult.compatibility.notes && (
                      <div className="mb-4 rounded-lg border border-border bg-muted/40 p-4">
                        <h4 className="mb-2 font-medium text-foreground">Install notes</h4>
                        <p className="text-sm text-muted-foreground">{compatibilityResult.compatibility.notes}</p>
                      </div>
                    )}

                    {/* Issues */}
                    {compatibilityResult.compatibility.specificIssues && compatibilityResult.compatibility.specificIssues.length > 0 && (
                      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                        <h4 className="mb-2 font-medium text-foreground">Potential issues</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {compatibilityResult.compatibility.specificIssues.map((issue, index) => (
                            <li key={index}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                      <h4 className="mb-2 font-medium text-foreground">Our assessment</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
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
                          <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                            <div>
                              <h4 className="font-medium">{alt.productName}</h4>
                              <p className="mb-2 text-sm text-muted-foreground">{alt.whyBetter}</p>
                              <Badge variant="secondary">Better match</Badge>
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
                          <div key={index} className="rounded-lg border border-border p-4 transition-colors hover:border-primary/40">
                            <div className="flex items-center gap-3 mb-2">
                              {getCompatibilityIcon(rec.compatibility.compatibility as CompatibilityLevel)}
                              <h4 className="font-medium">{rec.product.name}</h4>
                            </div>
                            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                              <span>${rec.product.price}</span>
                              <Badge variant={getCompatibilityVariant(rec.compatibility.compatibility as CompatibilityLevel)}>
                                {rec.compatibility.compatibility}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
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
      <section className="py-16 bg-background">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="border-border bg-muted/30">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <RiCustomerService2Line className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  Need Help Choosing?
                </h3>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Our specialists can help you pick the right presence kit for your vehicle and environment.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
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
