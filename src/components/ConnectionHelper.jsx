import { getPortCenter } from './portUtils'

export default function ConnectionHelper({ from, to, machines }) {
  const fromMachine = machines.find(m => m.id === from.machineId)
  if (!fromMachine) return null
  const fromPort = getPortCenter(fromMachine, from.portType, from.portIndex)
  // Ziel ist die aktuelle Mausposition (to.x, to.y)
  // Keine panOffset-Korrektur mehr! Weltkoordinaten direkt verwenden
  const fromX = fromPort.x
  const fromY = fromPort.y
  const toX = to.x
  const toY = to.y
  const path = `M${fromX},${fromY} C${fromX + Math.max(Math.abs(toX - fromX) * 0.4, 40)},${fromY} ${toX - Math.max(Math.abs(toX - fromX) * 0.4, 40)},${toY} ${toX},${toY}`
  return (
    <path
      d={path}
      stroke="#f0f"
      strokeWidth="4"
      style={{ filter: 'drop-shadow(0 0 8px #f0f)' }}
      strokeDasharray="6,6"
      className="animate-pulse"
      fill="none"
    />
  )
}