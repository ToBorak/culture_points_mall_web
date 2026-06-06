import type { LeaderboardEntry } from '@cpm/types';
import type { Meta, StoryObj } from '@storybook/react';
import { PodiumTop3 } from './PodiumTop3.tsx';

const mk = (rank: number, name: string, score: number): LeaderboardEntry => ({
  rank,
  userId: rank,
  name,
  avatarUrl: '',
  deptName: '',
  score,
  trend: 0,
});

const meta: Meta<typeof PodiumTop3> = { title: 'Components/PodiumTop3', component: PodiumTop3 };
export default meta;
type Story = StoryObj<typeof PodiumTop3>;

export const Default: Story = {
  args: { entries: [mk(1, '王梓涵', 2860), mk(2, '李思远', 2540), mk(3, '张一鸣', 2210)] },
  decorators: [
    (Story) => (
      <div style={{ width: 360, background: 'var(--cpm-app-bg)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
