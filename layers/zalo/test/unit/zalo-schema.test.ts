import { describe, expect, it } from 'vitest'
import { ZaloLoginSchema } from '#layers/zalo/shared/schemas/zalo'

describe('zaloLoginSchema.callbackUrl', () => {
  it('accepts a public https URL', () => {
    expect(ZaloLoginSchema.parse({ callbackUrl: 'https://example.com/hook' }))
      .toEqual({ callbackUrl: 'https://example.com/hook' })
  })

  it.each([
    ['http (not https)', 'http://example.com/hook'],
    ['localhost', 'https://localhost/hook'],
    ['loopback ip', 'https://127.0.0.1/hook'],
    ['rfc-1918 192.168', 'https://192.168.1.10/hook'],
    ['rfc-1918 10.x', 'https://10.0.0.5/hook'],
    ['rfc-1918 172.16', 'https://172.16.0.1/hook'],
    ['link-local', 'https://169.254.1.1/hook'],
    ['not a url', 'not-a-url'],
  ])('rejects %s', (_label, callbackUrl) => {
    expect(() => ZaloLoginSchema.parse({ callbackUrl })).toThrow()
  })
})
