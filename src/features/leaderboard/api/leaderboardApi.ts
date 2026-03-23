import { httpGet } from '../../../shared/network/httpClient'
import type { LeaderboardModel } from '../types'

interface LeaderboardApiModel {
  model_name: string
  provider_name: string
  provider_display_name: string
  matches: number
  wins: number
  losses: number
  ties: number
  win_rate: number
  non_tie_win_rate: number
  elo_score: number
  avg_prompt_tokens: number
  avg_completion_tokens: number
  avg_total_tokens: number
  avg_latency_ms: number | null
  avg_response_length_chars: number
}

export async function getLeaderboard(): Promise<LeaderboardModel[]> {
  const response = await httpGet<LeaderboardApiModel[]>('/api/arena/leaderboard/')

  return response.map((model) => ({
    id: `${model.provider_name}:${model.model_name}`,
    name: model.model_name,
    providerDisplayName: model.provider_display_name,
    eloScore: model.elo_score,
    nonTieWinRate: model.non_tie_win_rate,
    matches: model.matches,
    wins: model.wins,
    losses: model.losses,
    ties: model.ties,
  }))
}
