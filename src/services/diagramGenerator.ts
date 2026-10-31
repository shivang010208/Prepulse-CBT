/**
 * Diagram & Schematic Synthesizer for physics, chemistry, and geometry questions.
 * When text is extracted from a PDF (where vector/raster images are discarded),
 * this service inspects the question statement for visual references (circuits,
 * pulleys, inclined planes, ray optics, graphs, concentric shells, logic gates,
 * organic compounds, or geometric figures) and generates clean, dark-mode SVG schematics
 * so students never face a blank diagram in CBT mode.
 */

export interface DiagramResult {
  diagramSvg?: string;
  diagramDescription?: string;
}

export class DiagramSynthesizer {
  static synthesize(questionText: string, section?: string): DiagramResult {
    const textLower = questionText.toLowerCase();

    // 1. Inclined Plane / Block / Friction / Tension
    if (
      (textLower.includes('incline') || textLower.includes('wedge') || textLower.includes('plane of angle') || textLower.includes('angle θ')) &&
      (textLower.includes('block') || textLower.includes('mass') || textLower.includes('friction') || textLower.includes('force f'))
    ) {
      const angleMatch = questionText.match(/(\d+)\s*°/);
      const angle = angleMatch ? angleMatch[1] : '30';
      return {
        diagramDescription: `Free-body schematic: Block of mass resting on an inclined plane of inclination θ = ${angle}°. Force vectors represent normal force perpendicular to incline, gravity downwards, and applied force.`,
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" width="100%" height="160" class="mx-auto">
  <polygon points="40,170 320,170 320,50" fill="none" stroke="#64748b" stroke-width="2.5" />
  <path d="M 100,170 A 60,60 0 0,0 95,152" fill="none" stroke="#38bdf8" stroke-width="2" />
  <text x="110" y="162" fill="#38bdf8" font-size="12" font-family="sans-serif" font-weight="bold">θ = ${angle}°</text>
  <g transform="translate(180,110) rotate(-23)">
    <rect x="-25" y="-30" width="50" height="30" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5" />
    <text x="-14" y="-10" fill="#e0e7ff" font-size="11" font-family="sans-serif" font-weight="bold">Mass m</text>
    <line x1="0" y1="0" x2="0" y2="45" stroke="#f43f5e" stroke-width="2" />
    <polygon points="0,45 -3,38 3,38" fill="#f43f5e" />
    <text x="5" y="40" fill="#f43f5e" font-size="10">mg</text>
    <line x1="0" y1="-30" x2="0" y2="-65" stroke="#34d399" stroke-width="2" />
    <polygon points="0,-65 -3,-58 3,-58" fill="#34d399" />
    <text x="5" y="-55" fill="#34d399" font-size="10">N</text>
  </g>
  <line x1="95" y1="110" x2="155" y2="110" stroke="#fbbf24" stroke-width="2.5" />
  <polygon points="155,106 167,110 155,114" fill="#fbbf24" />
  <text x="105" y="98" fill="#fbbf24" font-size="12" font-family="sans-serif" font-weight="bold">Force F</text>
</svg>`,
      };
    }

    // 2. Pulley System / Atwood Machine
    if (textLower.includes('pulley') || textLower.includes('atwood') || (textLower.includes('string') && textLower.includes('mass') && textLower.includes('suspended'))) {
      return {
        diagramDescription: 'Atwood machine / pulley setup with two masses suspended by a light inextensible string passing over a smooth fixed pulley.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 210" width="100%" height="170" class="mx-auto">
  <line x1="120" y1="20" x2="240" y2="20" stroke="#94a3b8" stroke-width="4" />
  <line x1="180" y1="20" x2="180" y2="50" stroke="#64748b" stroke-width="2" />
  <!-- Pulley wheel -->
  <circle cx="180" cy="70" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
  <circle cx="180" cy="70" r="4" fill="#38bdf8" />
  <!-- Strings -->
  <line x1="158" y1="70" x2="158" y2="130" stroke="#cbd5e1" stroke-width="2" />
  <line x1="202" y1="70" x2="202" y2="150" stroke="#cbd5e1" stroke-width="2" />
  <!-- Mass 1 -->
  <rect x="143" y="130" width="30" height="30" rx="3" fill="#312e81" stroke="#a5b4fc" stroke-width="2" />
  <text x="158" y="150" fill="#ffffff" font-size="11" text-anchor="middle" font-weight="bold">m₁</text>
  <!-- Mass 2 -->
  <rect x="187" y="150" width="30" height="35" rx="3" fill="#1e1b4b" stroke="#818cf8" stroke-width="2" />
  <text x="202" y="172" fill="#ffffff" font-size="11" text-anchor="middle" font-weight="bold">m₂</text>
  <text x="180" y="200" fill="#94a3b8" font-size="11" text-anchor="middle">Pulley System (Tension T)</text>
</svg>`,
      };
    }

    // 3. Electric Circuits / Resistors / Batteries / Wheatstone Bridge
    if (
      textLower.includes('circuit') ||
      textLower.includes('resistor') ||
      textLower.includes('wheatstone') ||
      textLower.includes('galvanometer') ||
      textLower.includes('current in') ||
      (textLower.includes('resistance') && (textLower.includes('series') || textLower.includes('parallel') || textLower.includes('battery')))
    ) {
      return {
        diagramDescription: 'Electric circuit schematic depicting DC voltage source connected to network of resistors with current loop nodes.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 180" width="100%" height="160" class="mx-auto">
  <!-- Wires -->
  <line x1="40" y1="90" x2="110" y2="90" stroke="#38bdf8" stroke-width="2" />
  <line x1="270" y1="90" x2="340" y2="90" stroke="#38bdf8" stroke-width="2" />
  <line x1="110" y1="50" x2="110" y2="130" stroke="#38bdf8" stroke-width="2" />
  <line x1="270" y1="50" x2="270" y2="130" stroke="#38bdf8" stroke-width="2" />
  <!-- Parallel Top Branch R1 -->
  <line x1="110" y1="50" x2="150" y2="50" stroke="#38bdf8" stroke-width="2" />
  <rect x="150" y="40" width="80" height="20" rx="3" fill="#1e293b" stroke="#a78bfa" stroke-width="2" />
  <text x="190" y="55" fill="#a78bfa" font-size="11" text-anchor="middle" font-weight="bold">R₁</text>
  <line x1="230" y1="50" x2="270" y2="50" stroke="#38bdf8" stroke-width="2" />
  <!-- Parallel Bottom Branch R2 -->
  <line x1="110" y1="130" x2="150" y2="130" stroke="#38bdf8" stroke-width="2" />
  <rect x="150" y="120" width="80" height="20" rx="3" fill="#1e293b" stroke="#34d399" stroke-width="2" />
  <text x="190" y="135" fill="#34d399" font-size="11" text-anchor="middle" font-weight="bold">R₂</text>
  <line x1="230" y1="130" x2="270" y2="130" stroke="#38bdf8" stroke-width="2" />
  <!-- Battery & Bottom Loop -->
  <line x1="40" y1="90" x2="40" y2="165" stroke="#38bdf8" stroke-width="2" />
  <line x1="40" y1="165" x2="175" y2="165" stroke="#38bdf8" stroke-width="2" />
  <!-- DC Source -->
  <line x1="175" y1="155" x2="175" y2="175" stroke="#f43f5e" stroke-width="3" />
  <line x1="185" y1="160" x2="185" y2="170" stroke="#f43f5e" stroke-width="1.8" />
  <text x="180" y="150" fill="#f43f5e" font-size="11" text-anchor="middle" font-weight="bold">V (Battery)</text>
  <line x1="185" y1="165" x2="340" y2="165" stroke="#38bdf8" stroke-width="2" />
  <line x1="340" y1="90" x2="340" y2="165" stroke="#38bdf8" stroke-width="2" />
</svg>`,
      };
    }

    // 4. Ray Optics / Lens / Mirror / Prism
    if (textLower.includes('lens') || textLower.includes('mirror') || textLower.includes('prism') || textLower.includes('refraction') || textLower.includes('focal length')) {
      return {
        diagramDescription: 'Optical ray diagram illustrating incident light rays, optical axis, principal focus (F), and refraction/reflection geometry.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 180" width="100%" height="160" class="mx-auto">
  <!-- Optical Axis -->
  <line x1="20" y1="90" x2="360" y2="90" stroke="#475569" stroke-width="2" stroke-dasharray="5,4" />
  <!-- Convex Lens -->
  <path d="M 190,20 Q 215,90 190,160 Q 165,90 190,20" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2.5" />
  <!-- Object Arrow -->
  <line x1="80" y1="90" x2="80" y2="40" stroke="#f59e0b" stroke-width="3" />
  <polygon points="80,32 75,44 85,44" fill="#f59e0b" />
  <text x="80" y="25" fill="#f59e0b" font-size="11" text-anchor="middle" font-weight="bold">Object (h)</text>
  <!-- Ray 1 parallel then focus -->
  <line x1="80" y1="40" x2="190" y2="40" stroke="#34d399" stroke-width="1.8" />
  <line x1="190" y1="40" x2="300" y2="140" stroke="#34d399" stroke-width="1.8" />
  <!-- Ray 2 through optical centre -->
  <line x1="80" y1="40" x2="300" y2="140" stroke="#ec4899" stroke-width="1.8" />
  <!-- Focus F -->
  <circle cx="260" cy="90" r="3" fill="#38bdf8" />
  <text x="260" y="105" fill="#38bdf8" font-size="11" text-anchor="middle">F</text>
  <!-- Image Arrow -->
  <line x1="300" y1="90" x2="300" y2="140" stroke="#f43f5e" stroke-width="2.5" />
  <polygon points="300,146 295,136 305,136" fill="#f43f5e" />
  <text x="300" y="160" fill="#f43f5e" font-size="11" text-anchor="middle" font-weight="bold">Image (h\')</text>
</svg>`,
      };
    }

    // 5. Concentric Shells / Electrostatics
    if (textLower.includes('concentric') || (textLower.includes('spherical') && textLower.includes('radii')) || textLower.includes('shells')) {
      return {
        diagramDescription: 'Concentric spherical conducting shells with inner radius R and outer radius 2R carrying surface charges.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" width="100%" height="160" class="mx-auto">
  <circle cx="180" cy="100" r="75" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-dasharray="4,3" />
  <text x="260" y="100" fill="#818cf8" font-size="12" font-family="sans-serif" font-weight="bold">Outer Shell: 2R</text>
  <circle cx="180" cy="100" r="38" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2.5" />
  <text x="180" y="104" fill="#38bdf8" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">Inner: R</text>
  <line x1="180" y1="100" x2="218" y2="100" stroke="#f43f5e" stroke-width="1.8" />
  <line x1="180" y1="100" x2="180" y2="25" stroke="#34d399" stroke-width="1.8" />
</svg>`,
      };
    }

    // 6. Logic Gates
    if (textLower.includes('logic gate') || textLower.includes('nand') || textLower.includes('nor') || textLower.includes('and gate') || textLower.includes('or gate')) {
      return {
        diagramDescription: 'Digital logic circuit schematic showing gate inputs A, B and output Y.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" width="100%" height="140" class="mx-auto">
  <line x1="60" y1="60" x2="140" y2="60" stroke="#38bdf8" stroke-width="2.5" />
  <text x="45" y="65" fill="#38bdf8" font-size="13" font-weight="bold">A</text>
  <line x1="60" y1="100" x2="140" y2="100" stroke="#38bdf8" stroke-width="2.5" />
  <text x="45" y="105" fill="#38bdf8" font-size="13" font-weight="bold">B</text>
  <path d="M 140,40 L 175,40 A 40,40 0 0,1 215,80 A 40,40 0 0,1 175,120 L 140,120 Z" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2.5" />
  <circle cx="221" cy="80" r="6" fill="#1e1b4b" stroke="#a78bfa" stroke-width="2" />
  <line x1="227" y1="80" x2="290" y2="80" stroke="#38bdf8" stroke-width="2.5" />
  <text x="305" y="85" fill="#34d399" font-size="14" font-weight="bold">Y</text>
</svg>`,
      };
    }

    // 7. General mention of "shown in the figure" or "in the diagram" or "graph"
    if (
      textLower.includes('figure') ||
      textLower.includes('diagram') ||
      textLower.includes('graph') ||
      textLower.includes('chart') ||
      textLower.includes('shown below') ||
      textLower.includes('given below')
    ) {
      return {
        diagramDescription: 'Schematic reference: The problem refers to the visual layout, coordinate values, or circuit components specified in the problem statement above.',
        diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 150" width="100%" height="130" class="mx-auto">
  <rect x="20" y="20" width="320" height="110" rx="10" fill="#0f172a" stroke="#334155" stroke-width="2" stroke-dasharray="4,4" />
  <line x1="60" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2" />
  <line x1="60" y1="100" x2="60" y2="40" stroke="#64748b" stroke-width="2" />
  <!-- Curve -->
  <path d="M 60,100 Q 180,30 300,70" fill="none" stroke="#38bdf8" stroke-width="3" />
  <text x="180" y="125" fill="#94a3b8" font-size="11" text-anchor="middle">Coordinate / Visual Representation</text>
</svg>`,
      };
    }

    return {};
  }
}
