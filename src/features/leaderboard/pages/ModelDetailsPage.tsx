import { useEffect, useState } from 'react'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Link, useParams } from 'react-router-dom'
import { getModelDetails } from '../api/leaderboardApi'
import type { ModelDetails } from '../types'
import { FriendlyErrorToast } from '../../../shared/components/FriendlyErrorToast'

function SectionHeader({ title, details }: { title: string; details: string[] }) {
  const tooltipId = `section-info-${title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="model-section-header">
      <p className="eyebrow">{title}</p>
      <span className="model-section-info-wrap">
        <button
          type="button"
          className="model-section-info"
          aria-label={`More info about ${title}`}
          aria-describedby={tooltipId}
        >
          <InfoOutlinedIcon
            aria-hidden="true"
            className="model-section-info__icon"
          />
        </button>
        <span
          id={tooltipId}
          role="tooltip"
          className="model-section-tooltip"
        >
          {details.map((detail) => (
            <span key={detail} className="model-section-tooltip__item">
              {detail}
            </span>
          ))}
        </span>
      </span>
    </div>
  )
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return 'Not available'
  }

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
  const [copiedField, setCopiedField] = useState<'name' | 'externalId' | null>(null)

  async function handleCopy(value: string, field: 'name' | 'externalId') {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => {
        setCopiedField((currentField) => (currentField === field ? null : currentField))
      }, 1600)
    } catch {
      setCopiedField(null)
    }
  }

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
        {/*<div className="page-card page-card--helper">*/}
        {/*  /!*<p className="eyebrow">Model Details</p>*!/*/}
        {/*  /!*<h2>Explore a model profile.</h2>*!/*/}
        {/*  /!*<p>See what this model is, who provides it, and how it performs in the arena.</p>*!/*/}
        {/*</div>*/}

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
            <FriendlyErrorToast
              message="We could not load this model profile."
              detail={error}
            />
          </div>
        ) : null}

        {!isLoading && !error && model ? (
          <div className="model-details">
            <div className="leaderboard-card model-details__hero">
              <div className="model-details__hero-top">
                <div>
                  <p className="eyebrow">Model Profile</p>
                  <h3>{model.name}</h3>
                  <p className="model-details__provider-line">
                    Provided by <strong>{model.providerDisplayName}</strong>
                  </p>
                </div>
                <Link to="/leaderboard" className="btn btn--ghost model-details__back">
                  Back to Leaderboard
                </Link>
              </div>

              <div className="model-details__copy-blocks">
                <div className="model-details__copy-block">
                  <span className="model-details__copy-label">About this model</span>
                  <p className="model-details__description">{model.description}</p>
                </div>
                <div className="model-details__copy-block">
                  <span className="model-details__copy-label">About the provider</span>
                  <p className="model-details__provider-copy">{model.providerDescription}</p>
                </div>
              </div>

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
                <SectionHeader
                  title="Performance"
                  details={[
                    'ELO score is an overall strength rating based on arena match results. Higher usually means the model performs better against other models.',
                    'Win rate is the share of all matches this model won.',
                    'Non-tie win rate shows how often it won when a round had a clear winner and was not marked as a tie.',
                  ]}
                />
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
                <SectionHeader
                  title="Match History"
                  details={[
                    'Matches is the total number of arena comparisons this model has appeared in.',
                    'Wins, losses, and ties show the outcome breakdown across those comparisons.',
                  ]}
                />
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
                  <div className="model-stat">
                    <span className="model-stat__label">Experimental wins</span>
                    <strong>{model.experimentalWins}</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className="model-details__stats">
              <article className="leaderboard-card model-details__section">
                <SectionHeader
                  title="Response Profile"
                  details={[
                    'Prompt tokens are the average size of the user input sent to the model.',
                    'Completion tokens are the average size of the model response.',
                    'Total tokens combine prompt and completion size.',
                    'Response length shows the average output length in characters, and latency shows how long responses usually take when available.',
                  ]}
                />
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

              <article className="leaderboard-card model-details__section model-details__section--identifiers">
                <SectionHeader
                  title="Identifiers"
                  details={[
                    'Model name is the label shown inside the arena UI.',
                    'External model ID is the provider-side identifier used to reference the same model in backend systems.',
                  ]}
                />
                <div className="model-meta-list">
                  <div className="model-meta-row">
                    <span className="model-meta-row__label">Model name</span>
                    <div className="model-meta-field">
                      <code>{model.name}</code>
                      <button
                        type="button"
                        className="model-meta-copy"
                        onClick={() => void handleCopy(model.name, 'name')}
                        aria-label="Copy model name"
                        title="Copy model name"
                      >
                        {copiedField === 'name' ? (
                          <CheckRoundedIcon aria-hidden="true" className="model-meta-copy__icon" />
                        ) : (
                          <ContentCopyRoundedIcon
                            aria-hidden="true"
                            className="model-meta-copy__icon"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="model-meta-row">
                    <span className="model-meta-row__label">External model ID</span>
                    <div className="model-meta-field">
                      <code>{model.externalModelId}</code>
                      <button
                        type="button"
                        className="model-meta-copy"
                        onClick={() => void handleCopy(model.externalModelId, 'externalId')}
                        aria-label="Copy external model ID"
                        title="Copy external model ID"
                      >
                        {copiedField === 'externalId' ? (
                          <CheckRoundedIcon aria-hidden="true" className="model-meta-copy__icon" />
                        ) : (
                          <ContentCopyRoundedIcon
                            aria-hidden="true"
                            className="model-meta-copy__icon"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
                <article className="leaderboard-card model-details__section model-details__section--wide">
                    <SectionHeader
                        title="Parameter Averages"
                        details={[
                            'These averages summarize the experimental parameter values used when this model won a revealed experimental round.',
                            'When no experimental wins with tracked parameter data are available yet, these values remain unavailable.',
                        ]}
                    />
                    <div className="model-stats-grid model-stats-grid--wide">
                        <div className="model-stat">
                            <span className="model-stat__label">Avg. temperature</span>
                            <strong>{formatNumber(model.avgWinningTemp, 4)}</strong>
                        </div>
                        <div className="model-stat">
                            <span className="model-stat__label">Avg. top-p</span>
                            <strong>{formatNumber(model.avgWinningTopP, 4)}</strong>
                        </div>
                        <div className="model-stat">
                            <span className="model-stat__label">Avg. top-k</span>
                            <strong>{formatNumber(model.avgWinningTopK, 1)}</strong>
                        </div>
                        <div className="model-stat">
                            <span className="model-stat__label">Avg. frequency penalty</span>
                            <strong>{formatNumber(model.avgWinningFreqPenalty, 4)}</strong>
                        </div>
                        <div className="model-stat">
                            <span className="model-stat__label">Avg. presence penalty</span>
                            <strong>{formatNumber(model.avgWinningPresPenalty, 4)}</strong>
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
