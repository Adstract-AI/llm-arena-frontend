export interface LeaderboardModel {
  id: string
  name: string
  providerDisplayName: string
  matches: number
  wins: number
  losses: number
  ties: number
  experimentalWins: number
  nonTieWinRate: number | null
  eloScore: number
  avgPromptTokens: number | null
  avgCompletionTokens: number | null
  avgTotalTokens: number | null
  avgLatencyMs: number | null
  avgResponseLengthChars: number | null
  avgWinningTemp: number | null
  avgWinningTopP: number | null
  avgWinningTopK: number | null
  avgWinningFreqPenalty: number | null
  avgWinningPresPenalty: number | null
}

export interface ModelDetails {
  name: string
  externalModelId: string
  description: string
  providerName: string
  providerDisplayName: string
  providerDescription: string
  isFineTuned: boolean
  isMacedonianOptimized: boolean
  matches: number
  wins: number
  losses: number
  ties: number
  experimentalWins: number
  winRate: number
  nonTieWinRate: number | null
  eloScore: number
  avgPromptTokens: number | null
  avgCompletionTokens: number | null
  avgTotalTokens: number | null
  avgLatencyMs: number | null
  avgResponseLengthChars: number | null
  avgWinningTemp: number | null
  avgWinningTopP: number | null
  avgWinningTopK: number | null
  avgWinningFreqPenalty: number | null
  avgWinningPresPenalty: number | null
}
