import { useMemo, useState } from 'react'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import { Link } from 'react-router-dom'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { TbShare3 } from 'react-icons/tb'
import {
  continueExperimentalBattle,
  getExperimentalBattleDetails,
  startExperimentalBattle,
  submitExperimentalVote,
} from '../api/experimentalArenaApi'
import { PromptInput } from '../../arena/components/PromptInput'
import { ResponsePair } from '../../arena/components/ResponsePair'
import { VotePanel } from '../../arena/components/VotePanel'
import type { ArenaBattle, ArenaTurn, VoteChoice } from '../../arena/types'
import { ExperimentalSetupPanel } from '../components/ExperimentalSetupPanel'
import type {
  ExperimentalDistributionType,
  ExperimentalParameterReveal,
  ExperimentalParameterSettings,
  ExperimentalParameterValues,
  ExperimentalSetup,
  ExperimentalVoteOutcome,
} from '../types'

const DEFAULT_PARAMETER_DISTRIBUTION: ExperimentalDistributionType = 'uniform'

const DEFAULT_PARAMETER_SETTINGS: ExperimentalParameterSettings = {
  temperature: { enabled: true, distribution: DEFAULT_PARAMETER_DISTRIBUTION },
  topP: { enabled: false, distribution: DEFAULT_PARAMETER_DISTRIBUTION },
  topK: { enabled: false, distribution: DEFAULT_PARAMETER_DISTRIBUTION },
  frequencyPenalty: { enabled: false, distribution: DEFAULT_PARAMETER_DISTRIBUTION },
  presencePenalty: { enabled: false, distribution: DEFAULT_PARAMETER_DISTRIBUTION },
}

const DEFAULT_SETUP: ExperimentalSetup = {
  modelMode: 'same',
  parameterMode: 'random',
  parameters: DEFAULT_PARAMETER_SETTINGS,
}

function formatSetupSummary(setup: ExperimentalSetup): string {
  return setup.modelMode === 'same'
    ? setup.parameterMode === 'same'
      ? 'Same model · same parameters'
      : 'Same model · random parameters'
    : setup.parameterMode === 'same'
    ? 'Different models · same parameters'
    : 'Different models · random parameters'
}

function cloneDefaultParameterSettings(): ExperimentalParameterSettings {
  return {
    temperature: { ...DEFAULT_PARAMETER_SETTINGS.temperature },
    topP: { ...DEFAULT_PARAMETER_SETTINGS.topP },
    topK: { ...DEFAULT_PARAMETER_SETTINGS.topK },
    frequencyPenalty: { ...DEFAULT_PARAMETER_SETTINGS.frequencyPenalty },
    presencePenalty: { ...DEFAULT_PARAMETER_SETTINGS.presencePenalty },
  }
}

function requiresEnabledParameter(setup: ExperimentalSetup): boolean {
  return setup.modelMode === 'same' || setup.parameterMode === 'same'
}

function hasEnabledParameter(setup: ExperimentalSetup): boolean {
  return Object.values(setup.parameters).some((parameter) => parameter.enabled)
}

function createMockParameterReveal(setup: ExperimentalSetup): ExperimentalParameterReveal {
  const profileA: ExperimentalParameterValues = {
    temperature: 0.35,
    topP: 0.9,
    topK: 40,
    frequencyPenalty: 0.2,
    presencePenalty: 0.05,
  }
  const profileB: ExperimentalParameterValues = {
    temperature: 0.78,
    topP: 0.96,
    topK: 60,
    frequencyPenalty: 0.45,
    presencePenalty: 0.22,
  }
  const sharedProfile: ExperimentalParameterValues = {
    temperature: 0.55,
    topP: 0.92,
    topK: 50,
    frequencyPenalty: 0.15,
    presencePenalty: 0.1,
  }

  if (setup.modelMode === 'different' && setup.parameterMode === 'same') {
    return {
      answer1: sharedProfile,
      answer2: sharedProfile,
    }
  }

  return {
    answer1: profileA,
    answer2: profileB,
  }
}

function formatParameterValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2)
}

function getModelDetailsLink(modelName: string): string {
  return `/models/${encodeURIComponent(modelName)}`
}

