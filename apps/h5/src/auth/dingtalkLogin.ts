import axios from 'axios';
import dd from 'dingtalk-jsapi';

interface LoginResp {
  token: string;
  userId: number;
  tenantId: number;
  name: string;
}

const DEFAULT_DING_CORP_ID = 'dingc60a7ab6b656cc8124f2f5cc6abecb85';

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

/** 是否运行在钉钉客户端内（普通浏览器为 false）。用于决定是否每次进入都走钉钉静默登录。 */
export function isInDingTalk(): boolean {
  return ddPlatform() !== 'notInDingTalk';
}

export function resolveDingCorpId(value?: string): string {
  return value?.trim() || DEFAULT_DING_CORP_ID;
}

export function formatDingAuthError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    const code = obj.errorCode ?? obj.errCode ?? obj.code;
    const msg = obj.errorMessage ?? obj.errMsg ?? obj.message;
    const parts = [];
    if (code !== undefined) parts.push(`errorCode=${String(code)}`);
    if (msg !== undefined) parts.push(String(msg));
    if (parts.length > 0) return parts.join(' ');
    try {
      return JSON.stringify(obj);
    } catch {
      return Object.prototype.toString.call(err);
    }
  }
  return String(err);
}

export async function dingtalkLogin(): Promise<LoginResp> {
  const platform = ddPlatform();
  let code: string;
  let diag = `plat=${platform}`;
  try {
    if (platform === 'notInDingTalk') throw new Error('notInDingTalk');
    const corpId = resolveDingCorpId(import.meta.env.VITE_DING_CORP_ID);
    const result = await dd.runtime.permission.requestAuthCode({
      corpId,
    });
    if (!result?.code) {
      throw new Error(`empty authCode response: ${formatDingAuthError(result)}`);
    }
    code = result.code;
    diag += `;corpId=${corpId};authCode=ok`;
  } catch (e) {
    const reason = formatDingAuthError(e);
    if (platform !== 'notInDingTalk') {
      throw new Error(`dingtalk auth code failed: ${reason}`);
    }
    // 普通浏览器（非钉钉）→ dev 占位码（仅本地 mock 模式后端可用）
    code = `dev-${Date.now()}`;
    diag += `;fallback=${reason}`;
  }
  const { data } = await axios.post<LoginResp>('/auth/dingtalk/login', { code, _diag: diag });
  return data;
}
