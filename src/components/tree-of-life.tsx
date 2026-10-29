"use client";

/**
 * Detailed Kabbalistic Tree of Life — original rendering with:
 * - 10 sephiroth with name, number, meaning, planetary glyph
 * - 22 paths numbered with Roman numerals
 * - Three veils of negative existence at the top (Ain / Ain Soph / Ain Soph Aur)
 * - Four worlds labeled (Atziluth, Briah, Yetzirah, Assiah)
 * - Two "veils" dashed lines (Abyss, Paroketh)
 * - A single traveling point following the paths
 */

type Node = {
  id: number;
  name: string;
  meaning: string;
  glyph: string; // planetary / sephira symbol
  x: number;
  y: number;
};

// Vertical viewBox roughly 1:1.6
const NODES: Node[] = [
  { id: 1, name: "KETHER", meaning: "the crown", glyph: "☿?", x: 300, y: 90 },
  { id: 2, name: "CHOKMAH", meaning: "wisdom", glyph: "♆", x: 460, y: 180 },
  { id: 3, name: "BINAH", meaning: "understanding", glyph: "♄", x: 140, y: 180 },
  { id: 4, name: "CHESED", meaning: "mercy", glyph: "♃", x: 460, y: 380 },
  { id: 5, name: "GEBURAH", meaning: "strength", glyph: "♂", x: 140, y: 380 },
  { id: 6, name: "TIPHARETH", meaning: "beauty", glyph: "☉", x: 300, y: 470 },
  { id: 7, name: "NETZACH", meaning: "victory", glyph: "♀", x: 460, y: 580 },
  { id: 8, name: "HOD", meaning: "splendour", glyph: "☿", x: 140, y: 580 },
  { id: 9, name: "YESOD", meaning: "foundation", glyph: "☾", x: 300, y: 670 },
  { id: 10, name: "MALKUTH", meaning: "the kingdom", glyph: "⊕", x: 300, y: 820 },
];

// The 22 paths with Roman numerals (standard Kabbalistic ordering).
const PATHS: Array<{ from: number; to: number; roman: string }> = [
  { from: 1, to: 2, roman: "I" },
  { from: 1, to: 3, roman: "II" },
  { from: 1, to: 6, roman: "III" },
  { from: 2, to: 3, roman: "IV" },
  { from: 2, to: 6, roman: "V" },
  { from: 2, to: 4, roman: "VI" },
  { from: 3, to: 6, roman: "VII" },
  { from: 3, to: 5, roman: "VIII" },
  { from: 4, to: 5, roman: "IX" },
  { from: 4, to: 6, roman: "X" },
  { from: 4, to: 7, roman: "XI" },
  { from: 5, to: 6, roman: "XII" },
  { from: 5, to: 8, roman: "XIII" },
  { from: 6, to: 7, roman: "XIV" },
  { from: 6, to: 9, roman: "XV" },
  { from: 6, to: 8, roman: "XVI" },
  { from: 7, to: 8, roman: "XVII" },
  { from: 7, to: 9, roman: "XVIII" },
  { from: 7, to: 10, roman: "XIX" },
  { from: 8, to: 9, roman: "XX" },
  { from: 8, to: 10, roman: "XXI" },
  { from: 9, to: 10, roman: "XXII" },
];

const SEPHIRA_R = 42;

function nodeById(id: number) {
  return NODES.find((n) => n.id === id)!;
}

