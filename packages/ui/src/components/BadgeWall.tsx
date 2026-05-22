import { motion } from 'framer-motion';

export interface BadgeItem {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconUrl: string;
  earned: boolean;
}

const rarityGlow: Record<BadgeItem['rarity'], string> = {
  common: 'shadow-[2px_2px_0_var(--cpm-ink)]',
  rare: 'shadow-[3px_3px_0_var(--cpm-blue)]',
  epic: 'shadow-[4px_4px_0_var(--cpm-purple)]',
  legendary: 'shadow-[5px_5px_0_var(--cpm-yellow)]',
};

export function BadgeWall({ items }: { items: BadgeItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 p-2">
      {items.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 120 }}
          className={`rounded-xl border-3 border-ink bg-paper p-2 flex flex-col items-center text-center ${rarityGlow[b.rarity]}`}
          style={{ filter: b.earned ? 'none' : 'grayscale(1) opacity(0.5)' }}
        >
          <img src={b.iconUrl} alt={b.name} className="w-14 h-14" />
          <div className="text-xs font-kuaile mt-1">{b.name}</div>
        </motion.div>
      ))}
    </div>
  );
}
