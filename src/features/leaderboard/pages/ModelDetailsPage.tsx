import { useEffect, useState } from 'react'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Link, useParams } from 'react-router-dom'
import { getModelDetails } from '../api/leaderboardApi'
import type { ModelDetails } from '../types'
import { useI18n } from '../../../shared/i18n/I18nContext'

function SectionHeader({
  title,
  details,
  moreInfoLabel,
}: {
  title: string
  details: string[]
  moreInfoLabel: (title: string) => string
}) {
  const tooltipId = `section-info-${title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="model-section-header">
      <p className="eyebrow">{title}</p>
      <span className="model-section-info-wrap">
        <button
          type="button"
          className="model-section-info"
          aria-label={moreInfoLabel(title)}
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

function formatPercent(value: number | null, notAvailableLabel: string): string {
  if (value === null) {
    return notAvailableLabel
  }

  return `${(value * 100).toFixed(1)}%`
}

function formatNumber(value: number | null, notAvailableLabel: string, digits = 1): string {
  if (value === null) {
    return notAvailableLabel
  }

  return value.toFixed(digits)
}

function formatLatency(value: number | null, notAvailableLabel: string): string {
  if (value === null) {
    return notAvailableLabel
  }

  return `${Math.round(value)} ms`
}

export function ModelDetailsPage() {
  const { modelName } = useParams<{ modelName: string }>()
  const { strings } = useI18n()
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
      setError(strings.modelDetails.missingModelName)
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
            loadError instanceof Error ? loadError.message : strings.modelDetails.couldNotLoad,
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
  }, [modelName, strings.modelDetails.couldNotLoad, strings.modelDetails.missingModelName])

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
              <p className="leaderboard-note">{strings.modelDetails.loading}</p>
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
                  <p className="eyebrow">{strings.modelDetails.profile}</p>
                  <h3>{model.name}</h3>
                  <p className="model-details__provider-line">
                    {strings.modelDetails.providedBy} <strong>{model.providerDisplayName}</strong>
                  </p>
                </div>
                <Link to="/leaderboard" className="btn btn--ghost model-details__back">
                  {strings.modelDetails.backToLeaderboard}
                </Link>
              </div>

              <div className="model-details__copy-blocks">
                <div className="model-details__copy-block">
                  <span className="model-details__copy-label">{strings.modelDetails.aboutModel}</span>
                  <p className="model-details__description">{model.description}</p>
                </div>
                <div className="model-details__copy-block">
                  <span className="model-details__copy-label">{strings.modelDetails.aboutProvider}</span>
                  <p className="model-details__provider-copy">{model.providerDescription}</p>
                </div>
              </div>

              <div className="model-details__tags" aria-label={strings.modelDetails.attributes}>
                {model.isFineTuned ? <span className="model-tag">{strings.modelDetails.fineTuned}</span> : null}
                {model.isMacedonianOptimized ? (
                  <span className="model-tag">{strings.modelDetails.macedonianOptimized}</span>
                ) : null}
                <span className="model-tag model-tag--neutral">{model.providerName}</span>
              </div>
            </div>

            <div className="model-details__stats">
              <article className="leaderboard-card model-details__section">
                <SectionHeader
                  title={strings.modelDetails.performance}
                  details={[...strings.modelDetails.performanceDetails]}
                  moreInfoLabel={strings.modelDetails.moreInfoAbout}
                />
                <div className="model-stats-grid">
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.eloScore}</span>
                    <strong>{model.eloScore.toFixed(2)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.leaderboard.winRate}</span>
                    <strong>{formatPercent(model.winRate, strings.modelDetails.notAvailable)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.nonTieWinRate}</span>
                    <strong>{formatPercent(model.nonTieWinRate, strings.modelDetails.notAvailable)}</strong>
                  </div>
                </div>
              </article>

              <article className="leaderboard-card model-details__section">
                <SectionHeader
                  title={strings.modelDetails.matchHistory}
                  details={[...strings.modelDetails.matchHistoryDetails]}
                  moreInfoLabel={strings.modelDetails.moreInfoAbout}
                />
                <div className="model-stats-grid">
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.leaderboard.matches}</span>
                    <strong>{model.matches}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.wins}</span>
                    <strong>{model.wins}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.losses}</span>
                    <strong>{model.losses}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.ties}</span>
                    <strong>{model.ties}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.experimentalWins}</span>
                    <strong>{model.experimentalWins}</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className="model-details__stats">
              <article className="leaderboard-card model-details__section">
                <SectionHeader
                  title={strings.modelDetails.responseProfile}
                  details={[...strings.modelDetails.responseProfileDetails]}
                  moreInfoLabel={strings.modelDetails.moreInfoAbout}
                />
                <div className="model-stats-grid">
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgPromptTokens}</span>
                    <strong>{formatNumber(model.avgPromptTokens, strings.modelDetails.notAvailable)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgCompletionTokens}</span>
                    <strong>{formatNumber(model.avgCompletionTokens, strings.modelDetails.notAvailable)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgTotalTokens}</span>
                    <strong>{formatNumber(model.avgTotalTokens, strings.modelDetails.notAvailable)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgResponseLength}</span>
                    <strong>
                      {model.avgResponseLengthChars === null
                        ? strings.modelDetails.notAvailable
                        : `${model.avgResponseLengthChars.toFixed(1)} ${strings.modelDetails.chars}`}
                    </strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgLatency}</span>
                    <strong>{formatLatency(model.avgLatencyMs, strings.modelDetails.notAvailable)}</strong>
                  </div>
                </div>
              </article>

              <article className="leaderboard-card model-details__section model-details__section--identifiers">
                <SectionHeader
                  title={strings.modelDetails.identifiers}
                  details={[...strings.modelDetails.identifiersDetails]}
                  moreInfoLabel={strings.modelDetails.moreInfoAbout}
                />
                <div className="model-meta-list">
                  <div className="model-meta-row">
                    <span className="model-meta-row__label">{strings.modelDetails.modelName}</span>
                    <div className="model-meta-field">
                      <code>{model.name}</code>
                      <button
                        type="button"
                        className="model-meta-copy"
                        onClick={() => void handleCopy(model.name, 'name')}
                        aria-label={strings.modelDetails.copyModelName}
                        title={strings.modelDetails.copyModelName}
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
                    <span className="model-meta-row__label">{strings.modelDetails.externalModelId}</span>
                    <div className="model-meta-field">
                      <code>{model.externalModelId}</code>
                      <button
                        type="button"
                        className="model-meta-copy"
                        onClick={() => void handleCopy(model.externalModelId, 'externalId')}
                        aria-label={strings.modelDetails.copyExternalModelId}
                        title={strings.modelDetails.copyExternalModelId}
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
                  title={strings.modelDetails.parameterAverages}
                  details={[...strings.modelDetails.parameterAveragesDetails]}
                  moreInfoLabel={strings.modelDetails.moreInfoAbout}
                />
                <div className="model-stats-grid model-stats-grid--wide">
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgTemperature}</span>
                    <strong>{formatNumber(model.avgWinningTemp, strings.modelDetails.notAvailable, 4)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgTopP}</span>
                    <strong>{formatNumber(model.avgWinningTopP, strings.modelDetails.notAvailable, 4)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgTopK}</span>
                    <strong>{formatNumber(model.avgWinningTopK, strings.modelDetails.notAvailable, 1)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgFrequencyPenalty}</span>
                    <strong>{formatNumber(model.avgWinningFreqPenalty, strings.modelDetails.notAvailable, 4)}</strong>
                  </div>
                  <div className="model-stat">
                    <span className="model-stat__label">{strings.modelDetails.avgPresencePenalty}</span>
                    <strong>{formatNumber(model.avgWinningPresPenalty, strings.modelDetails.notAvailable, 4)}</strong>
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
