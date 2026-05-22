import type { Meta, StoryObj } from '@storybook/react';
import { Shout } from './Shout';

const meta: Meta<typeof Shout> = { title: 'Primitives/Shout', component: Shout };
export default meta;
type Story = StoryObj<typeof Shout>;

export const Yellow: Story = { render: () => <Shout>BANG!</Shout> };
export const Red: Story = { render: () => <Shout tone="red">POW!</Shout> };
export const Blue: Story = { render: () => <Shout tone="blue">WOW!</Shout> };
export const Pink: Story = { render: () => <Shout tone="pink">BOOM!</Shout> };
