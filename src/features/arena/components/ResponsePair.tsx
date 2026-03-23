import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ArenaRound, VoteChoice } from '../types'

interface ResponsePairProps {
  round: ArenaRound
  selectedVote: VoteChoice | null
  onSelectVote: (vote: VoteChoice) => void
  disabled: boolean
  reveal: boolean
  revealedModels?: {
    answer1Model: string
    answer2Model: string
  } | null
}

function renderMarkdown(text: string) {
  return (
    <div className="response-card__markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <pre className="response-card__code">{children}</pre>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export function ResponsePair({
  round,
  selectedVote,
  onSelectVote,
  disabled,
  reveal,
  revealedModels,
}: ResponsePairProps) {
  return (
    <section className="duel-grid" aria-live="polite">
      <div className="response-column">
        <p className="response-column__title">Model 1</p>
        {reveal && revealedModels ? (
          <p className="response-column__meta">{revealedModels.answer1Model}</p>
        ) : null}
        <button
          type="button"
          className={
            selectedVote === 'modelA'
              ? 'response-card response-card--selected'
              : 'response-card'
          }
          disabled={disabled}
          onClick={() => onSelectVote('modelA')}
          aria-label="Select model 1"
        >
          <div className="response-card__content">{renderMarkdown(round.answerA)}</div>
        </button>
      </div>

      <div className="response-column">
        <p className="response-column__title">Model 2</p>
        {reveal && revealedModels ? (
          <p className="response-column__meta">{revealedModels.answer2Model}</p>
        ) : null}
        <button
          type="button"
          className={
            selectedVote === 'modelB'
              ? 'response-card response-card--selected'
              : 'response-card'
          }
          disabled={disabled}
          onClick={() => onSelectVote('modelB')}
          aria-label="Select model 2"
        >
          <div className="response-card__content">{renderMarkdown(round.answerB)}</div>
        </button>
      </div>
    </section>
  )
}
