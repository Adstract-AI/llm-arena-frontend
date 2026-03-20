import type { VoteChoice } from '../types'

interface VotePanelProps {
  selectedVote: VoteChoice | null
  onSelectVote: (vote: VoteChoice) => void
  onSubmitVote: () => Promise<void>
  disabled: boolean
}

const options: Array<{ value: VoteChoice; label: string; helper: string }> = [
  { value: 'modelA', label: 'Answer 1', helper: 'First response is better' },
  { value: 'modelB', label: 'Answer 2', helper: 'Second response is better' },
  { value: 'bothGood', label: 'Both are good', helper: 'Both were strong' },
  { value: 'bothBad', label: 'Neither is good', helper: 'Both missed the mark' },
]

export function VotePanel({
  selectedVote,
  onSelectVote,
  onSubmitVote,
  disabled,
}: VotePanelProps) {
  return (
    <section className="vote-panel" aria-label="Vote for best response">
      <h3>Cast your vote</h3>
      <div className="vote-panel__grid">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={selectedVote === option.value ? 'vote-btn vote-btn--selected' : 'vote-btn'}
            onClick={() => onSelectVote(option.value)}
            disabled={disabled}
          >
            <span>{option.label}</span>
            <small>{option.helper}</small>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => void onSubmitVote()}
        disabled={disabled || !selectedVote}
      >
        Submit Vote
      </button>
    </section>
  )
}
