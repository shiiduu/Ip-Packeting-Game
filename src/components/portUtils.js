// Liefert die exakte Mitte eines Ports (input/output, index) auf einer Maschine
export function getPortCenter(machine, portType, portIndex) {
  // Maschinen-Konfigurationen
  const config = {
    INPUT: { w: 80, h: 80, inputs: 0, outputs: 1 },
    PROCESSOR: { w: 100, h: 80, inputs: 1, outputs: 1 },
    MERGER: { w: 90, h: 90, inputs: 3, outputs: 1 },
    SPLITTER: { w: 90, h: 90, inputs: 1, outputs: 3 },
    OUTPUT: { w: 80, h: 80, inputs: 1, outputs: 0 },
    HEADER: { w: 80, h: 80, inputs: 0, outputs: 1 },
    ASSEMBLER: { w: 110, h: 90, inputs: 2, outputs: 1 },
    GOAL: { w: 120, h: 100, inputs: 3, outputs: 0 }
  }[machine.type] || { w: 80, h: 80, inputs: 0, outputs: 1 }
  const portSize = 16 // px
  const x = machine.x
  const y = machine.y
  let portCount, spacing, px, py
  if (portType === 'input') {
    portCount = config.inputs || machine.config?.ports?.inputs || 1
    spacing = config.h / (portCount + 1)
    px = x - portSize / 2
    py = y + spacing * (portIndex + 1) - portSize / 2
  } else {
    portCount = config.outputs || machine.config?.ports?.outputs || 1
    spacing = config.h / (portCount + 1)
    px = x + config.w - portSize / 2
    py = y + spacing * (portIndex + 1) - portSize / 2
  }
  return {
    x: px + portSize / 2,
    y: py + portSize / 2
  }
}
