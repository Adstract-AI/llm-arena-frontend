import { useEffect, useMemo, useState } from 'react'
import { TbShare3 } from 'react-icons/tb'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { continueBattle, getBattleDetails, startBattle, submitVote } from '../api/arenaApi'
import { PromptInput } from '../components/PromptInput'
import { ResponsePair } from '../components/ResponsePair'
import { VotePanel } from '../components/VotePanel'
import type { ArenaBattle, ArenaTurn, VoteChoice, VoteOutcome } from '../types'
import {
  readLocalJson,
  removeLocalJson,
  writeLocalJson,
} from '../../../shared/storage/localJsonStorage'
import { FriendlyErrorToast } from '../../../shared/components/FriendlyErrorToast'

const ARENA_SESSION_STORAGE_KEY = 'makarena-arena-session-v1'

interface ArenaSessionSnapshot {
  battle: ArenaBattle | null
  voteOutcome: VoteOutcome | null
  selectedVote: VoteChoice | null
}

function readArenaSessionSnapshot(): ArenaSessionSnapshot | null {
  return readLocalJson<ArenaSessionSnapshot>(ARENA_SESSION_STORAGE_KEY)
}

export function ArenaPage() {
  const savedSession = useMemo(readArenaSessionSnapshot, [])
  const [battle, setBattle] = useState<ArenaBattle | null>(savedSession?.battle ?? null)
  const [voteOutcome, setVoteOutcome] = useState<VoteOutcome | null>(
    savedSession?.voteOutcome ?? null,
  )
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(
    savedSession?.selectedVote ?? null,
  )
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
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

    try {
      const nextBattle = battle
        ? await continueBattle(battle.battleId, prompt)
        : await startBattle(prompt)
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
          : 'Could not submit your vote.',
      )
    } finally {
      setIsVoting(false)
    }
  }

  function resetRound() {
    setBattle(null)
    setVoteOutcome(null)
    setSelectedVote(null)
    setPendingPrompt(null)
    setError(null)
    removeLocalJson(ARENA_SESSION_STORAGE_KEY)
  }

  function getModelDetailsLink(modelName: string) {
    return `/models/${encodeURIComponent(modelName)}`
  }

  const arenaClassName = [
    'arena',
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
    <section className={arenaClassName}>
      {!turns.length && !pendingPrompt ? (
        <div className="page-card page-card--helper">
          <p className="eyebrow">Model Arena</p>
          <h2>Put two anonymous models head-to-head.</h2>
          <p>
            Submit prompts, compare both responses, then vote. Model identities
            unlock after voting.
          </p>
          <div className="arena-note" aria-label="Model disclaimer">
            <strong>Keep in mind:</strong>
            <span>Responses may be slow, inaccurate, or hallucinated.</span>
            <span>Always double-check important facts before relying on them.</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <FriendlyErrorToast
          message="We could not update the arena."
          detail={error}
        />
      ) : null}

      <section className="chat-space" aria-live="polite">
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
              Start New Chat
            </button>
          </div>
          <h3>Thanks, your vote has been counted.</h3>

          <div className="result-card__grid">
            <article className="result-chip">
              <span className="result-chip__label">Model 1</span>
              <strong>
                <a
                  className="result-chip__model-link"
                  href={getModelDetailsLink(voteOutcome.answer1ModelName)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {voteOutcome.answer1ModelName}
                  <TbShare3 aria-hidden="true" className="model-link__icon" />
                </a>
              </strong>
            </article>
            <article className="result-chip result-chip--winner">
              <span className="result-chip__label">Winning model</span>
              <strong>
                {voteOutcome.winner === 'tie' || !winnerLabel ? (
                  winnerLabel
                ) : (
                  <a
                    className="result-chip__model-link"
                    href={getModelDetailsLink(winnerLabel)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {winnerLabel}
                    <TbShare3 aria-hidden="true" className="model-link__icon" />
                  </a>
                )}
              </strong>
            </article>
            <article className="result-chip">
              <span className="result-chip__label">Model 2</span>
              <strong>
                <a
                  className="result-chip__model-link"
                  href={getModelDetailsLink(voteOutcome.answer2ModelName)}
                  target="_blank"
                  rel="noreferrer"
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
