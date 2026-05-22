import dd from 'dingtalk-jsapi';
import axios from 'axios';

interface LoginResp { token: string; userId: number; tenantId: number; name: string }

export async function dingtalkLogin(): Promise<LoginResp> {
  let code: string;
  if (typeof window !== 'undefined' && (window as any).dd?.runtime) {
    const result = await dd.runtime.permission.requestAuthCode({
      corpId: import.meta.env.VITE_DING_CORP_ID ?? 'mock-corp',
    });
    code = result.code;
  } else {
    code = `dev-${Date.now()}`;
  }
  const { data } = await axios.post<LoginResp>('/auth/dingtalk/login', { code });
  return data;
}
