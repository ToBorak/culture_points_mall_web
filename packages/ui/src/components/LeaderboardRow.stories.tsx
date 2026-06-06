import type { LeaderboardEntry } from '@cpm/types';
import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardRow } from './LeaderboardRow.tsx';

const base: LeaderboardEntry = {
  rank: 4,
  userId: 4,
  name: '陈嘉怡',
  avatarUrl: '',
  deptName: '市场部',
  score: 2040,
  trend: 2,
};

const meta: Meta<typeof LeaderboardRow> = {
  title: 'Components/LeaderboardRow',
  component: LeaderboardRow,
  decorators: [
    (Story) => (
      <div style={{ width: 360, background: 'var(--cpm-app-bg)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LeaderboardRow>;

export const Default: Story = { args: { entry: base } };
export const Champion: Story = { args: { entry: { ...base, rank: 1, name: '王梓涵', trend: 1 } } };
export const You: Story = { args: { entry: { ...base, rank: 12, name: '徐东' }, highlight: true } };
