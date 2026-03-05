import { useRef, useMemo, createRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

// Object polling settings
const POOL_SIZE = 8
const SPAWN_DISTANCE = -80 // Spawn ahead of player
const DESPAWN_DISTANCE = 20 // Despawn behind player

const generateInitialTraffic = () => {
    return Array.from({ length: POOL_SIZE }).map((_, i) => ({
        id: i,
        active: false,
        xBase: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4), // Lanes
        zPos: 0,
        speed: (Math.random() * 50) + 80, // AI car speeds
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5)
    }))
}

export default function AITrafficSystem() {
    const gameState = useGameStore((state) => state.gameState)
    const trafficState = useRef(generateInitialTraffic())

    // Array of refs mapping to the RigidBody of each AI car
    const carRefs = useRef([...Array(POOL_SIZE)].map(() => createRef()))

    useFrame((state, delta) => {
        if (gameState !== 'playing') return

        const playerSpeed = useGameStore.getState().speed
        const playerZ = 0 // Player physically stays at Z=0

        trafficState.current.forEach((car, i) => {
            const body = carRefs.current[i].current
            if (!body) return

            if (car.active) {
                // AI drives forward (Speed dictates how fast it moves away from player, 
                // but the road moves past player too, we approximate relative movement).

                // Player effectively goes 'playerSpeed' (moving road covers this).
                // AI goes forward at 'car.speed'.
                // Therefore, AI's Z position relative to player = playerSpeed - car.speed.
                car.zPos += (playerSpeed - car.speed) * delta

                body.setTranslation({ x: car.xBase, y: 0.5, z: car.zPos }, true)

                // Check Overtake (AI passes player moving backwards)
                if (car.zPos > playerZ && car.zPos - (playerSpeed - car.speed) * delta <= playerZ) {
                    useGameStore.getState().addBonus(50) // Overtake Bonus!
                }

                // Despawn if it falls behind player
                if (car.zPos > DESPAWN_DISTANCE) {
                    car.active = false
                    body.setTranslation({ x: 0, y: -50, z: 0 }, true) // hide
                }

            } else {
                // Chance to spawn
                if (Math.random() < 0.01 * (playerSpeed / 100)) {
                    car.active = true
                    car.zPos = SPAWN_DISTANCE
                    car.xBase = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 4)
                    body.setTranslation({ x: car.xBase, y: 0.5, z: car.zPos }, true)
                }
            }
        })
    })

    const handleCollisionEnter = (e) => {
        // If we hit an AI Traffic Car, Game Over!
        if (e.other.rigidBodyObject?.name === "PlayerCar" || !e.other.rigidBodyObject) {
            // In Rapier, sometimes the player is the origin of the event, simplify:
            useGameStore.getState().setGameState('gameover')
        }
    }

    return (
        <group>
            {trafficState.current.map((car, i) => (
                <RigidBody
                    key={car.id}
                    ref={carRefs.current[i]}
                    type="kinematicPosition"
                    position={[0, -50, 0]} // hidden initially
                    onCollisionEnter={handleCollisionEnter}
                    name={`ai_car_${car.id}`}
                >
                    <CuboidCollider args={[1, 0.5, 2]} />
                    {/* AI Car Visuals */}
                    <mesh castShadow>
                        <boxGeometry args={[2, 1, 4]} />
                        <meshStandardMaterial color={car.color} metalness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0]} scale={[1.05, 1.05, 1.05]}>
                        <boxGeometry args={[2, 1, 4]} />
                        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.2} />
                    </mesh>
                    {/* AI Engine Glow */}
                    <mesh position={[0, 0, 2.1]}>
                        <planeGeometry args={[1.5, 0.4]} />
                        <meshBasicMaterial color="#ff5500" />
                    </mesh>
                </RigidBody>
            ))}
        </group>
    )
}
