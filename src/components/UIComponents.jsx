import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import gsap from 'gsap'

export default function UIComponents() {
    const score = useGameStore((state) => state.score)
    const highestScore = useGameStore((state) => state.highestScore)
    const speed = useGameStore((state) => state.speed)
    const nitroAmount = useGameStore((state) => state.nitroAmount)
    const nitroActive = useGameStore((state) => state.nitroActive)
    const gameState = useGameStore((state) => state.gameState)

    const setGameState = useGameStore((state) => state.setGameState)
    const setTouchInput = useGameStore((state) => state.setTouchInput)

    const overlayRef = useRef()

    useEffect(() => {
        if (gameState !== 'playing') {
            gsap.fromTo(overlayRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
            )
        }
    }, [gameState])

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* HUD (Top) */}
            <div className="flex justify-between items-start p-6 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                <div className="flex flex-col">
                    <div className="text-4xl font-black italic uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                        SCORE: {Math.floor(score)}
                    </div>
                    <div className="text-lg font-bold text-yellow-400">
                        HIGH: {Math.floor(highestScore)}
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className={`text-4xl font-black italic ${nitroActive ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,1)] animate-pulse' : 'text-fuchsia-400'}`}>
                        {Math.floor(speed)} MPH
                    </div>

                    {/* Nitro Bar */}
                    <div className="mt-2 w-48 h-4 bg-gray-900 border-2 border-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-100 ${nitroActive ? 'bg-cyan-400' : 'bg-fuchsia-500'}`}
                            style={{ width: `${nitroAmount}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-bold">NITRO [SHIFT]</div>
                </div>
            </div>

            {/* Touch Controls (Mobile) */}
            {gameState === 'playing' && (
                <div className="absolute bottom-0 left-0 w-full h-1/2 flex pointer-events-auto">
                    <div
                        className="w-1/2 h-full active:bg-cyan-500/10 transition-colors opacity-50"
                        onTouchStart={() => setTouchInput(-1)}
                        onTouchEnd={() => setTouchInput(0)}
                        onMouseDown={() => setTouchInput(-1)}
                        onMouseUp={() => setTouchInput(0)}
                        onMouseLeave={() => setTouchInput(0)}
                    />
                    <div
                        className="w-1/2 h-full active:bg-fuchsia-500/10 transition-colors opacity-50"
                        onTouchStart={() => setTouchInput(1)}
                        onTouchEnd={() => setTouchInput(0)}
                        onMouseDown={() => setTouchInput(1)}
                        onMouseUp={() => setTouchInput(0)}
                        onMouseLeave={() => setTouchInput(0)}
                    />
                </div>
            )}

            {/* Start / Game Over Overlay */}
            {gameState !== 'playing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-md">
                    <div ref={overlayRef} className="bg-neutral-900 border-y-4 border-fuchsia-500 p-12 max-w-2xl w-full text-center shadow-[0_0_80px_rgba(255,0,255,0.2)]">

                        <h1 className="text-6xl font-black mb-4 italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500 tracking-tighter">
                            NEON LOOP RACER X
                        </h1>

                        {gameState === 'gameover' && (
                            <div className="mb-8">
                                <p className="text-3xl text-red-500 font-black uppercase mb-2 animate-bounce">CRASHED!</p>
                                <p className="text-2xl text-white font-bold">FINAL SCORE: {Math.floor(score)}</p>
                                {Math.floor(score) >= highestScore && score > 0 && (
                                    <p className="text-yellow-400 font-bold mt-2 animate-pulse">NEW HIGH SCORE!</p>
                                )}
                            </div>
                        )}

                        <div className="mb-10 flex flex-wrap justify-center gap-6 text-neutral-300 text-sm font-medium">
                            <div className="bg-black/50 p-4 rounded border border-neutral-700">
                                <span className="text-cyan-400 block mb-1">STEER</span>
                                [A/D] or [Left/Right]
                            </div>
                            <div className="bg-black/50 p-4 rounded border border-neutral-700">
                                <span className="text-green-400 block mb-1">ACCEL / BRAKE</span>
                                [W/S] or [Up/Down]
                            </div>
                            <div className="bg-black/50 p-4 rounded border border-neutral-700">
                                <span className="text-fuchsia-400 block mb-1">NITRO BOOST</span>
                                [SHIFT]
                            </div>
                        </div>

                        <button
                            className="px-12 py-5 w-full bg-white hover:bg-gray-200 text-black font-black italic text-2xl tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95 border-b-8 border-gray-400 rounded"
                            onClick={() => {
                                useGameStore.getState().resetScore()
                                setGameState('playing')
                            }}
                        >
                            {gameState === 'gameover' ? 'TRY AGAIN' : 'START RACING'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
