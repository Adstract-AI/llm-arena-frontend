export type VoteChoice = 'modelA' | 'modelB' | 'bothGood' | 'bothBad'

export interface ArenaTurn {
  turnNumber: number
  prompt: string
  answerA: string
  answerB: string
}

export interface ArenaBattle {
  battleId: string
  status: string
  canVote: boolean
  turns: ArenaTurn[]
}

export interface VoteOutcome {
  winner: 'modelA' | 'modelB' | 'tie'
  message: string
  choice: VoteChoice
  winnerModelName: string | null
  winnerProviderName: string | null
  answer1ModelName: string
  answer2ModelName: string
  answer1ProviderDisplayName: string
  answer2ProviderDisplayName: string
}
