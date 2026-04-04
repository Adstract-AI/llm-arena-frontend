export function AboutPage() {
  return (
    <section className="about">
      <header className="about-hero">
        <p className="eyebrow">About MakArena</p>
        <h1 className="about-title">Blind evaluation for fairer model decisions.</h1>
        <p className="about-lead">
          MakArena compares anonymous models across a conversation, then uses
          user voting data to build transparent performance rankings.
          You can also use Chat mode for direct conversations with a single model,
          or Experimental Arena for more controlled comparison runs.
        </p>
      </header>

      <section className="about-highlight" aria-label="Available experiences">
        <h2>What&apos;s available</h2>
        <div className="about-highlight__grid">
          <article className="about-highlight__item">
            <h3>Arena</h3>
            <p>
              Put two anonymous models side by side and judge the quality of their
              answers without brand bias getting in the way.
            </p>
          </article>
          <article className="about-highlight__item">
            <h3>Chat</h3>
            <p>
              Talk directly with one model when you want a fast answer, a longer
              conversation, or a simpler one-on-one flow.
            </p>
          </article>
          <article className="about-highlight__item">
            <h3>Experimental Arena</h3>
            <p>
              Shape the comparison before it starts by choosing how models and
              parameters behave, then see how those choices affect the outcome.
            </p>
          </article>
        </div>
      </section>

      <section className="about-flow" aria-label="How MakArena works">
        <h2>How It Works</h2>
        <div className="about-flow__grid">
          <article className="about-flow__block">
            <p className="about-flow__block-kicker">Standard flow</p>
            <h3>Arena flow</h3>
            <div className="about-stack">
              <div className="about-item about-item--step">
                <span className="about-item__number">01</span>
                <h4>Start with a prompt</h4>
                <p>Submit a question or task to begin the comparison.</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">02</span>
                <h4>Compare anonymous answers</h4>
                <p>Two hidden models respond side by side so quality stays front and center.</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">03</span>
                <h4>Continue or vote</h4>
                <p>Keep the conversation going for more turns, or vote when you have enough signal.</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">04</span>
                <h4>Reveal the models</h4>
                <p>Identities appear only after the vote is submitted.</p>
              </div>
            </div>
          </article>

          <article className="about-flow__block">
            <p className="about-flow__block-kicker">Additional setup</p>
            <h3>What Experimental Arena adds</h3>
            <div className="about-stack">
              <div className="about-item about-item--step">
                <span className="about-item__number">01</span>
                <h4>Choose the setup first</h4>
                <p>Select whether the round compares the same model twice or two different models.</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">02</span>
                <h4>Control parameter behavior</h4>
                <p>Decide which parameters are active and how their values should be sampled.</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">03</span>
                <h4>Run the comparison blind</h4>
                <p>The conversation still follows the same anonymous compare-and-vote flow as Arena. After each round, you can also submit an improved version of the last response.</p>
              </div>
              <div className="about-item about-item--step">
                <span className="about-item__number">04</span>
                <h4>See the extra detail after voting</h4>
                <p>Once the vote is done, the models and the parameter values used in that round are revealed.</p>
              </div>
            </div>
          </article>
        </div>
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
      </section>
    </section>
  )
}
