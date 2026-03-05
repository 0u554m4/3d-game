import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
    // Core State
    gameState: 'start', // 'start', 'playing', 'gameover'
    score: 0,
    highestScore: parseInt(localStorage.getItem('neonLoopHighScore') || '0', 10),

    // Speed & Position
    speed: 0,
    maxSpeed: 250,
    playerPosition: [0, 0, 0],

    // Inputs
    touchInput: 0,
    gasInput: 0,

    // Advanced Mechanics
    nitroAmount: 100,
    nitroActive: false,
    timeOfDay: 0, // 0 to 1, cycles endlessly

    // Modifiers
    incrementScore: (delta) => set((state) => {
        const newScore = state.score + (state.speed * delta * 0.1)
        if (newScore > state.highestScore) {
            localStorage.setItem('neonLoopHighScore', Math.floor(newScore).toString())
        }
        return { score: newScore, highestScore: Math.max(state.highestScore, newScore) }
    }),

    addBonus: (amount) => set((state) => ({ score: state.score + amount })),

    updateMechanics: (delta) => set((state) => {
        let { speed, nitroAmount, nitroActive, timeOfDay } = state

        // 1. Time of Day Cycle
        timeOfDay = (timeOfDay + delta * 0.05) % 1

        // 2. Nitro Logic
        if (nitroActive && nitroAmount > 0) {
            nitroAmount = Math.max(0, nitroAmount - 20 * delta)
        } else {
            nitroAmount = Math.min(100, nitroAmount + 5 * delta) // Slow recharge
            if (nitroAmount === 0 || !nitroActive) nitroActive = false
        }

        // 3. Speed Logic
        const currentMax = nitroActive ? state.maxSpeed * 1.5 : state.maxSpeed

        if (state.gasInput > 0 || nitroActive) {
            // Accelerate (faster with nitro)
            speed += (nitroActive ? 80 : 40) * delta
        } else if (state.gasInput < 0) {
            // Brake hard
            speed -= 100 * delta
        } else {
            // Coasting friction
            speed -= 20 * delta
        }

        // Clamp speed
        if (speed > currentMax) speed = currentMax
        // Soft deceleration back to normal max if nitro ends
        if (!nitroActive && speed > state.maxSpeed) {
            speed -= 50 * delta
        }
        if (speed < 0) speed = 0

        return { speed, nitroAmount, nitroActive, timeOfDay }
    }),

    // Actions
    resetScore: () => set({
        score: 0,
        speed: 0,
        nitroAmount: 100,
        nitroActive: false,
        playerPosition: [0, 0, 0]
    }),
    setGameState: (state) => set({ gameState: state }),
    setPlayerPosition: (pos) => set({ playerPosition: pos }),
    setTouchInput: (val) => set({ touchInput: val }),
    setGasInput: (val) => set({ gasInput: val }),
    setNitroActive: (val) => set({ nitroActive: val })
}))
