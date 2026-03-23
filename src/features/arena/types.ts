export type VoteChoice = 'modelA' | 'modelB' | 'bothGood' | 'bothBad'

export interface ArenaRound {
  roundId: string
  prompt: string
  answerA: string
  answerB: string
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
