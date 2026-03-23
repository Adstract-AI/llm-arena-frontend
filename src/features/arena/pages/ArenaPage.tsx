import { useMemo, useState } from 'react'
import { startRound, submitVote } from '../api/arenaApi'
import { PromptInput } from '../components/PromptInput'
import { ResponsePair } from '../components/ResponsePair'
import { VotePanel } from '../components/VotePanel'
import type { ArenaRound, VoteChoice, VoteOutcome } from '../types'

export function ArenaPage() {
  const [round, setRound] = useState<ArenaRound | null>(null)
  const [voteOutcome, setVoteOutcome] = useState<VoteOutcome | null>(null)
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

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

    return 'Tie / No single winner'
  }, [voteOutcome])

  async function handlePromptSubmit(prompt: string) {
    if (round || isGenerating || isVoting) {
      return
    }

    setIsGenerating(true)
    setVoteOutcome(null)
    setSelectedVote(null)
    setRound(null)
    setCurrentPrompt(prompt)

    try {
      const nextRound = await startRound(prompt)
      setRound(nextRound)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleVoteSubmit() {
    if (!round || voteOutcome || !selectedVote) {
      return
    }

    setIsVoting(true)
    try {
      const outcome = await submitVote(round.roundId, selectedVote)
      setVoteOutcome(outcome)
    } finally {
      setIsVoting(false)
    }
  }

  function resetRound() {
    setRound(null)
    setVoteOutcome(null)
    setSelectedVote(null)
    setCurrentPrompt(null)
  }

  return (
    <section className="arena">
      <div className="page-card page-card--helper">
        <p className="eyebrow">ChatVote Arena</p>
        <h2>Put two anonymous models head-to-head.</h2>
        <p>
          Submit a prompt, compare both responses, then vote. Model identities
          unlock after voting.
        </p>
      </div>

      <section className="chat-space" aria-live="polite">
        {currentPrompt ? (
          <>
            <article className="chat-message chat-message--user">
              <p className="chat-message__role">You</p>
              <p className="chat-message__text">{currentPrompt}</p>
            </article>

            {isGenerating ? (
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
            ) : null}

            {round ? (
              <article className="chat-message chat-message--assistant chat-message--duel">
                <p className="chat-message__role">Responses</p>
                <ResponsePair
                  round={round}
                  selectedVote={selectedVote}
                  onSelectVote={setSelectedVote}
                  disabled={Boolean(voteOutcome) || isVoting}
                  reveal={Boolean(voteOutcome)}
                  revealedModels={
                    voteOutcome
                      ? {
                          answer1Model: voteOutcome.answer1ModelName,
                          answer2Model: voteOutcome.answer2ModelName,
                        }
                      : null
                  }
                />
              </article>
            ) : null}
          </>
        ) : (
          <article className="chat-message chat-message--empty">
            <p className="chat-message__text">Your comparison will appear here.</p>
          </article>
        )}
      </section>

      {!currentPrompt ? (
        <PromptInput
          onSubmit={handlePromptSubmit}
          loading={isGenerating}
          disabled={Boolean(currentPrompt)}
        />
      ) : null}

      {round ? (
        <>
          {!voteOutcome ? (
            <VotePanel
              selectedVote={selectedVote}
              onSelectVote={setSelectedVote}
              onSubmitVote={handleVoteSubmit}
              disabled={isVoting || isGenerating}
            />
          ) : (
            <section className="result-card" aria-live="polite">
              <div className="result-card__top">
                <p className="result-card__kicker">Vote submitted</p>
                <button
                  type="button"
                  className="btn btn--ghost result-card__new-chat"
                  onClick={resetRound}
                >
                  Start New Chat
                </button>
              </div>
              <h3>Thanks, your vote has been counted.</h3>
              <p className="result-card__summary">{voteOutcome.message}</p>

              <div className="result-card__grid">
                <article className="result-chip">
                  <span className="result-chip__label">Winning model</span>
                  <strong>{winnerLabel}</strong>
                </article>
                <article className="result-chip">
                  <span className="result-chip__label">Model 1</span>
                  <strong>{voteOutcome.answer1ModelName}</strong>
                </article>
                <article className="result-chip">
                  <span className="result-chip__label">Model 2</span>
                  <strong>{voteOutcome.answer2ModelName}</strong>
                </article>
              </div>

            </section>
          )}
        </>
      ) : null}
    </section>
  )
}
