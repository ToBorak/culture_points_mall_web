import { useBreakpoint } from '@cpm/ui';
import { MeDesktop } from './MeDesktop';
import { MeMobile } from './MeMobile';
import { useMeState } from './useMeState';

export function MePage() {
  const state = useMeState();
  const { isDesktop } = useBreakpoint();
  return isDesktop ? <MeDesktop {...state} /> : <MeMobile {...state} />;
}
