import { httpGet, httpPost } from '../../../shared/network/httpClient'
import type { ArenaBattle, ArenaTurn, VoteChoice, VoteOutcome } from '../types'

type ApiSlot = 'A' | 'B'

interface BattleStateResponse {
  id: string
  status: string
  can_vote: boolean
  turns: Array<{
    turn_number: number
    prompt: string
    responses: Array<{
      slot: ApiSlot
      response_text: string
    }>
  }>
}

interface VoteResponse {
  id: string
  status?: string
  choice: string
  feedback: string | null
  winner_provider_name: string | null
  winner_model_name: string | null
  responses?: Array<{
    slot: ApiSlot
    response_text: string
    model_name: string
    provider_name: string
    provider_display_name: string
    is_winner: boolean
  }>
  models?: Array<{
    slot: string
    model_name: string
    provider_name: string
    provider_display_name: string
    is_winner: boolean
  }>
}

interface VoteRequestPayload {
  choice: string
  feedback?: string
}

function toApiVotePayload(vote: VoteChoice): VoteRequestPayload {
  if (vote === 'modelA') return { choice: 'A' }
  if (vote === 'modelB') return { choice: 'B' }
  if (vote === 'bothGood') {
    return {
      choice: 'tie',
      feedback: 'Both responses were good.',
    }
  }

  return {
    choice: 'tie',
    feedback: 'Both responses were bad.',
  }
}

function getResponseBySlot<T extends { slot: string }>(
  responses: T[] | undefined,
  slot: ApiSlot | string,
): T | null {
  if (!responses) {
    return null
  }

  const normalizedSlot = slot.toUpperCase()
  return responses.find((response) => response.slot?.toUpperCase?.() === normalizedSlot) ?? null
}

function toArenaTurn(turn: BattleStateResponse['turns'][number]): ArenaTurn {
  const answerA = getResponseBySlot(turn.responses, 'A')
  const answerB = getResponseBySlot(turn.responses, 'B')

  if (!answerA || !answerB) {
    throw new Error('Battle turn is missing answer slots A/B.')
  }

  return {
    turnNumber: turn.turn_number,
    prompt: turn.prompt,
    answerA: answerA.response_text,
    answerB: answerB.response_text,
  }
}

function toArenaBattle(response: BattleStateResponse): ArenaBattle {
  return {
    battleId: response.id,
    status: response.status,
    canVote: response.can_vote,
    turns: response.turns.map(toArenaTurn),
  }
}

export async function startBattle(prompt: string): Promise<ArenaBattle> {
  const response = await httpPost<BattleStateResponse, { prompt: string }>(
    '/api/arena/battles/',
    { prompt },
  )

  return toArenaBattle(response)
}

export async function continueBattle(battleId: string, prompt: string): Promise<ArenaBattle> {
  const response = await httpPost<BattleStateResponse, { prompt: string }>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/turns/`,
    { prompt },
  )

  return toArenaBattle(response)
}

export async function getBattleDetails(battleId: string): Promise<ArenaBattle> {
  const response = await httpGet<BattleStateResponse>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/`,
  )

  return toArenaBattle(response)
}

export async function submitVote(battleId: string, vote: VoteChoice): Promise<VoteOutcome> {
  const response = await httpPost<VoteResponse, VoteRequestPayload>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/vote/`,
    toApiVotePayload(vote),
  )

  if (import.meta.env.DEV) {
    console.groupCollapsed('[Arena][Vote] Raw response')
    console.log('battleId:', battleId)
    console.log('vote sent:', vote, toApiVotePayload(vote))
    console.log('response:', response)
    console.log('response.responses type:', typeof response.responses)
    console.log('response.responses value:', response.responses)
    console.groupEnd()
  }

  const voteModels = Array.isArray(response.models) ? response.models : []
  const voteResponses = Array.isArray(response.responses) ? response.responses : []
  const voteEntries = voteModels.length > 0 ? voteModels : voteResponses
  const answerA = getResponseBySlot(voteEntries, 'A') ?? voteEntries[0] ?? null
  const answerB = getResponseBySlot(voteEntries, 'B') ?? voteEntries[1] ?? null

  const winnerResponse = voteEntries.find((entry) => entry.is_winner)
  const choice = response.choice?.toUpperCase()
  const winner =
    winnerResponse?.slot === 'A' || choice === 'A'
      ? 'modelA'
      : winnerResponse?.slot === 'B' || choice === 'B'
        ? 'modelB'
        : 'tie'

  const message =
    winner === 'modelA'
      ? 'Model 1 won this round.'
      : winner === 'modelB'
        ? 'Model 2 won this round.'
        : vote === 'bothGood'
          ? 'You marked both models as good.'
          : vote === 'bothBad'
            ? 'You marked both models as not good.'
            : 'Round saved successfully.'

  if (import.meta.env.DEV) {
    console.groupCollapsed('[Arena][Vote] Parsed mapping')
    console.log('voteModels:', voteModels)
    console.log('voteResponses:', voteResponses)
    console.log('voteEntries used:', voteEntries)
    console.log('answerA:', answerA)
    console.log('answerB:', answerB)
    console.log('winnerResponse:', winnerResponse)
    console.log('winner:', winner)
    console.log('choice (api):', response.choice)
    console.groupEnd()
  }

  return {
    winner,
    message,
    choice: vote,
    winnerModelName: response.winner_model_name,
    winnerProviderName: response.winner_provider_name,
    answer1ModelName: answerA?.model_name ?? 'Model 1',
    answer2ModelName: answerB?.model_name ?? 'Model 2',
    answer1ProviderDisplayName: answerA?.provider_display_name ?? 'Unknown provider',
    answer2ProviderDisplayName: answerB?.provider_display_name ?? 'Unknown provider',
  }
}
