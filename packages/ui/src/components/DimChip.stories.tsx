import type { Meta, StoryObj } from '@storybook/react';
import { DimChip } from './DimChip';

const meta: Meta<typeof DimChip> = { title: 'Components/DimChip', component: DimChip };
export default meta;
type Story = StoryObj<typeof DimChip>;

export const CustomerFirst: Story = { args: { code: 'customer_first', name: '客户至上' } };
export const Active: Story = { args: { code: 'team_collab', name: '团队协作', active: true } };
