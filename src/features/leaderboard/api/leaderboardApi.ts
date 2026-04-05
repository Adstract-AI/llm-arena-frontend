import { httpGet } from '../../../shared/network/httpClient'
import type { LeaderboardModel, ModelDetails } from '../types'

interface LeaderboardApiModel {
  model_name: string
  provider_name: string
  provider_display_name: string
  metrics: {
    matches: number | null
    wins: number | null
    losses: number | null
    ties: number | null
    experimental_wins: number | null
    win_rate: number | null
    non_tie_win_rate: number | null
    elo_score: number | null
  }
  averages: {
    avg_prompt_tokens: number | null
    avg_completion_tokens: number | null
    avg_total_tokens: number | null
    avg_latency_ms: number | null
    avg_response_length_chars: number | null
    avg_temperature: number | null
    avg_top_p: number | null
    avg_top_k: number | null
    avg_frequency_penalty: number | null
    avg_presence_penalty: number | null
  }
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
  metrics: {
    matches: number | null
    wins: number | null
    losses: number | null
    ties: number | null
    experimental_wins: number | null
    win_rate: number | null
    non_tie_win_rate: number | null
    elo_score: number | null
  }
  averages: {
    avg_prompt_tokens: number | null
    avg_completion_tokens: number | null
    avg_total_tokens: number | null
    avg_latency_ms: number | null
    avg_response_length_chars: number | null
    avg_temperature: number | null
    avg_top_p: number | null
    avg_top_k: number | null
    avg_frequency_penalty: number | null
    avg_presence_penalty: number | null
  }
}

export async function getLeaderboard(): Promise<LeaderboardModel[]> {
  const response = await httpGet<LeaderboardApiModel[]>('/api/arena/leaderboard/', {
    auth: false,
  })

  return response.map((model) => ({
    id: `${model.provider_name}:${model.model_name}`,
    name: model.model_name,
    providerDisplayName: model.provider_display_name,
    eloScore: model.metrics.elo_score ?? 0,
    nonTieWinRate: model.metrics.non_tie_win_rate,
    matches: model.metrics.matches ?? 0,
    wins: model.metrics.wins ?? 0,
    losses: model.metrics.losses ?? 0,
    ties: model.metrics.ties ?? 0,
    experimentalWins: model.metrics.experimental_wins ?? 0,
    avgPromptTokens: model.averages.avg_prompt_tokens,
    avgCompletionTokens: model.averages.avg_completion_tokens,
    avgTotalTokens: model.averages.avg_total_tokens,
    avgLatencyMs: model.averages.avg_latency_ms,
    avgResponseLengthChars: model.averages.avg_response_length_chars,
    avgWinningTemp: model.averages.avg_temperature,
    avgWinningTopP: model.averages.avg_top_p,
    avgWinningTopK: model.averages.avg_top_k,
    avgWinningFreqPenalty: model.averages.avg_frequency_penalty,
    avgWinningPresPenalty: model.averages.avg_presence_penalty,
  }))
}

export async function getModelDetails(modelName: string): Promise<ModelDetails> {
  const response = await httpGet<ModelDetailsApiResponse>(
    `/api/arena/models/${encodeURIComponent(modelName)}/`,
    { auth: false },
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
    matches: response.metrics.matches ?? 0,
    wins: response.metrics.wins ?? 0,
    losses: response.metrics.losses ?? 0,
    ties: response.metrics.ties ?? 0,
    experimentalWins: response.metrics.experimental_wins ?? 0,
    winRate: response.metrics.win_rate ?? 0,
    nonTieWinRate: response.metrics.non_tie_win_rate,
    eloScore: response.metrics.elo_score ?? 0,
    avgPromptTokens: response.averages.avg_prompt_tokens,
    avgCompletionTokens: response.averages.avg_completion_tokens,
    avgTotalTokens: response.averages.avg_total_tokens,
    avgLatencyMs: response.averages.avg_latency_ms,
    avgResponseLengthChars: response.averages.avg_response_length_chars,
    avgWinningTemp: response.averages.avg_temperature,
    avgWinningTopP: response.averages.avg_top_p,
    avgWinningTopK: response.averages.avg_top_k,
    avgWinningFreqPenalty: response.averages.avg_frequency_penalty,
    avgWinningPresPenalty: response.averages.avg_presence_penalty,
  }
}
