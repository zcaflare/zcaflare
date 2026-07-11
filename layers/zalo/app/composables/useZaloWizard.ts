import type { ZaloConflictInfo } from '#layers/zalo/app/api/useZaloApi'
import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'

type Phase = 'callback' | 'scanning' | 'conflict' | 'done' | 'error'

const POLL_INTERVAL_MS = 2500
const MAX_ATTEMPTS = 120

export function useZaloWizard() {
  const api = useZaloApi()

  const phase = ref<Phase>('callback')
  const callbackUrl = ref('')
  const qrDataUrl = ref('')
  const sessionId = ref('')
  const projectId = ref('')
  const webhookSecret = ref('')
  const errorMessage = ref('')
  const starting = ref(false)

  /** Webhooks the scanned account is already bound to. Non-empty only in `conflict`. */
  const conflicts = ref<ZaloConflictInfo[]>([])
  const resolving = ref(false)
  /** True once a conflict was settled by keeping the webhook that already existed. */
  const keptExisting = ref(false)

  let active = false
  let attempts = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function stop() {
    active = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function start() {
    if (starting.value)
      return
    starting.value = true
    errorMessage.value = ''
    try {
      const res = await api.startLogin(callbackUrl.value)
      sessionId.value = res.sessionId
      qrDataUrl.value = res.qrDataUrl
      phase.value = 'scanning'
      active = true
      attempts = 0
      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }
    catch (err) {
      errorMessage.value = getErrorMessage(err)
      phase.value = 'error'
    }
    finally {
      starting.value = false
    }
  }

  async function poll() {
    if (!active)
      return
    attempts++
    try {
      const res = await api.fetchStatus(sessionId.value)
      if (!active)
        return
      if (res.phase === 'authenticated' && res.projectId) {
        stop()
        projectId.value = res.projectId
        const wh = await api.fetchWebhook(res.projectId)
        webhookSecret.value = wh.webhookSecret
        phase.value = 'done'
        return
      }
      // Scanned, but the account is already feeding another webhook. Polling is
      // over: nothing further happens on the server until the user chooses.
      if (res.phase === 'conflict') {
        stop()
        conflicts.value = res.conflicts ?? []
        phase.value = 'conflict'
        return
      }
      if (res.phase === 'expired') {
        stop()
        errorMessage.value = 'This Zalo login expired. Please start again.'
        phase.value = 'error'
        return
      }
    }
    catch {
      // transient — keep polling
    }
    if (attempts >= MAX_ATTEMPTS) {
      stop()
      errorMessage.value = 'Timed out waiting for the Zalo scan. Please try again.'
      phase.value = 'error'
      return
    }
    if (active)
      timer = setTimeout(poll, POLL_INTERVAL_MS)
  }

  /**
   * Settle the conflict. `replace: true` gives the account to this new callback
   * URL and retires the one it collided with; `replace: false` leaves that one
   * running on its existing secret and throws this login away — so there is no
   * new secret to reveal, and the wizard says so rather than showing a blank.
   */
  async function resolveConflict(replace: boolean) {
    if (resolving.value)
      return
    resolving.value = true
    errorMessage.value = ''
    try {
      const res = await api.resolveConflict(sessionId.value, replace)
      keptExisting.value = res.keptExisting
      projectId.value = res.projectId ?? ''
      if (res.projectId && !res.keptExisting) {
        const wh = await api.fetchWebhook(res.projectId)
        webhookSecret.value = wh.webhookSecret
      }
      phase.value = 'done'
    }
    catch (err) {
      errorMessage.value = getErrorMessage(err)
      phase.value = 'error'
    }
    finally {
      resolving.value = false
    }
  }

  function reset() {
    stop()
    phase.value = 'callback'
    qrDataUrl.value = ''
    sessionId.value = ''
    projectId.value = ''
    webhookSecret.value = ''
    errorMessage.value = ''
    conflicts.value = []
    keptExisting.value = false
  }

  onScopeDispose(stop)

  return {
    phase,
    callbackUrl,
    qrDataUrl,
    projectId,
    webhookSecret,
    errorMessage,
    starting,
    conflicts,
    resolving,
    keptExisting,
    start,
    resolveConflict,
    reset,
  }
}
