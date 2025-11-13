"use client"
import { useEffect, useRef, useState } from "react"

interface VideoBackgroundProps {
  videoUrl: string
  posterUrl?: string
  className?: string
}

export function VideoBackground({ 
  videoUrl, 
  posterUrl,
  className = ""
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)


  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    console.log("Setting up video with URL:", videoUrl)
    console.log("Video element:", video)
    console.log("Video src:", video.src)
    console.log("Video currentSrc:", video.currentSrc)

    const handleLoadedData = () => {
      console.log("Video loaded successfully")
      setIsLoaded(true)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement
      console.error("Video loading error:", e)
      console.error("Video error details:", {
        error: target?.error,
        networkState: target?.networkState,
        readyState: target?.readyState,
        src: target?.src
      })
      setIsLoaded(false)
      setHasError(true)
    }

    const handleCanPlay = () => {
      console.log("Video can play")
      setIsLoaded(true)
      // Auto-play the video once it can play
      if (video) {
        video.play().catch(error => {
          console.log("Auto-play failed, user interaction required:", error)
        }).then(() => {
          setIsPlaying(true)
        })
      }
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('loadstart', () => console.log('Video load started'))
    video.addEventListener('loadedmetadata', () => console.log('Video metadata loaded'))
    video.addEventListener('canplaythrough', () => console.log('Video can play through'))
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)

    // Force the video to load
    video.load()
    console.log("Video load() called")

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('loadstart', () => console.log('Video load started'))
      video.removeEventListener('loadedmetadata', () => console.log('Video metadata loaded'))
      video.removeEventListener('canplaythrough', () => console.log('Video can play through'))
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [videoUrl])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Fallback Background when video fails */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse"></div>
          </div>
          <div className="absolute bottom-4 left-4 text-white/80 text-sm">
            Video failed to load - using fallback background
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={`absolute inset-0 w-full h-full object-cover ${hasError ? 'opacity-0' : 'opacity-100'}`}
        poster={posterUrl}
        muted
        playsInline
        preload="metadata"
        loop
      >
        <source src={videoUrl} type="video/mp4" />
        {/* Fallback text for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>


      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
      
      {/* Additional overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
    </div>
  )
}