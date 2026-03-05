import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

export default function Obstacles() {
    const obstacles = useGameStore((state) => state.obstacles)
    const groupRef = useRef()

    // Glitching red pillars (Agents/Virus)
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                // Glitchy movement
                child.position.x += (Math.random() - 0.5) * 0.05
                const originalX = obstacles[i].position[0]
                if (Math.abs(child.position.x - originalX) > 0.2) {
                    child.position.x = originalX
                }

                const innerMesh = child.children[0]
                if (innerMesh) {
                    innerMesh.material.emissiveIntensity = Math.random() > 0.9 ? 3 : 0.5
                }
            })
        }
    })

    return (
        <group ref={groupRef}>
            {obstacles.map((obs, i) => (
                <group key={obs.id} position={obs.position} scale={obs.scale}>
                    {/* Main Pillar */}
                    <mesh position={[0, 1, 0]}>
                        <boxGeometry args={[1, 2, 1]} />
                        <meshStandardMaterial color="#220000" emissive="#ff0000" emissiveIntensity={0.5} />
                    </mesh>
                    {/* Glitch Wireframe */}
                    <mesh position={[0, 1, 0]} scale={[1.05, 1.05, 1.05]}>
                        <boxGeometry args={[1, 2, 1]} />
                        <meshBasicMaterial color="#ff0000" wireframe />
                    </mesh>
                </group>
            ))}
        </group>
    )
}
