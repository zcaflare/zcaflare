/** A webhook the scanned Zalo account is already bound to. */
export interface ZaloConflictInfo {
  sessionId: string
  callbackUrl: string
  displayName: string | null
}

export interface ZaloStatusResult {
  phase: 'pending' | 'conflict' | 'authenticated' | 'expired'
  projectId?: string
  conflicts?: ZaloConflictInfo[]
}

export interface ZaloConflictResult {
  phase: 'authenticated'
  /** True when the existing webhook was kept and this login was discarded. */
  keptExisting: boolean
  callbackUrl: string
  /** Null when the kept webhook belongs to a project this user cannot see. */
  projectId: string | null
}

export interface ZaloWebhookDetail {
  projectId: string
  callbackUrl: string
  sessionId: string
  webhookSecret: string
  createdAt: string
}

export interface ZaloProjectDetail {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  callbackUrl: string
  sessionId: string
  connectedAt: string
  updatedAt: string | null
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

  function resolveConflict(sessionId: string, replace: boolean) {
    return $http<ZaloConflictResult>(`/api/zalo/${sessionId}/conflict`, {
      method: 'POST',
      body: { replace },
    })
  }

  function listProjects() {
    return $http<ZaloProjectDetail[]>('/api/zalo/projects')
  }

  function fetchProject(id: string) {
    return $http<ZaloProjectDetail>(`/api/zalo/projects/${id}`)
  }

  function revealProjectSecret(id: string) {
    return $http<{ secret: string }>(`/api/zalo/projects/${id}/reveal-secret`, { method: 'POST' })
  }

  return { startLogin, fetchStatus, fetchWebhook, resolveConflict, listProjects, fetchProject, revealProjectSecret }
}
