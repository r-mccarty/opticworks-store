import { FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const comparisonData = [
  {
    feature: "Stillness detection",
    pir: { value: "None", status: "poor" },
    cheapMmwave: { value: "Inconsistent", status: "neutral" },
    bedSensor: { value: "Absolute Clear Delay", status: "excellent" },
  },
  {
    feature: "False positives",
    pir: { value: "Fans & cats", status: "poor" },
    cheapMmwave: { value: "Pet + HVAC noise", status: "poor" },
    bedSensor: { value: "Still-energy focus", status: "excellent" },
  },
  {
    feature: "Transparency",
    pir: { value: "Black box", status: "poor" },
    cheapMmwave: { value: "Serial-only debug", status: "neutral" },
    bedSensor: { value: "HA debug text sensor", status: "excellent" },
  },
  {
    feature: "Tuning controls",
    pir: { value: "None", status: "poor" },
    cheapMmwave: { value: "Firmware hacking", status: "neutral" },
    bedSensor: { value: "Live sliders + z-scores", status: "excellent" },
  },
  {
    feature: "Install time",
    pir: { value: "5 min", status: "good" },
    cheapMmwave: { value: "Hours", status: "poor" },
    bedSensor: { value: "15 min guided", status: "excellent" },
  },
  {
    feature: "Privacy",
    pir: { value: "OK", status: "neutral" },
    cheapMmwave: { value: "Unknown firmware", status: "neutral" },
    bedSensor: { value: "Local + cloud-free", status: "excellent" },
  },
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
                Not all presence sensors understand a bedroom.
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                PIR sensors need motion. Cheap mmWave boards flap with every fan. The Bed Presence
                Sensor was engineered around still-energy reflections, hysteresis, and transparent
                tuning so Home Assistant automations stay calm.
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
                          PIR Motion Sensors
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-orange-600 bg-orange-50">
                          Bed Presence Sensor
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Cheap mmWave Dev Boards
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
                            <Badge className={statusStyles[row.pir.status as keyof typeof statusStyles]}>
                              {row.pir.value}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center bg-orange-50/50">
                            <Badge className={statusStyles[row.bedSensor.status as keyof typeof statusStyles]}>
                              {row.bedSensor.value}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge className={statusStyles[row.cheapMmwave.status as keyof typeof statusStyles]}>
                              {row.cheapMmwave.value}
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
                  <h3 className="font-semibold text-gray-900 mb-2">Still-energy analysis</h3>
                  <p className="text-sm text-gray-600">
                    We focus on energy that barely moves—exactly what a sleeping human looks like
                    to mmWave—so ceiling fans and hallway traffic stay invisible.
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
                  <h3 className="font-semibold text-gray-900 mb-2">Temporal filtering</h3>
                  <p className="text-sm text-gray-600">
                    Configurable debounce timers (3s ON / 5s OFF) stop flapping sensors in their
                    tracks without adding lag to your automations.
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
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent by design</h3>
                  <p className="text-sm text-gray-600">
                    Debug text sensors log every state transition, z-score, and Absolute Clear Delay so
                    you always know why the binary sensor changed.
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
