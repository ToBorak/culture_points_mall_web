import type { PointTransaction } from '@cpm/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PointLedgerRow } from './PointLedgerRow.tsx';

const tx = (amount: number): PointTransaction => ({
  id: 1,
  dimensionId: 1,
  dimensionCode: 'growth',
  amount,
  reason: '活动加分',
  activityId: null,
  createdAt: '2026-06-01 10:00',
});

describe('PointLedgerRow', () => {
  it('shows +N for a positive amount', () => {
    render(<PointLedgerRow tx={tx(30)} />);
    expect(screen.getByText('+30')).toBeTruthy();
  });
  it('shows -N for a negative amount', () => {
    render(<PointLedgerRow tx={tx(-10)} />);
    expect(screen.getByText('-10')).toBeTruthy();
  });
});
