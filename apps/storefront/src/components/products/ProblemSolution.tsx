import { FadeDiv } from "@/components/Fade"
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline"

export function ProblemSolution() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Tired of the Tinting Trade-Off?
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* The Problem */}
              <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <XMarkIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-900">The Old Way</h3>
                </div>
                
                <p className="text-red-800 mb-6">
                  You want to tint your new Tesla. You&apos;re faced with two bad options:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Cheap DIY Kits</h4>
                      <p className="text-red-700 text-sm">
                        You spend a weekend wrestling with a roll of cheap film, fighting bubbles, 
                        creases, and contamination, only to end up with a result you hate.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Expensive Pro Shops</h4>
                      <p className="text-red-700 text-sm">
                        You get a great result, but it costs $500+ and comes with an aggressive 
                        upsell for paint protection film you might not want.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Solution */}
              <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">The OpticWorks Way</h3>
                </div>
                
                <p className="text-green-800 mb-6">
                  We created CyberShade IRX to fill the gap. We provide professional-grade, 
                  high-performance ceramic tint in a foolproof, all-in-one DIY kit.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700 text-sm">
                      <strong>Pro-shop quality</strong> without the pro-shop invoice
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700 text-sm">
                      <strong>Foolproof installation</strong> with our revolutionary tools
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700 text-sm">
                      <strong>Perfect fit guaranteed</strong> with precision-cut films
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700 text-sm">
                      <strong>On your terms</strong> - install when and where you want
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    &ldquo;It&apos;s the upgrade your Tesla deserves, on your terms.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}