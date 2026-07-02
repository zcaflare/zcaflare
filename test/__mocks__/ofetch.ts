import { vi } from 'vitest'

export const $fetch = Object.assign(vi.fn(), { raw: vi.fn() })
