import { describe, expect, it } from 'vitest'
import { normalizeQrToDataUrl, phaseFromBounceStatus } from '#layers/zalo/server/services/bounce'

describe('phaseFromBounceStatus', () => {
  it('maps authenticated', () => {
    expect(phaseFromBounceStatus('authenticated')).toBe('authenticated')
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
