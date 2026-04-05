export type OAuthProvider = 'github' | 'google'

export interface AuthUser {
  email: string
  username: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthSession extends AuthTokens {
  user: AuthUser
}
