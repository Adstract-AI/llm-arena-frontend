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
  answerAStatus?: ResponseSlotStatus
  answerBStatus?: ResponseSlotStatus
  answerAError?: string | null
  answerBError?: string | null
}

export type ResponseSlotStatus = 'idle' | 'streaming' | 'completed' | 'failed'

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
  answerAStatus = 'completed',
  answerBStatus = 'completed',
  answerAError = null,
  answerBError = null,
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

  function renderCard(
    label: 'Model 1' | 'Model 2',
    vote: 'modelA' | 'modelB',
    responseText: string,
    modelName: string | undefined,
    status: ResponseSlotStatus,
    error: string | null,
    className: string,
  ) {
    const isStreaming = status === 'streaming'
    const isFailed = status === 'failed'

    return (
      <div className="response-column">
        <div className="response-column__header">
          <p className="response-column__title">{label}</p>
          {reveal && modelName ? (
            <p className="response-column__meta">{modelName}</p>
          ) : null}
        </div>
        <button
          type="button"
          className={[
            canSelect ? className : `${className} response-card--static`,
            isStreaming ? 'response-card--streaming' : null,
            isFailed ? 'response-card--failed' : null,
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          onClick={canSelect ? () => handleCardSelect(vote) : undefined}
          aria-disabled={!canSelect}
          tabIndex={canSelect ? 0 : -1}
          aria-label={`Select ${label.toLowerCase()}`}
        >
          <div className="response-card__content">
            {responseText ? renderMarkdown(responseText) : null}
            {isStreaming ? (
              <div className="response-card__stream-status" aria-label={`${label} is generating`}>
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {isFailed && error ? (
              <p className="response-card__error">{error}</p>
            ) : null}
          </div>
        </button>
      </div>
    )
  }

  return (
    <section className="duel-grid" aria-live="polite">
      {renderCard(
        'Model 1',
        'modelA',
        round.answerA,
        revealedModels?.answer1Model,
        answerAStatus,
        answerAError,
        cardAClassName,
      )}
      {renderCard(
        'Model 2',
        'modelB',
        round.answerB,
        revealedModels?.answer2Model,
        answerBStatus,
        answerBError,
        cardBClassName,
      )}
    </section>
  )
}
