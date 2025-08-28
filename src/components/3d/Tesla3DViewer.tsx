'use client'

import { useMemo } from 'react'
import Scene from './Scene'
import TeslaModel from './TeslaModel'
import { Badge } from '@/components/ui/badge'

interface Tesla3DViewerProps {
  scrollProgress: number
}

export default function Tesla3DViewer({ scrollProgress }: Tesla3DViewerProps) {
  const { showTint, highlightWindows } = useMemo(() => {
    // Example animation logic based on scroll progress:
    // 0% -> 25%: No tint, no highlight
    // 25% -> 50%: Highlight windows
    // 50% -> 100%: Show tint and highlight

    const highlight = scrollProgress > 0.25
    const tint = scrollProgress > 0.5

    return { showTint: tint, highlightWindows: highlight }
  }, [scrollProgress])

  return (
    <div className="w-full h-full">
      <Scene className="w-full h-full bg-gradient-to-b from-blue-50 to-blue-100">
        <TeslaModel showTint={showTint} highlightWindows={highlightWindows} scrollProgress={scrollProgress} />
      </Scene>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 ring-1 ring-black/5">
          <p className="font-medium mb-1">3D Controls:</p>
          <p>• Drag to rotate</p>
          <p>• Scroll to zoom</p>
          <p>• Right-click + drag to pan</p>
        </div>
      </div>

      {/* Scroll-based animation status */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="space-y-2">
          <Badge variant={highlightWindows ? 'default' : 'outline'} className="bg-white/80 backdrop-blur-sm transition-all duration-300">
            {highlightWindows ? 'Windows Highlighted' : 'Windows Normal'}
          </Badge>
          <Badge variant={showTint ? 'default' : 'outline'} className="bg-white/80 backdrop-blur-sm transition-all duration-300">
            {showTint ? 'Tint Applied' : 'Tint Not Applied'}
          </Badge>
        </div>
      </div>
    </div>
  )
}