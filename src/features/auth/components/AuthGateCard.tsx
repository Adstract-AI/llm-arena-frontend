import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../../../shared/i18n/I18nContext'

interface AuthGateCardProps {
  title: string
  description: ReactNode
  returnPath: string
}

export function AuthGateCard({ title, description, returnPath }: AuthGateCardProps) {
  const { openLoginPage } = useAuth()
  const { strings } = useI18n()

  return (
    <section className="auth-gate-card">
      <p className="eyebrow">{strings.auth.gateEyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <button
        type="button"
        className="btn btn--primary auth-gate-card__action"
        onClick={() => openLoginPage(returnPath)}
      >
        <LoginRoundedIcon aria-hidden="true" className="auth-gate-card__icon" />
        {strings.auth.gateAction}
      </button>
    </section>
  )
}
