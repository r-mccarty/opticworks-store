'use client'

import { useState } from 'react'
import { FadeDiv } from '@/components/Fade'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ThreeDErrorBoundary from '@/components/3d/ErrorBoundary'
import Tesla3DViewer from '@/components/3d/Tesla3DViewer'

export default function Tesla3DSection() {
  const [show3D, setShow3D] = useState(false)

  const VideoPlaceholder = () => (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="text-gray-600 font-medium">3-Minute Installation Video</p>
        <p className="text-sm text-gray-500 mb-4">Click to watch the complete process</p>
        <Button 
          onClick={() => setShow3D(true)}
          variant="outline"
          size="sm"
        >
          Or View in 3D
        </Button>
      </div>
    </div>
  )

  return (
    <FadeDiv className="mb-12">
      {!show3D ? (
        <VideoPlaceholder />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <ThreeDErrorBoundary>
              <Tesla3DViewer />
            </ThreeDErrorBoundary>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Interactive 3D Tesla Model Y
                  </h3>
                  <p className="text-sm text-gray-600">
                    Explore the tinting process in 3D. Use the controls to apply tint and highlight windows.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Interactive
                  </Badge>
                  <Button 
                    onClick={() => setShow3D(false)}
                    variant="outline"
                    size="sm"
                  >
                    Back to Video
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </FadeDiv>
  )
}