import React, { useRef, createRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

const SEGMENT_LENGTH = 200
const SEGMENT_COUNT = 4

export default function RoadSystem() {
    const roadGroup = useRef()
    const speed = useGameStore((state) => state.speed)
    const gameState = useGameStore((state) => state.gameState)

    // Create refs for individual segments
    const segmentRefs = useRef([...Array(SEGMENT_COUNT)].map(() => createRef()))

    useFrame((state, delta) => {
        if (gameState !== 'playing' || !roadGroup.current) return

        const currentSpeed = useGameStore.getState().speed
        const moveDist = currentSpeed * delta

        roadGroup.current.children.forEach(segment => {
            segment.position.z += moveDist
            if (segment.position.z > SEGMENT_LENGTH) {
                segment.position.z -= SEGMENT_LENGTH * SEGMENT_COUNT
            }
        })
    })

    return (
        <group ref={roadGroup}>
            {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
                <group key={i} position={[0, -0.4, -i * SEGMENT_LENGTH]}>

                    {/* Physical Floor for Physics engine support.
                    Instead of a dynamic moving physics plane (which can cause jitter),
                    We rely on the player staying locked to Y=0.5 while visual road moves underneath.
                */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[40, SEGMENT_LENGTH]} />
                        <meshStandardMaterial color="#020202" roughness={0.1} metalness={0.9} />
                    </mesh>

                    {/* Neon Highway Lines (Center) */}
                    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.5, SEGMENT_LENGTH, 1, 30]} />
                        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
                    </mesh>

                    {/* Left Wall / Border */}
                    <mesh position={[-20, 1, 0]}>
                        <boxGeometry args={[1, 2, SEGMENT_LENGTH]} />
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                    </mesh>

                    {/* Right Wall / Border */}
                    <mesh position={[20, 1, 0]}>
                        <boxGeometry args={[1, 2, SEGMENT_LENGTH]} />
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                    </mesh>

                    {/* Grid Overlay on Road */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                        <planeGeometry args={[40, SEGMENT_LENGTH, 20, 50]} />
                        <meshBasicMaterial color="#ff00ff" wireframe transparent opacity={0.3} />
                    </mesh>

                </group>
            ))}
        </group>
    )
}
