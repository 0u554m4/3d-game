import PhysicsScene from './components/PhysicsScene'
import UIComponents from './components/UIComponents'
import AudioSystem from './components/AudioSystem'

function App() {
    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
            <PhysicsScene />
            <AudioSystem />
            <UIComponents />
        </div>
    )
}

export default App
