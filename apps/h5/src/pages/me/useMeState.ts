import { useMe, useMyBadges, useMyTransactions, usePassport } from '@cpm/api-client';
import type { Badge, DimensionScore, PointTransaction } from '@cpm/types';
import { useAuth } from '../../store/auth';

export interface MeState {
  name: string;
  avatarUrl: string;
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
  const me = useMe();
  const p = usePassport();
  const b = useMyBadges();
  const txQ = useMyTransactions(20);
  const fallbackName = useAuth((s) => s.name);

  const name = me.data?.name ?? fallbackName ?? '伙伴';
  const avatarUrl = me.data?.avatarUrl ?? '';
  const total = p.data?.totalScore ?? 0;
  const badgeCount = p.data?.badgeCount ?? 0;
  const dims = p.data?.scoresByDimension ?? [];
  const badges = b.data?.items ?? [];
  const txItems = (txQ.data?.pages ?? []).flatMap((pg) => pg.items);

  return { name, avatarUrl, total, badgeCount, dims, badges, txItems, txQ, p, b };
}
