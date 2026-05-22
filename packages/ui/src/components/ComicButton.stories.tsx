import type { Meta, StoryObj } from '@storybook/react';
import { ComicButton } from './ComicButton';

const meta: Meta<typeof ComicButton> = { title: 'Components/ComicButton', component: ComicButton };
export default meta;
type Story = StoryObj<typeof ComicButton>;

export const Yellow: Story = { args: { children: '抽！' } };
export const Red: Story = { args: { children: '加入', tone: 'red' } };
export const Large: Story = { args: { children: '盖章', tone: 'blue', size: 'lg' } };
