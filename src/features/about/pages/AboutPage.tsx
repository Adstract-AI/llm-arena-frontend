export function AboutPage() {
  return (
    <section className="about">
      <header className="about-hero">
        <p className="eyebrow">About MakArena</p>
        <h1 className="about-title">Blind evaluation for fairer model decisions.</h1>
        <p className="about-lead">
          MakArena compares anonymous models across a conversation, then uses
          user voting data to build transparent performance rankings.
          You can also use Chat mode for direct conversations with a single model.
        </p>
      </header>

      <section className="about-flow" aria-label="How MakArena works">
        <h2>How It Works</h2>
        <ol className="about-steps">
          <li>
            A user starts an arena conversation with one prompt.
          </li>
          <li>
            Two anonymous models respond side by side and keep their own conversation history.
          </li>
          <li>
            The user can continue the conversation for multiple turns before voting.
          </li>
          <li>
            The final vote applies to the full conversation: Model 1, Model 2, both good, or neither good.
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
          <p>Conversation-level voting captures model quality across multiple turns.</p>
          <p>Leaderboard metrics reflect real user preference signals.</p>
        </div>
      </section>

      <section className="about-partners" aria-label="Funding and collaboration">
        <div className="about-partners__block about-funding">
          <p className="about-funding__label">Funded by</p>
          <img
            src="/finki_logo.png"
            alt="Faculty of Computer Science and Engineering logo"
            className="about-funding__logo"
          />
        </div>

        <div className="about-partners__block about-collaboration">
          <p className="about-funding__label">In collaboration with</p>
          <p className="about-collaboration__title">Adstract</p>
          <p className="about-collaboration__copy">
            MakArena is developed as a collaboration between FINKI and the Adstract
            team.
          </p>
        </div>
      </section>
    </section>
  )
}
