import type { AuthSession, AuthTokens, AuthUser } from './types'

const ACCESS_TOKEN_KEY = 'makarena-auth-access-token'
const REFRESH_TOKEN_KEY = 'makarena-auth-refresh-token'
const USER_KEY = 'makarena-auth-user'
const OAUTH_STATE_KEY = 'makarena-auth-oauth-state'
const RETURN_PATH_KEY = 'makarena-auth-return-path'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getStoredAuthTokens(): AuthTokens | null {
  if (!canUseStorage()) {
    return null
  }

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)

  if (!accessToken || !refreshToken) {
    return null
  }

  return { accessToken, refreshToken }
}

export function getStoredAuthUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null
  }

  const rawUser = window.localStorage.getItem(USER_KEY)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    return null
  }
}

export function getStoredAuthSession(): AuthSession | null {
  const tokens = getStoredAuthTokens()
  const user = getStoredAuthUser()

  if (!tokens || !user) {
    return null
  }

  return {
    ...tokens,
    user,
  }
}

export function persistAuthSession(session: AuthSession): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function persistAccessToken(accessToken: string): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function clearStoredAuthSession(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function setStoredOAuthState(state: string): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(OAUTH_STATE_KEY, state)
}

export function getStoredOAuthState(): string | null {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(OAUTH_STATE_KEY)
}

export function clearStoredOAuthState(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(OAUTH_STATE_KEY)
}

export function setStoredReturnPath(path: string): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(RETURN_PATH_KEY, path)
}

export function getStoredReturnPath(): string | null {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(RETURN_PATH_KEY)
}

export function clearStoredReturnPath(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(RETURN_PATH_KEY)
}
