import { useState, useRef, useEffect } from 'react'
import MachineStats from './MachineStats'
import MachinePort from './MachinePort'
import { getPortCenter } from './portUtils'

const MACHINE_CONFIGS = {
  INPUT: {
    name: 'Data Source',
    shape: 'circle',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-400',
    size: { w: 80, h: 80 },
    ports: { outputs: 1 }
  },
  PROCESSOR: {
    name: 'Processor',
    shape: 'square',
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-400',
    size: { w: 100, h: 80 },
    ports: { inputs: 1, outputs: 1 }
  },
  MERGER: {
    name: 'Merger',
    shape: 'diamond',
    color: 'from-pink-500 to-pink-600',
    borderColor: 'border-pink-400',
    size: { w: 90, h: 90 },
    ports: { inputs: 3, outputs: 1 }
  },
  SPLITTER: {
    name: 'Splitter',
    shape: 'diamond',
    color: 'from-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-400',
    size: { w: 90, h: 90 },
    ports: { inputs: 1, outputs: 3 }
  },
  OUTPUT: {
    name: 'Data Sink',
    shape: 'square',
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-400',
    size: { w: 80, h: 80 },
    ports: { inputs: 1 }
  },
  HEADER: {
    name: 'Header Source',
    shape: 'circle',
    color: 'from-orange-400 to-orange-600',
    borderColor: 'border-orange-400',
    size: { w: 80, h: 80 },
    ports: { outputs: 1 }
  },
  ASSEMBLER: {
    name: 'Assembler',
    shape: 'square',
    color: 'from-lime-500 to-lime-700',
    borderColor: 'border-lime-400',
    size: { w: 110, h: 90 },
    ports: { inputs: 2, outputs: 1 }
  },
  GOAL: {
    name: 'Goal',
    shape: 'square',
    color: 'from-fuchsia-600 to-fuchsia-900',
    borderColor: 'border-fuchsia-400',
    size: { w: 120, h: 100 },
    ports: { inputs: 3 }
  }
}

export default function DraggableMachine({
  machine,
  setGameState,
  onPortClick,
  isSelected,
  connectingFrom,
  boardRef,
  onRemoveMachine, // Callback für Löschen
  isPortOccupied,
  panOffset // NEU: panOffset als Prop
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const machineRef = useRef(null)

  const config = MACHINE_CONFIGS[machine.type]
  const isGoal = machine.type === 'GOAL'

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('port')) return
    setIsDragging(true)
    const rect = machineRef.current.getBoundingClientRect()
    // Drag-Offset OHNE panOffset, da Maschinenposition im Weltkoordinatensystem ist
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setGameState(prev => ({
      ...prev,
      selectedMachine: machine.id
    }))
  }

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e) => {
      if (!isDragging) return
      // Board-Position und panOffset berücksichtigen
      const boardRect = boardRef?.current?.getBoundingClientRect?.() || { left: 0, top: 0 }
      // Die neue Maschinenposition ist: Mausposition relativ zum Board, abzüglich panOffset und DragOffset
      const newX = e.clientX - boardRect.left - dragOffset.x - panOffset.x
      const newY = e.clientY - boardRect.top - dragOffset.y - panOffset.y
      setGameState(prev => ({
        ...prev,
        machines: prev.machines.map(m =>
          m.id === machine.id
            ? { ...m, x: newX, y: newY }
            : m
        )
      }))
    }
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, setGameState, machine.id, boardRef, panOffset])

  const getShapeClasses = () => {
    const base = `
      absolute bg-gradient-to-br ${config.color}
      border-2 ${config.borderColor}
      shadow-[0_0_24px_4px_rgba(0,255,255,0.4)]
      hover:shadow-[0_0_32px_8px_rgba(0,255,255,0.7)]
      transition-all duration-200
      cursor-move select-none
      ${isSelected ? 'ring-2 ring-cyan-400 ring-opacity-80' : ''}
      ${isDragging ? 'scale-105 shadow-[0_0_40px_12px_rgba(0,255,255,0.8)]' : ''}
      backdrop-blur-[2px]
    `

    switch (config.shape) {
      case 'circle':
        return `${base} rounded-full`
      case 'diamond':
        return `${base} rounded-lg`
      case 'square':
      default:
        return `${base} rounded-lg`
    }
  }

  return (
    <div
      ref={machineRef}
      className={getShapeClasses()}
      style={{
        left: machine.x, // keine panOffset-Subtraktion mehr
        top: machine.y,
        width: config.size.w,
        height: config.size.h,
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={isGoal ? undefined : handleMouseDown}
    >
      {/* Löschen-Button */}
      {isSelected && !isGoal && (
        <button
          className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-red-700 z-20"
          style={{ fontSize: '1.2rem' }}
          onClick={e => { e.stopPropagation(); onRemoveMachine?.(machine.id) }}
          title="Maschine entfernen"
        >
          ×
        </button>
      )}

      {/* Machine Content */}
      <div className={`
        absolute inset-0 flex items-center justify-center
        ${config.shape === 'diamond' ? 'transform -rotate-45' : ''}
      `}>
        <div className="text-white text-xs font-bold text-center">
          {config.name}
        </div>
      </div>

      {/* Input Ports */}
      {config.ports.inputs && (
        <>
          {Array.from({ length: config.ports.inputs }, (_, i) => {
            const pos = getPortCenter(machine, 'input', i)
            return (
              <MachinePort
                key={`input-${i}`}
                type="input"
                index={i}
                machineId={machine.id}
                onPortClick={onPortClick}
                isConnecting={connectingFrom?.machineId === machine.id && connectingFrom?.portType === 'input'}
                occupied={typeof isPortOccupied === 'function' ? isPortOccupied(machine.id, 'input', i) : false}
                style={{
                  position: 'absolute',
                  left: pos.x - machine.x - 8,
                  top: pos.y - machine.y - 8
                }}
              />
            )
          })}
        </>
      )}

      {/* Output Ports */}
      {config.ports.outputs && (
        <>
          {Array.from({ length: config.ports.outputs }, (_, i) => {
            const pos = getPortCenter(machine, 'output', i)
            return (
              <MachinePort
                key={`output-${i}`}
                type="output"
                index={i}
                machineId={machine.id}
                onPortClick={onPortClick}
                isConnecting={connectingFrom?.machineId === machine.id && connectingFrom?.portType === 'output'}
                occupied={typeof isPortOccupied === 'function' ? isPortOccupied(machine.id, 'output', i) : false}
                style={{
                  position: 'absolute',
                  left: pos.x - machine.x - 8,
                  top: pos.y - machine.y - 8
                }}
              />
            )
          })}
        </>
      )}

      {/* Stats Display */}
      <MachineStats machine={machine} config={config} />
    </div>
  )
}