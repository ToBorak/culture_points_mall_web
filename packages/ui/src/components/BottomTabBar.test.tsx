import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomTabBar, type TabItem } from './BottomTabBar.tsx';

const items: TabItem[] = [
  { key: 'leaderboard', label: '排行榜', icon: '🏆' },
  { key: 'activities', label: '活动', icon: '🎯' },
];

describe('BottomTabBar', () => {
  it('marks the active tab with aria-current=page', () => {
    render(<BottomTabBar items={items} activeKey="activities" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /活动/ }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: /排行榜/ }).getAttribute('aria-current')).toBe(null);
  });

  it('calls onSelect with the tab key on click', () => {
    const fn = vi.fn();
    render(<BottomTabBar items={items} activeKey="leaderboard" onSelect={fn} />);
    screen.getByRole('button', { name: /活动/ }).click();
    expect(fn).toHaveBeenCalledWith('activities');
  });
});
