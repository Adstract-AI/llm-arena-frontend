import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import WestRoundedIcon from '@mui/icons-material/WestRounded'
import type { SvgIconComponent } from '@mui/icons-material'
import type { VoteChoice } from '../types'

interface VotePanelProps {
  selectedVote: VoteChoice | null
  onSelectVote: (vote: VoteChoice) => void
  onSubmitVote: () => Promise<void>
  disabled: boolean
}

const options: Array<{
  value: VoteChoice
  label: string
  helper: string
  icon: SvgIconComponent
}> = [
  {
    value: 'modelA',
    label: 'Model 1',
    helper: 'First model is better',
    icon: WestRoundedIcon,
  },
  {
    value: 'bothGood',
    label: 'Both are good',
    helper: 'Both were strong',
    icon: DoneAllRoundedIcon,
  },
  {
    value: 'bothBad',
    label: 'Neither is good',
    helper: 'Both missed the mark',
    icon: HighlightOffRoundedIcon,
  },
  {
    value: 'modelB',
    label: 'Model 2',
    helper: 'Second model is better',
    icon: EastRoundedIcon,
  },
]

export function VotePanel({
  selectedVote,
  onSelectVote,
  onSubmitVote,
  disabled,
}: VotePanelProps) {
  return (
    <section className="vote-panel" aria-label="Vote for best response">
      <div className="vote-panel__header">
        <h3>Choose the better response</h3>
        <button
          type="button"
          className="btn btn--primary vote-panel__submit"
          onClick={() => void onSubmitVote()}
          disabled={disabled || !selectedVote}
        >
          Submit Vote
        </button>
      </div>

      <div className="vote-panel__grid">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={selectedVote === option.value ? 'vote-btn vote-btn--selected' : 'vote-btn'}
            onClick={() => onSelectVote(option.value)}
            disabled={disabled}
          >
            <span className="vote-btn__top">
              <option.icon aria-hidden="true" className="vote-btn__icon" />
              <span>{option.label}</span>
            </span>
            <small>{option.helper}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
