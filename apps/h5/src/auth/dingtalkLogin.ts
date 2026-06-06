import axios from 'axios';
import dd from 'dingtalk-jsapi';

interface LoginResp {
  token: string;
  userId: number;
  tenantId: number;
  name: string;
}

// 读取钉钉 SDK 检测到的运行环境（普通浏览器为 'notInDingTalk'）。
// 注意：要用 SDK 自带的 dd.env.platform 判断，不能用 window.dd —— SDK 是模块导出，
// 不一定挂到 window 上（旧写法 window.dd?.runtime 在钉钉里恒为 false，导致走 dev 兜底码）。
function ddPlatform(): string {
  try {
    return (dd as unknown as { env?: { platform?: string } }).env?.platform ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function dingtalkLogin(): Promise<LoginResp> {
  const platform = ddPlatform();
  let code: string;
  let diag = `plat=${platform}`;
  try {
    if (platform === 'notInDingTalk') throw new Error('notInDingTalk');
    const result = await dd.runtime.permission.requestAuthCode({
      corpId: import.meta.env.VITE_DING_CORP_ID ?? '',
    });
    code = result.code;
    diag += ';authCode=ok';
  } catch (e) {
    // 普通浏览器（非钉钉）或取码失败 → dev 占位码（仅本地 mock 模式后端可用）
    code = `dev-${Date.now()}`;
    diag += `;fallback=${(e as { message?: string })?.message ?? String(e)}`;
  }
  const { data } = await axios.post<LoginResp>('/auth/dingtalk/login', { code, _diag: diag });
  return data;
}
