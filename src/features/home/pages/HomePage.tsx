import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="home">
      <p className="eyebrow">Compare. Vote. Contribute.</p>
      <h2 className="hero-title">Decide which AI model performed better.</h2>
      <p className="hero-copy">
        Compare models in Arena, test controlled runs in Experimental Arena, or jump
        into direct Chat mode. Evaluate anonymous conversations, vote on the full exchange,
        and see transparent results after each decision.
      </p>

      <div className="hero-actions">
        <Link to="/arena" className="btn btn--primary">
          Start Comparing
        </Link>
        <Link to="/experimental" className="btn btn--ghost">
          Try Experimental
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
          <div className="info-card__inline-links">
            <Link to="/arena" className="info-card__inline-link">
              Go To Arena
            </Link>
          </div>
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
          <h3>Chat + Experimental</h3>
          <p>
            Need a fast answer? Use Chat mode for one-on-one conversations. Need more control?
            Experimental Arena lets you compare with parameter setup before the round starts.
          </p>
          <div className="info-card__inline-links">
            <Link to="/chat" className="info-card__inline-link">
              Open Chat
            </Link>
            <Link to="/experimental" className="info-card__inline-link">
              Explore Experimental
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
