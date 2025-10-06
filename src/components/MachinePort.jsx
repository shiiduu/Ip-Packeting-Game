export default function MachinePort({
  type,
  index,
  machineId,
  onPortClick,
  isConnecting,
  occupied,
  style
}) {
  const handleClick = (e) => {
    e.stopPropagation()
    if (occupied) return // Klick auf belegten Port ignorieren
    onPortClick(machineId, type, index)
  }

  return (
    <div
      className={`
        port w-4 h-4 rounded-full border-2
        ${occupied
          ? 'bg-gray-500 border-gray-400 opacity-50 cursor-not-allowed'
          : `cursor-pointer transition-all duration-200 transform hover:scale-125
            shadow-[0_0_12px_4px_rgba(0,255,255,0.7)]
            ${type === 'input' 
              ? 'bg-cyan-400 border-cyan-300 hover:bg-cyan-300' 
              : 'bg-pink-400 border-pink-300 hover:bg-pink-300'}
            ${isConnecting ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`
        }
      `}
      onClick={handleClick}
      style={style}
    />
  )
}