export function ExperimentalArenaPage() {
  const [battle, setBattle] = useState<ArenaBattle | null>(null)
  const [voteOutcome, setVoteOutcome] = useState<ExperimentalVoteOutcome | null>(null)
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(null)
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [draftSetup, setDraftSetup] = useState<ExperimentalSetup>({
    modelMode: DEFAULT_SETUP.modelMode,
    parameterMode: DEFAULT_SETUP.parameterMode,
    parameters: cloneDefaultParameterSettings(),
  })
  const [confirmedSetup, setConfirmedSetup] = useState<ExperimentalSetup | null>(null)
  const [isEditingSetup, setIsEditingSetup] = useState(true)
  const [isShowingParameters, setIsShowingParameters] = useState(false)
  const [setupValidationMessage, setSetupValidationMessage] = useState<string | null>(null)
  const turns = battle?.turns ?? []
  const latestTurn = turns.length > 0 ? turns[turns.length - 1] : null

  const winnerLabel = useMemo(() => {
    if (!voteOutcome) {
      return null
    }

    if (voteOutcome.winner === 'modelA') {
      return voteOutcome.answer1ModelName
    }

    if (voteOutcome.winner === 'modelB') {
      return voteOutcome.answer2ModelName
    }

    return 'Tie'
  }, [voteOutcome])

  async function syncBattleState(nextBattle: ArenaBattle) {
    try {
      const refreshedBattle = await getExperimentalBattleDetails(nextBattle.battleId)
      setBattle(refreshedBattle)
    } catch {
      setBattle(nextBattle)
    }
  }

  async function handlePromptSubmit(prompt: string) {
    if (!confirmedSetup || isGenerating || isVoting || voteOutcome) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setSelectedVote(null)
    setPendingPrompt(prompt)

    try {
      const nextBattle = battle
        ? await continueExperimentalBattle(battle.battleId, prompt)
        : await startExperimentalBattle(prompt)
      await syncBattleState(nextBattle)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not process your prompt.',
      )
    } finally {
      setIsGenerating(false)
      setPendingPrompt(null)
    }
  }

  async function handleVoteSubmit() {
    if (!battle || !selectedVote || !confirmedSetup || voteOutcome) {
      return
    }

    setIsVoting(true)
    setError(null)

    try {
      const outcome = await submitExperimentalVote(battle.battleId, selectedVote)
      setVoteOutcome({
        ...outcome,
        parameters: createMockParameterReveal(confirmedSetup),
      })
      await syncBattleState(battle)
    } catch (voteError) {
      setError(
        voteError instanceof Error
          ? voteError.message
          : 'Could not submit your vote.',
      )
    } finally {
      setIsVoting(false)
    }
  }

  function handleConfirmSetup() {
    if (requiresEnabledParameter(draftSetup) && !hasEnabledParameter(draftSetup)) {
      setSetupValidationMessage('Enable at least one parameter for this setup.')
      return
    }

    setConfirmedSetup(draftSetup)
    setIsEditingSetup(false)
    setSetupValidationMessage(null)
  }

  function resetRound() {
    setBattle(null)
    setVoteOutcome(null)
    setSelectedVote(null)
    setPendingPrompt(null)
    setError(null)
    setDraftSetup({
      modelMode: DEFAULT_SETUP.modelMode,
      parameterMode: DEFAULT_SETUP.parameterMode,
      parameters: cloneDefaultParameterSettings(),
    })
    setConfirmedSetup(null)
    setIsEditingSetup(true)
    setIsShowingParameters(false)
    setSetupValidationMessage(null)
  }

  const experimentalClassName = [
    'arena',
    'experimental-arena',
    turns.length > 0 || pendingPrompt ? 'arena--active' : 'arena--idle',
    battle && !voteOutcome && !isGenerating ? 'arena--with-vote-panel' : null,
    voteOutcome ? 'arena--with-result-panel' : null,
  ]
    .filter(Boolean)
    .join(' ')

  function renderTurn(turn: ArenaTurn) {
    const isLatestTurn = turn.turnNumber === latestTurn?.turnNumber
    const isVotingTurn = isLatestTurn && !voteOutcome && !isGenerating

    return (
      <div key={turn.turnNumber} className="arena-turn">
        <article className="chat-message chat-message--user">
          <p className="chat-message__text">{turn.prompt}</p>
        </article>

        <article className="chat-message chat-message--assistant chat-message--duel">
          <p className="chat-message__role">Responses</p>
          <ResponsePair
            round={turn}
            selectedVote={isVotingTurn ? selectedVote : null}
            onSelectVote={isVotingTurn ? setSelectedVote : undefined}
            disabled={isVoting}
            reveal={Boolean(voteOutcome) && isLatestTurn}
            revealedModels={
              voteOutcome && isLatestTurn
                ? {
                    answer1Model: voteOutcome.answer1ModelName,
                    answer2Model: voteOutcome.answer2ModelName,
                  }
                : null
            }
          />
        </article>
      </div>
    )
  }

  return (
    <section className={experimentalClassName}>
      {!turns.length && !pendingPrompt ? (
        <div className="experimental-arena__setup-shell">
          <div className="page-card page-card--helper experimental-arena__intro-card">
            <p className="eyebrow">Experimental Arena</p>
            <h2>Compare with one extra layer of control.</h2>
            <p>
              Keep the same ChatVote rhythm, but define the comparison setup first
              so you can test same-model runs or parameter-matched battles.
            </p>
            <div className="arena-note" aria-label="Experimental arena disclaimer">
              <strong>Experimental mode:</strong>
              <span>
                Parameter values stay hidden until after voting to preserve the
                blind-evaluation flow.
              </span>
              <span>
                This page currently uses the same endpoints as Arena while the new
                backend is being prepared.
              </span>
            </div>
          </div>

          {confirmedSetup && !isEditingSetup ? (
            <section className="experimental-summary experimental-summary--editable">
              <div>
                <p className="experimental-summary__label">Configuration set</p>
                <p className="experimental-summary__value">
                  {formatSetupSummary(confirmedSetup)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--ghost experimental-summary__action"
                onClick={() => setIsEditingSetup(true)}
              >
                Change
              </button>
            </section>
          ) : (
            <ExperimentalSetupPanel
              value={draftSetup}
              onModelModeChange={(modelMode) => {
                setSetupValidationMessage(null)
                setDraftSetup((current) => ({
                  ...current,
                  modelMode,
                }))
              }}
              onParameterModeChange={(parameterMode) => {
                setSetupValidationMessage(null)
                setDraftSetup((current) => ({ ...current, parameterMode }))
              }}
              onParameterEnabledChange={(key, enabled) => {
                setSetupValidationMessage(null)
                setDraftSetup((current) => ({
                  ...current,
                  parameters: {
                    ...current.parameters,
                    [key]: {
                      ...current.parameters[key],
                      enabled,
                    },
                  },
                }))
              }}
              onParameterDistributionChange={(key, distribution) => {
                setDraftSetup((current) => ({
                  ...current,
                  parameters: {
                    ...current.parameters,
                    [key]: {
                      ...current.parameters[key],
                      distribution,
                    },
                  },
                }))
              }}
              onConfirm={handleConfirmSetup}
              validationMessage={setupValidationMessage}
            />
          )}
        </div>
      ) : null}

      {error ? <p className="leaderboard-error">{error}</p> : null}

      <section className="chat-space" aria-live="polite">
        {confirmedSetup && (turns.length > 0 || pendingPrompt) && !voteOutcome ? (
          <div className="experimental-context-chip" aria-label="Current experiment setup">
            <TuneRoundedIcon
              aria-hidden="true"
              className="experimental-context-chip__icon"
            />
            <span>{formatSetupSummary(confirmedSetup)}</span>
          </div>
        ) : null}

        {turns.map(renderTurn)}

        {pendingPrompt ? (
          <>
            <article className="chat-message chat-message--user">
              <p className="chat-message__text">{pendingPrompt}</p>
            </article>
            <article className="chat-message chat-message--assistant chat-message--loading">
              <p className="chat-message__role">MakArena</p>
              <div className="typing-indicator" aria-label="Generating answers">
                <span />
                <span />
                <span />
              </div>
              <div className="duel-grid duel-grid--skeleton">
                <div className="response-card response-card--skeleton" />
                <div className="response-card response-card--skeleton" />
              </div>
            </article>
          </>
        ) : null}
      </section>

      {!voteOutcome ? (
        <PromptInput
          onSubmit={handlePromptSubmit}
          loading={isGenerating}
          disabled={isVoting || !confirmedSetup}
          placeholder={
            confirmedSetup
              ? 'Ask to compare responses...'
              : 'Set the experimental configuration first...'
          }
        />
      ) : null}

      {battle && !voteOutcome && !isGenerating && battle.canVote ? (
        <VotePanel
          selectedVote={selectedVote}
          onSelectVote={setSelectedVote}
          onSubmitVote={handleVoteSubmit}
          disabled={isVoting}
        />
      ) : null}

      {battle && voteOutcome ? (
        <section className="result-card result-card--experimental" aria-live="polite">
          <div className="result-card__top">
            <p className="result-card__kicker">Vote submitted</p>
            <button
              type="button"
              className="btn btn--ghost result-card__new-chat"
              onClick={resetRound}
            >
              <RefreshRoundedIcon
                aria-hidden="true"
                className="result-card__new-chat-icon"
              />
              Start New Experiment
            </button>
          </div>
          <h3>Thanks, your vote has been counted.</h3>

          <div className="experimental-result__controls">
            <button
              type="button"
              className="experimental-parameters__toggle"
              onClick={() => setIsShowingParameters((current) => !current)}
            >
              {isShowingParameters ? 'Hide parameters' : 'View parameters'}
            </button>
          </div>

          <div className="result-card__grid">
            <article
              className={
                isShowingParameters ? 'result-chip result-chip--expanded' : 'result-chip'
              }
            >
              <span className="result-chip__label">Model 1</span>
              <strong>
                <Link
                  className="result-chip__model-link"
                  to={getModelDetailsLink(voteOutcome.answer1ModelName)}
                >
                  {voteOutcome.answer1ModelName}
                  <TbShare3 aria-hidden="true" className="model-link__icon" />
                </Link>
              </strong>

              <div
                className={
                  isShowingParameters
                    ? 'result-chip__parameters-wrap result-chip__parameters-wrap--open'
                    : 'result-chip__parameters-wrap'
                }
                aria-hidden={!isShowingParameters}
              >
                <div className="result-chip__parameters-panel">
                  <span>Temperature</span>
                  <strong>
                    {formatParameterValue(voteOutcome.parameters.answer1.temperature)}
                  </strong>
                  <span>Top-p</span>
                  <strong>{formatParameterValue(voteOutcome.parameters.answer1.topP)}</strong>
                  <span>Top-k</span>
                  <strong>{formatParameterValue(voteOutcome.parameters.answer1.topK)}</strong>
                  <span>Frequency penalty</span>
                  <strong>
                    {formatParameterValue(voteOutcome.parameters.answer1.frequencyPenalty)}
                  </strong>
                  <span>Presence penalty</span>
                  <strong>
                    {formatParameterValue(voteOutcome.parameters.answer1.presencePenalty)}
                  </strong>
                </div>
              </div>
            </article>

            <article className="result-chip result-chip--winner">
              <span className="result-chip__label">Winning model</span>
              <strong>
                {voteOutcome.winner === 'tie' || !winnerLabel ? (
                  winnerLabel
                ) : (
                  <Link
                    className="result-chip__model-link"
                    to={getModelDetailsLink(winnerLabel)}
                  >
                    {winnerLabel}
                    <TbShare3 aria-hidden="true" className="model-link__icon" />
                  </Link>
                )}
              </strong>
            </article>

            <article
              className={
                isShowingParameters ? 'result-chip result-chip--expanded' : 'result-chip'
              }
            >
              <span className="result-chip__label">Model 2</span>
              <strong>
                <Link
                  className="result-chip__model-link"
                  to={getModelDetailsLink(voteOutcome.answer2ModelName)}
                >
                  {voteOutcome.answer2ModelName}
                  <TbShare3 aria-hidden="true" className="model-link__icon" />
                </Link>
              </strong>

              <div
                className={
                  isShowingParameters
                    ? 'result-chip__parameters-wrap result-chip__parameters-wrap--open'
                    : 'result-chip__parameters-wrap'
                }
                aria-hidden={!isShowingParameters}
              >
                <div className="result-chip__parameters-panel">
                  <span>Temperature</span>
                  <strong>
                    {formatParameterValue(voteOutcome.parameters.answer2.temperature)}
                  </strong>
                  <span>Top-p</span>
                  <strong>{formatParameterValue(voteOutcome.parameters.answer2.topP)}</strong>
                  <span>Top-k</span>
                  <strong>{formatParameterValue(voteOutcome.parameters.answer2.topK)}</strong>
                  <span>Frequency penalty</span>
                  <strong>
                    {formatParameterValue(voteOutcome.parameters.answer2.frequencyPenalty)}
                  </strong>
                  <span>Presence penalty</span>
                  <strong>
                    {formatParameterValue(voteOutcome.parameters.answer2.presencePenalty)}
                  </strong>
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </section>
  )
}
