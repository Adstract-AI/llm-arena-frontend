import { httpDelete, httpGet, httpPost } from '../../../shared/network/httpClient'
import type { AuthSession, AuthTokens, AuthUser, OAuthProvider } from '../types'

interface AuthLoginResponseDto {
  access: string
  refresh: string
  user: {
    email: string
    username: string
  }
}

interface RefreshResponseDto {
  access: string
}

interface CurrentUserResponseDto {
  email: string
  username: string
}

function toAuthUser(response: CurrentUserResponseDto): AuthUser {
  return {
    email: response.email,
    username: response.username,
  }
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
): Promise<AuthSession> {
  const response = await httpPost<AuthLoginResponseDto, { code: string }>(
    provider === 'github' ? '/api/auth/github/' : '/api/auth/google/',
    { code },
    { auth: false },
  )

  return {
    accessToken: response.access,
    refreshToken: response.refresh,
    user: toAuthUser(response.user),
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await httpPost<RefreshResponseDto, { refresh: string }>(
    '/api/auth/token/refresh/',
    { refresh: refreshToken },
    { auth: false },
  )

  return response.access
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await httpGet<CurrentUserResponseDto>('/api/auth/me/')
  return toAuthUser(response)
}

export async function deleteCurrentUser(): Promise<void> {
  await httpDelete('/api/auth/me/delete/')
}

export function toAuthTokens(session: AuthSession): AuthTokens {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  }
}
