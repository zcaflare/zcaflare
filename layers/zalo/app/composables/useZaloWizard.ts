import { useZaloApi } from '#layers/zalo/app/api/useZaloApi'

type Phase = 'callback' | 'scanning' | 'done' | 'error'

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

  function reset() {
    stop()
    phase.value = 'callback'
    qrDataUrl.value = ''
    sessionId.value = ''
    projectId.value = ''
    webhookSecret.value = ''
    errorMessage.value = ''
  }

  onScopeDispose(stop)

  return { phase, callbackUrl, qrDataUrl, projectId, webhookSecret, errorMessage, starting, start, reset }
}
