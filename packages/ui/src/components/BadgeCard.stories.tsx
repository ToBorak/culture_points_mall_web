import type { Badge } from '@cpm/types';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgeCard } from './BadgeCard.tsx';

const mk = (name: string, rarity: Badge['rarity'], earned: boolean): Badge => ({
  id: 1,
  dimensionId: 1,
  dimensionCode: 'growth',
  name,
  rarity,
  iconUrl: '',
  earned,
  earnedAt: earned ? '2026-05-01' : null,
});

const meta: Meta<typeof BadgeCard> = {
  title: 'Components/BadgeCard',
  component: BadgeCard,
  decorators: [
    (Story) => (
      <div style={{ width: 110 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof BadgeCard>;

export const Legendary: Story = { args: { badge: mk('全勤之星', 'legendary', true) } };
export const Locked: Story = { args: { badge: mk('创新先锋', 'epic', false) } };
