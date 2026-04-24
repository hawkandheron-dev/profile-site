/**
 * Network mocking helpers for E2E tests.
 *
 * Everything is intercepted at the request level via Playwright's
 * page.route(); no live network is hit. The mocks are deliberately
 * minimal — just enough surface for the auth bootstrap and a basic
 * timeline-app render.
 */

// A pk_test_* key whose embedded Frontend API decodes to a hostname we
// can intercept (clerk.test.invalid). The auth-helpers.js getFrontendApi
// strips the trailing '$', leaving us with 'clerk.test.invalid'.
const TEST_CLERK_HOST = 'clerk.test.invalid';
export const TEST_CLERK_KEY = 'pk_test_' + Buffer.from(TEST_CLERK_HOST + '$').toString('base64');

const DEFAULT_SUPABASE_URL = 'https://test-project.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'test-anon-key';

/** Stubs /api/supabase-config to inject the three window globals.
 *  Pass clerkKey: '' to simulate a missing Clerk env var. */
export async function installConfigMock(page, opts = {}) {
  const url = opts.supabaseUrl ?? DEFAULT_SUPABASE_URL;
  const anonKey = opts.supabaseAnonKey ?? DEFAULT_SUPABASE_ANON_KEY;
  const clerkKey = opts.clerkKey ?? TEST_CLERK_KEY;
  const body = [
    `window.SUPABASE_URL = ${JSON.stringify(url)};`,
    `window.SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};`,
    `window.CLERK_PUBLISHABLE_KEY = ${JSON.stringify(clerkKey)};`,
  ].join('\n') + '\n';
  await page.route('**/api/supabase-config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript; charset=utf-8',
    body,
  }));
}

/** Stubs Supabase REST endpoints with empty arrays — enough for the home
 *  page bootstrap and the timeline app's initial fetch to settle. */
export async function installSupabaseMock(page) {
  await page.route('**/*.supabase.co/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: '[]',
  }));
}

/** Stubs the Clerk JS bundle. Provides the minimal surface that
 *  editable-content.js's loadClerkScript path expects: a window.Clerk
 *  with load(), user, signOut(), openSignIn(). */
export async function installClerkMock(page) {
  const stub = `
    window.Clerk = {
      load: async function () {},
      user: null,
      signOut: async function () {},
      openSignIn: function () {},
    };
  `;
  // editable-content.js loads from https://<host>/npm/@clerk/clerk-js@5/dist/clerk.browser.js
  await page.route('**/npm/@clerk/clerk-js**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: stub,
  }));
  // The React bundle (clerk-react) loads its own variant under a similar URL.
  await page.route('**/clerk.browser.js', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: stub,
  }));
}

export async function installAllMocks(page, opts = {}) {
  await installConfigMock(page, opts);
  await installSupabaseMock(page);
  await installClerkMock(page);
}
