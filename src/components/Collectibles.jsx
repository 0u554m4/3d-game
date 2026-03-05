import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

export default function Collectibles() {
    const collectibles = useGameStore((state) => state.collectibles)
    const groupRef = useRef()

    // Matrix glowing data cubes
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                child.rotation.y += delta * 2
                child.rotation.x += delta * 1.5
                child.position.y = 1 + Math.sin(state.clock.elapsedTime * 4 + i) * 0.3
            })
        }
    })

    return (
        <group ref={groupRef}>
            {collectibles.map((orb) => (
                orb.active && (
                    <group key={orb.id} position={orb.position}>
                        {/* Matrix Data Cube */}
                        <mesh>
                            <boxGeometry args={[0.8, 0.8, 0.8]} />
                            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} transparent opacity={0.6} />
                        </mesh>
                        <mesh scale={[1.1, 1.1, 1.1]}>
                            <boxGeometry args={[0.8, 0.8, 0.8]} />
                            <meshBasicMaterial color="#ffffff" wireframe />
                        </mesh>
                    </group>
                )
            ))}
        </group>
    )
}
