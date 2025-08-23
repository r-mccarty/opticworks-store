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
  const [showPlayButton, setShowPlayButton] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        console.log("Attempting to play video...")
        await videoRef.current.play()
        setIsPlaying(true)
        setShowPlayButton(false)
        console.log("Video started playing successfully")
      } catch (error) {
        console.error("Video play failed:", error)
        // If autoplay fails, keep the play button visible
        setShowPlayButton(true)
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      console.log("Video loaded successfully")
      setIsLoaded(true)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setShowPlayButton(true)
    }

    const handleError = (e: Event) => {
      console.error("Video loading error:", e)
      setIsLoaded(false)
      setHasError(true)
    }

    const handleCanPlay = () => {
      console.log("Video can play")
      setIsLoaded(true)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Fallback Background when video fails */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)] animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Video Element */}
      <video
        ref={videoRef}
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

      {/* Play Button Overlay */}
      {showPlayButton && isLoaded && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity hover:bg-black/30 group"
          aria-label="Play background video"
        >
          <div className="rounded-full bg-white/90 p-6 shadow-xl hover:bg-white transition-all duration-200 group-hover:scale-110">
            <svg className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </button>
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />
      
      {/* Additional overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
    </div>
  )
}