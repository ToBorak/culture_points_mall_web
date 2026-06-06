import type { Meta, StoryObj } from '@storybook/react';
import { TrendIndicator } from './TrendIndicator.tsx';

const meta: Meta<typeof TrendIndicator> = { title: 'Components/TrendIndicator', component: TrendIndicator };
export default meta;
type Story = StoryObj<typeof TrendIndicator>;

export const Up: Story = { args: { value: 3 } };
export const Down: Story = { args: { value: -2 } };
export const Flat: Story = { args: { value: 0 } };
