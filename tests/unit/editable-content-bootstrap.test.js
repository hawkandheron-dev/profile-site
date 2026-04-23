/**
 * Integration tests for the editable-content.js bootstrap chain.
 *
 * editable-content.js is a classic-script IIFE. We exercise it by reading
 * the file from disk, executing it in jsdom, and asserting on DOM + spies.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as authHelpers from '../../auth-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const editableContentSrc = fs.readFileSync(
  path.resolve(__dirname, '../../editable-content.js'),
  'utf-8'
);

/** Minimal Supabase client stub. Lets the caller customise the order() promise
 *  so we can simulate a slow / hung CMS fetch. */
function makeSupabaseStub({ orderImpl } = {}) {
  const order = orderImpl ?? (async () => ({ data: [], error: null }));
  return {
    createClient: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({ order }),
        }),
      }),
    }),
  };
}

function loadEditableContent() {
  // Execute the IIFE in the jsdom global scope. The script's references
  // to `window`, `document`, etc. resolve via the jsdom globals exposed
  // by vitest's environment.
  // eslint-disable-next-line no-new-func
  new Function(editableContentSrc)();
}

function resetGlobals() {
  document.documentElement.dataset.page = 'home';
  document.body.innerHTML = '<nav class="top-nav"></nav>';
  delete window.SUPABASE_URL;
  delete window.SUPABASE_ANON_KEY;
  delete window.CLERK_PUBLISHABLE_KEY;
  delete window.supabase;
  delete window.Clerk;
  window.__authHelpers = authHelpers;
}

describe('editable-content bootstrap', () => {
  let errorSpy;

  beforeEach(() => {
    resetGlobals();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('mounts a disabled "Sign-in unavailable" button when CLERK_PUBLISHABLE_KEY is empty', async () => {
    window.SUPABASE_URL = 'https://x.supabase.co';
    window.SUPABASE_ANON_KEY = 'anon';
    window.CLERK_PUBLISHABLE_KEY = '';
    window.supabase = makeSupabaseStub();

    loadEditableContent();
    await new Promise((r) => setTimeout(r, 100));

    const btn = document.querySelector('#ec-sign-in-btn');
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Sign-in unavailable');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('CLERK_PUBLISHABLE_KEY missing')
    );
  });

  // Regression test for the parallel-init hardening. With the old serial
  // bootstrap (await fetchAndRender; await initClerk), the auth button
  // would not mount until the CMS query resolved. Here we leave the CMS
  // promise pending forever and assert the auth UI mounts anyway.
  it('mounts auth UI immediately even when the Supabase content fetch hangs', async () => {
    window.SUPABASE_URL = 'https://x.supabase.co';
    window.SUPABASE_ANON_KEY = 'anon';
    window.CLERK_PUBLISHABLE_KEY = ''; // → mountAuthUnavailableUI synchronously
    window.supabase = makeSupabaseStub({
      orderImpl: () => new Promise(() => {}), // never resolves
    });

    loadEditableContent();
    await new Promise((r) => setTimeout(r, 50));

    // If init() were still serializing fetchAndRender → initClerk, this
    // assertion would fail because the never-resolving promise would
    // block initClerk from running.
    expect(document.querySelector('#ec-sign-in-btn')).toBeTruthy();
  });

  it('mounts a disabled button + logs an error when waitForConfig times out', async () => {
    // SUPABASE_URL / SUPABASE_ANON_KEY intentionally not set.
    // Override the helpers to use a tiny timeout so the test is fast.
    window.__authHelpers = {
      ...authHelpers,
      waitForConfig: () => authHelpers.waitForConfig({
        timeoutMs: 30,
        intervalMs: 5,
      }),
    };

    loadEditableContent();
    await new Promise((r) => setTimeout(r, 80));

    const btn = document.querySelector('#ec-sign-in-btn');
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
    expect(btn.title).toMatch(/Site config unavailable/);
    const allArgs = errorSpy.mock.calls.flat().join(' ');
    expect(allArgs).toMatch(/Supabase config not loaded/);
  });
});
