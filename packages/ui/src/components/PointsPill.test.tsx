import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PointsPill } from './PointsPill.tsx';

describe('PointsPill', () => {
  it('renders the formatted point value', () => {
    render(<PointsPill value={1280} />);
    expect(screen.getByText('1,280')).toBeTruthy();
  });
});
