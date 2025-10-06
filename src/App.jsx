import { useState, useEffect } from 'react'
import GameBoard from './components/GameBoard'
import MachineToolbar from './components/MachineToolbar'
import HUD from './components/HUD'
import './App.css'

function App() {
  const [gameState, setGameState] = useState({
    machines: [
      {
        id: 1,
        type: 'INPUT',
        x: 100,
        y: 200,
        config: { rate: 2, dataType: 'raw' },
        stats: { generated: 0, buffer: 0 }
      },
      {
        id: 2,
        type: 'PROCESSOR',
        x: 300,
        y: 200,
        config: { processingTime: 1000, efficiency: 0.8 },
        stats: { payload: 0, buffer: 0, processing: false }
      },
      {
        id: 10000,
        type: 'GOAL',
        x: 700,
        y: 200,
        config: {},
        stats: { received: 0, buffer: 0 }
      }
    ],
    connections: [],
    selectedMachine: null,
    draggedMachine: null,
    connectionMode: false,
    resources: {
      rawData: 0,
      payload: 0,
      header: 0,
      packet: 0,
      totalGenerated: 0
    }
  })

  // Spielschleife: Datenfluss und Verarbeitung
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        // Deep Copy für Maschinen und Ressourcen
        let machines = prev.machines.map(m => ({ ...m, stats: { ...m.stats } }))
        let resources = { ...prev.resources }

        // --- PHASE 0: Initialisiere nextBuffer für alle Maschinen ---
        machines.forEach(machine => {
          if (machine.type === 'ASSEMBLER') {
            machine.nextPayloadBuffer = 0
            machine.nextHeaderBuffer = 0
            machine.nextPacketBuffer = 0
          }
          if (machine.type === 'MERGER') {
            machine.nextPayload = 0
          }
          if (machine.type === 'SPLITTER') {
            machine.nextBuffer = 0
          }
          if (machine.type === 'PROCESSOR') {
            machine.nextBuffer = 0
          }
          if (machine.type === 'OUTPUT') {
            machine.nextBuffer = 0
          }
          if (machine.type === 'GOAL') {
            machine.nextBuffer = 0
          }
          if (machine.type === 'HEADER') {
            machine.nextBuffer = 0
          }
          if (machine.type === 'INPUT') {
            machine.nextBuffer = 0
          }
        })

        // --- PHASE 1: Maschinen generieren Daten (INPUT, HEADER) ---
        machines.forEach(machine => {
          if (machine.type === 'INPUT') {
            const rate = Math.floor(machine.config.rate || 1)
            machine.stats.generated = Math.floor((machine.stats.generated || 0) + rate)
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + rate)
            resources.rawData = Math.floor(resources.rawData + rate)
            resources.totalGenerated = Math.floor(resources.totalGenerated + rate)
          }
          if (machine.type === 'HEADER') {
            const rate = 1
            machine.stats.generated = Math.floor((machine.stats.generated || 0) + rate)
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + rate)
            resources.header = Math.floor(resources.header + rate)
          }
        })

        // --- PHASE 2: Transport-Phase: Alle Transfers in nextBuffer (keine direkte Buffer-Manipulation) ---
        // --- PHASE 2a: INPUT zu SPLITTER/PROCESSOR (wie gehabt) ---
        prev.connections.forEach(conn => {
          const fromMachine = machines.find(m => m.id === conn.from.machineId)
          const toMachine = machines.find(m => m.id === conn.to.machineId)
          if (!fromMachine || !toMachine) return
          if (fromMachine.type === 'INPUT') {
            if (toMachine.type === 'SPLITTER' || toMachine.type === 'PROCESSOR') {
              const available = Math.floor(fromMachine.stats.buffer || 0)
              if (available > 0) {
                const transfer = Math.min(available, 2)
                fromMachine.stats.buffer -= transfer
                toMachine.nextBuffer += transfer
              }
            }
          }
        })

        // --- PHASE 2b: SPLITTER verteilt Buffer simultan und fair auf alle Outputs ---
        machines.forEach(splitter => {
          if (splitter.type === 'SPLITTER') {
            const outConns = prev.connections.filter(c => c.from.machineId === splitter.id && c.from.portType === 'output')
            let available = Math.floor(splitter.stats.buffer || 0)
            // Jeder Ausgang bekommt pro Tick maximal 1, solange Buffer > 0
            outConns.forEach(conn => {
              if (available > 0) {
                const toMachine = machines.find(m => m.id === conn.to.machineId)
                if (toMachine) {
                  toMachine.nextBuffer += 1
                  splitter.stats.buffer -= 1
                  splitter.stats.split = Math.floor((splitter.stats.split || 0) + 1)
                  available--
                }
              }
            })
          }
        })

        // --- PHASE 2c: Restliche Transfers (wie gehabt, ohne SPLITTER zu Output) ---
        prev.connections.forEach(conn => {
          const fromMachine = machines.find(m => m.id === conn.from.machineId)
          const toMachine = machines.find(m => m.id === conn.to.machineId)
          if (!fromMachine || !toMachine) return

          // MERGER zu andere Maschinen (wie Input)
          if (fromMachine.type === 'MERGER' && toMachine.type !== 'MERGER') {
            const available = Math.floor(fromMachine.stats.payload || 0)
            if (available > 0) {
              const transfer = Math.min(available, 2)
              fromMachine.stats.payload -= transfer
              toMachine.nextBuffer += transfer
            }
          }

          // PROCESSOR zu OUTPUT
          if (fromMachine.type === 'PROCESSOR' && toMachine.type === 'OUTPUT') {
            const available = Math.floor(fromMachine.stats.payload || 0)
            if (available > 0) {
              const transfer = Math.min(available, 2)
              fromMachine.stats.payload -= transfer
              toMachine.nextBuffer += transfer
              toMachine.stats.received = Math.floor((toMachine.stats.received || 0) + transfer)
              toMachine.stats.total = Math.floor((toMachine.stats.total || 0) + transfer)
            }
          }

          // HEADER zu ASSEMBLER
          if (fromMachine.type === 'HEADER' && toMachine.type === 'ASSEMBLER') {
            const available = Math.floor(fromMachine.stats.buffer || 0)
            if (available > 0) {
              const transfer = Math.min(available, 2)
              fromMachine.stats.buffer -= transfer
              toMachine.nextHeaderBuffer += transfer
            }
          }

          // Jede Maschine mit payload zu ASSEMBLER
          if (toMachine.type === 'ASSEMBLER' && typeof fromMachine.stats.payload === 'number') {
            const available = Math.floor(fromMachine.stats.payload || 0)
            if (available > 0) {
              const transfer = Math.min(available, 2)
              fromMachine.stats.payload -= transfer
              toMachine.nextPayloadBuffer += transfer
            }
          }

          // Jede Maschine mit payload zu MERGER
          if (toMachine.type === 'MERGER' && typeof fromMachine.stats.payload === 'number') {
            const available = Math.floor(fromMachine.stats.payload || 0)
            if (available > 0) {
              const transfer = Math.min(available, 1)
              fromMachine.stats.payload -= transfer
              toMachine.nextPayload += transfer
              toMachine.stats.merged = Math.floor((toMachine.stats.merged || 0) + transfer)
            }
          }

          // ASSEMBLER zu GOAL
          if (fromMachine.type === 'ASSEMBLER' && toMachine.type === 'GOAL') {
            const available = Math.floor(fromMachine.stats.packetBuffer || 0)
            if (available > 0) {
              const transfer = Math.min(available, 2)
              fromMachine.stats.packetBuffer -= transfer
              toMachine.nextBuffer += transfer
              toMachine.stats.received = Math.floor((toMachine.stats.received || 0) + transfer)
            }
          }
        })

        // --- PHASE 3: Commit-Phase: Übernehme nextBuffer in echte Buffer ---
        machines.forEach(machine => {
          if (machine.type === 'ASSEMBLER') {
            machine.stats.payloadBuffer = Math.floor((machine.stats.payloadBuffer || 0) + (machine.nextPayloadBuffer || 0))
            machine.stats.headerBuffer = Math.floor((machine.stats.headerBuffer || 0) + (machine.nextHeaderBuffer || 0))
            machine.stats.packetBuffer = Math.floor((machine.stats.packetBuffer || 0) + (machine.nextPacketBuffer || 0))
            delete machine.nextPayloadBuffer
            delete machine.nextHeaderBuffer
            delete machine.nextPacketBuffer
          }
          if (machine.type === 'MERGER') {
            machine.stats.payload = Math.floor((machine.stats.payload || 0) + (machine.nextPayload || 0))
            delete machine.nextPayload
          }
          if (machine.type === 'SPLITTER') {
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + (machine.nextBuffer || 0))
            delete machine.nextBuffer
          }
          if (machine.type === 'PROCESSOR') {
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + (machine.nextBuffer || 0))
            delete machine.nextBuffer
          }
          if (machine.type === 'OUTPUT') {
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + (machine.nextBuffer || 0))
            delete machine.nextBuffer
          }
          if (machine.type === 'GOAL') {
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + (machine.nextBuffer || 0))
            delete machine.nextBuffer
          }
          if (machine.type === 'HEADER') {
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + (machine.nextBuffer || 0))
            delete machine.nextBuffer
          }
          if (machine.type === 'INPUT') {
            machine.stats.buffer = Math.floor((machine.stats.buffer || 0) + (machine.nextBuffer || 0))
            delete machine.nextBuffer
          }
        })

        // --- PHASE 4: Verarbeitungs-Phase: Maschinen verarbeiten Buffer (z.B. Prozessoren) ---
        machines.forEach(machine => {
          if (machine.type === 'PROCESSOR') {
            const buffer = Math.floor(machine.stats.buffer || 0)
            const eff = machine.config.efficiency || 1
            const processAmount = Math.min(buffer, 1)
            if (processAmount > 0) {
              machine.stats.processing = true
              machine.stats.buffer -= processAmount
              const produced = Math.floor(processAmount * eff)
              machine.stats.payload = Math.floor((machine.stats.payload || 0) + produced)
              resources.payload = Math.floor(resources.payload + produced)
            } else {
              machine.stats.processing = false
            }
          }
        })

        // --- PHASE 5: ASSEMBLER erzeugt Packet, wenn 2 Header und 1 Payload vorhanden ---
        machines.forEach(machine => {
          if (machine.type === 'ASSEMBLER') {
            const payload = Math.floor(machine.stats.payloadBuffer || 0)
            const header = Math.floor(machine.stats.headerBuffer || 0)
            const canAssemble = Math.min(Math.floor(payload / 1), Math.floor(header / 2), 1)
            if (canAssemble > 0) {
              machine.stats.payloadBuffer -= canAssemble * 1
              machine.stats.headerBuffer -= canAssemble * 2
              machine.stats.packetBuffer = Math.floor((machine.stats.packetBuffer || 0) + canAssemble)
              resources.packet = Math.floor(resources.packet + canAssemble)
            }
          }
        })

        // --- PHASE 6: Alles runden ---
        machines.forEach(machine => {
          Object.keys(machine.stats).forEach(k => {
            if (typeof machine.stats[k] === 'number') {
              machine.stats[k] = Math.floor(machine.stats[k])
            }
          })
        })
        Object.keys(resources).forEach(k => {
          if (typeof resources[k] === 'number') {
            resources[k] = Math.floor(resources[k])
          }
        })

        return { ...prev, machines, resources }
      })
    }, 500) // alle 500ms
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-screen h-screen bg-gray-950 relative overflow-hidden select-none">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Game Components */}
      <HUD gameState={gameState} />
      <MachineToolbar gameState={gameState} setGameState={setGameState} />
      <GameBoard gameState={gameState} setGameState={setGameState} />
    </div>
  )
}

export default App