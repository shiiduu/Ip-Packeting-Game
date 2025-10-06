const MACHINE_TYPES = [
  { type: 'INPUT', icon: '📥', name: 'Data Source' },
  { type: 'PROCESSOR', icon: '⚙️', name: 'Processor' },
  { type: 'MERGER', icon: '🔗', name: 'Merger' },
  { type: 'SPLITTER', icon: '🔀', name: 'Splitter' },
  { type: 'OUTPUT', icon: '📤', name: 'Data Sink' },
  { type: 'HEADER', icon: '📰', name: 'Header Source' },
  { type: 'ASSEMBLER', icon: '🛠️', name: 'Assembler' }
]

export default function MachineToolbar({ gameState, setGameState }) {
  const addMachine = (type) => {
    const newMachine = {
      id: Date.now(),
      type,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 100,
      config: getDefaultConfig(type),
      stats: getDefaultStats(type)
    }

    setGameState(prev => ({
      ...prev,
      machines: [...prev.machines, newMachine]
    }))
  }

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'INPUT': return { rate: 1, dataType: 'raw' }
      case 'PROCESSOR': return { processingTime: 1000, efficiency: 1.0 }
      case 'MERGER': return { }
      case 'SPLITTER': return { }
      case 'OUTPUT': return { capacity: 100 }
      case 'HEADER': return { }
      case 'ASSEMBLER': return { }
      default: return {}
    }
  }

  const getDefaultStats = (type) => {
    switch (type) {
      case 'INPUT': return { generated: 0, buffer: 0 }
      case 'PROCESSOR': return { payload: 0, buffer: 0, processing: false }
      case 'MERGER': return { merged: 0, payload: 0, buffer: 0 }
      case 'SPLITTER': return { split: 0, buffer: 0 }
      case 'OUTPUT': return { received: 0, total: 0 }
      case 'HEADER': return { generated: 0, buffer: 0 }
      case 'ASSEMBLER': return { payloadBuffer: 0, headerBuffer: 0, packetBuffer: 0 }
      default: return {}
    }
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex gap-2 bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border-2 border-cyan-400 shadow-[0_0_32px_8px_rgba(0,255,255,0.3)]">
        {MACHINE_TYPES.map(({ type, icon, name }) => (
          <button
            key={type}
            onClick={() => addMachine(type)}
            className="
              flex flex-col items-center gap-1 px-3 py-2 rounded-lg
              bg-gray-800/80 hover:bg-cyan-900 border-2 border-cyan-400
              hover:border-pink-400 transition-all duration-200
              hover:scale-110 transform
              shadow-[0_0_16px_4px_rgba(0,255,255,0.4)]
              hover:shadow-[0_0_32px_8px_rgba(255,0,255,0.5)]
              text-cyan-200 hover:text-pink-200
            "
            style={{
              textShadow: '0 0 8px #0ff, 0 0 16px #0ff4',
              boxShadow: '0 0 16px 4px #0ff4',
            }}
          >
            <span className="text-2xl drop-shadow-[0_0_8px_#0ff]">{icon}</span>
            <span className="text-xs font-bold tracking-wide">{name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}