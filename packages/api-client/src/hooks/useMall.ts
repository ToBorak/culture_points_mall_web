import type { MallItem, MallOrder, RedeemResult } from '@cpm/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../http';

export function useMallItems() {
  return useQuery<MallItem[]>({
    queryKey: ['mall', 'items'],
    queryFn: async () => (await http().get('/api/v1/mall/items')).data.items ?? [],
  });
}

export function useMyOrders() {
  return useQuery<MallOrder[]>({
    queryKey: ['me', 'orders'],
    queryFn: async () => (await http().get('/api/v1/me/orders')).data.items ?? [],
  });
}

/** 直接兑换非盲盒商品。成功后刷新积分余额 / 订单 / 商品库存。 */
export function useRedeemItem() {
  const qc = useQueryClient();
  return useMutation<RedeemResult, Error, number>({
    mutationFn: async (itemId) => (await http().post(`/api/v1/mall/items/${itemId}/redeem`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me', 'passport'] });
      qc.invalidateQueries({ queryKey: ['me', 'orders'] });
      qc.invalidateQueries({ queryKey: ['mall', 'items'] });
    },
  });
}
