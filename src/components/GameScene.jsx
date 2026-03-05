import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import PlayerCar from './PlayerCar'
import RoadSystem from './RoadSystem'
import * as THREE from 'three'

export default function GameScene() {
    return (
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }} shadows>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 20, 10]} intensity={1.5} color="#00ffff" castShadow />

            {/* Environment */}
            <color attach="background" args={['#010105']} />
            <fog attach="fog" args={['#010105', 40, 150]} />

            {/* Game Entities */}
            <RoadSystem />
            <PlayerCar />

            {/* Post Processing for Cyberpunk Neon Feel */}
            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={0.2}
                    luminanceSmoothing={0.9}
                    height={300}
                    intensity={2.5}
                    mipmapBlur
                />
                {/* Adds a slight RGB split effect simulating speed & camera lenses */}
                <ChromaticAberration
                    offset={new THREE.Vector2(0.002, 0.002)}
                />
            </EffectComposer>
        </Canvas>
    )
}
