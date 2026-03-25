import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="home">
      <p className="eyebrow">Compare. Vote. Contribute.</p>
      <h2 className="hero-title">Decide which AI model performed better.</h2>
      <p className="hero-copy">
        Compare models in Arena or jump into direct Chat mode. Evaluate anonymous
        conversations, vote on the full exchange, and see transparent results after each decision.
      </p>

      <div className="hero-actions">
        <Link to="/arena" className="btn btn--primary">
          Start Comparing
        </Link>
        <Link to="/chat" className="btn btn--ghost">
          Open Chat
        </Link>
        <Link to="/about" className="btn btn--ghost">
          How It Works
        </Link>
      </div>

      <div className="home-grid" aria-label="How it works">
        <article className="info-card">
          <p className="info-card__kicker">Step 1</p>
          <h3>Anonymous Arena Chat</h3>
          <p>
            Start one arena conversation and compare two side-by-side model threads
            with hidden identities, so decisions stay focused on quality.
          </p>
        </article>
        <article className="info-card">
          <p className="info-card__kicker">Step 2</p>
          <h3>Quick Voting + Reveal</h3>
          <p>
            Continue for multiple turns if needed, then vote Model 1, Model 2, both,
            or neither. After voting, MakArena reveals which models were behind the conversation.
          </p>
        </article>
        <article className="info-card">
          <p className="info-card__kicker">Also Available</p>
          <h3>Direct Chat</h3>
          <p>
            Try out our available models in Chat mode and get quick answers in a continuous one-on-one conversation.
          </p>
        </article>
      </div>
    </section>
  )
}
