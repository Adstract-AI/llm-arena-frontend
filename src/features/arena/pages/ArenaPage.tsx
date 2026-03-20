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
    if (!voteOutcome || !round) {
      return null
    }

    if (voteOutcome.winner === 'modelA') {
      return round.modelAName
    }

    if (voteOutcome.winner === 'modelB') {
      return round.modelBName
    }

    return 'Tie'
  }, [round, voteOutcome])

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
        <article className="chat-message chat-message--assistant">
          <p className="chat-message__role">MakArena</p>
          <p className="chat-message__text">Send a prompt to begin.</p>
        </article>

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
                <p className="chat-message__role">Response Duel</p>
                <ResponsePair
                  round={round}
                  selectedVote={selectedVote}
                  onSelectVote={setSelectedVote}
                  disabled={Boolean(voteOutcome) || isVoting}
                  reveal={Boolean(voteOutcome)}
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

      <PromptInput
        onSubmit={handlePromptSubmit}
        loading={isGenerating}
        disabled={Boolean(currentPrompt)}
      />

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
              <p className="eyebrow">Vote recorded</p>
              <h3>{voteOutcome.message || 'Thank you for your vote.'}</h3>
              <p>
                Winner: <strong>{winnerLabel}</strong>
              </p>
              <p>
                Answer 1: <strong>{round.modelAName}</strong> | Answer 2:{' '}
                <strong>{round.modelBName}</strong>
              </p>
              <button type="button" className="btn btn--primary" onClick={resetRound}>
                Start New Chat
              </button>
            </section>
          )}
        </>
      ) : null}
    </section>
  )
}
