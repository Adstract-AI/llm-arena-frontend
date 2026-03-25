import { useEffect, useMemo, useState } from 'react'
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

type SortDirection = 'asc' | 'desc'

interface SortState {
  key: NumericSortKey
  direction: SortDirection
}

const numericSortColumns: Array<{ key: NumericSortKey; label: string }> = [
  { key: 'eloScore', label: 'ELO' },
  { key: 'nonTieWinRate', label: 'Win Rate' },
  { key: 'matches', label: 'Matches' },
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'ties', label: 'Ties' },
]

export function LeaderboardPage() {
  const navigate = useNavigate()
  const [models, setModels] = useState<LeaderboardModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>({ key: 'eloScore', direction: 'desc' })

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1
      return (a[sort.key] - b[sort.key]) * direction
    })
  }, [models, sort])

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
                  {numericSortColumns.map((column) => {
                    const active = sort.key === column.key
                    const directionMarker = active ? (sort.direction === 'desc' ? '↓' : '↑') : ''
                    return (
                      <th key={column.key} className="numeric-col leaderboard-th-sort">
                        <button
                          type="button"
                          className={active ? 'th-sort-btn th-sort-btn--active' : 'th-sort-btn'}
                          onClick={() => toggleNumericSort(column.key)}
                          aria-label={`Sort by ${column.label}`}
                        >
                          <span className="th-sort-btn__label">{column.label}</span>
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
                      <span className="score-badge">{model.eloScore.toFixed(2)}</span>
                    </td>
                    <td className="winrate-cell numeric-col">
                      <div className="winrate-meter">
                        <span className="winrate-meter__value">
                          {(model.nonTieWinRate * 100).toFixed(1)}%
                        </span>
                        <span className="winrate-meter__track" aria-hidden="true">
                          <span
                            className="winrate-meter__fill"
                            style={{ width: `${Math.max(0, Math.min(model.nonTieWinRate * 100, 100))}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="votes-cell numeric-col">{model.matches.toLocaleString()}</td>
                    <td className="votes-cell numeric-col">{model.wins.toLocaleString()}</td>
                    <td className="votes-cell numeric-col">{model.losses.toLocaleString()}</td>
                    <td className="votes-cell numeric-col">{model.ties.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !isLoading && !error && models.length === 0 ? (
          <p className="leaderboard-note">No models in leaderboard yet.</p>
        ) : null}
        </div>
      </div>
    </section>
  )
}
