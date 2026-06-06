import type { Meta, StoryObj } from '@storybook/react';
import { PointsPill } from './PointsPill.tsx';

const meta: Meta<typeof PointsPill> = { title: 'Components/PointsPill', component: PointsPill };
export default meta;
type Story = StoryObj<typeof PointsPill>;

export const Default: Story = { args: { value: 1280 } };
export const Large: Story = { args: { value: 28600 } };
