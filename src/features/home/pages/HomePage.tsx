import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="home">
      <p className="eyebrow">Compare. Vote. Learn.</p>
      <h2 className="hero-title">Pick better AI answers in a blind arena.</h2>
      <p className="hero-copy">
        Ask one question, get two anonymous responses, and vote for the better
        answer. Model names stay hidden until your vote is submitted.
      </p>

      <div className="hero-actions">
        <Link to="/chatvote" className="btn btn--primary">
          Start ChatVote
        </Link>
        <Link to="/about" className="btn btn--ghost">
          How It Works
        </Link>
      </div>

      <div className="home-grid" aria-label="Product highlights">
        <article className="info-card">
          <h3>Blind by Design</h3>
          <p>No logo bias. Evaluate answer quality only.</p>
        </article>
        <article className="info-card">
          <h3>Fast Voting</h3>
          <p>Choose A, B, both good, or both bad in one click.</p>
        </article>
        <article className="info-card">
          <h3>Transparent Reveal</h3>
          <p>See which model won after you cast your vote.</p>
        </article>
      </div>
    </section>
  )
}
