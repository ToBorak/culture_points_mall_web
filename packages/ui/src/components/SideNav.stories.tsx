import type { Meta, StoryObj } from '@storybook/react';
import { Gift, Target, Trophy, User } from 'lucide-react';
import { SideNav } from './SideNav.tsx';

const items = [
  { key: 'leaderboard', label: '排行榜', icon: <Trophy size={20} /> },
  { key: 'activities', label: '活动', icon: <Target size={20} /> },
  { key: 'mall', label: '商城', icon: <Gift size={20} /> },
  { key: 'me', label: '我的', icon: <User size={20} /> },
];

const meta: Meta<typeof SideNav> = { title: 'Components/SideNav', component: SideNav };
export default meta;
type Story = StoryObj<typeof SideNav>;

export const Default: Story = {
  args: { items, activeKey: 'leaderboard', onSelect: () => {} },
  decorators: [
    (Story) => (
      <div style={{ height: 520, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};
