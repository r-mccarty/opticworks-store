'use client'

import { useState } from 'react'
import Scene from './Scene'
import TeslaModel from './TeslaModel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Tesla3DViewerProps {
  className?: string
}

export default function Tesla3DViewer({ className }: Tesla3DViewerProps) {
  const [showTint, setShowTint] = useState(false)
  const [highlightWindows, setHighlightWindows] = useState(false)

  return (
    <div className={className}>
      <div className="relative">
        <Scene className="w-full h-96 rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100">
          <TeslaModel showTint={showTint} highlightWindows={highlightWindows} />
        </Scene>
        
        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 space-y-2">
          <Badge variant="outline" className="bg-white/90">
            3D Tesla Model Y
          </Badge>
        </div>
        
        <div className="absolute bottom-4 left-4 space-x-2">
          <Button
            size="sm"
            variant={showTint ? "default" : "outline"}
            onClick={() => setShowTint(!showTint)}
            className={showTint ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {showTint ? "Remove Tint" : "Apply Tint"}
          </Button>
          
          <Button
            size="sm"
            variant={highlightWindows ? "default" : "outline"}
            onClick={() => setHighlightWindows(!highlightWindows)}
          >
            {highlightWindows ? "Hide Highlight" : "Highlight Windows"}
          </Button>
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/90 rounded-lg px-3 py-2 text-sm text-gray-600">
            <p className="font-medium mb-1">3D Controls:</p>
            <p>• Drag to rotate</p>
            <p>• Scroll to zoom</p>
            <p>• Right-click + drag to pan</p>
          </div>
        </div>
      </div>
    </div>
  )
}