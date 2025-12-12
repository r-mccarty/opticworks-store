'use client'

import { useState } from 'react'
import { FadeDiv } from '@/components/Fade'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import ThreeDErrorBoundary from '@/components/3d/ErrorBoundary'

const Tesla3DViewer = dynamic(() => import('@/components/3d/Tesla3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center rounded-lg bg-muted/30">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-muted-foreground">Loading 3D Model...</p>
      </div>
    </div>
  )
})

export default function Tesla3DSection() {
  const [show3D, setShow3D] = useState(false)

  const VideoPlaceholder = () => (
    <div className="flex aspect-video items-center justify-center rounded-lg bg-muted/30">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="font-medium text-muted-foreground">3-Minute Installation Video</p>
        <p className="mb-4 text-sm text-muted-foreground">Click to watch the complete process</p>
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
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Interactive 3D Tesla Model Y
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Explore the tinting process in 3D. Use the controls to apply tint and highlight windows.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Interactive</Badge>
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
