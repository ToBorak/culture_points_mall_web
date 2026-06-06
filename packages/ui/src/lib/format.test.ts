import { describe, expect, it } from 'vitest';
import { formatPoints } from './format.ts';

describe('formatPoints', () => {
  it('adds thousands separators', () => {
    expect(formatPoints(1280)).toBe('1,280');
    expect(formatPoints(2860)).toBe('2,860');
  });
  it('handles zero and rounds', () => {
    expect(formatPoints(0)).toBe('0');
    expect(formatPoints(12.6)).toBe('13');
  });
});
