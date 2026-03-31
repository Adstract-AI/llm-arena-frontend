export interface LeaderboardModel {
  id: string
  name: string
  providerDisplayName: string
  matches: number
  wins: number
  losses: number
  ties: number
  nonTieWinRate: number
  eloScore: number
  avgWinningTemp: number
  avgWinningTopP: number
  avgWinningTopK: number
  avgWinningFreqPenalty: number
  avgWinningPresPenalty: number
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
  winRate: number
  nonTieWinRate: number
  eloScore: number
  avgPromptTokens: number | null
  avgCompletionTokens: number | null
  avgTotalTokens: number | null
  avgLatencyMs: number | null
  avgResponseLengthChars: number | null
}
