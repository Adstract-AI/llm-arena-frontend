import { Link } from 'react-router-dom'
import { useI18n } from '../../../shared/localisation/I18nContext'

export function HomePage() {
  const { strings } = useI18n()

  return (
    <section className="home">
      <h2 className="hero-title">{strings.home.title}</h2>
      <p className="hero-copy">
        {strings.home.description}
      </p>

      <div className="hero-actions">
        <Link to="/arena" className="btn btn--primary">
          {strings.home.startComparing}
        </Link>
        <Link to="/experimental" className="btn btn--ghost">
          {strings.home.tryExperimental}
        </Link>
        <Link to="/chat" className="btn btn--ghost">
          {strings.home.openChat}
        </Link>
        <Link to="/about" className="btn btn--ghost">
          {strings.home.howItWorks}
        </Link>
      </div>

      <div className="home-grid" aria-label={strings.home.howItWorksLabel}>
        <article className="info-card">
          <p className="info-card__kicker">{strings.home.step1}</p>
          <h3>{strings.home.anonymousArenaTitle}</h3>
          <p>{strings.home.anonymousArenaBody}</p>

        </article>
        <article className="info-card">
          <p className="info-card__kicker">{strings.home.step2}</p>
          <h3>{strings.home.quickVotingTitle}</h3>
          <p>{strings.home.quickVotingBody}</p>
          <div className="info-card__inline-links">
            <Link to="/arena" className="info-card__inline-link">
              {strings.home.goToArena}
            </Link>
          </div>
        </article>
        <article className="info-card">
          <p className="info-card__kicker">{strings.home.alsoAvailable}</p>
          <h3>{strings.home.chatExperimentalTitle}</h3>
          <p>{strings.home.chatExperimentalBody}</p>
          <div className="info-card__inline-links">
            <Link to="/chat" className="info-card__inline-link">
              {strings.home.openChat}
            </Link>
            <Link to="/experimental" className="info-card__inline-link">
              {strings.home.exploreExperimental}
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