export function TreeOfLife() {
  // Build the traveling-point circuit: walk through every path in order,
  // visiting each endpoint. SMIL interpolates between successive values.
  const circuit: Array<{ x: number; y: number }> = [];
  for (const p of PATHS) {
    const a = nodeById(p.from);
    const b = nodeById(p.to);
    circuit.push({ x: a.x, y: a.y });
    circuit.push({ x: b.x, y: b.y });
  }
  const xValues = circuit.map((c) => c.x).join(";");
  const yValues = circuit.map((c) => c.y).join(";");

  return (
    <svg
      viewBox="0 0 900 600"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="árvore da vida"
      style={{ color: "#ffffff" }}
    >
      <g transform="translate(900 0) rotate(90)">
       {/* content is authored in a 600x900 vertical space.
            This transform maps (x,y) -> (900-y, x), rotating -90° visually
            so the vertical tree ends up horizontal inside the 900x600 viewBox,
            with the top (Kether) at the right edge and the bottom (Malkuth) at the left. */}
      <defs>
        <filter id="serpentGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feGaussianBlur stdDeviation="10" result="wideBlur" />
          <feMerge>
            <feMergeNode in="wideBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === three veils of negative existence at the top (arcs) === */}
      <g fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.75">
        <path d="M 60 90 A 240 60 0 0 1 540 90" />
        <path d="M 30 70 A 270 70 0 0 1 570 70" />
        <path d="M 10 50 A 290 80 0 0 1 590 50" />
      </g>
      <g
        fill="currentColor"
        fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
        fontSize="10"
        textAnchor="middle"
        letterSpacing="0.15em"
      >
        <text x="300" y="30">AIN SOPH AUR · the limitless light</text>
        <text x="300" y="50">AIN SOPH · the limitless</text>
        <text x="300" y="70">AIN · nothingness</text>
      </g>

      {/* === world labels on left and right === */}
      <g
        fill="currentColor"
        opacity="0.6"
        fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
        fontSize="9"
        letterSpacing="0.2em"
      >
        <text x="10" y="150" transform="rotate(-90 10 150)" textAnchor="middle">
          ATZILUTH
        </text>
        <text x="10" y="400" transform="rotate(-90 10 400)" textAnchor="middle">
          BRIAH
        </text>
        <text x="10" y="640" transform="rotate(-90 10 640)" textAnchor="middle">
          YETZIRAH
        </text>
        <text x="10" y="820" transform="rotate(-90 10 820)" textAnchor="middle">
          ASSIAH
        </text>
      </g>

      {/* === veils between the worlds (dashed horizontal lines) === */}
      <g stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 4" opacity="0.5">
        <line x1="60" y1="275" x2="540" y2="275" />
        <line x1="60" y1="525" x2="540" y2="525" />
      </g>
      <g
        fill="currentColor"
        opacity="0.6"
        fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
        fontSize="9"
        letterSpacing="0.15em"
      >
        <text x="548" y="272" textAnchor="start">veil of the abyss</text>
        <text x="548" y="522" textAnchor="start">veil of paroketh</text>
      </g>

      {/* === paths (lines) === */}
      <g stroke="currentColor" strokeWidth="1" fill="none">
        {PATHS.map((p) => {
          const a = nodeById(p.from);
          const b = nodeById(p.to);
          return (
            <line key={`l-${p.from}-${p.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          );
        })}
      </g>

      {/* === path labels (Roman numerals) === */}
      <g
        fill="currentColor"
        opacity="0.85"
        fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
        fontSize="11"
        textAnchor="middle"
      >
        {PATHS.map((p) => {
          const a = nodeById(p.from);
          const b = nodeById(p.to);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={`t-${p.from}-${p.to}`}>
              <rect
                x={mx - 12}
                y={my - 7}
                width="24"
                height="14"
                fill="#000000"
              />
              <text x={mx} y={my + 4}>{p.roman}</text>
            </g>
          );
        })}
      </g>

      {/* === sephiroth (circles) === */}
      <g>
        {NODES.map((n) => (
          <g key={n.id}>
            {/* outer stroke */}
            <circle
              cx={n.x}
              cy={n.y}
              r={SEPHIRA_R}
              fill="#000000"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            {/* inner thin ring */}
            <circle
              cx={n.x}
              cy={n.y}
              r={SEPHIRA_R - 4}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.4"
            />
            {/* number */}
            <text
              x={n.x}
              y={n.y - 18}
              textAnchor="middle"
              fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
              fontSize="9"
              fill="currentColor"
              opacity="0.75"
            >
              {n.id}
            </text>
            {/* name */}
            <text
              x={n.x}
              y={n.y - 4}
              textAnchor="middle"
              fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
              fontSize="10"
              letterSpacing="0.1em"
              fill="currentColor"
              fontWeight="700"
            >
              {n.name}
            </text>
            {/* glyph (planet/symbol) */}
            <text
              x={n.x}
              y={n.y + 14}
              textAnchor="middle"
              fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
              fontSize="14"
              fill="currentColor"
            >
              {n.glyph}
            </text>
            {/* meaning (italic small) */}
            <text
              x={n.x}
              y={n.y + 28}
              textAnchor="middle"
              fontFamily='"Times New Roman", Times, serif'
              fontStyle="italic"
              fontSize="9"
              fill="currentColor"
              opacity="0.75"
            >
              {n.meaning}
            </text>
          </g>
        ))}
      </g>

      {/* === the traveling point — serpent of wisdom (glowing) === */}
      <g filter="url(#serpentGlow)">
        <circle r="14" fill="#ffffff" opacity="0.35">
          <animate
            attributeName="cx"
            values={xValues}
            dur="60s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="cy"
            values={yValues}
            dur="60s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </circle>
        <circle r="7" fill="#ffd27a">
          <animate
            attributeName="cx"
            values={xValues}
            dur="60s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="cy"
            values={yValues}
            dur="60s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </circle>
      </g>
      <circle r="3" fill="#ffffff">
        <animate
          attributeName="cx"
          values={xValues}
          dur="60s"
          repeatCount="indefinite"
          calcMode="linear"
        />
        <animate
          attributeName="cy"
          values={yValues}
          dur="60s"
          repeatCount="indefinite"
          calcMode="linear"
        />
      </circle>
      </g>
    </svg>
  );
}
