import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { OAuthProvider } from '../types'
import { FriendlyErrorToast } from '../../../shared/components/FriendlyErrorToast'

interface OAuthCallbackPageProps {
  provider: OAuthProvider
}

export function OAuthCallbackPage({ provider }: OAuthCallbackPageProps) {
  const [searchParams] = useSearchParams()
  const { completeOAuthLogin, isAuthenticated, isInitializing } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const hasStartedRef = useRef(false)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (!error && !isInitializing && isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true
      window.location.replace('/')
    }
  }, [error, isAuthenticated, isInitializing])

  useEffect(() => {
    if (hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true
    let isMounted = true

    async function finishLogin() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code) {
        if (isMounted) {
          setError('The provider did not return a login code. Please try again.')
        }
        return
      }

      try {
        const returnPath = await completeOAuthLogin(provider, code, state)
        if (isMounted) {
          hasRedirectedRef.current = true
          window.location.replace(returnPath)
        }
      } catch (callbackError) {
        if (isMounted) {
          setError(
            callbackError instanceof Error
              ? callbackError.message
              : 'Could not complete login.',
          )
        }
      }
    }

    void finishLogin()

    return () => {
      isMounted = false
    }
  }, [completeOAuthLogin, provider, searchParams])

  return (
    <section className="auth-page auth-page--callback">
      <section className="auth-card auth-card--callback auth-card--callback-minimal">
        {error ? (
          <div className="auth-card__error-state">
            <FriendlyErrorToast
              message="We could not finish sign in."
              detail={error}
            />
            <Link to="/login" className="btn btn--ghost">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="auth-callback-status" role="status" aria-live="polite">
            <span className="auth-callback-status__spinner" aria-hidden="true" />
            <span>Signing you in…</span>
          </div>
        )}
      </section>
    </section>
  )
}
