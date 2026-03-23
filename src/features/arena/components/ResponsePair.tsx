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
      <button
        type="button"
        className={
          selectedVote === 'modelA'
            ? 'response-card response-card--selected'
            : 'response-card'
        }
        disabled={disabled}
        onClick={() => onSelectVote('modelA')}
        aria-label="Select answer 1"
      >
        <p className="response-card__badge">
          Answer 1
          {reveal && revealedModels ? ` · ${revealedModels.answer1Model}` : ''}
        </p>
        <p>{round.answerA}</p>
      </button>

      <button
        type="button"
        className={
          selectedVote === 'modelB'
            ? 'response-card response-card--selected'
            : 'response-card'
        }
        disabled={disabled}
        onClick={() => onSelectVote('modelB')}
        aria-label="Select answer 2"
      >
        <p className="response-card__badge">
          Answer 2
          {reveal && revealedModels ? ` · ${revealedModels.answer2Model}` : ''}
        </p>
        <p>{round.answerB}</p>
      </button>
    </section>
  )
}
