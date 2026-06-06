import { describe, expect, it } from 'vitest';
import { levelOf } from './level.ts';

describe('levelOf', () => {
  it('tiers by total score', () => {
    expect(levelOf(0).tier).toBe('L1');
    expect(levelOf(99).tier).toBe('L1');
    expect(levelOf(120).tier).toBe('L2');
    expect(levelOf(800).tier).toBe('L3');
    expect(levelOf(2000).tier).toBe('L4');
  });
  it('exposes next threshold (null at top tier)', () => {
    expect(levelOf(0).next).toBe(100);
    expect(levelOf(2000).next).toBeNull();
  });
});
