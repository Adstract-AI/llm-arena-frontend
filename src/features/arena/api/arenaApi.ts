import type { ArenaRound, VoteChoice, VoteOutcome } from '../types'

const MODEL_POOL: Array<[string, string]> = [
  ['Astra Prime', 'Nimbus Ultra'],
  ['Vector 3.2', 'Lyric Pro'],
  ['Orion Max', 'Nova Reasoner'],
]

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAnswerA(prompt: string) {
  return `Direct approach for "${prompt}": break the problem into steps, produce a concise answer, and add one practical follow-up action.`
}

function buildAnswerB(prompt: string) {
  return `Alternative strategy for "${prompt}": start with assumptions, explain tradeoffs, then provide a structured recommendation with next steps.`
}

export async function startRound(prompt: string): Promise<ArenaRound> {
  await wait(550)

  const modelPair = MODEL_POOL[Math.floor(Math.random() * MODEL_POOL.length)]

  return {
    roundId: crypto.randomUUID(),
    prompt,
    answerA: buildAnswerA(prompt),
    answerB: buildAnswerB(prompt),
    modelAName: modelPair[0],
    modelBName: modelPair[1],
  }
}

export async function submitVote(
  roundId: string,
  vote: VoteChoice,
): Promise<VoteOutcome> {
  await wait(350)
  void roundId

  if (vote === 'modelA') {
    return {
      winner: 'modelA',
      message: 'Answer 1 wins this round.',
    }
  }

  if (vote === 'modelB') {
    return {
      winner: 'modelB',
      message: 'Answer 2 wins this round.',
    }
  }

  if (vote === 'bothGood') {
    return {
      winner: 'tie',
      message: 'Both answers were marked as good.',
    }
  }

  return {
    winner: 'tie',
    message: 'Both answers were marked as not good.',
  }
}
