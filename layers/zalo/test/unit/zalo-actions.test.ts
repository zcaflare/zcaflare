import { describe, expect, it } from 'vitest'
import { ZALO_ACTIONS } from '#layers/zalo/server/services/zalo-actions'

describe('zalo action registry', () => {
  it('still exposes every action the per-method routes did', () => {
    expect(Object.keys(ZALO_ACTIONS)).toHaveLength(145)
  })

  it('maps a kebab-case URL segment to core camelCase wire vocabulary', () => {
    expect(ZALO_ACTIONS['send-message']?.method).toBe('sendMessage')
    expect(ZALO_ACTIONS['send-typing-event']?.method).toBe('sendTypingEvent')
    expect(ZALO_ACTIONS['accept-friend-request']?.method).toBe('acceptFriendRequest')
  })

  it('builds positional arguments in the order zca-js declares them', () => {
    // sendMessage(message, threadId, type) — an argument order silently swapped
    // here would send the message text as the thread id.
    const action = ZALO_ACTIONS['send-message']!
    const body = action.schema!.parse({ message: 'chào', threadId: '42', type: 0 })
    expect(action.args(body)).toEqual(['chào', '42', 0])
  })

  it('passes no arguments for a method that takes none', () => {
    const action = ZALO_ACTIONS['get-own-id']!
    expect(action.schema).toBeUndefined()
    expect(action.args(undefined)).toEqual([])
  })

  it('rejects a body the action does not model', () => {
    expect(() => ZALO_ACTIONS['send-message']!.schema!.parse({ threadId: '42' })).toThrow()
  })

  it('never resolves an inherited property as an action', () => {
    // The route looks actions up by a URL segment, so a lookup that walked the
    // prototype chain would dispatch `constructor` as if it were a zca-js method.
    for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty'])
      expect(Object.hasOwn(ZALO_ACTIONS, name)).toBe(false)
  })
})
