declare global {
  interface Window {
    __APP_CONFIG__?: {
      ENABLE_STREAMING?: string
      VITE_API_BASE_URL?: string
      VITE_ENABLE_STREAMING?: string
      VITE_GITHUB_CLIENT_ID?: string
      VITE_GOOGLE_CLIENT_ID?: string
      VITE_GITHUB_OAUTH_AUTHORIZE_URL?: string
      VITE_GOOGLE_OAUTH_AUTHORIZE_URL?: string
      VITE_GITHUB_OAUTH_REDIRECT_URI?: string
      VITE_GOOGLE_OAUTH_REDIRECT_URI?: string
    }
  }
}

const apiBaseUrlRaw =
  window.__APP_CONFIG__?.VITE_API_BASE_URL?.trim() ?? import.meta.env.VITE_API_BASE_URL?.trim()
const apiBaseUrl = apiBaseUrlRaw ? apiBaseUrlRaw.replace(/\/+$/, '') : ''
const enableStreamingRaw =
  window.__APP_CONFIG__?.ENABLE_STREAMING?.trim() ??
  window.__APP_CONFIG__?.VITE_ENABLE_STREAMING?.trim() ??
  import.meta.env.VITE_ENABLE_STREAMING?.trim()
const enableStreaming =
  enableStreamingRaw === undefined
    ? true
    : !['false', '0', 'no', 'off'].includes(enableStreamingRaw.toLowerCase())
const githubClientId =
  window.__APP_CONFIG__?.VITE_GITHUB_CLIENT_ID?.trim() ??
  import.meta.env.VITE_GITHUB_CLIENT_ID?.trim() ??
  ''
const googleClientId =
  window.__APP_CONFIG__?.VITE_GOOGLE_CLIENT_ID?.trim() ??
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ??
  ''
const githubOAuthAuthorizeUrl =
  window.__APP_CONFIG__?.VITE_GITHUB_OAUTH_AUTHORIZE_URL?.trim() ??
  import.meta.env.VITE_GITHUB_OAUTH_AUTHORIZE_URL?.trim() ??
  'https://github.com/login/oauth/authorize'
const googleOAuthAuthorizeUrl =
  window.__APP_CONFIG__?.VITE_GOOGLE_OAUTH_AUTHORIZE_URL?.trim() ??
  import.meta.env.VITE_GOOGLE_OAUTH_AUTHORIZE_URL?.trim() ??
  'https://accounts.google.com/o/oauth2/v2/auth'
const githubOAuthRedirectUri =
  window.__APP_CONFIG__?.VITE_GITHUB_OAUTH_REDIRECT_URI?.trim() ??
  import.meta.env.VITE_GITHUB_OAUTH_REDIRECT_URI?.trim() ??
  `${window.location.origin}/auth/github/callback`
const googleOAuthRedirectUri =
  window.__APP_CONFIG__?.VITE_GOOGLE_OAUTH_REDIRECT_URI?.trim() ??
  import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI?.trim() ??
  `${window.location.origin}/auth/google/callback`

export const env = {
  apiBaseUrl,
  enableStreaming,
  githubClientId,
  googleClientId,
  githubOAuthAuthorizeUrl,
  googleOAuthAuthorizeUrl,
  githubOAuthRedirectUri,
  googleOAuthRedirectUri,
}
