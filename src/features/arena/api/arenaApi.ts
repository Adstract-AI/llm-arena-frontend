import type { ArenaRound, VoteChoice } from '../types'

export async function startRound(prompt: string): Promise<ArenaRound> {
  void prompt

  return {
    roundId: 'placeholder-round-id',
    prompt: 'Placeholder prompt',
    answerA: 'Placeholder answer A',
    answerB: 'Placeholder answer B',
  }
}

export async function submitVote(roundId: string, vote: VoteChoice): Promise<void> {
  void roundId
  void vote
}
