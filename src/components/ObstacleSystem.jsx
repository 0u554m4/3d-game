import { useRef, createRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

const POOL_SIZE = 12
const SPAWN_DISTANCE = -120

// Generates slow moving 'civilian' traffic to act as realistic obstacles
const generatePool = () => {
    return Array.from({ length: POOL_SIZE }).map((_, i) => ({
        id: i,
        active: false,
        pos: [0, -50, 0],
        type: Math.random() > 0.3 ? 'sedan' : 'truck',
        speed: Math.random() * 30 + 30, // Slow speeds: 30-60
        laneOffset: 0,
        color: new THREE.Color().setHSL(Math.random(), 0.4, 0.4) // Dull realistic colors
    }))
}

export default function ObstacleSystem() {
    const gameState = useGameStore((state) => state.gameState)
    const obstacleState = useRef(generatePool())
    const obsRefs = useRef([...Array(POOL_SIZE)].map(() => createRef()))

    useFrame((state, delta) => {
        if (gameState !== 'playing') return

        const playerSpeed = useGameStore.getState().speed

        obstacleState.current.forEach((obs, i) => {
            const body = obsRefs.current[i].current
            if (!body) return

            if (obs.active) {
                // Move civilian car forward relative to player
                obs.pos[2] += (playerSpeed - obs.speed) * delta

                // Minor lane drift for realism
                obs.laneOffset = Math.sin(state.clock.elapsedTime * 0.5 + obs.id) * 0.5
                body.setTranslation({ x: obs.pos[0] + obs.laneOffset, y: 0.5, z: obs.pos[2] }, true)

                // Despawn if passed
                if (obs.pos[2] > 20) {
                    obs.active = false
                    body.setTranslation({ x: 0, y: -50, z: 0 }, true)
                }
            } else {
                // Spawn Civilian Traffic
                if (Math.random() < 0.02 * (playerSpeed / 100)) {
                    obs.active = true
                    obs.pos = [
                        (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 8 + 2), // Spawn in lanes
                        0.5,
                        SPAWN_DISTANCE - (Math.random() * 50)
                    ]
                    obs.speed = Math.random() * 30 + 30
                    body.setTranslation({ x: obs.pos[0], y: obs.pos[1], z: obs.pos[2] }, true)
                }
            }
        })
    })

    return (
        <group>
            {obstacleState.current.map((obs, i) => (
                <RigidBody
                    key={obs.id}
                    ref={obsRefs.current[i]}
                    type="kinematicPosition"
                    position={[0, -50, 0]}
                    onCollisionEnter={() => useGameStore.getState().setGameState('gameover')}
                >
                    {obs.type === 'sedan' ? (
                        <>
                            <CuboidCollider args={[1, 0.6, 2.2]} />
                            <group>
                                {/* Sedan Body */}
                                <mesh castShadow>
                                    <boxGeometry args={[2, 0.8, 4.4]} />
                                    <meshStandardMaterial color={obs.color} roughness={0.7} />
                                </mesh>
                                {/* Sedan Cabin */}
                                <mesh position={[0, 0.6, -0.2]}>
                                    <boxGeometry args={[1.6, 0.6, 2]} />
                                    <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
                                </mesh>
                                {/* Taillights */}
                                <mesh position={[0, 0.2, 2.21]}>
                                    <planeGeometry args={[1.6, 0.3]} />
                                    <meshBasicMaterial color="#ff0000" />
                                </mesh>
                            </group>
                        </>
                    ) : (
                        <>
                            <CuboidCollider args={[1.5, 1.5, 4]} />
                            <group>
                                {/* Truck Body */}
                                <mesh castShadow position={[0, 0.5, 1]}>
                                    <boxGeometry args={[3, 2.5, 6]} />
                                    <meshStandardMaterial color={obs.color} roughness={0.8} />
                                </mesh>
                                {/* Truck Cabin */}
                                <mesh position={[0, 0.2, -2.5]}>
                                    <boxGeometry args={[2.8, 2, 2]} />
                                    <meshStandardMaterial color="#cccccc" roughness={0.5} />
                                </mesh>
                            </group>
                        </>
                    )}
                </RigidBody>
            ))}
        </group>
    )
}
