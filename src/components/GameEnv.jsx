import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

export default function GameEnv() {
    const gridRef = useRef()
    const ambientLightRef = useRef()
    const fogRef = useRef()
    const rainGroupRef = useRef()

    // Rain specs
    const RAIN_COUNT = 800
    const RAIN_SPEED = 60

    // Matrix-style speeding ground
    useFrame((state, delta) => {
        const gameState = useGameStore.getState().gameState
        const timeOfDay = useGameStore.getState().timeOfDay
        const speed = useGameStore.getState().speed

        if (gridRef.current && gameState === 'playing') {
            // Move ground mesh based on speed
            gridRef.current.position.z = (gridRef.current.position.z + speed * delta) % 10
        }

        // Animated Rain
        if (rainGroupRef.current) {
            rainGroupRef.current.children.forEach((drop) => {
                // Rain falls down and comes towards player based on speed
                drop.position.y -= RAIN_SPEED * delta
                drop.position.z += (speed * 0.5) * delta

                // Angle rain drops based on speed
                drop.rotation.x = -Math.atan2(speed * 0.5, RAIN_SPEED)

                // Recycle drops
                if (drop.position.y < 0) {
                    drop.position.y = Math.random() * 40 + 20
                    drop.position.z = (Math.random() - 0.5) * 100 - 50 // Keep within view distance
                    drop.position.x = (Math.random() - 0.5) * 100
                }
            })
        }

        // Day/Night Cycle Interpolation
        // Map timeOfDay (0-1) to colors using HSL for cool cyberpunk sunset to deep night
        if (ambientLightRef.current && fogRef.current) {
            // timeOfDay = 0: Midnight (Dark blue) -> 0.5: Synthwave Sunset (Magenta/Orange) -> 1: Midnight
            const hue = THREE.MathUtils.lerp(0.6, 0.9, Math.sin(timeOfDay * Math.PI))
            const lightness = THREE.MathUtils.lerp(0.05, 0.2, Math.sin(timeOfDay * Math.PI))

            const cycleColor = new THREE.Color().setHSL(hue, 1.0, lightness)
            ambientLightRef.current.color.copy(cycleColor)
            fogRef.current.color.copy(cycleColor)
            // Also update scene background
            state.scene.background = cycleColor
        }
    })

    // Digital rain / Dust particles
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < RAIN_COUNT; i++) {
            temp.push({
                pos: [
                    (Math.random() - 0.5) * 150,
                    Math.random() * 60,
                    (Math.random() - 0.5) * 150 - 50
                ]
            })
        }
        return temp
    }, [])

    return (
        <>
            <ambientLight ref={ambientLightRef} intensity={0.5} color="#000022" />
            <directionalLight position={[0, 20, -50]} intensity={1.5} color="#ff00ff" castShadow />

            {/* Environment defaults */}
            <fog attach="fog" ref={fogRef} args={['#000022', 15, 80]} />

            {/* Realistic Rain */}
            <group ref={rainGroupRef}>
                {particles.map((p, i) => (
                    <mesh key={i} position={p.pos}>
                        <boxGeometry args={[0.04, Math.random() * 2 + 1, 0.04]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
                    </mesh>
                ))}
            </group>

            {/* Speeding Grid Floor */}
            <group position={[0, 0, 0]}>
                <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[200, 200, 100, 100]} />
                    <meshBasicMaterial
                        color="#ff0088"
                        wireframe
                        transparent
                        opacity={0.15}
                    />
                </mesh>
                {/* Solid void floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </group>
        </>
    )
}
