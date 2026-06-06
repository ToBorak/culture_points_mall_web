import { useEffect, useState } from 'react';

export const DESKTOP_MIN = 1024;

export interface Breakpoint {
  width: number;
  isDesktop: boolean;
  isMobile: boolean;
}

export function useBreakpoint(): Breakpoint {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 0 : window.innerWidth));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { width, isDesktop: width >= DESKTOP_MIN, isMobile: width < DESKTOP_MIN };
}
