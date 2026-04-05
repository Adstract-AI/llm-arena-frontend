import { useEffect, useMemo, useState } from 'react'
import GitHubIcon from '@mui/icons-material/GitHub'
import GoogleIcon from '@mui/icons-material/Google'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { env } from '../../../shared/config/env'
import { getStoredReturnPath } from '../storage'

function getConfigurationErrors(): string[] {
  const errors: string[] = []

  if (!env.githubClientId) {
    errors.push('GitHub OAuth client ID is missing.')
  }

  if (!env.googleClientId) {
    errors.push('Google OAuth client ID is missing.')
  }

  return errors
}

export function LoginPage() {
  const location = useLocation()
  const { isAuthenticated, isInitializing, login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const configErrors = useMemo(getConfigurationErrors, [])
  const nextPath = useMemo(
    () => new URLSearchParams(location.search).get('next') ?? getStoredReturnPath() ?? '/',
    [location.search],
  )

  useEffect(() => {
    if (configErrors.length > 0) {
      setError(configErrors[0])
    }
  }, [configErrors])

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={nextPath} replace />
  }

  return (
    <section className="auth-page auth-page--login">
      <section className="auth-login-shell">
        <div className="auth-login-shell__glow" aria-hidden="true" />
        <section className="auth-card auth-card--login">
          <div className="auth-card__header auth-card__header--compact">
            <p className="eyebrow">Sign In</p>
            <h1>Sign in to access all the features</h1>
            <p>Continue with a provider:</p>
          </div>

          {error ? <p className="leaderboard-error">{error}</p> : null}

          <div className="auth-card__actions auth-card__actions--stacked">
            <button
              type="button"
              className="auth-provider-btn auth-provider-btn--github"
              onClick={() => login('github', nextPath)}
              disabled={Boolean(error)}
            >
              <span className="auth-provider-btn__brand">
                <GitHubIcon aria-hidden="true" className="auth-provider-btn__icon" />
                <span>Continue with GitHub</span>
              </span>
              <ArrowOutwardRoundedIcon
                aria-hidden="true"
                className="auth-provider-btn__trailing-icon"
              />
            </button>

            <button
              type="button"
              className="auth-provider-btn auth-provider-btn--google"
              onClick={() => login('google', nextPath)}
              disabled={Boolean(error)}
            >
              <span className="auth-provider-btn__brand">
                <GoogleIcon aria-hidden="true" className="auth-provider-btn__icon" />
                <span>Continue with Google</span>
              </span>
              <ArrowOutwardRoundedIcon
                aria-hidden="true"
                className="auth-provider-btn__trailing-icon"
              />
            </button>
          </div>

          <p className="auth-card__disclaimer">
            By signing in, you agree to the{' '}
            <Link to="/terms" className="auth-card__disclaimer-link">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="auth-card__disclaimer-link">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </section>
    </section>
  )
}
