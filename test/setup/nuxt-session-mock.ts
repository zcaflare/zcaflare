import { registerEndpoint } from '@nuxt/test-utils/runtime'

// @thecodeorigin/auth registers an async plugin (`0.session.js`) that awaits
// GET /api/_auth/session during Nuxt app init. In the Nuxt test environment
// there is no Nitro server, so the request hangs forever and `setupNuxt()`'s
// beforeAll hook times out — every nuxt-env suite fails at setup. Register an
// unauthenticated session mock so the plugin resolves immediately.
//
// This setup file also runs for files under test/nuxt/ that opt out of the
// nuxt runtime with `@vitest-environment happy-dom` (e.g. pure DOM-util tests);
// registerEndpoint throws there, so no-op unless the nuxt runtime is active.
if (typeof window !== 'undefined' && (window as unknown as { __app?: unknown }).__app)
  registerEndpoint('/api/_auth/session', () => ({ user: null }))
