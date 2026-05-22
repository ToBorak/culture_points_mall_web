import type { Meta, StoryObj } from '@storybook/react';
import { Stamp } from './Stamp';

const meta: Meta<typeof Stamp> = { title: 'Primitives/Stamp', component: Stamp };
export default meta;
type Story = StoryObj<typeof Stamp>;

export const Red: Story = { render: () => <Stamp text="DONE" /> };
export const Blue: Story = { render: () => <Stamp text="APPROVED" color="blue" rotation={4} /> };
