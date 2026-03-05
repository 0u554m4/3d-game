import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export default function AudioSystem() {
    const audioCtxRef = useRef(null)
    const engineOscRef = useRef(null)

    const gameState = useGameStore(state => state.gameState)
    const speed = useGameStore(state => state.speed)
    const isNitro = useGameStore(state => state.nitroActive)

    useEffect(() => {
        // Initialize Web Audio API on first play to bypass browser autoplay rules
        if (gameState === 'playing' && !audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()

            // Engine drone setup
            const osc = audioCtxRef.current.createOscillator()
            const gainNode = audioCtxRef.current.createGain()

            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(50, audioCtxRef.current.currentTime) // Base idle

            gainNode.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime)

            osc.connect(gainNode)
            gainNode.connect(audioCtxRef.current.destination)

            osc.start()
            engineOscRef.current = { osc, gainNode }
        }

        // Stop audio on game over
        if (gameState === 'gameover' && audioCtxRef.current) {
            // Crash sound
            const osc = audioCtxRef.current.createOscillator()
            const gainNode = audioCtxRef.current.createGain()
            osc.type = 'square'
            osc.frequency.setValueAtTime(100, audioCtxRef.current.currentTime)
            osc.frequency.exponentialRampToValueAtTime(10, audioCtxRef.current.currentTime + 0.5)
            gainNode.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.5)

            osc.connect(gainNode)
            gainNode.connect(audioCtxRef.current.destination)
            osc.start()
            osc.stop(audioCtxRef.current.currentTime + 0.5)

            // Kill engine
            if (engineOscRef.current) {
                engineOscRef.current.gainNode.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1)
            }
        }
    }, [gameState])

    // Modulate engine sound based on speed & nitro
    useEffect(() => {
        if (engineOscRef.current && audioCtxRef.current && gameState === 'playing') {
            const { osc, gainNode } = engineOscRef.current

            const targetFreq = 50 + (speed * 0.5) + (isNitro ? 100 : 0)
            let targetVol = 0.05 + (speed * 0.0005) + (isNitro ? 0.05 : 0)

            // Mute engine if stopped completely to avoid annoying drone
            if (speed <= 1 && !isNitro) {
                targetVol = 0
            }

            osc.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1)
            gainNode.gain.setTargetAtTime(targetVol, audioCtxRef.current.currentTime, 0.1)
        }
    }, [speed, isNitro, gameState])

    return null // Purely logical component
}
