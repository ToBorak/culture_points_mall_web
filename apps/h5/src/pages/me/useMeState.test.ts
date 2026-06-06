import { meProfileQueryKey } from '@cpm/api-client';
import { describe, expect, it } from 'vitest';

describe('me profile query key', () => {
  it('is scoped by the logged-in user id', () => {
    expect(meProfileQueryKey(12)).toEqual(['me', 'profile', 12]);
    expect(meProfileQueryKey(null)).toEqual(['me', 'profile', 'anonymous']);
  });
});
