const PALETTE = [
  '#22d3ee', // cyan
  '#a78bfa', // violet
  '#fb923c', // orange
  '#4ade80', // green
  '#f472b6', // pink
  '#facc15', // yellow
  '#38bdf8', // sky
  '#e879f9', // fuchsia
  '#fb7185', // rose
  '#34d399', // emerald
  '#818cf8', // indigo
  '#fbbf24', // amber
];

export function getColor(index) {
  return PALETTE[index % PALETTE.length];
}

export function getBg(color) {
  return `${color}14`;
}
