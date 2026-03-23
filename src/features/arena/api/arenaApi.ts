import { httpPost } from '../../../shared/network/httpClient'
import type { ArenaRound, VoteChoice, VoteOutcome } from '../types'

type ApiSlot = 'A' | 'B'

interface StartBattleResponse {
  id: string
  prompt: string
  responses: Array<{
    slot: ApiSlot
    response_text: string
  }>
}

interface VoteResponse {
  id: string
  choice: string
  feedback: string | null
  winner_provider_name: string | null
  winner_model_name: string | null
  responses: Array<{
    slot: ApiSlot
    response_text: string
    model_name: string
    provider_name: string
    provider_display_name: string
    is_winner: boolean
  }>
}

function toApiChoice(vote: VoteChoice): string {
  if (vote === 'modelA') return 'A'
  if (vote === 'modelB') return 'B'
  if (vote === 'bothGood') return 'BOTH_GOOD'
  return 'BOTH_BAD'
}

function getResponseBySlot<T extends { slot: ApiSlot }>(responses: T[], slot: ApiSlot): T | null {
  return responses.find((response) => response.slot === slot) ?? null
}

export async function startRound(prompt: string): Promise<ArenaRound> {
  const response = await httpPost<StartBattleResponse, { prompt: string }>(
    '/api/arena/battles/',
    { prompt },
  )

  const answerA = getResponseBySlot(response.responses, 'A')
  const answerB = getResponseBySlot(response.responses, 'B')

  if (!answerA || !answerB) {
    throw new Error('Battle response is missing answer slots A/B.')
  }

  return {
    roundId: response.id,
    prompt: response.prompt,
    answerA: answerA.response_text,
    answerB: answerB.response_text,
  }
}

export async function submitVote(roundId: string, vote: VoteChoice): Promise<VoteOutcome> {
  const response = await httpPost<VoteResponse, { choice: string }>(
    `/api/arena/battles/${encodeURIComponent(roundId)}/vote/`,
    { choice: toApiChoice(vote) },
  )

  const answerA = getResponseBySlot(response.responses, 'A')
  const answerB = getResponseBySlot(response.responses, 'B')

  if (!answerA || !answerB) {
    throw new Error('Vote response is missing answer slots A/B.')
  }

  const winnerResponse = response.responses.find((entry) => entry.is_winner)
  const winner =
    winnerResponse?.slot === 'A'
      ? 'modelA'
      : winnerResponse?.slot === 'B'
        ? 'modelB'
        : 'tie'

  const message =
    winner === 'modelA'
      ? 'Answer 1 won this round.'
      : winner === 'modelB'
        ? 'Answer 2 won this round.'
        : vote === 'bothGood'
          ? 'You marked both answers as good.'
          : vote === 'bothBad'
            ? 'You marked both answers as not good.'
            : 'Round saved successfully.'

  return {
    winner,
    message,
    choice: vote,
    winnerModelName: response.winner_model_name,
    winnerProviderName: response.winner_provider_name,
    answer1ModelName: answerA.model_name,
    answer2ModelName: answerB.model_name,
    answer1ProviderDisplayName: answerA.provider_display_name,
    answer2ProviderDisplayName: answerB.provider_display_name,
  }
}
