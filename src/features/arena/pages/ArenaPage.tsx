import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TbShare3 } from 'react-icons/tb'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import {
  continueBattle,
  continueBattleStream,
  getBattleDetails,
  startBattle,
  startBattleStream,
  submitVote,
  toArenaBattle,
  type BattleStateResponse,
} from '../api/arenaApi'
import { PromptInput } from '../components/PromptInput'
import { ResponsePair, type ResponseSlotStatus } from '../components/ResponsePair'
import { VotePanel } from '../components/VotePanel'
import type { ArenaBattle, ArenaTurn, VoteChoice, VoteOutcome } from '../types'
import {
  readLocalJson,
  removeLocalJson,
  writeLocalJson,
} from '../../../shared/storage/localJsonStorage'
import { FriendlyErrorToast } from '../../../shared/components/FriendlyErrorToast'
import { env } from '../../../shared/config/env'
import { isRateLimitError } from '../../../shared/network/rateLimit'
import { useI18n } from '../../../shared/localisation/I18nContext'

const ARENA_SESSION_STORAGE_KEY = 'makarena-arena-session-v1'

interface ArenaSessionSnapshot {
  battle: ArenaBattle | null
  voteOutcome: VoteOutcome | null
  selectedVote: VoteChoice | null
}

type StreamSlot = 'A' | 'B'

interface StreamingTurnState {
  turn: ArenaTurn
  slotStatuses: Record<StreamSlot, ResponseSlotStatus>
  slotErrors: Record<StreamSlot, string | null>
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

function readArenaSessionSnapshot(): ArenaSessionSnapshot | null {
  return readLocalJson<ArenaSessionSnapshot>(ARENA_SESSION_STORAGE_KEY)
}

export function ArenaPage() {
  const { strings } = useI18n()
  const savedSession = useMemo(readArenaSessionSnapshot, [])
  const [battle, setBattle] = useState<ArenaBattle | null>(savedSession?.battle ?? null)
  const [voteOutcome, setVoteOutcome] = useState<VoteOutcome | null>(
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

  useEffect(() => {
    if (!battle && !voteOutcome && !selectedVote) {
      removeLocalJson(ARENA_SESSION_STORAGE_KEY)
      return
    }

    writeLocalJson<ArenaSessionSnapshot>(ARENA_SESSION_STORAGE_KEY, {
      battle,
      voteOutcome,
      selectedVote,
    })
  }, [battle, selectedVote, voteOutcome])

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
      const refreshedBattle = await getBattleDetails(nextBattle.battleId)
      setBattle(refreshedBattle)
    } catch {
      setBattle(nextBattle)
    }
  }

  async function handlePromptSubmit(prompt: string) {
    if (isGenerating || isVoting || voteOutcome) {
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

        await (battle
          ? continueBattleStream(
              battle.battleId,
              prompt,
              {
                onEvent: async ({ event, data }) => {
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
                          answerA:
                            slot === 'A' ? current.turn.answerA + text : current.turn.answerA,
                          answerB:
                            slot === 'B' ? current.turn.answerB + text : current.turn.answerB,
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
                                strings.arena.couldNotProcessPrompt,
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
                },
              },
              abortController.signal,
            )
          : startBattleStream(
              prompt,
              {
                onEvent: async ({ event, data }) => {
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
                          answerA:
                            slot === 'A' ? current.turn.answerA + text : current.turn.answerA,
                          answerB:
                            slot === 'B' ? current.turn.answerB + text : current.turn.answerB,
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
                                strings.arena.couldNotProcessPrompt,
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
                },
              },
              abortController.signal,
            ))

        return
      }

      const nextBattle = battle
        ? await continueBattle(battle.battleId, prompt)
        : await startBattle(prompt)
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
    if (!battle || voteOutcome || !selectedVote) {
      return
    }

    setIsVoting(true)
    setError(null)
    try {
      const outcome = await submitVote(battle.battleId, selectedVote)
      setVoteOutcome(outcome)
      await syncBattleState(battle)
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

  function resetRound() {
    streamAbortRef.current?.abort()
    shouldScrollToNextResponseRef.current = false
    setBattle(null)
    setVoteOutcome(null)
    setSelectedVote(null)
    setPendingPrompt(null)
    setStreamingTurn(null)
    setError(null)
    removeLocalJson(ARENA_SESSION_STORAGE_KEY)
  }

  function getModelDetailsLink(modelName: string) {
    return `/models/${encodeURIComponent(modelName)}`
  }

  const arenaClassName = [
    'arena',
    turns.length > 0 || pendingPrompt || streamingTurn ? 'arena--active' : 'arena--idle',
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
          <p className="chat-message__role">{strings.arena.responses}</p>
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
          <p className="chat-message__role">{strings.arena.responses}</p>
          <ResponsePair
            round={currentStreamingTurn.turn}
            selectedVote={null}
            disabled
            reveal={false}
            answerAStatus={currentStreamingTurn.slotStatuses.A}
            answerBStatus={currentStreamingTurn.slotStatuses.B}
            answerAError={currentStreamingTurn.slotErrors.A}
            answerBError={currentStreamingTurn.slotErrors.B}
          />
        </article>
      </div>
    )
  }

  return (
    <section className={arenaClassName}>
      {!turns.length && !pendingPrompt && !streamingTurn ? (
        <div className="page-card page-card--helper">
          <p className="eyebrow">{strings.arena.eyebrow}</p>
          <h2>{strings.arena.introTitle}</h2>
          <p>{strings.arena.introBody}</p>
          <div className="arena-note" aria-label={strings.arena.disclaimerLabel}>
            <strong>{strings.arena.disclaimerTitle}</strong>
            <span>{strings.arena.disclaimerLine1}</span>
            <span>{strings.arena.disclaimerLine2}</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <FriendlyErrorToast
          message={strings.arena.couldNotProcessPrompt}
          detail={error}
        />
      ) : null}

      <section className="chat-space" aria-live="polite">
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
          disabled={isVoting}
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
        <section className="result-card" aria-live="polite">
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
              {strings.arena.startNewChat}
            </button>
          </div>
          <h3>{strings.arena.thanksVote}</h3>

          <div className="result-card__grid">
            <article className="result-chip">
              <span className="result-chip__label">{strings.arena.voteModel1}</span>
              <strong>
                <a
                  className="result-chip__model-link"
                  href={getModelDetailsLink(voteOutcome.answer1ModelName)}
                >
                  {voteOutcome.answer1ModelName}
                  <TbShare3 aria-hidden="true" className="model-link__icon" />
                </a>
              </strong>
            </article>
            <article className="result-chip result-chip--winner">
              <span className="result-chip__label">{strings.arena.winningModel}</span>
              <strong>
                {voteOutcome.winner === 'tie' || !winnerLabel ? (
                  winnerLabel
                ) : (
                  <a
                    className="result-chip__model-link"
                    href={getModelDetailsLink(winnerLabel)}
                  >
                    {winnerLabel}
                    <TbShare3 aria-hidden="true" className="model-link__icon" />
                  </a>
                )}
              </strong>
            </article>
            <article className="result-chip">
              <span className="result-chip__label">{strings.arena.voteModel2}</span>
              <strong>
                <a
                  className="result-chip__model-link"
                  href={getModelDetailsLink(voteOutcome.answer2ModelName)}
                >
                  {voteOutcome.answer2ModelName}
                  <TbShare3 aria-hidden="true" className="model-link__icon" />
                </a>
              </strong>
            </article>
          </div>
        </section>
      ) : null}
    </section>
  )
}
