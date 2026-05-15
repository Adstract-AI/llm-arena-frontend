import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import WestRoundedIcon from '@mui/icons-material/WestRounded'
import type { SvgIconComponent } from '@mui/icons-material'
import type { VoteChoice } from '../types'
import { useI18n } from '../../../shared/localisation/I18nContext'

interface VotePanelProps {
  selectedVote: VoteChoice | null
  onSelectVote: (vote: VoteChoice) => void
  onSubmitVote: () => Promise<void>
  disabled: boolean
}

const options: Array<{
  value: VoteChoice
  labelKey: 'voteModel1' | 'voteBothGood' | 'voteBothBad' | 'voteModel2'
  helperKey: 'voteModel1Helper' | 'voteBothGoodHelper' | 'voteBothBadHelper' | 'voteModel2Helper'
  icon: SvgIconComponent
}> = [
  {
    value: 'modelA',
    labelKey: 'voteModel1',
    helperKey: 'voteModel1Helper',
    icon: WestRoundedIcon,
  },
  {
    value: 'bothGood',
    labelKey: 'voteBothGood',
    helperKey: 'voteBothGoodHelper',
    icon: DoneAllRoundedIcon,
  },
  {
    value: 'bothBad',
    labelKey: 'voteBothBad',
    helperKey: 'voteBothBadHelper',
    icon: HighlightOffRoundedIcon,
  },
  {
    value: 'modelB',
    labelKey: 'voteModel2',
    helperKey: 'voteModel2Helper',
    icon: EastRoundedIcon,
  },
]

export function VotePanel({
  selectedVote,
  onSelectVote,
  onSubmitVote,
  disabled,
}: VotePanelProps) {
  const { strings } = useI18n()

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
              <span>{strings.arena[option.labelKey]}</span>
            </span>
            <small>{strings.arena[option.helperKey]}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
