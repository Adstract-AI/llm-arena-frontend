export type VoteChoice = 'modelA' | 'modelB' | 'bothGood' | 'bothBad'

export interface ArenaRound {
  roundId: string
  prompt: string
  answerA: string
  answerB: string
}
