import type { Activity, ActivityStatus } from '@cpm/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../http';

// 兜底补齐聚合字段，避免后端尚未升级时前端读取 mine/enrolledCount 崩溃。
function normalize(a: Partial<Activity>): Activity {
  return {
    ...(a as Activity),
    enrolledCount: a.enrolledCount ?? 0,
    dimensionCode: a.dimensionCode ?? '',
    dimensionName: a.dimensionName ?? '',
    mine: a.mine ?? { enrolled: false, status: '', checkedIn: false, inCalendar: false },
  };
}

/** 活动列表（含报名人数与「我的」状态）。status 省略则返回全部。 */
export function useActivities(status?: ActivityStatus) {
  return useQuery<Activity[]>({
    queryKey: ['activities', status ?? 'all'],
    queryFn: async () => {
      const items: Partial<Activity>[] =
        (await http().get('/api/v1/activities', { params: status ? { status } : undefined })).data.items ?? [];
      return items.map(normalize);
    },
  });
}

/** 单个活动详情。 */
export function useActivity(id: number) {
  return useQuery<Activity>({
    queryKey: ['activity', id],
    queryFn: async () => normalize((await http().get(`/api/v1/activities/${id}`)).data),
    enabled: id > 0,
  });
}

/** 报名参加。成功后回写详情缓存并刷新列表。 */
export function useEnroll() {
  const qc = useQueryClient();
  return useMutation<Activity, Error, number>({
    mutationFn: async (id) => normalize((await http().post(`/api/v1/activities/${id}/enroll`)).data),
    onSuccess: (data) => {
      qc.setQueryData(['activity', data.ID], data);
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

/** 取消报名。 */
export function useUnenroll() {
  const qc = useQueryClient();
  return useMutation<Activity, Error, number>({
    mutationFn: async (id) => normalize((await http().delete(`/api/v1/activities/${id}/enroll`)).data),
    onSuccess: (data) => {
      qc.setQueryData(['activity', data.ID], data);
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
