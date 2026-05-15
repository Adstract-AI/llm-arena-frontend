import { Link } from 'react-router-dom'
import { useI18n } from '../../../shared/localisation/I18nContext'

export function AboutPage() {
  const { strings } = useI18n()

  return (
    <section className="about">
      <header className="about-hero">
        <p className="eyebrow">{strings.about.eyebrow}</p>
        <h1 className="about-title">{strings.about.title}</h1>
        <p className="about-lead">{strings.about.lead}</p>
      </header>

      <section className="about-highlight" aria-label={strings.about.availableExperiences}>
        <h2>{strings.about.whatsAvailable}</h2>
        <div className="about-highlight__grid">
          <article className="about-highlight__item">
            <h3>Arena</h3>
            <p>{strings.about.arenaBody}</p>
          </article>
          <article className="about-highlight__item">
            <h3>Chat</h3>
            <p>{strings.about.chatBody}</p>
          </article>
          <article className="about-highlight__item">
            <h3>{strings.about.experimentalTitle}</h3>
            <p>{strings.about.experimentalBody}</p>
          </article>
        </div>
      </section>

      <section className="about-flow" aria-label={strings.about.howMakArenaWorks}>
        <h2>{strings.about.howItWorks}</h2>
        <div className="about-flow__grid">
          <article className="about-flow__block">
            <p className="about-flow__block-kicker">{strings.about.standardFlow}</p>
            <h3>{strings.about.arenaFlow}</h3>
            <div className="about-stack">
              <div className="about-item about-item--step">
                <span className="about-item__number">01</span>
                <h4>{strings.about.arenaStep1Title}</h4>
                <p>{strings.about.arenaStep1Body}</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">02</span>
                <h4>{strings.about.arenaStep2Title}</h4>
                <p>{strings.about.arenaStep2Body}</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">03</span>
                <h4>{strings.about.arenaStep3Title}</h4>
                <p>{strings.about.arenaStep3Body}</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">04</span>
                <h4>{strings.about.arenaStep4Title}</h4>
                <p>{strings.about.arenaStep4Body}</p>
              </div>
            </div>
          </article>

          <article className="about-flow__block">
            <p className="about-flow__block-kicker">{strings.about.additionalSetup}</p>
            <h3>{strings.about.experimentalAdds}</h3>
            <div className="about-stack">
              <div className="about-item about-item--step">
                <span className="about-item__number">01</span>
                <h4>{strings.about.experimentalStep1Title}</h4>
                <p>{strings.about.experimentalStep1Body}</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">02</span>
                <h4>{strings.about.experimentalStep2Title}</h4>
                <p>{strings.about.experimentalStep2Body}</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">03</span>
                <h4>{strings.about.experimentalStep3Title}</h4>
                <p>{strings.about.experimentalStep3Body}</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">04</span>
                <h4>{strings.about.experimentalStep4Title}</h4>
                <p>{strings.about.experimentalStep4Body}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="about-principles" aria-label={strings.about.evaluationPrinciples}>
        <h2>{strings.about.evaluationPrinciples}</h2>
        <div className="about-principles__grid">
          <p>{strings.about.principle1}</p>
          <p>{strings.about.principle2}</p>
          <p>{strings.about.principle3}</p>
        </div>
      </section>

      <section className="about-partners" aria-label={strings.about.fundingCollaboration}>
        <div className="about-partners__block about-funding">
          <p className="about-funding__label">{strings.about.fundedBy}</p>
          <img
            src="/finki_logo.png"
            alt={strings.about.finkiLogoAlt}
            className="about-funding__logo"
          />
        </div>

        <div className="about-partners__block about-legal">
          <p className="about-funding__label">{strings.about.legal}</p>
          <div className="about-legal__links">
            <Link to="/privacy" className="about-legal__link">
              {strings.about.privacyPolicy}
            </Link>
            <Link to="/terms" className="about-legal__link">
              {strings.about.termsOfService}
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}
