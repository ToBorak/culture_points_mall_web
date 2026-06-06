import { useBreakpoint } from '@cpm/ui';
import { LeaderboardDesktop } from './LeaderboardDesktop';
import { LeaderboardMobile } from './LeaderboardMobile';
import { useLeaderboardState } from './useLeaderboardState';

export function LeaderboardPage() {
  const state = useLeaderboardState();
  const { isDesktop } = useBreakpoint();
  return isDesktop ? <LeaderboardDesktop {...state} /> : <LeaderboardMobile {...state} />;
}
