'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'

interface SceneProps {
  children: React.ReactNode
  className?: string
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1}
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  )
}

export default function Scene({ children, className = "w-full h-96" }: SceneProps) {
  return (
    <div className={className}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ 
            position: [0, 2, 5], 
            fov: 50 
          }}
          shadows
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <SceneLights />
          <Environment preset="studio" />
          <OrbitControls 
            enableDamping
            dampingFactor={0.1}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            panSpeed={0.8}
            maxPolarAngle={Math.PI * 0.75}
            minDistance={2}
            maxDistance={10}
          />
          {children}
        </Canvas>
      </Suspense>
    </div>
  )
}