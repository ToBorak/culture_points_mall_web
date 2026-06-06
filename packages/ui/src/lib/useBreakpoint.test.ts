import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBreakpoint } from './useBreakpoint.ts';

function setWidth(w: number) {
  (window as unknown as { innerWidth: number }).innerWidth = w;
  window.dispatchEvent(new Event('resize'));
}

describe('useBreakpoint', () => {
  it('is mobile below 1024', () => {
    const { result } = renderHook(() => useBreakpoint());
    act(() => setWidth(390));
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });
  it('is desktop at/above 1024', () => {
    const { result } = renderHook(() => useBreakpoint());
    act(() => setWidth(1280));
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });
});
