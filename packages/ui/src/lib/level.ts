export interface Level {
  tier: string;
  name: string;
  color: string;
  min: number;
  next: number | null;
}

const LEVELS: Level[] = [
  { tier: 'L1', name: '起步', color: '#22c55e', min: 0, next: 100 },
  { tier: 'L2', name: '进阶', color: '#22d3ee', min: 100, next: 500 },
  { tier: 'L3', name: '精英', color: '#6a5cff', min: 500, next: 1500 },
  { tier: 'L4', name: '传奇', color: '#ffb020', min: 1500, next: null },
];

export function levelOf(total: number): Level {
  return [...LEVELS].reverse().find((l) => total >= l.min) ?? LEVELS[0];
}
