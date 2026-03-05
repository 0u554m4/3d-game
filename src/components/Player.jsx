import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { useGameStore } from '../store/gameStore'

const MOVEMENT_SPEED = 20
const BOUNDARY = 25

export default function Player() {
    const playerRef = useRef()
    const carGroup = useRef()

    const controls = usePlayerControls()
    const gameState = useGameStore((state) => state.gameState)
    const setPlayerPosition = useGameStore((state) => state.setPlayerPosition)
    const setGameState = useGameStore((state) => state.setGameState)

    const collectibles = useGameStore((state) => state.collectibles)
    const obstacles = useGameStore((state) => state.obstacles)
    const collectItem = useGameStore((state) => state.collectItem)
    const incrementScore = useGameStore((state) => state.incrementScore)

    useFrame((state, delta) => {
        if (gameState !== 'playing' || !playerRef.current) return

        const { forward, backward, left, right } = controls

        // Movement logic
        const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0)
        const moveX = (right ? 1 : 0) - (left ? 1 : 0)

        playerRef.current.position.z += moveZ * MOVEMENT_SPEED * delta
        playerRef.current.position.x += moveX * MOVEMENT_SPEED * delta

        // Boundaries
        playerRef.current.position.x = THREE.MathUtils.clamp(playerRef.current.position.x, -BOUNDARY, BOUNDARY)
        playerRef.current.position.z = THREE.MathUtils.clamp(playerRef.current.position.z, -BOUNDARY, BOUNDARY)

        // Visual rotation (car steering)
        carGroup.current.rotation.y = THREE.MathUtils.lerp(carGroup.current.rotation.y, -moveX * 0.3, 0.1)

        // Sync position to store
        setPlayerPosition([playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z])

        // Camera follow (chase cam for car)
        const cameraOffset = new THREE.Vector3(0, 4, 10)
        const targetAdjusted = playerRef.current.position.clone().add(cameraOffset)
        state.camera.position.lerp(targetAdjusted, 0.1)

        const lookAtPos = playerRef.current.position.clone()
        state.camera.lookAt(lookAtPos.x, lookAtPos.y, lookAtPos.z - 5)

        // Collision Detection
        const pPos = playerRef.current.position

        // Collectibles
        collectibles.forEach(c => {
            if (c.active) {
                const dist = Math.hypot(pPos.x - c.position[0], pPos.z - c.position[2])
                if (dist < 2.0) { // Collision radius
                    collectItem(c.id)
                    incrementScore(100)
                }
            }
        })

        // Obstacles
        obstacles.forEach(o => {
            const dist = Math.hypot(pPos.x - o.position[0], pPos.z - o.position[2])
            if (dist < 1.8) { // Hit obstacle
                setGameState('gameover')
            }
        })
    })

    // Reset position when game starts
    if (gameState === 'start' && playerRef.current) {
        playerRef.current.position.set(0, 0, 0)
    }

    return (
        <group ref={playerRef} position={[0, 0.5, 0]}>
            <group ref={carGroup}>
                {/* Car Body (Matrix black with dark green outline) */}
                <mesh castShadow position={[0, 0.5, 0]}>
                    <boxGeometry args={[1.6, 0.6, 3]} />
                    <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.5, 0]} scale={[1.02, 1.02, 1.02]}>
                    <boxGeometry args={[1.6, 0.6, 3]} />
                    <meshBasicMaterial color="#00ff00" wireframe />
                </mesh>

                {/* Car Cabin */}
                <mesh castShadow position={[0, 1, -0.2]}>
                    <boxGeometry args={[1.2, 0.5, 1.5]} />
                    <meshStandardMaterial color="#020202" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 1, -0.2]} scale={[1.05, 1.05, 1.05]}>
                    <boxGeometry args={[1.2, 0.5, 1.5]} />
                    <meshBasicMaterial color="#00ff00" wireframe />
                </mesh>

                {/* Wheels */}
                {/* Front Left */}
                <mesh castShadow position={[-0.9, 0.2, -1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Front Right */}
                <mesh castShadow position={[0.9, 0.2, -1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Rear Left */}
                <mesh castShadow position={[-0.9, 0.2, 1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                {/* Rear Right */}
                <mesh castShadow position={[0.9, 0.2, 1]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
                    <meshStandardMaterial color="#111" />
                </mesh>

                {/* Headlights */}
                <pointLight position={[-0.5, 0.5, -1.6]} color="#00ff00" distance={10} intensity={2} />
                <pointLight position={[0.5, 0.5, -1.6]} color="#00ff00" distance={10} intensity={2} />
            </group>
        </group>
    )
}
