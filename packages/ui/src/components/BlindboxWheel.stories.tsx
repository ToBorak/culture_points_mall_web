import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BlindboxWheel } from './BlindboxWheel';
import { ComicButton } from './ComicButton';

const segs = [
  { label: '未中奖', color: '#a8a8a8' },
  { label: '咖啡券', color: '#ff9f43' },
  { label: '帆布袋', color: '#4facfe' },
  { label: 'T 恤', color: '#ff7eb3' },
];

const meta: Meta<typeof BlindboxWheel> = { title: 'Components/BlindboxWheel', component: BlindboxWheel };
export default meta;
type Story = StoryObj<typeof BlindboxWheel>;

export const Demo: Story = {
  render: () => {
    const [spin, setSpin] = useState(false);
    const [idx, setIdx] = useState<number | null>(null);
    return (
      <div className="flex flex-col items-center gap-3 p-6">
        <BlindboxWheel segments={segs} spinning={spin} resultIndex={idx} onSpinEnd={() => setSpin(false)} />
        <ComicButton
          onClick={() => {
            setSpin(true);
            setIdx(Math.floor(Math.random() * segs.length));
          }}
        >
          抽！
        </ComicButton>
      </div>
    );
  },
};
