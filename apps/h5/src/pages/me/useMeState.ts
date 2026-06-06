import { useMyBadges, useMyTransactions, usePassport } from '@cpm/api-client';
import type { Badge, DimensionScore, PointTransaction } from '@cpm/types';
import { useAuth } from '../../store/auth';

export interface MeState {
  name: string;
  total: number;
  badgeCount: number;
  dims: DimensionScore[];
  badges: Badge[];
  txItems: PointTransaction[];
  txQ: ReturnType<typeof useMyTransactions>;
  p: ReturnType<typeof usePassport>;
  b: ReturnType<typeof useMyBadges>;
}

export function useMeState(): MeState {
  const p = usePassport();
  const b = useMyBadges();
  const txQ = useMyTransactions(20);
  const name = useAuth((s) => s.name) ?? '伙伴';

  const total = p.data?.totalScore ?? 0;
  const badgeCount = p.data?.badgeCount ?? 0;
  const dims = p.data?.scoresByDimension ?? [];
  const badges = b.data?.items ?? [];
  const txItems = (txQ.data?.pages ?? []).flatMap((pg) => pg.items);

  return { name, total, badgeCount, dims, badges, txItems, txQ, p, b };
}
