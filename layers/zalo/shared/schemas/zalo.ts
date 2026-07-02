import { z } from 'zod'

const PRIVATE_HOST_RE = /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|\[?::1\]?|172\.(?:1[6-9]|2\d|3[01])\.)/i

export const ZaloLoginSchema = z.object({
  callbackUrl: z.string().url().refine((value) => {
    let url: URL
    try {
      url = new URL(value)
    }
    catch {
      return false
    }
    if (url.protocol !== 'https:')
      return false
    if (PRIVATE_HOST_RE.test(url.hostname))
      return false
    return true
  }, 'Callback URL must be a public https:// URL'),
})

export type ZaloLogin = z.infer<typeof ZaloLoginSchema>
