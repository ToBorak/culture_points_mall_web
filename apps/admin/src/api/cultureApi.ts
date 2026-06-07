import axios from 'axios';

function authHeaders() {
  const token = localStorage.getItem('cpm_admin_jwt');
  return { Authorization: `Bearer ${token}` };
}

export const cultureApi = {
  // stars
  listSeasons: () => axios.get('/admin/stars/seasons', { headers: authHeaders() }).then((r) => r.data.items ?? []),
  createSeason: (body: { name: string; quarterCode: string }) =>
    axios.post('/admin/stars/seasons', body, { headers: authHeaders() }).then((r) => r.data),
  advanceSeason: (id: number, status: string) =>
    axios.put(`/admin/stars/seasons/${id}/status`, { status }, { headers: authHeaders() }),
  listNominations: (seasonId: number) =>
    axios
      .get(`/admin/stars/seasons/${seasonId}/nominations`, { headers: authHeaders() })
      .then((r) => r.data.items ?? []),
  scoreNomination: (seasonId: number, nominationId: number, score: number) =>
    axios.post(`/admin/stars/nominations/${nominationId}/score`, { seasonId, score }, { headers: authHeaders() }),
  selectWinners: (
    seasonId: number,
    picks: Array<{
      userId: number;
      dimensionId: number;
      sourceNominationId?: number;
      citation?: string;
    }>,
  ) => axios.post(`/admin/stars/seasons/${seasonId}/select`, { picks }, { headers: authHeaders() }),
  aiDigest: (seasonId: number) =>
    axios.post(`/admin/stars/seasons/${seasonId}/ai-digest`, {}, { headers: authHeaders() }).then((r) => r.data),
  // publications
  listPublications: () => axios.get('/admin/publications', { headers: authHeaders() }).then((r) => r.data.items ?? []),
  getPublication: (id: number) =>
    axios.get(`/admin/publications/${id}`, { headers: authHeaders() }).then((r) => r.data),
  createPublication: (body: { title: string; periodCode: string; seasonId?: number }) =>
    axios.post('/admin/publications', body, { headers: authHeaders() }).then((r) => r.data),
  configureSections: (
    id: number,
    sections: Array<{ type: string; title: string; sortOrder: number; visible: boolean }>,
  ) => axios.put(`/admin/publications/${id}/sections`, { sections }, { headers: authHeaders() }),
  aggregate: (id: number) => axios.post(`/admin/publications/${id}/aggregate`, {}, { headers: authHeaders() }),
  aiCompose: (id: number) => axios.post(`/admin/publications/${id}/ai-compose`, {}, { headers: authHeaders() }),
  aiCases: (id: number) =>
    axios.post(`/admin/publications/${id}/ai-cases`, {}, { headers: authHeaders() }).then((r) => r.data),
  upsertArticle: (id: number, body: Record<string, unknown>) =>
    axios.post(`/admin/publications/${id}/articles`, body, { headers: authHeaders() }).then((r) => r.data),
  publish: (id: number) => axios.post(`/admin/publications/${id}/publish`, {}, { headers: authHeaders() }),
  pushDingtalk: (id: number, groupId: string) =>
    axios.post(`/admin/publications/${id}/push-dingtalk`, { groupId }, { headers: authHeaders() }),
  // 辅助
  dimensions: () => axios.get('/api/v1/values/dimensions', { headers: authHeaders() }).then((r) => r.data.items ?? []),
  robots: () =>
    axios.get('/admin/dingtalk/robots', { headers: authHeaders() }).then((r) => r.data.items ?? r.data ?? []),
};
