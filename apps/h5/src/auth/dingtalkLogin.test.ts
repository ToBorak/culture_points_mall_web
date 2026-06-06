import { describe, expect, it, vi } from 'vitest';
import { formatDingAuthError, resolveDingCorpId } from './dingtalkLogin';

vi.mock('dingtalk-jsapi', () => ({
  default: {
    env: { platform: 'notInDingTalk' },
    runtime: { permission: { requestAuthCode: vi.fn() } },
  },
}));

describe('resolveDingCorpId', () => {
  it('uses the project corpId when Vite env is missing', () => {
    expect(resolveDingCorpId(undefined)).toBe('dingc60a7ab6b656cc8124f2f5cc6abecb85');
    expect(resolveDingCorpId('')).toBe('dingc60a7ab6b656cc8124f2f5cc6abecb85');
  });

  it('keeps an explicitly configured corpId', () => {
    expect(resolveDingCorpId('  ding-custom  ')).toBe('ding-custom');
  });
});

describe('formatDingAuthError', () => {
  it('formats object rejections with useful DingTalk fields', () => {
    const formatted = formatDingAuthError({ errorCode: 7, errorMessage: 'invalid corpId' });

    expect(formatted).toContain('errorCode=7');
    expect(formatted).toContain('invalid corpId');
    expect(formatted).not.toBe('[object Object]');
  });
});
