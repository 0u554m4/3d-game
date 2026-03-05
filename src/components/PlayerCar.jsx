import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

const STEER_FORCE = 30
const ALIGNMENT_FORCE = 5

export default function PlayerCar() {
    const rigidBodyRef = useRef()
    const carVisualRef = useRef()
    const gameState = useGameStore((state) => state.gameState)
    const touchInput = useGameStore((state) => state.touchInput)

    const [keys, setKeys] = useState({ left: false, right: false, up: false, down: false, shift: false })

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(k => ({ ...k, left: true }))
            if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(k => ({ ...k, right: true }))
            if (e.code === 'KeyW' || e.code === 'ArrowUp') setKeys(k => ({ ...k, up: true }))
            if (e.code === 'KeyS' || e.code === 'ArrowDown') setKeys(k => ({ ...k, down: true }))
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setKeys(k => ({ ...k, shift: true }))
        }
        const handleKeyUp = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') setKeys(k => ({ ...k, left: false }))
            if (e.code === 'KeyD' || e.code === 'ArrowRight') setKeys(k => ({ ...k, right: false }))
            if (e.code === 'KeyW' || e.code === 'ArrowUp') setKeys(k => ({ ...k, up: false }))
            if (e.code === 'KeyS' || e.code === 'ArrowDown') setKeys(k => ({ ...k, down: false }))
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setKeys(k => ({ ...k, shift: false }))
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((state, delta) => {
        if (gameState !== 'playing' || !rigidBodyRef.current || !carVisualRef.current) return

        // Input to Store mapping
        if (keys.up) useGameStore.getState().setGasInput(1)
        else if (keys.down) useGameStore.getState().setGasInput(-1)
        else useGameStore.getState().setGasInput(0)

        useGameStore.getState().setNitroActive(keys.shift)

        // Run core mechanics update loop
        useGameStore.getState().updateMechanics(delta)
        useGameStore.getState().incrementScore(delta)

        const currentSpeed = useGameStore.getState().speed
        const isNitro = useGameStore.getState().nitroActive

        // Physics Movement (Steering only, since road moves +Z to simulate speed)
        let moveX = 0
        if (keys.left || touchInput === -1) moveX = -1
        else if (keys.right || touchInput === 1) moveX = 1

        // Apply impulse to RigidBody for drifty arcade feel
        const currentVel = rigidBodyRef.current.linvel()

        // Calculate steering impulse based on current horizontal speed
        const desiredVelX = moveX * STEER_FORCE
        const forceX = (desiredVelX - currentVel.x) * 4 * delta

        rigidBodyRef.current.applyImpulse({ x: forceX, y: 0, z: 0 }, true)

        const pos = rigidBodyRef.current.translation()

        // Visual rotation logic (drifting/banking based on physics velocity)
        const driftAngle = -currentVel.x * 0.05
        carVisualRef.current.rotation.y = THREE.MathUtils.lerp(carVisualRef.current.rotation.y, driftAngle, 0.1)
        carVisualRef.current.rotation.z = THREE.MathUtils.lerp(carVisualRef.current.rotation.z, driftAngle * 0.5, 0.1)

        // Dynamic FOV and Camera Lag
        const fovTarget = 60 + (currentSpeed / 250) * 40 + (isNitro ? 10 : 0)
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, fovTarget, 0.1)
        state.camera.updateProjectionMatrix()

        const cameraOffset = new THREE.Vector3(0, 4, 10)
        const targetPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(cameraOffset)
        state.camera.position.lerp(targetPos, 0.1)

        const lookAtPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(new THREE.Vector3(0, 0, -20))
        state.camera.lookAt(lookAtPos.x * 0.5, lookAtPos.y, lookAtPos.z)
    })

    // Start position reset
    if (gameState === 'start' && rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: 0, y: 0.5, z: 0 }, true)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }

    const isNitro = useGameStore((state) => state.nitroActive)

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={[0, 0.5, 0]}
            colliders={false}
            enabledTranslations={[true, false, false]} // Only allow movement on X axis natively
            enabledRotations={[false, false, false]}   // Lock native rotations, handle visual banking manually
            type="dynamic"
        >
            <CuboidCollider args={[1.2, 0.4, 2.5]} />

            <group ref={carVisualRef}>
                <group rotation={[0, Math.PI, 0]}>
                    {/* Main Chassis */}
                    <mesh position={[0, -0.1, 0]} castShadow>
                        <boxGeometry args={[2.2, 0.4, 4.8]} />
                        <meshStandardMaterial color={isNitro ? "#00ffff" : "#111118"} metalness={0.9} roughness={0.1} />
                    </mesh>

                    {/* Cabin / Roof */}
                    <mesh position={[0, 0.35, -0.4]} castShadow>
                        <boxGeometry args={[1.8, 0.5, 2.2]} />
                        <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
                    </mesh>

                    {/* Front Hood */}
                    <mesh position={[0, 0.15, 1.8]} castShadow>
                        <boxGeometry args={[2.0, 0.1, 1.2]} />
                        <meshStandardMaterial color={isNitro ? "#00ffff" : "#111118"} metalness={0.9} roughness={0.1} />
                    </mesh>

                    {/* Spoiler */}
                    <group position={[0, 0.3, -2.2]}>
                        <mesh position={[0, 0.4, 0]} castShadow>
                            <boxGeometry args={[2.4, 0.1, 0.6]} />
                            <meshStandardMaterial color="#222222" metalness={0.8} />
                        </mesh>
                        <mesh position={[-0.8, 0.2, 0]} castShadow>
                            <boxGeometry args={[0.1, 0.4, 0.5]} />
                            <meshStandardMaterial color="#222222" metalness={0.8} />
                        </mesh>
                        <mesh position={[0.8, 0.2, 0]} castShadow>
                            <boxGeometry args={[0.1, 0.4, 0.5]} />
                            <meshStandardMaterial color="#222222" metalness={0.8} />
                        </mesh>
                    </group>

                    {/* Wheels */}
                    {[[-1.15, -0.2, 1.5], [1.15, -0.2, 1.5], [-1.15, -0.2, -1.8], [1.15, -0.2, -1.8]].map((pos, i) => (
                        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]} castShadow>
                            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                            <meshStandardMaterial color="#050505" roughness={0.8} />
                        </mesh>
                    ))}

                    {/* Headlights */}
                    <mesh position={[-0.8, 0.0, 2.41]}>
                        <planeGeometry args={[0.6, 0.15]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <pointLight position={[-0.8, 0, 3]} color="#ffffff" intensity={2} distance={20} />

                    <mesh position={[0.8, 0.0, 2.41]}>
                        <planeGeometry args={[0.6, 0.15]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <pointLight position={[0.8, 0, 3]} color="#ffffff" intensity={2} distance={20} />

                    {/* Taillights / Nitro Boosters */}
                    <mesh position={[-0.8, 0.0, -2.41]}>
                        <planeGeometry args={[0.6, 0.15]} />
                        <meshBasicMaterial color={isNitro ? "#ffffff" : "#ff0000"} />
                    </mesh>
                    <pointLight position={[-0.8, 0, -3]} color={isNitro ? "#00ffff" : "#ff0000"} intensity={isNitro ? 8 : 2} distance={10} />

                    <mesh position={[0.8, 0.0, -2.41]}>
                        <planeGeometry args={[0.6, 0.15]} />
                        <meshBasicMaterial color={isNitro ? "#ffffff" : "#ff0000"} />
                    </mesh>
                    <pointLight position={[0.8, 0, -3]} color={isNitro ? "#00ffff" : "#ff0000"} intensity={isNitro ? 8 : 2} distance={10} />
                </group>
            </group>
        </RigidBody>
    )
}
