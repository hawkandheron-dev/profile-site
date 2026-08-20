/**
 * Smoke coverage for CH Timeline 2.0.
 *
 * The fixture is deliberately tiny — one figure per layer, one emperor, one
 * movement, one council, one text — which is enough to exercise the three
 * things 2.0 does differently from the 1.0 pages it merges:
 *
 *   1. white ground with a parallax field instead of the manuscript photo
 *   2. eras as colour only, derived from dates, with no period brackets
 *   3. a background layer that is blurred until focused, and a detail panel
 *      that docks beside the timeline rather than covering it
 */
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installConfigMock, installClerkMock, installSupabaseTableMock } from './fixtures.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const person = (id, name, birth, death, role, extra = {}) => ({
  person_id: id,
  name,
  birth_date: `0${birth}-01-01`,
  death_date: `0${death}-01-01`,
  birth_year: birth,
  death_year: death,
  location: 'Alexandria',
  role_type: 'person',
  // Deliberately stale: 2.0 derives the era from dates and ignores this.
  era_id: 'era-monks-missionaries',
  is_monarch: false,
  monarch_type: null,
  doctrinal_role: role,
  description: `${name} — test fixture.`,
  reference_url: 'https://example.invalid/',
  ...extra,
});

const TABLES = {
  CH_People: [
    // Front layer: a plain figure and a defender.
    person('athanasius', 'Athanasius', 296, 373, 'defender'),
    person('gregory-nyssa', 'Gregory of Nyssa', 335, 395, null),
    // Foreground figure in a much later era, to prove the date-derived remap.
    person('aquinas', 'Thomas Aquinas', 1225, 1274, null),
    // Back layer: a heresiarch, a contested figure and an emperor.
    person('arius', 'Arius', 256, 336, 'heresiarch'),
    person('origen', 'Origen', 185, 254, 'contested'),
    person('roman-constantius-2', 'Constantius II', 317, 361, 'emperor-arianizing', {
      role_type: 'emperor',
      is_monarch: true,
      monarch_type: 'roman-unified',
      era_id: null,
      reign_start_year: 337,
      reign_end_year: 361,
    }),
  ],
  CH_Events: [
    {
      event_id: 'council-nicaea', name: 'Council of Nicaea', event_type: 'council',
      event_date: '0325-01-01', end_date: null, location: 'Nicaea',
      description: 'Test fixture.', reference_url: 'https://example.invalid/',
    },
    {
      event_id: 'doc-on-incarnation', name: 'On the Incarnation', event_type: 'document',
      event_date: '0328-01-01', end_date: null, location: 'Alexandria',
      description: 'Test fixture.', reference_url: null,
    },
  ],
  CH_Movements: [
    {
      movement_id: 'mov-arianism', name: 'Arianism', kind: 'heresy',
      start_year: 318, end_year: 381, color: '#c62828',
      description: 'Test fixture.', reference_url: 'https://example.invalid/',
    },
  ],
  CH_Movement_Figures: [
    { id: 1, movement_id: 'mov-arianism', person_id: 'arius', role: 'founder' },
    { id: 2, movement_id: 'mov-arianism', person_id: 'athanasius', role: 'opponent' },
  ],
  CH_Movement_Events: [
    { id: 1, movement_id: 'mov-arianism', event_id: 'council-nicaea', relation: 'condemned_at' },
  ],
  CH_Connections: [
    { connection_id: 1, person_id_1: 'athanasius', person_id_2: 'arius', connection_type: 'opposed' },
  ],
  CH_EventConnections: [
    { id: 1, event_id: 'council-nicaea', person_id: 'athanasius' },
  ],
  CH_Sources: [],
  CH_Source_Figures: [],
  CH_Works: [],
  CH_TourScenes: [],
};

async function loadPage(page, { viewport = { width: 1400, height: 900 }, mobile = false } = {}) {
  await installConfigMock(page, { clerkKey: '' });
  await installClerkMock(page);
  await installSupabaseTableMock(page, TABLES);
  await page.setViewportSize(viewport);
  const response = await page.goto('/apps/church-history-2.html');
  expect(response?.status()).toBe(200);

  // Desktop draws to canvas; mobile is a DOM swimlane.
  await expect(page.locator(mobile ? '.mobile-timeline' : 'canvas').first())
    .toBeVisible({ timeout: 15_000 });

  // The tour's welcome dialog covers the page on a first visit and would
  // swallow every click below. Dismissing it is what a reader does too.
  const skip = page.locator('.welcome-btn-secondary');
  if (await skip.count()) {
    await skip.click();
    await expect(page.locator('.welcome-overlay')).toHaveCount(0);
  }
}

