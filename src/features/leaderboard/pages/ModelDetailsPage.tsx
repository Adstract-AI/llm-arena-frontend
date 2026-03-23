import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getModelDetails } from '../api/leaderboardApi'
import type { ModelDetails } from '../types'

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatNumber(value: number | null, digits = 1): string {
  if (value === null) {
    return 'Not available'
  }

  return value.toFixed(digits)
}

function formatLatency(value: number | null): string {
  if (value === null) {
    return 'Not available'
  }

  return `${Math.round(value)} ms`
}

export function ModelDetailsPage() {
  const { modelName } = useParams<{ modelName: string }>()
  const [model, setModel] = useState<ModelDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!modelName) {
      setError('Model name is missing.')
      setIsLoading(false)
      return
    }

    const safeModelName = modelName

    let isMounted = true

    async function loadModelDetails() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getModelDetails(safeModelName)
        if (isMounted) {
          setModel(response)
        }
      } catch (loadError) {
        if (isMounted) {
          setModel(null)
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load model details right now.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadModelDetails()

    return () => {
      isMounted = false
    }
  }, [modelName])

  return (
    <section className="leaderboard leaderboard--wide">
      <div className="leaderboard-shell">
        <div className="page-card page-card--helper">
          <p className="eyebrow">Model Details</p>
          <h2>{model?.name ?? 'Loading model profile...'}</h2>
          <p>Explore provider information, performance, and response behavior.</p>
        </div>

        {isLoading ? (
          <div className="leaderboard-card">
            <div className="leaderboard-loading">
              <div className="leaderboard-spinner"></div>
              <p className="leaderboard-note">Loading model details...</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="leaderboard-card">
            <p className="leaderboard-error">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && model ? (
          <div className="model-details">
            <div className="leaderboard-card model-details__hero">
              <div className="model-details__hero-top">
                <div>
                  <p className="eyebrow">Provider</p>
                  <h3>{model.providerDisplayName}</h3>
                </div>
                <Link to="/leaderboard" className="btn btn--ghost model-details__back">
                  Back to Leaderboard
                </Link>
              </div>
              <p className="model-details__description">{model.description}</p>
              <p className="model-details__provider-copy">{model.providerDescription}</p>

              <div className="model-details__tags" aria-label="Model attributes">
                {model.isFineTuned ? <span className="model-tag">Fine-tuned</span> : null}
                {model.isMacedonianOptimized ? (
                  <span className="model-tag">Macedonian-optimized</span>
                ) : null}
                <span className="model-tag model-tag--neutral">{model.providerName}</span>
              </div>
            </div>

            <div className="model-details__stats">
              <article className="leaderboard-card model-details__section">
                <p className="eyebrow">Performance</p>
                <div className="model-stats-grid">
                  <div className="model-stat">
                    <span className="model-stat__label">ELO score</span>
                    <strong>{model.eloScore.toFixed(2)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Win rate</span>
                    <strong>{formatPercent(model.winRate)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Non-tie win rate</span>
                    <strong>{formatPercent(model.nonTieWinRate)}</strong>
                  </div>
                </div>
              </article>

              <article className="leaderboard-card model-details__section">
                <p className="eyebrow">Match History</p>
                <div className="model-stats-grid">
                  <div className="model-stat">
                    <span className="model-stat__label">Matches</span>
                    <strong>{model.matches}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Wins</span>
                    <strong>{model.wins}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Losses</span>
                    <strong>{model.losses}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Ties</span>
                    <strong>{model.ties}</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className="model-details__stats">
              <article className="leaderboard-card model-details__section">
                <p className="eyebrow">Response Profile</p>
                <div className="model-stats-grid">
                  <div className="model-stat">
                    <span className="model-stat__label">Avg. prompt tokens</span>
                    <strong>{formatNumber(model.avgPromptTokens)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Avg. completion tokens</span>
                    <strong>{formatNumber(model.avgCompletionTokens)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Avg. total tokens</span>
                    <strong>{formatNumber(model.avgTotalTokens)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Avg. response length</span>
                    <strong>
                      {model.avgResponseLengthChars === null
                        ? 'Not available'
                        : `${model.avgResponseLengthChars.toFixed(1)} chars`}
                    </strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">Avg. latency</span>
                    <strong>{formatLatency(model.avgLatencyMs)}</strong>
                  </div>
                </div>
              </article>

              <article className="leaderboard-card model-details__section">
                <p className="eyebrow">Identifiers</p>
                <div className="model-meta-list">
                  <div className="model-meta-row">
                    <span className="model-meta-row__label">Model name</span>
                    <code>{model.name}</code>
                  </div>
                  <div className="model-meta-row">
                    <span className="model-meta-row__label">External model ID</span>
                    <code>{model.externalModelId}</code>
                  </div>
                </div>
              </article>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
