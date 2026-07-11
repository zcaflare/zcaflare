import { createError, getRouterParam, readValidatedBody } from 'h3'
import { callZaloAction } from '#layers/zalo/server/services/bounce'
import { resolveSessionSecret } from '#layers/zalo/server/services/webhook'
import { ZALO_ACTIONS } from '#layers/zalo/server/services/zalo-actions'

/**
 * POST /api/zalo/{sessionId}/actions/{action}
 *
 * Dispatches one `zca-js` method on a live core session. Every action shares
 * this handler: they differ only in which schema validates the body and how
 * that body becomes positional arguments, both of which live in the registry.
 *
 * One route rather than 145. Each file under this directory used to be its own
 * route, and each route its own entry in Nitro's generated route map — enough of
 * them that TypeScript gave up resolving any typed `$fetch` call in the app.
 */
export default defineAuthenticatedHandler(async (event, session) => {
  const sessionId = getRouterParam(event, 'sessionId')!
  const name = getRouterParam(event, 'action')!

  // The registry is the allowlist, and `hasOwn` keeps the lookup off the
  // prototype chain — otherwise `constructor` or `__proto__` would resolve to a
  // truthy value here and be dispatched as if it were an action.
  const action = Object.hasOwn(ZALO_ACTIONS, name) ? ZALO_ACTIONS[name] : undefined
  if (!action)
    throw createError({ statusCode: 404, statusMessage: `Unknown Zalo action: ${name}` })

  const body = action.schema
    ? await readValidatedBody(event, action.schema.parse)
    : undefined

  const secret = await resolveSessionSecret(sessionId, session.sub)
  return callZaloAction(sessionId, secret, action.method, action.args(body))
})