test.describe('CH Timeline 2.0', () => {
  test.beforeEach(() => {
    const built = path.join(REPO_ROOT, 'apps/church-history-2.html');
    test.skip(!fs.existsSync(built), 'apps/ not built — run `npm run build` first');
  });

  test('renders on white with the parallax field and no manuscript', async ({ page }) => {
    await loadPage(page);

    await expect(page.getByText(/^Error:/)).toHaveCount(0);
    // The manuscript layer is 1.0's; 2.0 must not carry it.
    await expect(page.locator('.timeline-bg-image')).toHaveCount(0);
    await expect(page.locator('.ch2-parallax')).toBeVisible();
    // Far, mid, near vertical rules plus one horizontal stratum.
    await expect(page.locator('.ch2-parallax-stratum')).toHaveCount(4);

    const bg = await page.locator('.timeline-container').evaluate(
      el => getComputedStyle(el).backgroundColor
    );
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('legend shows the remapped eras and the background key, not periods', async ({ page }) => {
    await loadPage(page);

    for (const label of [
      'The Apostolic Age',
      'The Ante-Nicene Age',
      'The First Four Councils',
      'Early Middle Ages',
      'High Middle Ages',
      'Late Middle Ages',
      'Renaissance & Reformation',
      'Age of Enlightenment',
      'Modern Era',
    ]) {
      await expect(page.locator('.legend-item', { hasText: label }).first()).toBeVisible();
    }

    // The two sections the long legend is split into.
    const headings = page.locator('.legend-section-heading');
    expect((await headings.allTextContents()).map(s => s.trim())).toEqual(['Eras', 'Background']);

    // Background key.
    for (const label of ['Emperors & monarchs', 'Heresiarchs', 'Contested figures', 'Movements & schisms']) {
      await expect(page.locator('.legend-item', { hasText: label }).first()).toBeVisible();
    }

    // 1.0's generic "Period" row is gone — eras no longer draw as brackets.
    await expect(page.locator('.legend-item').filter({ hasText: /^Period$/ })).toHaveCount(0);
  });

  test('the background layer is blurred and non-interactive at rest', async ({ page }) => {
    await loadPage(page);

    const wash = page.locator('.ch2-layer-wash');
    await expect(wash).toBeVisible();

    const style = await wash.evaluate(el => {
      const cs = getComputedStyle(el);
      return { filter: cs.filter, opacity: Number(cs.opacity), pointerEvents: cs.pointerEvents };
    });
    expect(style.filter).toContain('blur');
    expect(style.opacity).toBeLessThan(1);
    expect(style.pointerEvents).toBe('none');

    // Nothing is focused yet, so the crisp overlay is not mounted.
    await expect(page.locator('.ch2-layer-focus')).toHaveCount(0);
  });

  test('the depth control lifts the whole background layer', async ({ page }) => {
    await loadPage(page);

    const wash = page.locator('.ch2-layer-wash');
    // The filter is transitioned, so poll rather than sampling mid-animation.
    const blurPx = () => wash.evaluate(el => {
      const match = /blur\(([\d.]+)px\)/.exec(getComputedStyle(el).filter);
      return match ? Number(match[1]) : null;
    });
    expect(await blurPx()).toBeGreaterThan(1);

    await page.locator('.depth-btn', { hasText: 'Front' }).click();
    await expect.poll(blurPx, { timeout: 3000 }).toBe(0);

    await page.locator('.depth-btn', { hasText: 'Off' }).click();
    await expect(wash).toHaveCount(0);

    await page.locator('.depth-btn', { hasText: 'Soft' }).click();
    await expect(page.locator('.ch2-layer-wash')).toBeVisible();
  });

  test('selecting a figure docks the detail panel beside a live timeline', async ({ page }) => {
    await loadPage(page);

    const container = page.locator('.timeline-container');
    const widthBefore = (await container.boundingBox()).width;

    // Reach the figure through search rather than hunting for it on canvas.
    const search = page.locator('.timeline-search input').first();
    await search.fill('Athanasius');
    await page.locator('.timeline-search-option', { hasText: 'Athanasius' }).first().click();

    const panel = page.locator('.timeline-modal--panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.modal-title')).toContainText('Athanasius');

    // A docked panel takes width from the row; a modal would have covered it.
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    const widthAfter = (await container.boundingBox()).width;
    expect(widthAfter).toBeLessThan(widthBefore);

    // The timeline stays live — a centred modal freezes it with this class.
    await expect(page.locator('body.modal-open')).toHaveCount(0);

    // Athanasius's background is now in focus: his opponent, his movement and
    // the council he is tied to are drawn crisp on the focus layer.
    await expect(page.locator('.ch2-layer-focus')).toBeVisible();

    // Closing gives the width back.
    await page.locator('.modal-close').click();
    await expect(panel).toHaveCount(0);
    expect((await container.boundingBox()).width).toBeCloseTo(widthBefore, 0);
  });

  test('search reaches both layers', async ({ page }) => {
    await loadPage(page);
    const search = page.locator('.timeline-search input').first();

    // Foreground
    await search.fill('Gregory');
    await expect(page.locator('.timeline-search-option', { hasText: 'Gregory of Nyssa' }).first()).toBeVisible();

    // Background: an emperor, a heresiarch and a movement
    await search.fill('Constantius');
    await expect(page.locator('.timeline-search-option', { hasText: 'Constantius II' }).first()).toBeVisible();

    await search.fill('Arius');
    await expect(page.locator('.timeline-search-option', { hasText: 'Arius' }).first()).toBeVisible();

    await search.fill('Arianism');
    await expect(page.locator('.timeline-search-option', { hasText: 'Arianism' }).first()).toBeVisible();
  });

  test('mobile falls back to the 1.0 swimlane', async ({ page }) => {
    await loadPage(page, { viewport: { width: 390, height: 844 }, mobile: true });

    await expect(page.locator('.mobile-timeline')).toBeVisible();
    // No depth stack on mobile — the background layer is a desktop affordance.
    await expect(page.locator('.ch2-layer-wash')).toHaveCount(0);
    await expect(page.locator('.ch2-parallax')).toHaveCount(0);
  });
});
