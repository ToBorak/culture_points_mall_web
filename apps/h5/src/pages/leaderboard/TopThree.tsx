import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shout, Panel } from '@cpm/ui';

interface Entry { rank: number; name: string; avatarUrl: string; score: number }

export function TopThree({ entries }: { entries: Entry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.podium-item', {
        y: 80, opacity: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.15,
      });
    }, ref);
    return () => ctx.revert();
  }, [entries]);

  const [first, second, third] = [entries[0], entries[1], entries[2]];
  const item = (e: Entry | undefined, color: 'yellow' | 'pink' | 'green', h: number) =>
    e ? (
      <div className="podium-item flex flex-col items-center" style={{ flex: 1 }}>
        <img src={e.avatarUrl} alt={e.name} className="w-16 h-16 rounded-full border-3 border-ink bg-paper" />
        <div className="font-kuaile mt-2">{e.name}</div>
        <Shout tone={color} rotation={0}>{e.score} 分</Shout>
        <div
          className="w-full mt-2 border-3 border-ink rounded-t-lg flex items-center justify-center font-bangers text-3xl"
          style={{ height: h, background: `var(--cpm-${color})` }}
        >
          #{e.rank}
        </div>
      </div>
    ) : (
      <div className="podium-item" style={{ flex: 1 }} />
    );

  return (
    <Panel shadow="yellow" className="overflow-hidden">
      <div ref={ref} className="flex items-end gap-3 h-72">
        {item(second, 'pink', 120)}
        {item(first, 'yellow', 180)}
        {item(third, 'green', 90)}
      </div>
    </Panel>
  );
}
