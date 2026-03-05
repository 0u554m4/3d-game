import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import gsap from 'gsap'

export default function UI() {
    const score = useGameStore((state) => state.score)
    const gameState = useGameStore((state) => state.gameState)
    const setGameState = useGameStore((state) => state.setGameState)

    const overlayRef = useRef()

    useEffect(() => {
        if (gameState !== 'playing') {
            gsap.fromTo(overlayRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'power4.out' }
            )
        }
    }, [gameState])

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 text-[#00ff00] font-mono tracking-widest">
            <div className="text-3xl font-bold p-4 bg-black/80 border border-[#00ff00] self-start uppercase">
                SYSTEM.DATA_ACQUIRED: {score}
            </div>

            {gameState !== 'playing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto">
                    <div ref={overlayRef} className="bg-black border-2 border-[#00ff00] p-8 max-w-lg w-full text-center shadow-[0_0_40px_rgba(0,255,0,0.4)]">
                        <h1 className="text-5xl font-black mb-6 uppercase drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">
                            {gameState === 'gameover' ? 'CONNECTION.LOST' : 'MATRIX.RALLY'}
                        </h1>

                        <div className="mb-8 space-y-4 text-[#00dd00] text-sm text-left border border-[#00ff00]/50 p-4 bg-[#002200]/30">
                            <p>{'>'} INPUT_OVERRIDE: [WASD] / [ARROWS] TO NAVIGATE</p>
                            <p>{'>'} OBJECTIVE: EXTRACT <span className="text-[#ffffff] font-bold">DATA CUBES</span></p>
                            <p>{'>'} WARNING: AVOID <span className="text-red-500 font-bold">RED ANOMALIES</span></p>
                        </div>

                        <button
                            className="px-8 py-3 w-full bg-[#00ff00] hover:bg-[#ffffff] text-black font-bold uppercase transition-all shadow-[0_0_15px_rgba(0,255,0,0.5)] active:scale-95"
                            onClick={() => {
                                useGameStore.getState().resetScore()
                                setGameState('playing')
                            }}
                        >
                            {gameState === 'gameover' ? 'REBOOT.SYSTEM()' : 'EXECUTE.START()'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
