import { Link } from 'react-router-dom'

export function TermsOfServicePage() {
  return (
    <section className="legal-page">
      <header className="legal-page__hero">
        <p className="eyebrow">Terms of Service</p>
        <h1 className="legal-page__title">The basic rules for using MakArena.</h1>
        <p className="legal-page__lead">
          These terms outline acceptable use of the platform, your responsibility when
          using model outputs, and the expectations around accounts and platform access.
        </p>
      </header>

      <section className="legal-page__section">
        <h2>Use of the platform</h2>
        <p>
          MakArena is provided for model comparison, exploration, and research-oriented
          interaction. You agree to use the platform responsibly and not attempt to
          disrupt, abuse, or misuse the service or its underlying systems.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Accounts and access</h2>
        <p>
          Some features require authentication. You are responsible for the activity
          carried out through your account and for using supported sign-in providers in
          a lawful and appropriate way.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Model outputs</h2>
        <p>
          Model outputs are generated automatically and may be incorrect, misleading, or
          harmful if relied on without review. MakArena does not guarantee that responses
          are accurate or fit for a particular purpose.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Votes and submitted content</h2>
        <p>
          By using the platform, you understand that prompts, conversation turns, votes,
          and comparison outcomes may be used to operate the product and improve model
          evaluation workflows and reporting.
        </p>
      </section>

      <section className="legal-page__section">
        <h2>Changes and availability</h2>
        <p>
          Features, routes, models, and platform behavior may change over time. Access
          can be modified, limited, or removed if needed for security, maintenance, or
          product changes.
        </p>
      </section>

      <footer className="legal-page__footer">
        <Link to="/privacy" className="legal-page__link">
          Read Privacy Policy
        </Link>
      </footer>
    </section>
  )
}
