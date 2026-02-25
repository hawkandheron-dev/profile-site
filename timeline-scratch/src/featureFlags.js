/**
 * Feature flags.
 *
 * Flip a flag by setting the corresponding VITE_* env variable to "true"
 * (e.g. in .env.local or your hosting dashboard) and restarting the dev server.
 *
 * In code:  import { SHOW_TERRITORIES } from '../featureFlags.js';
 */

/** Show tribal-territory polygon overlays on the Bible Atlas map. */
export const SHOW_TERRITORIES =
  import.meta.env.VITE_ENABLE_TERRITORIES === 'true';
