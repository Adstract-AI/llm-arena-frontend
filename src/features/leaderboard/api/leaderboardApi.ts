import { httpGet } from '../../../shared/network/httpClient'
import type { LeaderboardModel, ModelDetails } from '../types'

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

interface ModelDetailsApiResponse {
  name: string
  external_model_id: string
  description: string
  provider_name: string
  provider_display_name: string
  provider_description: string
  is_fine_tuned: boolean
  is_macedonian_optimized: boolean
  matches: number
  wins: number
  losses: number
  ties: number
  win_rate: number
  non_tie_win_rate: number
  elo_score: number
  avg_prompt_tokens: number | null
  avg_completion_tokens: number | null
  avg_total_tokens: number | null
  avg_latency_ms: number | null
  avg_response_length_chars: number | null
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

export async function getModelDetails(modelName: string): Promise<ModelDetails> {
  const response = await httpGet<ModelDetailsApiResponse>(
    `/api/arena/models/${encodeURIComponent(modelName)}/`,
  )

  return {
    name: response.name,
    externalModelId: response.external_model_id,
    description: response.description,
    providerName: response.provider_name,
    providerDisplayName: response.provider_display_name,
    providerDescription: response.provider_description,
    isFineTuned: response.is_fine_tuned,
    isMacedonianOptimized: response.is_macedonian_optimized,
    matches: response.matches,
    wins: response.wins,
    losses: response.losses,
    ties: response.ties,
    winRate: response.win_rate,
    nonTieWinRate: response.non_tie_win_rate,
    eloScore: response.elo_score,
    avgPromptTokens: response.avg_prompt_tokens,
    avgCompletionTokens: response.avg_completion_tokens,
    avgTotalTokens: response.avg_total_tokens,
    avgLatencyMs: response.avg_latency_ms,
    avgResponseLengthChars: response.avg_response_length_chars,
  }
}
