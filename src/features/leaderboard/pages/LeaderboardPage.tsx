import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api/leaderboardApi'
import type { LeaderboardModel } from '../types'

export function LeaderboardPage() {
  const [models, setModels] = useState<LeaderboardModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch {
        if (isMounted) {
          setError('Could not load leaderboard right now.')
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
    <section className="leaderboard">
      <div className="page-card page-card--helper">
        <p className="eyebrow">Leaderboard</p>
        <h2>Model ranking by community votes.</h2>
        <p>Endpoint integration is ready to plug in when available.</p>
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
              <thead>
                <tr>
                  <th className="rank-col">Rank</th>
                  <th className="model-col">Model</th>
                  <th className="score-col">Score</th>
                  <th className="winrate-col">Win Rate</th>
                  <th className="votes-col">Votes</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.id} className={`rank-${Math.min(model.rank, 3)}`}>
                    <td className="rank-cell">
                      <span className={`rank-number ${model.rank <= 3 ? 'top-rank' : ''}`}>
                        #{model.rank}
                      </span>
                    </td>
                    <td className="model-cell">{model.name}</td>
                    <td className="score-cell">
                      <span className="score-badge">{model.score}</span>
                    </td>
                    <td className="winrate-cell">{model.winRate.toFixed(1)}%</td>
                    <td className="votes-cell">{model.votes.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !isLoading && models.length === 0 ? (
          <p className="leaderboard-note">No models in leaderboard yet.</p>
        ) : null}
      </div>
    </section>
  )
}
