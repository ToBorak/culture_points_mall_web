import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar.tsx';

const meta: Meta<typeof Avatar> = { title: 'Components/Avatar', component: Avatar };
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initial: Story = { args: { name: '王梓涵', size: 56 } };
export const WithImage: Story = { args: { name: '李四', avatarUrl: 'https://i.pravatar.cc/100', size: 56 } };
