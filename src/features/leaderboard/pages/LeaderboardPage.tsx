import { useEffect, useMemo, useState, type ReactNode } from 'react'
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded'
import { Link, useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../api/leaderboardApi'
import type { LeaderboardModel } from '../types'

type NumericSortKey =
  | 'eloScore'
  | 'nonTieWinRate'
  | 'matches'
  | 'wins'
  | 'losses'
  | 'ties'
  | 'avgWinningTemp'
  | 'avgWinningTopP'
  | 'avgWinningTopK'
  | 'avgWinningFreqPenalty'
  | 'avgWinningPresPenalty'

type SortDirection = 'asc' | 'desc'

interface SortState {
  key: NumericSortKey
  direction: SortDirection
}

interface NumericColumn {
  key: NumericSortKey
  label: ReactNode
  sortLabel: string
  tooltip?: string
  render: (model: LeaderboardModel) => ReactNode
}

function formatNullableMetric(value: number | null, digits = 2): string {
  if (value === null) {
    return digits === 0 ? '0' : (0).toFixed(digits)
  }

  return value.toFixed(digits)
}

const defaultColumns: NumericColumn[] = [
  {
    key: 'eloScore',
    label: 'ELO',
    sortLabel: 'ELO',
    render: (model) => <span className="score-badge">{model.eloScore.toFixed(2)}</span>,
  },
  {
    key: 'nonTieWinRate',
    label: 'Win Rate',
    sortLabel: 'Win Rate',
    render: (model) => (
      <div className="winrate-meter">
        <span className="winrate-meter__value">
          {`${((model.nonTieWinRate ?? 0) * 100).toFixed(1)}%`}
        </span>
        <span className="winrate-meter__track" aria-hidden="true">
          <span
            className="winrate-meter__fill"
            style={{
              width: `${Math.max(0, Math.min((model.nonTieWinRate ?? 0) * 100, 100))}%`,
            }}
          />
        </span>
      </div>
    ),
  },
  {
    key: 'matches',
    label: 'Matches',
    sortLabel: 'Matches',
    render: (model) => model.matches.toLocaleString(),
  },
  {
    key: 'wins',
    label: 'Wins',
    sortLabel: 'Wins',
    render: (model) => model.wins.toLocaleString(),
  },
  {
    key: 'losses',
    label: 'Losses',
    sortLabel: 'Losses',
    render: (model) => model.losses.toLocaleString(),
  },
  {
    key: 'ties',
    label: 'Ties',
    sortLabel: 'Ties',
    render: (model) => model.ties.toLocaleString(),
  },
]

const experimentalColumns: NumericColumn[] = [
  {
    key: 'eloScore',
    label: 'ELO',
    sortLabel: 'ELO',
    render: (model) => <span className="score-badge">{model.eloScore.toFixed(2)}</span>,
  },
  {
    key: 'avgWinningTemp',
    label: 'Avg Temp',
    sortLabel: 'Avg Temp',
    tooltip: 'Average winning temperature',
    render: (model) => formatNullableMetric(model.avgWinningTemp),
  },
  {
    key: 'avgWinningTopP',
    label: 'Avg Top-p',
    sortLabel: 'Avg Top-p',
    tooltip: 'Average winning top-p',
    render: (model) => formatNullableMetric(model.avgWinningTopP),
  },
  {
    key: 'avgWinningTopK',
    label: 'Avg Top-k',
    sortLabel: 'Avg Top-k',
    tooltip: 'Average winning top-k',
    render: (model) => formatNullableMetric(model.avgWinningTopK, 0),
  },
  {
    key: 'avgWinningFreqPenalty',
    label: (
      <span className="th-sort-btn__label-stack">
        <span>Avg Freq</span>
        <span>Penalty</span>
      </span>
    ),
    sortLabel: 'Avg Freq Penalty',
    tooltip: 'Average winning frequency penalty',
    render: (model) => formatNullableMetric(model.avgWinningFreqPenalty),
  },
  {
    key: 'avgWinningPresPenalty',
    label: (
      <span className="th-sort-btn__label-stack">
        <span>Avg Pres</span>
        <span>Penalty</span>
      </span>
    ),
    sortLabel: 'Avg Pres Penalty',
    tooltip: 'Average winning presence penalty',
    render: (model) => formatNullableMetric(model.avgWinningPresPenalty),
  },
]

export function LeaderboardPage() {
  const navigate = useNavigate()
  const [models, setModels] = useState<LeaderboardModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>({ key: 'eloScore', direction: 'desc' })
  const [showExperimentalMetrics, setShowExperimentalMetrics] = useState(false)

  const numericColumns = showExperimentalMetrics ? experimentalColumns : defaultColumns

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1
      const valueA = a[sort.key] ?? Number.NEGATIVE_INFINITY
      const valueB = b[sort.key] ?? Number.NEGATIVE_INFINITY
      return (valueA - valueB) * direction
    })
  }, [models, sort])

  useEffect(() => {
    if (numericColumns.some((column) => column.key === sort.key)) {
      return
    }

    setSort({
      key: numericColumns[0]?.key ?? 'eloScore',
      direction: 'desc',
    })
  }, [numericColumns, sort.key])

  function toggleNumericSort(key: NumericSortKey) {
    setSort((previous) => {
      if (previous.key !== key) {
        return { key, direction: 'desc' }
      }

      return {
        key,
        direction: previous.direction === 'desc' ? 'asc' : 'desc',
      }
    })
  }

  useEffect(() => {
    let isMounted = true

    async function loadLeaderboard() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getLeaderboard()
        if (isMounted) {
          setModels(data)
        }
      } catch (error) {
        if (isMounted) {
          setModels([])
          setError(
            error instanceof Error
              ? error.message
              : 'Could not load leaderboard right now.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadLeaderboard()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="leaderboard leaderboard--wide">
      <div className="leaderboard-shell">
        <div className="page-card page-card--helper">
          <p className="eyebrow">Leaderboard</p>
          <h2>Model ranking by community votes.</h2>
          <p>See how models are performing based on recent community comparisons.</p>
        </div>

        <div className="leaderboard-card">
        {isLoading ? (
          <div className="leaderboard-loading">
            <div className="leaderboard-spinner"></div>
            <p className="leaderboard-note">Loading leaderboard...</p>
          </div>
        ) : null}

        {error ? <p className="leaderboard-error">{error}</p> : null}

        {!isLoading && !error && models.length > 0 ? (
          <>
          <div className="leaderboard-card__toolbar">
            <button
              type="button"
              className={
                showExperimentalMetrics
                  ? 'leaderboard-view-toggle leaderboard-view-toggle--active'
                  : 'leaderboard-view-toggle'
              }
              onClick={() => setShowExperimentalMetrics((previous) => !previous)}
              aria-label={
                showExperimentalMetrics
                  ? 'Show standard leaderboard metrics'
                  : 'Show experimental leaderboard metrics'
              }
              title={
                showExperimentalMetrics
                  ? 'Show standard leaderboard metrics'
                  : 'Show experimental leaderboard metrics'
              }
            >
              <SwapVertRoundedIcon fontSize="inherit" />
            </button>
          </div>
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table" aria-label="Model leaderboard">
              <colgroup>
                <col className="rank-col" />
                <col className="model-col" />
                <col className="stat-col" />
                <col className="stat-col" />
                <col className="stat-col" />
                <col className="stat-col" />
                <col className="stat-col" />
                <col className="stat-col" />
              </colgroup>
              <thead>
                <tr>
                  <th className="rank-col">Rank</th>
                  <th className="model-col">Model</th>
                  {numericColumns.map((column) => {
                    const active = sort.key === column.key
                    const directionMarker = active ? (sort.direction === 'desc' ? '↓' : '↑') : ''
                    return (
                      <th key={column.key} className="numeric-col leaderboard-th-sort">
                        <button
                          type="button"
                          className={active ? 'th-sort-btn th-sort-btn--active' : 'th-sort-btn'}
                          onClick={() => toggleNumericSort(column.key)}
                          aria-label={`Sort by ${column.sortLabel}`}
                        >
                          <span className="th-sort-btn__label">
                            {column.label}
                            {column.tooltip ? (
                              <span className="leaderboard-header-tooltip-wrap">
                                <span className="leaderboard-header-tooltip" role="tooltip">
                                  {column.tooltip}
                                </span>
                              </span>
                            ) : null}
                          </span>
                          <span className="th-sort-btn__marker">{directionMarker}</span>
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedModels.map((model, index) => (
                  <tr
                    key={model.id}
                    className={`rank-${Math.min(index + 1, 3)} leaderboard-row-link`}
                    onClick={() => navigate(`/models/${encodeURIComponent(model.name)}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/models/${encodeURIComponent(model.name)}`)
                      }
                    }}
                    tabIndex={0}
                  >
                    <td className="rank-cell">
                      <span className={`rank-number ${index + 1 <= 3 ? 'top-rank' : ''}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="model-cell">
                      <Link
                        to={`/models/${encodeURIComponent(model.name)}`}
                        className="leaderboard-model-link"
                      >
                        <span className="leaderboard-model-link__label">{model.name}</span>
                        <span className="leaderboard-model-tooltip" role="tooltip">
                          {model.name}
                        </span>
                      </Link>
                      <span className="model-provider">{model.providerDisplayName}</span>
                    </td>
                    <td className="score-cell numeric-col">
                      {numericColumns[0].render(model)}
                    </td>
                    {numericColumns.slice(1).map((column) => (
                      <td
                        key={column.key}
                        className={
                          showExperimentalMetrics
                            ? 'votes-cell numeric-col leaderboard-value-cell'
                            : `${column.key === 'nonTieWinRate' ? 'winrate-cell' : 'votes-cell'} numeric-col`
                        }
                      >
                        {column.render(model)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : !isLoading && !error && models.length === 0 ? (
          <p className="leaderboard-note">No models in leaderboard yet.</p>
        ) : null}
        </div>
      </div>
    </section>
  )
}
