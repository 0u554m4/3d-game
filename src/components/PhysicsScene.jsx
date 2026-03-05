import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import PlayerCar from './PlayerCar'
import RoadSystem from './RoadSystem'
import AITrafficSystem from './AITrafficSystem'
import ObstacleSystem from './ObstacleSystem'
import GameEnv from './GameEnv'
import * as THREE from 'three'

export default function PhysicsScene() {
    return (
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }} shadows>
            <GameEnv />

            {/* 3D Physics World */}
            <Physics gravity={[0, -30, 0]}>
                <RoadSystem />
                <PlayerCar />
                <AITrafficSystem />
                <ObstacleSystem />
            </Physics>

            {/* Advanced Post Processing for Cyberpunk Neon Feel */}
            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={0.25}
                    luminanceSmoothing={0.9}
                    height={300}
                    intensity={1.8}
                    mipmapBlur
                />
                {/* Adds a slight RGB split effect simulating speed & camera lenses */}
                <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
            </EffectComposer>
        </Canvas>
    )
}
