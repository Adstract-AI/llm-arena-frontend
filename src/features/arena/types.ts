export type VoteChoice = 'modelA' | 'modelB' | 'bothGood' | 'bothBad'

export interface ArenaRound {
  roundId: string
  prompt: string
  answerA: string
  answerB: string
  modelAName: string
  modelBName: string
}

export interface VoteOutcome {
  winner: 'modelA' | 'modelB' | 'tie'
  message: string
}
