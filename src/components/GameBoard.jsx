import { useState, useRef, useCallback } from 'react'
import DraggableMachine from './DraggableMachine'
import ConnectionLine from './ConnectionLine'
import ConnectionHelper from './ConnectionHelper'

export default function GameBoard({ gameState, setGameState }) {
  const boardRef = useRef(null)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const mouseStart = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true)
      panStart.current = { ...panOffset }
      mouseStart.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = e.clientX - mouseStart.current.x
      const dy = e.clientY - mouseStart.current.y
      setPanOffset({ x: panStart.current.x + dx, y: panStart.current.y + dy })
    } else if (connectingFrom) {
      const rect = boardRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left - panOffset.x,
        y: e.clientY - rect.top - panOffset.y
      })
    }
  }, [connectingFrom, isPanning, panOffset])

  const handleMouseUp = () => setIsPanning(false)

  const isPortOccupied = useCallback((machineId, portType, portIndex) => {
    return gameState.connections.some(conn => {
      if (portType === 'input') {
        return conn.to.machineId === machineId && conn.to.portType === 'input' && conn.to.portIndex === portIndex
      } else {
        return conn.from.machineId === machineId && conn.from.portType === 'output' && conn.from.portIndex === portIndex
      }
    })
  }, [gameState.connections])

  const handlePortClick = useCallback((machineId, portType, portIndex) => {
    if (!connectingFrom) {
      if (portType === 'output' && isPortOccupied(machineId, portType, portIndex)) return
      setConnectingFrom({ machineId, portType, portIndex })
    } else {
      if (connectingFrom.machineId !== machineId) {
        if (portType === 'input' && isPortOccupied(machineId, portType, portIndex)) return
        const newConnection = {
          id: Date.now(),
            from: connectingFrom,
            to: { machineId, portType, portIndex },
            dataFlow: []
        }
        setGameState(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }))
      }
      setConnectingFrom(null)
    }
  }, [connectingFrom, setGameState, isPortOccupied])

  const handleBoardClick = useCallback((e) => {
    if (e.target === boardRef.current) {
      setConnectingFrom(null)
      setGameState(prev => ({ ...prev, selectedMachine: null }))
    }
  }, [setGameState])

  const handleRemoveConnection = useCallback((connectionId) => {
    setGameState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }))
  }, [setGameState])

  const handleRemoveMachine = useCallback((machineId) => {
    setGameState(prev => ({
      ...prev,
      machines: prev.machines.filter(m => m.id !== machineId),
      connections: prev.connections.filter(conn => conn.from.machineId !== machineId && conn.to.machineId !== machineId),
      selectedMachine: prev.selectedMachine === machineId ? null : prev.selectedMachine
    }))
  }, [setGameState])

  return (
    <div
      ref={boardRef}
      className={`absolute inset-0 cursor-${isPanning ? 'grabbing' : 'crosshair'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={e => e.preventDefault()}
      onClick={handleBoardClick}
      style={{ overflow: 'hidden', userSelect: isPanning ? 'none' : undefined }}
    >
      {/* World Layer: komplette Szene wird verschoben */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)`, willChange: 'transform' }}
      >
        {/* Verbindungslayer */}
        <svg
          className="absolute left-0 top-0"
          width="100%"
          height="100%"
          style={{ overflow: 'visible', zIndex: 0 }}
        >
          {gameState.connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              machines={gameState.machines}
              onRemove={handleRemoveConnection}
            />
          ))}
          {connectingFrom && (
            <ConnectionHelper
              from={connectingFrom}
              to={{ x: mousePos.x, y: mousePos.y }}
              machines={gameState.machines}
            />
          )}
        </svg>

        {/* Maschinen */}
        {gameState.machines.map(machine => (
          <DraggableMachine
            key={machine.id}
            machine={machine}
            setGameState={setGameState}
            onPortClick={handlePortClick}
            isSelected={gameState.selectedMachine === machine.id}
            connectingFrom={connectingFrom}
            boardRef={boardRef}
            onRemoveMachine={handleRemoveMachine}
            isPortOccupied={isPortOccupied}
            panOffset={panOffset}
          />
        ))}
      </div>
    </div>
  )
}