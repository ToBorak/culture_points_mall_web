import type { Meta, StoryObj } from '@storybook/react';
import { RadarChart3D } from './RadarChart3D';

const data = [
  { code: 'customer_first', name: '客户至上', score: 80, max: 200, color: '#ff9f43' },
  { code: 'team_collab', name: '团队协作', score: 120, max: 200, color: '#4facfe' },
  { code: 'innovation', name: '创新求变', score: 60, max: 200, color: '#ff7eb3' },
  { code: 'integrity', name: '诚信务实', score: 150, max: 200, color: '#6dd5a3' },
  { code: 'craftsmanship', name: '极致专注', score: 95, max: 200, color: '#a55eea' },
  { code: 'growth', name: '学习成长', score: 175, max: 200, color: '#ffd93d' },
];

const meta: Meta<typeof RadarChart3D> = { title: 'Components/RadarChart3D', component: RadarChart3D };
export default meta;
type Story = StoryObj<typeof RadarChart3D>;

export const Demo: Story = { render: () => <RadarChart3D data={data} /> };
