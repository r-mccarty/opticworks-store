'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface TeslaModelProps {
  showTint?: boolean
  highlightWindows?: boolean
}

export default function TeslaModel({ showTint = false, highlightWindows = false }: TeslaModelProps) {
  const carBodyRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (carBodyRef.current) {
      carBodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group position={[0, -1, 0]}>
      {/* Car Body */}
      <mesh
        ref={carBodyRef}
        position={[0, 0.5, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial 
          color={hovered ? "#ff6600" : "#1a1a1a"} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Front Windshield */}
      <mesh position={[1.2, 1.2, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.6, 0.8, 1.4]} />
        <meshStandardMaterial 
          color={showTint ? "#333333" : "#87CEEB"}
          transparent
          opacity={showTint ? 0.3 : 0.7}
          metalness={0.1}
          roughness={0.1}
          emissive={highlightWindows ? "#0066ff" : "#000000"}
          emissiveIntensity={highlightWindows ? 0.3 : 0}
        />
      </mesh>

      {/* Side Windows (Left) */}
      <mesh position={[0, 1, 0.8]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[2, 0.6, 0.1]} />
        <meshStandardMaterial 
          color={showTint ? "#333333" : "#87CEEB"}
          transparent
          opacity={showTint ? 0.3 : 0.7}
          metalness={0.1}
          roughness={0.1}
          emissive={highlightWindows ? "#0066ff" : "#000000"}
          emissiveIntensity={highlightWindows ? 0.3 : 0}
        />
      </mesh>

      {/* Side Windows (Right) */}
      <mesh position={[0, 1, -0.8]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[2, 0.6, 0.1]} />
        <meshStandardMaterial 
          color={showTint ? "#333333" : "#87CEEB"}
          transparent
          opacity={showTint ? 0.3 : 0.7}
          metalness={0.1}
          roughness={0.1}
          emissive={highlightWindows ? "#0066ff" : "#000000"}
          emissiveIntensity={highlightWindows ? 0.3 : 0}
        />
      </mesh>

      {/* Rear Windshield */}
      <mesh position={[-1.2, 1.2, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.6, 0.8, 1.4]} />
        <meshStandardMaterial 
          color={showTint ? "#333333" : "#87CEEB"}
          transparent
          opacity={showTint ? 0.3 : 0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Wheels */}
      {[[-1, 0, 1], [-1, 0, -1], [1, 0, 1], [1, 0, -1]].map((position, index) => (
        <mesh key={index} position={position as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      ))}
    </group>
  )
}