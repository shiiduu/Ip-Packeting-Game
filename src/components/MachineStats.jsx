export default function MachineStats({ machine, config }) {
  const getStatsDisplay = () => {
    switch (machine.type) {
      case 'INPUT':
        return (
          <div className="text-xs text-white/80">
            <div>Rate: {machine.config.rate}/s</div>
            <div>Generated: {machine.stats.generated}</div>
          </div>
        )
      case 'PROCESSOR':
        return (
          <div className="text-xs text-white/80">
            <div>Payload: {machine.stats.payload || 0}</div>
            <div>Buffer: {machine.stats.buffer}</div>
            {machine.stats.processing && (
              <div className="text-green-300 animate-pulse">Processing...</div>
            )}
          </div>
        )
      case 'MERGER':
        return (
          <div className="text-xs text-white/80">
            <div>Merged: {machine.stats.merged || 0}</div>
            <div>Payload: {machine.stats.payload || 0}</div>
            <div>Buffer: {machine.stats.buffer || 0}</div>
          </div>
        )
      case 'SPLITTER':
        return (
          <div className="text-xs text-white/80">
            <div>Split: {machine.stats.split || 0}</div>
            <div>Buffer: {machine.stats.buffer || 0}</div>
          </div>
        )
      case 'OUTPUT':
        return (
          <div className="text-xs text-white/80">
            <div>Received: {machine.stats.received || 0}</div>
            <div>Total: {machine.stats.total || 0}</div>
          </div>
        )
      case 'HEADER':
        return (
          <div className="text-xs text-white/80">
            <div>Generated: {machine.stats.generated || 0}</div>
            <div>Buffer: {machine.stats.buffer || 0}</div>
          </div>
        )
      case 'ASSEMBLER':
        return (
          <div className="text-xs text-white/80">
            <div>Payload: {machine.stats.payloadBuffer || 0}</div>
            <div>Header: {machine.stats.headerBuffer || 0}</div>
            <div>Packet: {machine.stats.packetBuffer || 0}</div>
          </div>
        )
      case 'GOAL':
        return (
          <div className="text-xs text-white/80">
            <div>Received: {machine.stats.received || 0}</div>
            <div>Buffer: {machine.stats.buffer || 0}</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`
      absolute -bottom-16 left-1/2 transform -translate-x-1/2
      bg-gray-900/90 backdrop-blur-sm rounded px-2 py-1
      border border-gray-700 min-w-max
      ${config.shape === 'diamond' ? 'transform -translate-x-1/2 rotate-0' : ''}
    `}>
      {getStatsDisplay()}
    </div>
  )
}