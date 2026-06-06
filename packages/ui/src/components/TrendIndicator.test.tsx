import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrendIndicator } from './TrendIndicator.tsx';

describe('TrendIndicator', () => {
  it('shows up arrow for positive', () => {
    render(<TrendIndicator value={2} />);
    expect(screen.getByText('▲ 2')).toBeTruthy();
  });
  it('shows down arrow for negative', () => {
    render(<TrendIndicator value={-1} />);
    expect(screen.getByText('▼ 1')).toBeTruthy();
  });
  it('shows dash for zero', () => {
    render(<TrendIndicator value={0} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
  it('shows dash for NaN instead of "▼ NaN" (bug fix)', () => {
    render(<TrendIndicator value={Number.NaN} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
