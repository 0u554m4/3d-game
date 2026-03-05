import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import gsap from 'gsap'

export default function ScoreUI() {
    const score = useGameStore((state) => state.score)
    const speed = useGameStore((state) => state.speed)
    const gameState = useGameStore((state) => state.gameState)
    const setGameState = useGameStore((state) => state.setGameState)
    const setTouchInput = useGameStore((state) => state.setTouchInput)

    const overlayRef = useRef()

    useEffect(() => {
        if (gameState !== 'playing') {
            gsap.fromTo(overlayRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            )
        }
    }, [gameState])

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* HUD */}
            <div className="flex justify-between items-start p-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">
                <div className="text-4xl font-black italic uppercase">
                    SCORE: {Math.floor(score)}
                </div>
                <div className="text-2xl font-bold italic text-fuchsia-400 drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]">
                    {Math.floor(speed)} MPH
                </div>
            </div>

            {/* Touch Controls (Mobile) */}
            {gameState === 'playing' && (
                <div className="absolute bottom-0 left-0 w-full h-1/2 flex pointer-events-auto">
                    <div
                        className="w-1/2 h-full active:bg-cyan-500/10 transition-colors opacity-50 flex items-end p-8"
                        onTouchStart={() => setTouchInput(-1)}
                        onTouchEnd={() => setTouchInput(0)}
                        onMouseDown={() => setTouchInput(-1)}
                        onMouseUp={() => setTouchInput(0)}
                        onMouseLeave={() => setTouchInput(0)}
                    >
                        {/* Visual hint could go here */}
                    </div>
                    <div
                        className="w-1/2 h-full active:bg-fuchsia-500/10 transition-colors opacity-50 flex items-end justify-end p-8"
                        onTouchStart={() => setTouchInput(1)}
                        onTouchEnd={() => setTouchInput(0)}
                        onMouseDown={() => setTouchInput(1)}
                        onMouseUp={() => setTouchInput(0)}
                        onMouseLeave={() => setTouchInput(0)}
                    >
                    </div>
                </div>
            )}

            {/* Start / Game Over Overlay */}
            {gameState !== 'playing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm">
                    <div ref={overlayRef} className="bg-neutral-900 border border-cyan-500/50 p-10 max-w-lg w-full text-center rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.15)] relative overflow-hidden">

                        {/* Decorative BG element */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-fuchsia-500/20 blur-3xl rounded-full"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full"></div>

                        <h1 className="text-5xl font-black mb-2 italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 animate-pulse">
                            NEON LOOP RACER
                        </h1>

                        {gameState === 'gameover' && (
                            <p className="text-2xl text-white mb-6 font-bold">FINAL SCORE: {Math.floor(score)}</p>
                        )}

                        <div className="mb-8 space-y-2 text-neutral-300 text-sm">
                            <p>Controls: Steer [A/D] or [Left/Right Arrows]</p>
                            <p>Gas: [W] or [Up Arrow] | Brake: [S] or [Down Arrow]</p>
                            <p>Mobile: Tap sides to steer.</p>
                            <p>Survive the neon highway.</p>
                        </div>

                        <button
                            className="px-10 py-4 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black italic tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-95 border-b-4 border-cyan-800"
                            onClick={() => {
                                useGameStore.getState().resetScore()
                                setGameState('playing')
                            }}
                        >
                            {gameState === 'gameover' ? 'DRIVE AGAIN' : 'START ENGINE'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
