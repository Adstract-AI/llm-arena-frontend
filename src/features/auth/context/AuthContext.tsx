import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { exchangeOAuthCode, getCurrentUser, refreshAccessToken as requestRefreshAccessToken } from '../api/authApi'
import {
  clearStoredAuthSession,
  clearStoredOAuthState,
  clearStoredReturnPath,
  getStoredAuthSession,
  getStoredAuthTokens,
  getStoredOAuthState,
  persistAccessToken,
  persistAuthSession,
  setStoredOAuthState,
  setStoredReturnPath,
} from '../storage'
import { buildOAuthAuthorizeUrl, generateOAuthState } from '../oauth'
import type { AuthSession, AuthUser, OAuthProvider } from '../types'
import { registerAuthFailureHandler } from '../../../shared/network/httpClient'

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  openLoginPage: (returnPath?: string) => void
  login: (provider: OAuthProvider, returnPath?: string) => void
  completeOAuthLogin: (provider: OAuthProvider, code: string, state: string | null) => Promise<string>
  refreshAccessToken: () => Promise<string | null>
  loadCurrentUser: () => Promise<void>
  logout: (redirectToLogin?: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getFallbackReturnPath(): string {
  return '/'
}

function isProtectedPath(pathname: string): boolean {
  return pathname === '/chat' || pathname === '/experimental'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  function applySession(session: AuthSession) {
    persistAuthSession(session)
    setUser(session.user)
    setAccessToken(session.accessToken)
    setRefreshToken(session.refreshToken)
  }

  function clearSessionState() {
    clearStoredAuthSession()
    clearStoredOAuthState()
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
  }

  function logout(redirectToLogin = false) {
    clearSessionState()

    if (redirectToLogin) {
      const next = `${location.pathname}${location.search}${location.hash}`
      setStoredReturnPath(next)
      startTransition(() => {
        navigate('/login')
      })
    }
  }

  function openLoginPage(returnPath?: string) {
    const nextReturnPath = returnPath ?? `${location.pathname}${location.search}${location.hash}`
    setStoredReturnPath(nextReturnPath)
    startTransition(() => {
      navigate('/login')
    })
  }

  async function refreshAccessToken() {
    const tokens = getStoredAuthTokens()
    if (!tokens?.refreshToken) {
      clearSessionState()
      return null
    }

    try {
      const nextAccessToken = await requestRefreshAccessToken(tokens.refreshToken)
      persistAccessToken(nextAccessToken)
      setAccessToken(nextAccessToken)
      setRefreshToken(tokens.refreshToken)
      return nextAccessToken
    } catch {
      clearSessionState()
      return null
    }
  }

  async function loadCurrentUser() {
    const session = getStoredAuthSession()
    if (!session) {
      clearSessionState()
      return
    }

    setAccessToken(session.accessToken)
    setRefreshToken(session.refreshToken)

    try {
      const currentUser = await getCurrentUser()
      applySession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: currentUser,
      })
    } catch {
      const nextAccessToken = await refreshAccessToken()

      if (!nextAccessToken) {
        clearSessionState()
        return
      }

      const storedTokens = getStoredAuthTokens()
      if (!storedTokens?.refreshToken) {
        clearSessionState()
        return
      }

      try {
        const currentUser = await getCurrentUser()
        applySession({
          accessToken: nextAccessToken,
          refreshToken: storedTokens.refreshToken,
          user: currentUser,
        })
      } catch {
        clearSessionState()
      }
    }
  }

  function login(provider: OAuthProvider, returnPath?: string) {
    const nextReturnPath = returnPath ?? `${location.pathname}${location.search}${location.hash}`
    const state = generateOAuthState()

    setStoredReturnPath(nextReturnPath)
    setStoredOAuthState(state)

    window.location.assign(buildOAuthAuthorizeUrl(provider, state))
  }

  async function completeOAuthLogin(
    provider: OAuthProvider,
    code: string,
    state: string | null,
  ): Promise<string> {
    const expectedState = getStoredOAuthState()
    if (!state || !expectedState || state !== expectedState) {
      throw new Error('Login could not be verified. Please try again.')
    }

    const session = await exchangeOAuthCode(provider, code)
    applySession(session)
    clearStoredOAuthState()
    clearStoredReturnPath()
    return getFallbackReturnPath()
  }

  useEffect(() => {
    let isMounted = true

    async function initialize() {
      const session = getStoredAuthSession()
      if (!session) {
        if (isMounted) {
          setIsInitializing(false)
        }
        return
      }

      try {
        await loadCurrentUser()
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    void initialize()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return registerAuthFailureHandler(() => {
      clearSessionState()

      if (isProtectedPath(window.location.pathname)) {
        const next = `${window.location.pathname}${window.location.search}${window.location.hash}`
        setStoredReturnPath(next)
        window.location.assign('/login')
      }
    })
  }, [])

  const value: AuthContextValue = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: Boolean(user && accessToken && refreshToken),
    isInitializing,
    openLoginPage,
    login,
    completeOAuthLogin,
    refreshAccessToken,
    loadCurrentUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
