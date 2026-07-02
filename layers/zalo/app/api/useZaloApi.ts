export interface ZaloStatusResult {
  phase: 'pending' | 'authenticated' | 'expired'
  projectId?: string
}

export interface ZaloWebhookDetail {
  projectId: string
  callbackUrl: string
  sessionId: string
  webhookSecret: string
  createdAt: string
}

export function useZaloApi() {
  function startLogin(callbackUrl: string) {
    return $http<{ sessionId: string, qrDataUrl: string, status: string }>('/api/zalo/login', {
      method: 'POST',
      body: { callbackUrl },
    })
  }

  function fetchStatus(sessionId: string) {
    return $http<ZaloStatusResult>(`/api/zalo/${sessionId}/status`, { silent: true })
  }

  function fetchWebhook(projectId: string) {
    return $http<ZaloWebhookDetail>(`/api/zalo/webhooks/${projectId}`)
  }

  return { startLogin, fetchStatus, fetchWebhook }
}
