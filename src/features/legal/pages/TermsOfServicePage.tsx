import { Link } from 'react-router-dom'
import { useI18n } from '../../../shared/i18n/I18nContext'

export function TermsOfServicePage() {
  const { strings } = useI18n()

  return (
    <section className="legal-page">
      <header className="legal-page__hero">
        <p className="eyebrow">{strings.legal.termsOfService}</p>
        <h1 className="legal-page__title">{strings.legal.termsTitle}</h1>
        <p className="legal-page__lead">{strings.legal.termsLead}</p>
      </header>

      <section className="legal-page__section">
        <h2>{strings.legal.usePlatformTitle}</h2>
        <p>{strings.legal.usePlatformBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.accountsAccessTitle}</h2>
        <p>{strings.legal.accountsAccessBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.modelOutputsTitle}</h2>
        <p>{strings.legal.modelOutputsBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.votesContentTitle}</h2>
        <p>{strings.legal.votesContentBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.changesTitle}</h2>
        <p>{strings.legal.changesBody}</p>
      </section>

      <footer className="legal-page__footer">
        <Link to="/privacy" className="legal-page__link">
          {strings.legal.readPrivacy}
        </Link>
      </footer>
    </section>
  )
}
