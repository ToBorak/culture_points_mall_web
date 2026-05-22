import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';

const meta: Meta<typeof Panel> = { title: 'Primitives/Panel', component: Panel };
export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  render: () => (
    <Panel><h3>这是默认 Panel</h3><p>黑边粗描 + 偏移阴影。</p></Panel>
  ),
};

export const RedShadow: Story = {
  render: () => (
    <Panel shadow="red"><h3>红色阴影</h3></Panel>
  ),
};

export const YellowShadow: Story = {
  render: () => (
    <Panel shadow="yellow"><h3>黄色阴影</h3></Panel>
  ),
};
