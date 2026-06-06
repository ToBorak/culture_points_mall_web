import type { PointTransaction } from '@cpm/types';
import type { Meta, StoryObj } from '@storybook/react';
import { PointLedgerRow } from './PointLedgerRow.tsx';

const tx = (amount: number, reason: string, dimensionCode: string): PointTransaction => ({
  id: amount,
  dimensionId: 1,
  dimensionCode,
  amount,
  reason,
  activityId: null,
  createdAt: '2026-06-01 10:00',
});

const meta: Meta<typeof PointLedgerRow> = {
  title: 'Components/PointLedgerRow',
  component: PointLedgerRow,
  decorators: [
    (Story) => (
      <div style={{ width: 360, background: 'var(--cpm-app-bg)', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof PointLedgerRow>;

export const Earn: Story = { args: { tx: tx(30, '完成签到', 'growth') } };
export const Spend: Story = { args: { tx: tx(-50, '商城兑换盲盒', 'customer_first') } };
