import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ArenaTurn, VoteChoice } from '../types'

interface ResponsePairProps {
  round: ArenaTurn
  selectedVote: VoteChoice | null
  onSelectVote?: (vote: VoteChoice) => void
  disabled?: boolean
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
  disabled = false,
  reveal,
  revealedModels,
}: ResponsePairProps) {
  const canSelect = Boolean(onSelectVote) && !disabled
  const cardAClassName =
    selectedVote === 'modelA'
      ? 'response-card response-card--selected'
      : 'response-card'
  const cardBClassName =
    selectedVote === 'modelB'
      ? 'response-card response-card--selected'
      : 'response-card'

  function handleCardSelect(vote: VoteChoice) {
    const selectedText = window.getSelection()?.toString().trim()
    if (selectedText) {
      return
    }

    onSelectVote?.(vote)
  }

  return (
    <section className="duel-grid" aria-live="polite">
      <div className="response-column">
        <div className="response-column__header">
          <p className="response-column__title">Model 1</p>
          {reveal && revealedModels ? (
            <p className="response-column__meta">{revealedModels.answer1Model}</p>
          ) : null}
        </div>
        <button
          type="button"
          className={canSelect ? cardAClassName : `${cardAClassName} response-card--static`}
          disabled={disabled}
          onClick={canSelect ? () => handleCardSelect('modelA') : undefined}
          aria-disabled={!canSelect}
          tabIndex={canSelect ? 0 : -1}
          aria-label="Select model 1"
        >
          <div className="response-card__content">{renderMarkdown(round.answerA)}</div>
        </button>
      </div>

      <div className="response-column">
        <div className="response-column__header">
          <p className="response-column__title">Model 2</p>
          {reveal && revealedModels ? (
            <p className="response-column__meta">{revealedModels.answer2Model}</p>
          ) : null}
        </div>
        <button
          type="button"
          className={canSelect ? cardBClassName : `${cardBClassName} response-card--static`}
          disabled={disabled}
          onClick={canSelect ? () => handleCardSelect('modelB') : undefined}
          aria-disabled={!canSelect}
          tabIndex={canSelect ? 0 : -1}
          aria-label="Select model 2"
        >
          <div className="response-card__content">{renderMarkdown(round.answerB)}</div>
        </button>
      </div>
    </section>
  )
}
