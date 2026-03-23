export function AboutPage() {
  return (
    <section className="about">
      <header className="about-hero">
        <p className="eyebrow">About MakArena</p>
        <h1 className="about-title">Blind evaluation for fairer model decisions.</h1>
        <p className="about-lead">
          MakArena compares anonymous model answers for the same prompt, then
          uses user voting data to build transparent performance rankings.
        </p>
      </header>

      <section className="about-flow" aria-label="How MakArena works">
        <h2>How It Works</h2>
        <ol className="about-steps">
          <li>
            A user sends one prompt.
          </li>
          <li>
            Two anonymous answers are generated side by side.
          </li>
          <li>
            The user votes: Answer 1, Answer 2, both good, or neither good.
          </li>
          <li>
            Model identities are revealed only after the vote is submitted.
          </li>
        </ol>
      </section>

      <section className="about-principles" aria-label="Evaluation principles">
        <h2>Evaluation Principles</h2>
        <div className="about-principles__grid">
          <p>Blind comparison reduces brand bias in judgment.</p>
          <p>Single-round voting keeps each evaluation stateless and focused.</p>
          <p>Leaderboard metrics reflect real user preference signals.</p>
        </div>
      </section>

      <section className="about-funding" aria-label="Funding">
        <p className="about-funding__label">Funding</p>
        <p className="about-funding__text">
          This project is supported by the Faculty of Computer Science and Engineering.
        </p>
      </section>
    </section>
  )
}
