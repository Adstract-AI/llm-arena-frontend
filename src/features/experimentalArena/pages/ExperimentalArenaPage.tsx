import { Fragment, useMemo, useState } from 'react'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import { Link } from 'react-router-dom'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { TbShare3 } from 'react-icons/tb'
import {
  continueExperimentalBattle,
  getExperimentalBattleDetails,
  startExperimentalBattle,
  submitExperimentalResponseImprovement,
  submitExperimentalVote,
} from '../api/experimentalArenaApi'
import { PromptInput } from '../../arena/components/PromptInput'
import { VotePanel } from '../../arena/components/VotePanel'
import type { ArenaBattle, ArenaTurn, VoteChoice } from '../../arena/types'
import {
  EditableResponsePair,
  type EditableResponseState,
} from '../components/EditableResponsePair'
import { ExperimentalSetupPanel } from '../components/ExperimentalSetupPanel'
import type {
  ExperimentalDistributionType,
  ExperimentalParameterKey,
  ExperimentalParameterSettings,
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

const PARAMETER_LABELS: Record<ExperimentalParameterKey, string> = {
  temperature: 'temperature',
  topP: 'top-p',
  topK: 'top-k',
  frequencyPenalty: 'frequency penalty',
  presencePenalty: 'presence penalty',
}

function formatSetupSummary(setup: ExperimentalSetup): string {
  const baseSummary = setup.modelMode === 'same'
    ? setup.parameterMode === 'same'
      ? 'Same model · same parameters'
      : 'Same model · different parameters'
    : setup.parameterMode === 'same'
    ? 'Different models · same parameters'
    : 'Different models · different parameters'

  const enabledParameters = Object.entries(setup.parameters)
    .filter(([, parameter]) => parameter.enabled)
    .map(([key]) => PARAMETER_LABELS[key as ExperimentalParameterKey])

  if (enabledParameters.length === 0) {
    return `${baseSummary} · none exposed`
  }

  return `${baseSummary} · ${enabledParameters.join(', ')}`
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

function hasEnabledParameter(setup: ExperimentalSetup): boolean {
  return Object.values(setup.parameters).some((parameter) => parameter.enabled)
}

function formatParameterValue(value: number | null): string {
  if (value === null) {
    return 'Not used'
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(2)
}

function getModelDetailsLink(modelName: string): string {
  return `/models/${encodeURIComponent(modelName)}`
}

type EditableResponseSide = 'A' | 'B'
type ResponseEditMap = Record<string, EditableResponseState>

function getResponseEditKey(turnNumber: number, side: EditableResponseSide): string {
  return `${turnNumber}:${side}`
}

function createResponseState(originalResponse: string): EditableResponseState {
  return {
    originalResponse,
    editedResponse: null,
    draftResponse: originalResponse,
    isEditing: false,
    isShowingEdited: false,
  }
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
  const [responseEdits, setResponseEdits] = useState<ResponseEditMap>({})
  const [savingEditKey, setSavingEditKey] = useState<string | null>(null)
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
        : await startExperimentalBattle(prompt, confirmedSetup)
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
      const result = await submitExperimentalVote(battle.battleId, selectedVote)
      setVoteOutcome(result.outcome)
      setIsShowingParameters(true)
      setBattle(result.battle)
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
    if (!hasEnabledParameter(draftSetup)) {
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
    setResponseEdits({})
    setSavingEditKey(null)
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

  function getResponseState(
    turn: ArenaTurn,
    side: EditableResponseSide,
  ): EditableResponseState {
    const originalResponse = side === 'A' ? turn.answerA : turn.answerB
    const editedResponse =
      side === 'A' ? turn.answerAImprovementText : turn.answerBImprovementText
    const savedState = responseEdits[getResponseEditKey(turn.turnNumber, side)]

    return {
      originalResponse,
      editedResponse,
      draftResponse:
        savedState?.isEditing
          ? savedState.draftResponse
          : editedResponse ?? savedState?.draftResponse ?? originalResponse,
      isEditing: savedState?.isEditing ?? false,
      isShowingEdited: editedResponse ? (savedState?.isShowingEdited ?? false) : false,
    }
  }

  function updateResponseState(
    turn: ArenaTurn,
    side: EditableResponseSide,
    updater: (current: EditableResponseState) => EditableResponseState,
  ) {
    const key = getResponseEditKey(turn.turnNumber, side)
    const originalResponse = side === 'A' ? turn.answerA : turn.answerB

    setResponseEdits((current) => ({
      ...current,
      [key]: updater(current[key] ?? createResponseState(originalResponse)),
    }))
  }

  function startEditing(turn: ArenaTurn, side: EditableResponseSide) {
    updateResponseState(turn, side, (current) => ({
      ...current,
      draftResponse:
        current.isEditing
          ? current.draftResponse
          : current.editedResponse ?? current.originalResponse,
      isEditing: !current.isEditing,
    }))
  }

  function updateDraft(turn: ArenaTurn, side: EditableResponseSide, value: string) {
    updateResponseState(turn, side, (current) => ({
      ...current,
      draftResponse: value,
    }))
  }

  async function submitEditedResponse(turn: ArenaTurn, side: EditableResponseSide) {
    if (!battle) {
      return
    }

    const key = getResponseEditKey(turn.turnNumber, side)
    const currentState = getResponseState(turn, side)
    setSavingEditKey(key)
    setError(null)

    try {
      const nextBattle = await submitExperimentalResponseImprovement(
        battle.battleId,
        turn.turnNumber,
        side,
        currentState.draftResponse,
      )
      setBattle(nextBattle)
      setResponseEdits((current) => ({
        ...current,
        [key]: {
          ...currentState,
          editedResponse: currentState.draftResponse,
          draftResponse: currentState.draftResponse,
          isEditing: false,
          isShowingEdited: false,
        },
      }))
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not save your edited response.',
      )
    } finally {
      setSavingEditKey(null)
    }
  }

  function toggleEditedResponse(turn: ArenaTurn, side: EditableResponseSide) {
    updateResponseState(turn, side, (current) => {
      if (!current.editedResponse) {
        return current
      }

      return {
        ...current,
        isShowingEdited: !current.isShowingEdited,
      }
    })
  }

  function renderTurn(turn: ArenaTurn) {
    const isLatestTurn = turn.turnNumber === latestTurn?.turnNumber
    const isVotingTurn = isLatestTurn && !voteOutcome && !isGenerating
    const answerAState = getResponseState(turn, 'A')
    const answerBState = getResponseState(turn, 'B')

    return (
      <div key={turn.turnNumber} className="arena-turn">
        <article className="chat-message chat-message--user">
          <p className="chat-message__text">{turn.prompt}</p>
        </article>

        <article className="chat-message chat-message--assistant chat-message--duel">
          <p className="chat-message__role">Responses</p>
          <EditableResponsePair
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
            canEditLatest={isLatestTurn && !voteOutcome && !isGenerating}
            answerAIsSubmitting={savingEditKey === getResponseEditKey(turn.turnNumber, 'A')}
            answerBIsSubmitting={savingEditKey === getResponseEditKey(turn.turnNumber, 'B')}
            answerAState={answerAState}
            answerBState={answerBState}
            onStartEdit={(side) => startEditing(turn, side)}
            onDraftChange={(side, value) => updateDraft(turn, side, value)}
            onSubmitEdit={(side) => submitEditedResponse(turn, side)}
            onToggleEdited={(side) => toggleEditedResponse(turn, side)}
          />
        </article>
      </div>
    )
  }

  const experimentalResultRows = voteOutcome
    ? [
        {
          key: 'temperature',
          label: 'Temperature',
          answer1Value: voteOutcome.experiment.parameters.temperature.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.temperature.answer2Value,
        },
        {
          key: 'topP',
          label: 'Top-p',
          answer1Value: voteOutcome.experiment.parameters.topP.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.topP.answer2Value,
        },
        {
          key: 'topK',
          label: 'Top-k',
          answer1Value: voteOutcome.experiment.parameters.topK.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.topK.answer2Value,
        },
        {
          key: 'frequencyPenalty',
          label: 'Frequency penalty',
          answer1Value: voteOutcome.experiment.parameters.frequencyPenalty.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.frequencyPenalty.answer2Value,
        },
        {
          key: 'presencePenalty',
          label: 'Presence penalty',
          answer1Value: voteOutcome.experiment.parameters.presencePenalty.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.presencePenalty.answer2Value,
        },
      ]
    : []

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
                  {experimentalResultRows.map((row) => (
                    <Fragment key={row.key}>
                      <span>{row.label}</span>
                      <strong>{formatParameterValue(row.answer1Value)}</strong>
                    </Fragment>
                  ))}
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
                  {experimentalResultRows.map((row) => (
                    <Fragment key={row.key}>
                      <span>{row.label}</span>
                      <strong>{formatParameterValue(row.answer2Value)}</strong>
                    </Fragment>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </section>
  )
}
