import { Link } from 'react-router-dom'

export function PrivacyPolicyPage() {
  return (
    <section className="legal-page">
      <header className="legal-page__hero">
        <p className="eyebrow">Privacy Policy</p>
        <h1 className="legal-page__title">How MakArena handles your information.</h1>
        <p className="legal-page__lead">
          This page explains what information may be collected when you use MakArena,
          why it is used, and the care taken around your account and interaction data.
        </p>
      </header>

      <section className="legal-page__section">
        <h2>Information we may store</h2>
        <p>
          MakArena may store account details such as your username and email address,
          along with usage data needed to operate the platform. This can include chat
          sessions, arena prompts, model responses, votes, leaderboard activity, and
          authentication-related records.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Why this information is used</h2>
        <p>
          The information is used to authenticate users, support arena and chat
          functionality, improve model evaluation workflows, maintain platform
          reliability, and generate aggregate rankings and comparison insights.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Model output and user responsibility</h2>
        <p>
          Model responses may be inaccurate, incomplete, biased, or hallucinated. You
          should verify important facts before relying on them, especially in cases
          involving health, law, finance, safety, or other high-impact decisions.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Account deletion</h2>
        <p>
          You can request account deletion from the profile menu. Deleting your account
          is intended to remove sensitive account information connected to you, and this
          action is irreversible.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Policy updates</h2>
        <p>
          This policy may be updated as MakArena evolves. Continued use of the platform
          after changes means the updated policy applies going forward.
        </p>
      </section>

      <footer className="legal-page__footer">
        <Link to="/terms" className="legal-page__link">
          Read Terms of Service
        </Link>
      </footer>
    </section>
  )
}
