export default function HUD({ gameState }) {
  return (
    <div className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-md rounded-lg p-4 border-2 border-cyan-400 shadow-[0_0_32px_8px_rgba(0,255,255,0.3)]">
      <div className="text-sm space-y-2">
        <div className="flex justify-between items-center gap-4">
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#0ff]">Raw Data:</span>
          <span className="text-white font-mono drop-shadow-[0_0_8px_#0ff]">{gameState.resources.rawData}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#0ff]">Total Generated:</span>
          <span className="text-green-400 font-mono drop-shadow-[0_0_8px_#0f0]">{gameState.resources.totalGenerated}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#0ff]">Machines:</span>
          <span className="text-purple-400 font-mono drop-shadow-[0_0_8px_#a0f]">{gameState.machines.length}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#0ff]">Payload:</span>
          <span className="text-pink-400 font-mono drop-shadow-[0_0_8px_#f0f]">{gameState.resources.payload}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#0ff]">Header:</span>
          <span className="text-orange-400 font-mono drop-shadow-[0_0_8px_#fa0]">{gameState.resources.header}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#0ff]">Packet:</span>
          <span className="text-lime-400 font-mono drop-shadow-[0_0_8px_#af0]">{gameState.resources.packet}</span>
        </div>
      </div>
    </div>
  )
}