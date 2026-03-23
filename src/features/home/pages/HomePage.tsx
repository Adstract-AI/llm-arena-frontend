import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="home">
      <p className="eyebrow">Compare. Vote. Contribute.</p>
      <h2 className="hero-title">Decide which AI model performed better.</h2>
      <p className="hero-copy">
        Ask one question, get two anonymous responses, and vote for the better
        answer. Model names stay hidden until your vote is submitted.
      </p>

      <div className="hero-actions">
        <Link to="/chatvote" className="btn btn--primary">
            Start Comparing
        </Link>
        <Link to="/about" className="btn btn--ghost">
          How It Works
        </Link>
      </div>

        <div className="home-grid" aria-label="How it works">
            <article className="info-card">
                <h3>Anonymous Comparison</h3>
                <p>Two answers. No model names. No bias.</p>
            </article>
            <article className="info-card">
                <h3>Quick Voting</h3>
                <p>Pick the better answer, both, or neither.</p>
            </article>
            <article className="info-card">
                <h3>Results Revealed</h3>
                <p>See which model performed better after voting.</p>
            </article>
        </div>
    </section>
  )
}
