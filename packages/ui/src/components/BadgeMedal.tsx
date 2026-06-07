import { useId } from 'react';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

const RARITY_COLORS: Record<BadgeRarity, { center: string; edge: string; deep: string; ribbon: string }> = {
  common: { center: '#fafbfc', edge: '#64748b', deep: '#3f4b5c', ribbon: '#4a5568' },
  rare: { center: '#ecfeff', edge: '#22b6d6', deep: '#0e7490', ribbon: '#0e7490' },
  epic: { center: '#f2efff', edge: '#6a5cff', deep: '#4326c0', ribbon: '#4326c0' },
  legendary: { center: '#fff6df', edge: '#f5a623', deep: '#a3640a', ribbon: '#b9770f' },
};

// 每枚勋章的图案（绘制在奖牌中心，约 x24~48 / y26~52）。deep = 主色，center = 高光色。
function Emblem({ code, deep, center }: { code: string; deep: string; center: string }) {
  switch (code) {
    case 'sprout': // 初来乍到 · 新芽
      return (
        <>
          <path d="M36 50 C36 44 36 40 36 33" fill="none" stroke={deep} strokeWidth={3} strokeLinecap="round" />
          <path d="M36 44 C30 44 26.5 40.5 26.5 35 C32 35 36 39 36 44 Z" fill={deep} />
          <path d="M36 41.5 C42 41.5 45.5 38 45.5 32.5 C40 32.5 36 36 36 41.5 Z" fill={deep} />
        </>
      );
    case 'flag': // 旗开得胜 · 旗帜
      return (
        <>
          <path d="M30 28 L30 50" stroke={deep} strokeWidth={3} strokeLinecap="round" />
          <path d="M30 29 Q39 28 45 32 Q39 35 30 38 Z" fill={deep} />
        </>
      );
    case 'coin_stack': // 积少成多 · 叠币
      return (
        <>
          <ellipse cx={36} cy={47} rx={12} ry={3.6} fill={deep} stroke={center} strokeWidth={0.7} />
          <ellipse cx={36} cy={42} rx={12} ry={3.6} fill={deep} stroke={center} strokeWidth={0.7} />
          <ellipse cx={36} cy={37} rx={12} ry={3.6} fill={deep} stroke={center} strokeWidth={0.7} />
        </>
      );
    case 'pagoda': // 聚沙成塔 · 宝塔
      return (
        <>
          <path d="M36 25 L37.5 29 L34.5 29 Z" fill={deep} />
          <path d="M32 29 L40 29 L42 34 L30 34 Z" fill={deep} />
          <path d="M30 35 L42 35 L44 41 L28 41 Z" fill={deep} />
          <path d="M28.5 42 L43.5 42 L45 49 L27 49 Z" fill={deep} />
        </>
      );
    case 'burst': // 厚积薄发 · 蓄力上射
      return (
        <>
          <rect x={27} y={48.5} width={18} height={3.4} rx={1.4} fill={deep} />
          <path d="M36 48 L36 32" stroke={deep} strokeWidth={3.4} strokeLinecap="round" />
          <path d="M28 37 L36 28 L44 37 Z" fill={deep} />
          <circle cx={26} cy={30} r={1.6} fill={deep} />
          <circle cx={46} cy={30} r={1.6} fill={deep} />
        </>
      );
    case 'ingot': // 富甲一方 · 元宝
      return (
        <>
          <path d="M22 47 Q36 54 50 47 L47 42 Q36 48 25 42 Z" fill={deep} />
          <ellipse cx={36} cy={40} rx={13} ry={4.6} fill={deep} />
          <ellipse cx={36} cy={39} rx={8} ry={2.2} fill={center} opacity={0.45} />
        </>
      );
    case 'cleaver': // 小试牛刀 · 牛刀
      return (
        <>
          <rect x={20} y={33} width={9} height={5} rx={2} fill={deep} />
          <path d="M28 30 L44 30 Q48 30 48 34 L48 42 L28 42 Z" fill={deep} />
          <circle cx={44} cy={34} r={1.3} fill={center} />
        </>
      );
    case 'gift': // 各取所需 · 礼盒
      return (
        <>
          <rect x={26} y={39} width={20} height={13} rx={1.5} fill={deep} />
          <rect x={24} y={34} width={24} height={6} rx={1.5} fill={deep} />
          <rect x={34} y={34} width={4} height={18} fill={center} opacity={0.6} />
          <path d="M36 34 Q32 29 30 32 Q29.5 34 36 34.5 Q42.5 34 42 32 Q40 29 36 34 Z" fill={deep} />
        </>
      );
    case 'bag': // 满载而归 · 满袋
      return (
        <>
          <path
            d="M31 39 Q31 32 36 32 Q41 32 41 39"
            stroke={deep}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
          <path d="M27 39 L45 39 L46.5 53 Q46.6 54 45.6 54 L26.4 54 Q25.4 54 25.5 53 Z" fill={deep} />
          <circle cx={32} cy={38} r={2.4} fill={center} />
          <circle cx={40} cy={38} r={2.4} fill={center} />
        </>
      );
    case 'coins_toss': // 一掷千金 · 抛金
      return (
        <>
          <path d="M19 31 L25 33" stroke={deep} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
          <path d="M18 37 L24 38" stroke={deep} strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
          <circle cx={31} cy={43} r={6} fill={deep} />
          <circle cx={31} cy={43} r={3.2} fill="none" stroke={center} strokeWidth={1.1} />
          <circle cx={43} cy={37} r={7} fill={deep} />
          <circle cx={43} cy={37} r={3.7} fill="none" stroke={center} strokeWidth={1.2} />
          <circle cx={44} cy={49} r={4.5} fill={deep} />
          <circle cx={44} cy={49} r={2.3} fill="none" stroke={center} strokeWidth={1} />
        </>
      );
    case 'calendar_check': // 渐入佳境 · 日历打卡（完成 5 次签到）
      return (
        <>
          <rect x={30.5} y={27} width={2.6} height={6} rx={1.3} fill={deep} />
          <rect x={38.9} y={27} width={2.6} height={6} rx={1.3} fill={deep} />
          <rect x={25} y={30} width={22} height={20} rx={3} fill={deep} />
          <rect x={27} y={33} width={18} height={2.4} rx={1.2} fill={center} opacity={0.55} />
          <path
            d="M30.5 42 L34.5 46 L42 38"
            fill="none"
            stroke={center}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'flame': // 持之以恒 · 不灭之焰（完成 10 次签到）
      return (
        <>
          <path
            d="M36 27 C 41 33 44 37 44 42.5 C 44 47.7 40.4 51 36 51 C 31.6 51 28 47.7 28 42.5 C 28 39 29.8 36.6 31.6 34.4 C 31.8 37.6 33.2 39 34.4 39.4 C 34 34.6 34.2 30.6 36 27 Z"
            fill={deep}
          />
          <path
            d="M36 39 C 38.4 41.6 39.4 43.4 39.4 45.6 C 39.4 47.9 38 49.4 36 49.4 C 34 49.4 32.8 47.9 32.8 46 C 32.8 44 34.2 43 35 41.4 C 35.2 42.3 35.6 42.5 36 42.3 Z"
            fill={center}
            opacity={0.6}
          />
        </>
      );
    default:
      return <circle cx={36} cy={38} r={8} fill={deep} />;
  }
}

export interface BadgeMedalProps {
  /** emblem 代码，对应后端 badge.iconUrl */
  emblem: string;
  rarity: BadgeRarity;
  /** 像素宽，默认 64 */
  size?: number;
  /** 未获得时整体置灰 */
  earned?: boolean;
}

/** 拟物奖牌：绶带 + 金属圆牌 + 稀有度配色 + 图案。 */
export function BadgeMedal({ emblem, rarity, size = 64, earned = true }: BadgeMedalProps) {
  const rawId = useId();
  const gid = `medal-${rawId.replace(/:/g, '')}`;
  const c = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;
  return (
    <svg
      width={size}
      height={(size * 66) / 72}
      viewBox="0 0 72 66"
      role="img"
      aria-label={`${rarity} 勋章`}
      style={{ display: 'block', filter: earned ? 'none' : 'grayscale(1) opacity(0.45)' }}
    >
      <defs>
        <radialGradient id={gid} cx="40%" cy="34%" r="72%">
          <stop offset="0" stopColor={c.center} />
          <stop offset="1" stopColor={c.edge} />
        </radialGradient>
      </defs>
      <ellipse cx={36} cy={62} rx={15} ry={2.6} fill="rgba(0,0,0,0.08)" />
      <path d="M27 6 L37 32 L31 35 L21 11 Z" fill={c.ribbon} />
      <path d="M45 6 L35 32 L41 35 L51 11 Z" fill={c.ribbon} />
      <circle cx={36} cy={38} r={20} fill={`url(#${gid})`} stroke={c.ribbon} strokeWidth={1.4} />
      <circle cx={36} cy={38} r={15} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.3} />
      <Emblem code={emblem} deep={c.deep} center={c.center} />
    </svg>
  );
}
