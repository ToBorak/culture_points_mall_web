import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl.tsx';

const items = [
  { key: 'total', label: '总榜' },
  { key: 'dim', label: '维度榜' },
  { key: 'dept', label: '部门榜' },
];

describe('SegmentedControl', () => {
  it('marks the active item with aria-pressed=true', () => {
    render(<SegmentedControl items={items} value="dim" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '维度榜' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '总榜' }).getAttribute('aria-pressed')).toBe('false');
  });
  it('calls onChange with the item key on click', () => {
    const fn = vi.fn();
    render(<SegmentedControl items={items} value="total" onChange={fn} />);
    screen.getByRole('button', { name: '部门榜' }).click();
    expect(fn).toHaveBeenCalledWith('dept');
  });
});
