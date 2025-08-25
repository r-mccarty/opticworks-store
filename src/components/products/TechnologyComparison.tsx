import { FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const comparisonData = [
  {
    feature: "Heat Rejection",
    cheapFilm: { value: "Low (~20%)", status: "poor" },
    cyberShade: { value: "Excellent (Up to 99% IR)", status: "excellent" },
    proShop: { value: "Excellent", status: "excellent" }
  },
  {
    feature: "Ease of Install",
    cheapFilm: { value: "Very Hard", status: "poor" },
    cyberShade: { value: "Foolproof (Pre-cut)", status: "excellent" },
    proShop: { value: "Pro Install Only", status: "neutral" }
  },
  {
    feature: "Clarity",
    cheapFilm: { value: "Fair", status: "poor" },
    cyberShade: { value: "Pristine", status: "excellent" },
    proShop: { value: "Pristine", status: "excellent" }
  },
  {
    feature: "Longevity",
    cheapFilm: { value: "1-2 Years (fades/bubbles)", status: "poor" },
    cyberShade: { value: "Lifetime", status: "excellent" },
    proShop: { value: "Lifetime", status: "excellent" }
  },
  {
    feature: "Cost",
    cheapFilm: { value: "~$40", status: "good" },
    cyberShade: { value: "~$150", status: "good" },
    proShop: { value: "$500+", status: "poor" }
  },
  {
    feature: "Tools Included",
    cheapFilm: { value: "None / Basic", status: "poor" },
    cyberShade: { value: "Complete Pro Kit", status: "excellent" },
    proShop: { value: "N/A", status: "neutral" }
  }
]

const statusStyles = {
  excellent: "bg-green-100 text-green-800",
  good: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-800",
  poor: "bg-red-100 text-red-800"
}

export function TechnologyComparison() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Not All Tint is Created Equal. Meet CyberShade IRX™.
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                CyberShade IRX isn&apos;t just for looks. It&apos;s an advanced, multi-layer ceramic film 
                engineered for maximum performance. While standard films only block UV light, 
                our IRX technology targets and rejects infrared heat&mdash;the kind you can actually feel. 
                The result? A significantly cooler cabin, reduced glare, and protection for your 
                interior, all with pristine optical clarity.
              </p>
            </div>

            {/* Comparison Table */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-white border-b">
                <CardTitle className="text-center">Product Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Feature
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Cheap Dyed Film
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-orange-600 bg-orange-50">
                          CyberShade IRX Ceramic
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Pro-Shop Ceramic<br />
                          <span className="font-normal text-xs">(3M/XPEL)</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {row.feature}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge className={statusStyles[row.cheapFilm.status as keyof typeof statusStyles]}>
                              {row.cheapFilm.value}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center bg-orange-50/50">
                            <Badge className={statusStyles[row.cyberShade.status as keyof typeof statusStyles]}>
                              {row.cyberShade.value}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge className={statusStyles[row.proShop.status as keyof typeof statusStyles]}>
                              {row.proShop.value}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Key Technology Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ceramic Technology</h3>
                  <p className="text-sm text-gray-600">
                    Multi-layer ceramic construction blocks heat without interfering 
                    with electronics or signals.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">IR Heat Rejection</h3>
                  <p className="text-sm text-gray-600">
                    Specifically targets infrared radiation - the heat you actually 
                    feel - for maximum cooling performance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Optical Clarity</h3>
                  <p className="text-sm text-gray-600">
                    Crystal-clear visibility with no haze, distortion, or color 
                    shift - just like looking through premium glass.
                  </p>
                </CardContent>
              </Card>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}