"use client"

import { FadeDiv } from "@/components/Fade"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RocketLaunchIcon, ShieldCheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

export function BetaFirmware() {
  return (
    <div className="px-6 py-24 bg-gradient-to-br from-slate-50 to-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeDiv>
            <Badge className="mb-6 bg-purple-100 text-purple-700 border-0">
              Beta Firmware Channel
            </Badge>
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-6">
              Get features before
              <br />
              they hit production
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Developer Edition owners receive weekly firmware builds with experimental
              detection modes, new tuning parameters, and engine improvements under active
              development. Flash via OTA or USB—your choice.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Early Access to New Algorithms
                  </h4>
                  <p className="text-gray-600">
                    Test adaptive Z-score thresholds, multi-target tracking, and HVAC noise
                    filters before they land in stable releases.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Safe Rollback Mechanism
                  </h4>
                  <p className="text-gray-600">
                    Every beta build includes a factory partition. One button press restores
                    the last stable firmware.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Weekly Update Cadence
                  </h4>
                  <p className="text-gray-600">
                    New builds drop every Friday with changelog, known issues, and tuning
                    guidance in the private Discord lab channel.
                  </p>
                </div>
              </div>
            </div>
          </FadeDiv>

          <FadeDiv>
            <Card className="p-6 bg-slate-900 text-white border-0 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-400">latest_beta_changelog.md</span>
              </div>
              <div className="text-sm text-gray-300 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs border-0">
                      v2.4.0-beta.3
                    </Badge>
                    <span className="text-gray-500">2025-11-08</span>
                  </div>
                  <p className="text-gray-400 mb-2">New Features:</p>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    <li>Adaptive Z-score baseline recalibration</li>
                    <li>HVAC cycle noise suppression filter</li>
                    <li>Multi-target confidence scoring (experimental)</li>
                  </ul>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-gray-400 mb-2">Tuning Parameters:</p>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    <li><code className="text-cyan-400">hvac_suppress_threshold</code> (0-100)</li>
                    <li><code className="text-cyan-400">adaptive_baseline_window</code> (30-600s)</li>
                    <li><code className="text-cyan-400">multi_target_mode</code> (bool)</li>
                  </ul>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-gray-400 mb-2">Known Issues:</p>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    <li>Multi-target mode increases false positives near windows</li>
                    <li>Adaptive baseline may drift on very long (8h+) sessions</li>
                  </ul>
                </div>
              </div>
            </Card>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
