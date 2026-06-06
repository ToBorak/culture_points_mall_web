import type { Meta, StoryObj } from '@storybook/react';
import { Gift, Target, Trophy, User } from 'lucide-react';
import { BottomTabBar } from './BottomTabBar.tsx';

const items = [
  { key: 'leaderboard', label: '排行榜', icon: <Trophy size={22} /> },
  { key: 'activities', label: '活动', icon: <Target size={22} /> },
  { key: 'mall', label: '商城', icon: <Gift size={22} /> },
  { key: 'me', label: '我的', icon: <User size={22} /> },
];

const meta: Meta<typeof BottomTabBar> = { title: 'Components/BottomTabBar', component: BottomTabBar };
export default meta;
type Story = StoryObj<typeof BottomTabBar>;

export const Default: Story = {
  args: { items, activeKey: 'leaderboard', onSelect: () => {} },
  decorators: [
    (Story) => (
      <div style={{ width: 390, border: '1px solid #eee' }}>
        <Story />
      </div>
    ),
  ],
};
