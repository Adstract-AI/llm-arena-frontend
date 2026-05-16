import { useState } from 'react'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const selectedOption = options.find((option) => option.value === selectedVote)

  return (
    <section
      className={isCollapsed ? 'vote-panel vote-panel--collapsed' : 'vote-panel'}
      aria-label={strings.arena.votePanelLabel}
    >
      <div className="vote-panel__header">
        <div className="vote-panel__title-group">
          <h3>{strings.arena.voteTitle}</h3>
          {selectedOption ? (
            <p className="vote-panel__selection">
              {strings.arena[selectedOption.labelKey]}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="vote-panel__collapse"
          aria-expanded={!isCollapsed}
          aria-controls="vote-panel-options"
          aria-label={
            isCollapsed
              ? strings.arena.expandVotePanel
              : strings.arena.collapseVotePanel
          }
          title={
            isCollapsed
              ? strings.arena.expandVotePanel
              : strings.arena.collapseVotePanel
          }
          onClick={() => setIsCollapsed((current) => !current)}
        >
          {isCollapsed ? (
            <KeyboardArrowUpRoundedIcon aria-hidden="true" />
          ) : (
            <KeyboardArrowDownRoundedIcon aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="btn btn--primary vote-panel__submit"
          onClick={() => void onSubmitVote()}
          disabled={disabled || !selectedVote}
        >
          {strings.arena.submitVote}
        </button>
      </div>

      <div className="vote-panel__grid" id="vote-panel-options">
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
