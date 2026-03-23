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
}
