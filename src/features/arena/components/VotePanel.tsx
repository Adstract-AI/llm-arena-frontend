import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import WestRoundedIcon from '@mui/icons-material/WestRounded'
import type { SvgIconComponent } from '@mui/icons-material'
import type { VoteChoice } from '../types'
import { useI18n } from '../../../shared/i18n/I18nContext'

interface VotePanelProps {
  selectedVote: VoteChoice | null
  onSelectVote: (vote: VoteChoice) => void
  onSubmitVote: () => Promise<void>
  disabled: boolean
}

export function VotePanel({
  selectedVote,
  onSelectVote,
  onSubmitVote,
  disabled,
}: VotePanelProps) {
  const { strings } = useI18n()
  const options: Array<{
    value: VoteChoice
    label: string
    helper: string
    icon: SvgIconComponent
  }> = [
    {
      value: 'modelA',
      label: strings.arena.voteModel1,
      helper: strings.arena.voteModel1Helper,
      icon: WestRoundedIcon,
    },
    {
      value: 'bothGood',
      label: strings.arena.voteBothGood,
      helper: strings.arena.voteBothGoodHelper,
      icon: DoneAllRoundedIcon,
    },
    {
      value: 'bothBad',
      label: strings.arena.voteBothBad,
      helper: strings.arena.voteBothBadHelper,
      icon: HighlightOffRoundedIcon,
    },
    {
      value: 'modelB',
      label: strings.arena.voteModel2,
      helper: strings.arena.voteModel2Helper,
      icon: EastRoundedIcon,
    },
  ]

  return (
    <section className="vote-panel" aria-label={strings.arena.votePanelLabel}>
      <div className="vote-panel__header">
        <h3>{strings.arena.voteTitle}</h3>
        <button
          type="button"
          className="btn btn--primary vote-panel__submit"
          onClick={() => void onSubmitVote()}
          disabled={disabled || !selectedVote}
        >
          {strings.arena.submitVote}
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
