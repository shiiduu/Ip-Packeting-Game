import { getPortCenter } from './portUtils'

export default function ConnectionLine({ connection, machines, onRemove }) {
  const fromMachine = machines.find(m => m.id === connection.from.machineId)
  const toMachine = machines.find(m => m.id === connection.to.machineId)
  if (!fromMachine || !toMachine) return null
  const fromPort = getPortCenter(fromMachine, connection.from.portType, connection.from.portIndex)
  const toPort = getPortCenter(toMachine, connection.to.portType, connection.to.portIndex)
  // Keine panOffset-Korrektur mehr! Weltkoordinaten direkt verwenden
  const fromX = fromPort.x
  const fromY = fromPort.y
  const toX = toPort.x
  const toY = toPort.y
  const path = `M${fromX},${fromY} C${fromX + Math.max(Math.abs(toX - fromX) * 0.4, 40)},${fromY} ${toX - Math.max(Math.abs(toX - fromX) * 0.4, 40)},${toY} ${toX},${toY}`
  return (
    <g>
      {/* Unsichtbare Klickfläche */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="16"
        style={{ cursor: 'pointer' }}
        onClick={() => onRemove?.(connection.id)}
        fill="none"
      />
      <path
        d={path}
        stroke="#0ff6"
        strokeWidth="4"
        style={{ filter: 'drop-shadow(0 0 6px #0ff)' }}
        fill="none"
      />
      <path
        d={path}
        stroke="#60a5fa"
        strokeWidth="2"
        strokeDasharray="8,4"
        className="animate-pulse"
        fill="none"
      />
    </g>
  )
}