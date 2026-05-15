import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import { Link } from 'react-router-dom'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { TbShare3 } from 'react-icons/tb'
import {
  continueExperimentalBattle,
  continueExperimentalBattleStream,
  getExperimentalBattleDetails,
  startExperimentalBattle,
  startExperimentalBattleStream,
  submitExperimentalResponseImprovement,
  submitExperimentalVote,
  toArenaBattle,
  type BattleStateResponse,
} from '../api/experimentalArenaApi'
import { PromptInput } from '../../arena/components/PromptInput'
import { VotePanel } from '../../arena/components/VotePanel'
import type { ArenaBattle, ArenaTurn, VoteChoice } from '../../arena/types'
import type { ResponseSlotStatus } from '../../arena/components/ResponsePair'
import {
  EditableResponsePair,
  type EditableResponseState,
} from '../components/EditableResponsePair'
import { ExperimentalSetupPanel } from '../components/ExperimentalSetupPanel'
import { useAuth } from '../../auth/context/AuthContext'
import { AuthGateCard } from '../../auth/components/AuthGateCard'
import {
  readLocalJson,
  removeLocalJson,
  writeLocalJson,
} from '../../../shared/storage/localJsonStorage'
import { FriendlyErrorToast } from '../../../shared/components/FriendlyErrorToast'
import { env } from '../../../shared/config/env'
import { isRateLimitError } from '../../../shared/network/rateLimit'
import { useI18n } from '../../../shared/localisation/I18nContext'
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

const EXPERIMENTAL_ARENA_SESSION_STORAGE_KEY = 'makarena-experimental-arena-session-v1'

type ExperimentalStrings = ReturnType<typeof useI18n>['strings']['experimental']

