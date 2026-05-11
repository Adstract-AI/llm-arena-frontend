import { Link } from 'react-router-dom'
import { useI18n } from '../../../shared/i18n/I18nContext'

export function PrivacyPolicyPage() {
  const { strings } = useI18n()

  return (
    <section className="legal-page">
      <header className="legal-page__hero">
        <p className="eyebrow">{strings.legal.privacyPolicy}</p>
        <h1 className="legal-page__title">{strings.legal.privacyTitle}</h1>
        <p className="legal-page__lead">{strings.legal.privacyLead}</p>
      </header>

      <section className="legal-page__section">
        <h2>{strings.legal.privacyInfoTitle}</h2>
        <p>{strings.legal.privacyInfoBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.privacyWhyTitle}</h2>
        <p>{strings.legal.privacyWhyBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.privacyResponsibilityTitle}</h2>
        <p>{strings.legal.privacyResponsibilityBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.privacyDeletionTitle}</h2>
        <p>{strings.legal.privacyDeletionBody}</p>
      </section>

      <section className="legal-page__section">
        <h2>{strings.legal.privacyUpdatesTitle}</h2>
        <p>{strings.legal.privacyUpdatesBody}</p>
      </section>

      <footer className="legal-page__footer">
        <Link to="/terms" className="legal-page__link">
          {strings.legal.readTerms}
        </Link>
      </footer>
    </section>
  )
}
