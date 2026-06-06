import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl.tsx';

const meta: Meta<typeof SegmentedControl> = { title: 'Components/SegmentedControl', component: SegmentedControl };
export default meta;

export const Default: StoryObj<typeof SegmentedControl> = {
  args: {
    items: [
      { key: 'total', label: '总榜' },
      { key: 'dim', label: '维度榜' },
      { key: 'dept', label: '部门榜' },
    ],
    value: 'total',
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};