function formatSetupSummary(setup: ExperimentalSetup, strings: ExperimentalStrings): string {
  const baseSummary = setup.modelMode === 'same'
    ? setup.parameterMode === 'same'
      ? strings.sameModelSameParameters
      : strings.sameModelDifferentParameters
    : setup.parameterMode === 'same'
    ? strings.differentModelsSameParameters
    : strings.differentModelsDifferentParameters

  const enabledParameters = Object.entries(setup.parameters)
    .filter(([, parameter]) => parameter.enabled)
    .map(([key]) => {
      const labels: Record<ExperimentalParameterKey, string> = {
        temperature: strings.temperature,
        topP: strings.topP,
        topK: strings.topK,
        frequencyPenalty: strings.frequencyPenalty,
        presencePenalty: strings.presencePenalty,
      }

      return labels[key as ExperimentalParameterKey]
    })

  if (enabledParameters.length === 0) {
    return `${baseSummary} · ${strings.noneExposed}`
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

function formatParameterValue(value: number | null, strings: ExperimentalStrings): string {
  if (value === null) {
    return strings.notUsed
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(2)
}

function getModelDetailsLink(modelName: string): string {
  return `/models/${encodeURIComponent(modelName)}`
}

type EditableResponseSide = 'A' | 'B'
type StreamSlot = 'A' | 'B'
type ResponseEditMap = Record<string, EditableResponseState>

interface StreamingTurnState {
  turn: ArenaTurn
  slotStatuses: Record<StreamSlot, ResponseSlotStatus>
  slotErrors: Record<StreamSlot, string | null>
}

interface ExperimentalArenaSessionSnapshot {
  battle: ArenaBattle | null
  voteOutcome: ExperimentalVoteOutcome | null
  selectedVote: VoteChoice | null
  draftSetup: ExperimentalSetup
  confirmedSetup: ExperimentalSetup | null
  isEditingSetup: boolean
  isShowingParameters: boolean
  responseEdits: ResponseEditMap
}

function createDefaultSetup(): ExperimentalSetup {
  return {
    modelMode: DEFAULT_SETUP.modelMode,
    parameterMode: DEFAULT_SETUP.parameterMode,
    parameters: cloneDefaultParameterSettings(),
  }
}

function readExperimentalArenaSessionSnapshot(): ExperimentalArenaSessionSnapshot | null {
  return readLocalJson<ExperimentalArenaSessionSnapshot>(
    EXPERIMENTAL_ARENA_SESSION_STORAGE_KEY,
  )
}

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

function createStreamingTurn(prompt: string, turnNumber: number): StreamingTurnState {
  return {
    turn: {
      turnNumber,
      prompt,
      answerA: '',
      answerB: '',
      answerAImprovementText: null,
      answerBImprovementText: null,
    },
    slotStatuses: {
      A: 'idle',
      B: 'idle',
    },
    slotErrors: {
      A: null,
      B: null,
    },
  }
}

function getStreamSlot(payload: unknown): StreamSlot | null {
  const slot = typeof payload === 'object' && payload && 'slot' in payload
    ? String((payload as { slot?: unknown }).slot).toUpperCase()
    : ''

  return slot === 'A' || slot === 'B' ? slot : null
}

function getPayloadText(payload: unknown, key: 'text' | 'response_text' | 'error'): string {
  if (!payload || typeof payload !== 'object' || !(key in payload)) {
    return ''
  }

  const value = (payload as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}

export function ExperimentalArenaPage() {
  const { isAuthenticated, isInitializing } = useAuth()
  const { strings } = useI18n()
  const savedSession = useMemo(readExperimentalArenaSessionSnapshot, [])
  const [battle, setBattle] = useState<ArenaBattle | null>(savedSession?.battle ?? null)
  const [voteOutcome, setVoteOutcome] = useState<ExperimentalVoteOutcome | null>(
    savedSession?.voteOutcome ?? null,
  )
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(
    savedSession?.selectedVote ?? null,
  )
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const [streamingTurn, setStreamingTurn] = useState<StreamingTurnState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const streamAbortRef = useRef<AbortController | null>(null)
  const shouldScrollToNextResponseRef = useRef(false)
  const [draftSetup, setDraftSetup] = useState<ExperimentalSetup>(
    savedSession?.draftSetup ?? createDefaultSetup(),
  )
  const [confirmedSetup, setConfirmedSetup] = useState<ExperimentalSetup | null>(
    savedSession?.confirmedSetup ?? null,
  )
  const [isEditingSetup, setIsEditingSetup] = useState(
    savedSession?.isEditingSetup ?? true,
  )
  const [isShowingParameters, setIsShowingParameters] = useState(
    savedSession?.isShowingParameters ?? false,
  )
  const [setupValidationMessage, setSetupValidationMessage] = useState<string | null>(null)
  const [responseEdits, setResponseEdits] = useState<ResponseEditMap>(
    savedSession?.responseEdits ?? {},
  )
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

    return strings.arena.tie
  }, [strings.arena.tie, voteOutcome])

  useEffect(() => {
    if (isInitializing) {
      return
    }

    if (!isAuthenticated) {
      removeLocalJson(EXPERIMENTAL_ARENA_SESSION_STORAGE_KEY)
      return
    }

    const hasMeaningfulSession =
      battle ||
      voteOutcome ||
      selectedVote ||
      confirmedSetup ||
      !isEditingSetup ||
      isShowingParameters ||
      Object.keys(responseEdits).length > 0

    if (!hasMeaningfulSession) {
      removeLocalJson(EXPERIMENTAL_ARENA_SESSION_STORAGE_KEY)
      return
    }

    writeLocalJson<ExperimentalArenaSessionSnapshot>(
      EXPERIMENTAL_ARENA_SESSION_STORAGE_KEY,
      {
        battle,
        voteOutcome,
        selectedVote,
        draftSetup,
        confirmedSetup,
        isEditingSetup,
        isShowingParameters,
        responseEdits,
      },
    )
  }, [
    battle,
    confirmedSetup,
    draftSetup,
    isAuthenticated,
    isInitializing,
    isEditingSetup,
    isShowingParameters,
    responseEdits,
    selectedVote,
    voteOutcome,
  ])

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort()
    }
  }, [])

  const scrollToNewResponse = useCallback((node: HTMLElement | null) => {
    if (!node || !shouldScrollToNextResponseRef.current) {
      return
    }

    shouldScrollToNextResponseRef.current = false
    window.requestAnimationFrame(() => {
      const top = node.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      })
    })
  }, [])

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
    setStreamingTurn(null)
    shouldScrollToNextResponseRef.current = true

    try {
      if (env.enableStreaming) {
        const abortController = new AbortController()
        streamAbortRef.current = abortController
        const nextTurnNumber = (latestTurn?.turnNumber ?? 0) + 1
        setStreamingTurn(createStreamingTurn(prompt, nextTurnNumber))

        const handleStreamEvent = async (event: string, data: unknown) => {
          if (event === 'response_started') {
            const slot = getStreamSlot(data)
            if (!slot) return
            setStreamingTurn((current) =>
              current
                ? {
                    ...current,
                    slotStatuses: {
                      ...current.slotStatuses,
                      [slot]: 'streaming',
                    },
                    slotErrors: {
                      ...current.slotErrors,
                      [slot]: null,
                    },
                  }
                : current,
            )
            return
          }

          if (event === 'response_delta') {
            const slot = getStreamSlot(data)
            const text = getPayloadText(data, 'text')
            if (!slot || !text) return

            setStreamingTurn((current) => {
              if (!current) return current
              return {
                ...current,
                turn: {
                  ...current.turn,
                  answerA: slot === 'A' ? current.turn.answerA + text : current.turn.answerA,
                  answerB: slot === 'B' ? current.turn.answerB + text : current.turn.answerB,
                },
              }
            })
            return
          }

          if (event === 'response_completed') {
            const slot = getStreamSlot(data)
            const text = getPayloadText(data, 'response_text')
            if (!slot) return

            setStreamingTurn((current) => {
              if (!current) return current
              return {
                ...current,
                turn: {
                  ...current.turn,
                  answerA: slot === 'A' ? text : current.turn.answerA,
                  answerB: slot === 'B' ? text : current.turn.answerB,
                },
                slotStatuses: {
                  ...current.slotStatuses,
                  [slot]: 'completed',
                },
              }
            })
            return
          }

          if (event === 'response_failed') {
            const slot = getStreamSlot(data)
            if (!slot) return
            setStreamingTurn((current) =>
              current
                ? {
                    ...current,
                    slotStatuses: {
                      ...current.slotStatuses,
                      [slot]: 'failed',
                    },
                    slotErrors: {
                      ...current.slotErrors,
                      [slot]:
                        getPayloadText(data, 'error') ||
                        strings.chat.responseFailed,
                    },
                  }
                : current,
            )
            return
          }

          if (event === 'battle_failed') {
            throw new Error(
              getPayloadText(data, 'error') || strings.arena.couldNotProcessPrompt,
            )
          }

          if (event === 'done') {
            shouldScrollToNextResponseRef.current = false
            setPendingPrompt(null)
            setStreamingTurn(null)
            setBattle(toArenaBattle(data as BattleStateResponse))
          }
        }

        await (battle
          ? continueExperimentalBattleStream(
              battle.battleId,
              prompt,
              {
                onEvent: ({ event, data }) => handleStreamEvent(event, data),
              },
              abortController.signal,
            )
          : startExperimentalBattleStream(
              prompt,
              confirmedSetup,
              {
                onEvent: ({ event, data }) => handleStreamEvent(event, data),
              },
              abortController.signal,
            ))

        return
      }

      const nextBattle = battle
        ? await continueExperimentalBattle(battle.battleId, prompt)
        : await startExperimentalBattle(prompt, confirmedSetup)
      await syncBattleState(nextBattle)
    } catch (submissionError) {
      if (submissionError instanceof DOMException && submissionError.name === 'AbortError') {
        return
      }

      if (isRateLimitError(submissionError)) {
        setError(submissionError.message)
        return
      }

      setError(
        submissionError instanceof Error
          ? submissionError.message
          : strings.arena.couldNotProcessPrompt,
      )
    } finally {
      streamAbortRef.current = null
      setIsGenerating(false)
      setPendingPrompt(null)
      setStreamingTurn(null)
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
          : strings.arena.couldNotSubmitVote,
      )
    } finally {
      setIsVoting(false)
    }
  }

  function handleConfirmSetup() {
    if (!hasEnabledParameter(draftSetup)) {
      setSetupValidationMessage(strings.experimental.setupValidation)
      return
    }

    setConfirmedSetup(draftSetup)
    setIsEditingSetup(false)
    setSetupValidationMessage(null)
  }

  function resetRound() {
    streamAbortRef.current?.abort()
    shouldScrollToNextResponseRef.current = false
    setBattle(null)
    setVoteOutcome(null)
    setSelectedVote(null)
    setPendingPrompt(null)
    setStreamingTurn(null)
    setError(null)
    setDraftSetup(createDefaultSetup())
    setConfirmedSetup(null)
    setIsEditingSetup(true)
    setIsShowingParameters(false)
    setSetupValidationMessage(null)
    setResponseEdits({})
    setSavingEditKey(null)
    removeLocalJson(EXPERIMENTAL_ARENA_SESSION_STORAGE_KEY)
  }

  const experimentalClassName = [
    'arena',
    'experimental-arena',
    turns.length > 0 || pendingPrompt || streamingTurn ? 'arena--active' : 'arena--idle',
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
          : strings.experimental.couldNotSaveEdit,
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

  function renderStreamingTurn(currentStreamingTurn: StreamingTurnState) {
    return (
      <div key="streaming-turn" className="arena-turn">
        <article className="chat-message chat-message--user">
          <p className="chat-message__text">{currentStreamingTurn.turn.prompt}</p>
        </article>

        <article
          ref={scrollToNewResponse}
          className="chat-message chat-message--assistant chat-message--duel"
        >
          <p className="chat-message__role">Responses</p>
          <EditableResponsePair
            selectedVote={null}
            disabled
            reveal={false}
            canEditLatest={false}
            answerAStatus={currentStreamingTurn.slotStatuses.A}
            answerBStatus={currentStreamingTurn.slotStatuses.B}
            answerAError={currentStreamingTurn.slotErrors.A}
            answerBError={currentStreamingTurn.slotErrors.B}
            answerAState={createResponseState(currentStreamingTurn.turn.answerA)}
            answerBState={createResponseState(currentStreamingTurn.turn.answerB)}
            onStartEdit={() => undefined}
            onDraftChange={() => undefined}
            onSubmitEdit={() => undefined}
            onToggleEdited={() => undefined}
          />
        </article>
      </div>
    )
  }

  const experimentalResultRows = voteOutcome
    ? [
        {
          key: 'temperature',
          label: strings.experimental.temperature,
          answer1Value: voteOutcome.experiment.parameters.temperature.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.temperature.answer2Value,
        },
        {
          key: 'topP',
          label: strings.experimental.topP,
          answer1Value: voteOutcome.experiment.parameters.topP.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.topP.answer2Value,
        },
        {
          key: 'topK',
          label: strings.experimental.topK,
          answer1Value: voteOutcome.experiment.parameters.topK.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.topK.answer2Value,
        },
        {
          key: 'frequencyPenalty',
          label: strings.experimental.frequencyPenalty,
          answer1Value: voteOutcome.experiment.parameters.frequencyPenalty.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.frequencyPenalty.answer2Value,
        },
        {
          key: 'presencePenalty',
          label: strings.experimental.presencePenalty,
          answer1Value: voteOutcome.experiment.parameters.presencePenalty.answer1Value,
          answer2Value: voteOutcome.experiment.parameters.presencePenalty.answer2Value,
        },
      ]
    : []

  return (
    <section className={experimentalClassName}>
      {!isInitializing && !isAuthenticated ? (
        <AuthGateCard
          title={strings.auth.experimentalGateTitle}
          description={strings.auth.experimentalGateDescription}
          returnPath="/experimental"
        />
      ) : null}

      {isInitializing || isAuthenticated ? (
        <>
      {!turns.length && !pendingPrompt && !streamingTurn ? (
        <div className="experimental-arena__setup-shell">
          <div className="page-card page-card--helper experimental-arena__intro-card">
            <p className="eyebrow">{strings.experimental.eyebrow}</p>
            <h2>{strings.experimental.introTitle}</h2>
            <p>{strings.experimental.introBody}</p>
            <div className="arena-note" aria-label={strings.experimental.disclaimerLabel}>
              <strong>{strings.experimental.disclaimerTitle}</strong>
              <span>{strings.experimental.disclaimerLine}</span>
            </div>
          </div>

          {confirmedSetup && !isEditingSetup ? (
            <section className="experimental-summary experimental-summary--editable">
              <div>
                <p className="experimental-summary__label">{strings.experimental.configurationSet}</p>
                <p className="experimental-summary__value">
                  {formatSetupSummary(confirmedSetup, strings.experimental)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--ghost experimental-summary__action"
                onClick={() => setIsEditingSetup(true)}
              >
                {strings.experimental.change}
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

      {error ? (
        <FriendlyErrorToast
          message={strings.arena.couldNotProcessPrompt}
          detail={error}
        />
      ) : null}

      <section className="chat-space" aria-live="polite">
        {confirmedSetup && (turns.length > 0 || pendingPrompt || streamingTurn) && !voteOutcome ? (
          <div className="experimental-context-chip" aria-label={strings.experimental.currentSetup}>
            <TuneRoundedIcon
              aria-hidden="true"
              className="experimental-context-chip__icon"
            />
            <span>{formatSetupSummary(confirmedSetup, strings.experimental)}</span>
          </div>
        ) : null}

        {turns.map(renderTurn)}

        {streamingTurn ? renderStreamingTurn(streamingTurn) : null}

        {pendingPrompt && !streamingTurn ? (
          <>
            <article className="chat-message chat-message--user">
              <p className="chat-message__text">{pendingPrompt}</p>
            </article>
            <article
              ref={scrollToNewResponse}
              className="chat-message chat-message--assistant chat-message--loading"
            >
              <p className="chat-message__role">MakArena</p>
              <div className="typing-indicator" aria-label={strings.arena.generatingAnswers}>
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
              ? strings.experimental.promptPlaceholderReady
              : strings.experimental.promptPlaceholderBlocked
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
            <p className="result-card__kicker">{strings.arena.voteSubmitted}</p>
            <button
              type="button"
              className="btn btn--ghost result-card__new-chat"
              onClick={resetRound}
            >
              <RefreshRoundedIcon
                aria-hidden="true"
                className="result-card__new-chat-icon"
              />
              {strings.experimental.startNewExperiment}
            </button>
          </div>
          <h3>{strings.arena.thanksVote}</h3>

          <div className="experimental-result__controls">
            <button
              type="button"
              className="experimental-parameters__toggle"
              onClick={() => setIsShowingParameters((current) => !current)}
            >
              {isShowingParameters ? strings.experimental.hideParameters : strings.experimental.viewParameters}
            </button>
          </div>

          <div className="result-card__grid">
            <article
              className={
                isShowingParameters ? 'result-chip result-chip--expanded' : 'result-chip'
              }
            >
              <span className="result-chip__label">{strings.arena.voteModel1}</span>
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
                      <strong>{formatParameterValue(row.answer1Value, strings.experimental)}</strong>
                    </Fragment>
                  ))}
                </div>
              </div>
            </article>

            <article className="result-chip result-chip--winner">
              <span className="result-chip__label">{strings.arena.winningModel}</span>
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
              <span className="result-chip__label">{strings.arena.voteModel2}</span>
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
                      <strong>{formatParameterValue(row.answer2Value, strings.experimental)}</strong>
                    </Fragment>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}
        </>
      ) : null}
    </section>
  )
}
