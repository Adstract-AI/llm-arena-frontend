import { env } from '../../shared/config/env'
import { createClientId } from '../../shared/crypto/id'
import type { OAuthProvider } from './types'

function createOAuthState(): string {
  return createClientId()
}

function buildRedirectUri(provider: OAuthProvider): string {
  return provider === 'github'
    ? env.githubOAuthRedirectUri
    : env.googleOAuthRedirectUri
}

export function generateOAuthState(): string {
  return createOAuthState()
}

export function getOAuthProviderLabel(provider: OAuthProvider): string {
  return provider === 'github' ? 'GitHub' : 'Google'
}

export function buildOAuthAuthorizeUrl(provider: OAuthProvider, state: string): string {
  if (provider === 'github') {
    if (!env.githubClientId || !env.githubOAuthAuthorizeUrl || !env.githubOAuthRedirectUri) {
      throw new Error('GitHub OAuth is not configured.')
    }

    const params = new URLSearchParams({
      client_id: env.githubClientId,
      redirect_uri: buildRedirectUri('github'),
      scope: 'user:email',
      state,
    })

    return `${env.githubOAuthAuthorizeUrl}?${params.toString()}`
  }

  if (!env.googleClientId || !env.googleOAuthAuthorizeUrl || !env.googleOAuthRedirectUri) {
    throw new Error('Google OAuth is not configured.')
  }

  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: buildRedirectUri('google'),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${env.googleOAuthAuthorizeUrl}?${params.toString()}`
}
