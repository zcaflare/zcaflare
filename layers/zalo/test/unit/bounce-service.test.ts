import { $fetch } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { normalizeQrToDataUrl, phaseFromBounceStatus, resolveZaloConflict } from '#layers/zalo/server/services/bounce'

// `$fetch` binds its transport at import time, so stubbing globalThis.fetch
// never reaches it — the module itself has to be the seam.
vi.mock('ofetch', () => ({
  $fetch: Object.assign(vi.fn(), { raw: vi.fn() }),
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ bounceServerUrl: 'https://bounce.test' }),
}))

const fetchMock = vi.mocked($fetch)

describe('phaseFromBounceStatus', () => {
  it('maps authenticated', () => {
    expect(phaseFromBounceStatus('authenticated')).toBe('authenticated')
  })

  it('maps conflict, which is neither still-waiting nor done', () => {
    // Falling back to `pending` here would leave the wizard polling for a scan
    // that already happened, until it timed out — the server is waiting on the
    // user, not the other way round.
    expect(phaseFromBounceStatus('conflict')).toBe('conflict')
  })

  it.each(['expired', 'declined', 'error'])('maps %s to expired', (s) => {
    expect(phaseFromBounceStatus(s)).toBe('expired')
  })

  it.each(['pending', 'scanned', 'anything-else'])('maps %s to pending', (s) => {
    expect(phaseFromBounceStatus(s)).toBe('pending')
  })
})

describe('normalizeQrToDataUrl', () => {
  it('passes a data: URL through untouched (no network)', async () => {
    const dataUrl = 'data:image/png;base64,AAAA'
    expect(await normalizeQrToDataUrl(dataUrl)).toBe(dataUrl)
  })
})

describe('resolveZaloConflict', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: true,
      keptSessionId: 'session-old',
      callbackUrl: 'https://a.example/foo',
      removedSessionIds: ['session-new'],
      keptExisting: true,
    })
  })

  it('carries the decision to the bounce server, authenticated by the session secret', async () => {
    const result = await resolveZaloConflict('session-new', 'sekrit', false)

    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string, headers: Record<string, string>, body: unknown }]
    expect(url).toBe('https://bounce.test/api/zalo/session-new/conflict')
    expect(init.method).toBe('POST')
    expect(init.headers['x-webhook-secret']).toBe('sekrit')
    expect(init.body).toEqual({ replace: false })

    // keptExisting is what tells the caller its own session was the discarded
    // one — so it must survive the round-trip, not be inferred from `replace`.
    expect(result.keptExisting).toBe(true)
    expect(result.keptSessionId).toBe('session-old')
    expect(result.removedSessionIds).toEqual(['session-new'])
  })

  it('sends replace: true when the new webhook takes over', async () => {
    await resolveZaloConflict('session-new', 'sekrit', true)
    const [, init] = fetchMock.mock.calls[0] as [string, { body: unknown }]
    expect(init.body).toEqual({ replace: true })
  })
})
