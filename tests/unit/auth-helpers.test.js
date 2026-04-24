import { describe, it, expect } from 'vitest';
import { getFrontendApi, waitForConfig } from '../../auth-helpers.js';

describe('getFrontendApi', () => {
  it('decodes a pk_test_ key to the embedded Frontend API hostname', () => {
    const host = 'clerk.test.invalid';
    const key = 'pk_test_' + btoa(host + '$');
    expect(getFrontendApi(key)).toBe(host);
  });

  it('decodes a pk_live_ key the same way', () => {
    const host = 'clerk.example.com';
    const key = 'pk_live_' + btoa(host + '$');
    expect(getFrontendApi(key)).toBe(host);
  });

  it('strips the trailing $ from the decoded hostname', () => {
    const key = 'pk_test_' + btoa('foo.bar$');
    expect(getFrontendApi(key)).toBe('foo.bar');
  });

  it('returns the decoded value unchanged when no trailing $ is present', () => {
    const key = 'pk_test_' + btoa('foo.bar');
    expect(getFrontendApi(key)).toBe('foo.bar');
  });
});

describe('waitForConfig', () => {
  it('resolves when getGlobals returns both url and key before timeout', async () => {
    let calls = 0;
    const start = Date.now();
    await expect(
      waitForConfig({
        timeoutMs: 500,
        intervalMs: 10,
        getGlobals: () => {
          calls++;
          return calls >= 3
            ? { url: 'https://x.supabase.co', key: 'anon' }
            : { url: undefined, key: undefined };
        },
      })
    ).resolves.toBeUndefined();
    // Should have resolved well before the timeout
    expect(Date.now() - start).toBeLessThan(300);
  });

  it('rejects with a helpful error after timeout when globals never appear', async () => {
    await expect(
      waitForConfig({
        timeoutMs: 80,
        intervalMs: 20,
        getGlobals: () => ({ url: undefined, key: undefined }),
      })
    ).rejects.toThrow(/Supabase config not loaded within 80ms/);
  });

  it('rejects when only url is set (key missing)', async () => {
    await expect(
      waitForConfig({
        timeoutMs: 60,
        intervalMs: 20,
        getGlobals: () => ({ url: 'https://x.supabase.co', key: '' }),
      })
    ).rejects.toThrow(/Supabase config not loaded/);
  });

  it('rejects when only key is set (url missing)', async () => {
    await expect(
      waitForConfig({
        timeoutMs: 60,
        intervalMs: 20,
        getGlobals: () => ({ url: '', key: 'anon' }),
      })
    ).rejects.toThrow(/Supabase config not loaded/);
  });
});
