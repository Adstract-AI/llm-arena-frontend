import { httpGet, httpPatch, httpPost } from '../../../shared/network/httpClient'
import { streamSseRequest } from '../../../shared/network/streamSseRequest'
import type { ArenaStreamHandlers } from '../../arena/api/arenaApi'
import type { ArenaBattle, ArenaTurn, VoteChoice } from '../../arena/types'
import type {
  ExperimentalSetup,
  ExperimentalVoteOutcome,
} from '../types'

type ApiSlot = 'A' | 'B'

export interface BattleStateResponse {
  id: string
  status: string
  can_vote: boolean
  turns: Array<{
    turn_number: number
    prompt: string
    responses: Array<{
      slot: ApiSlot
      response_text: string
      improvement_text?: string | null
    }>
  }>
}

interface ExperimentalBattleRequest {
  prompt: string
  model_mode: 'same_model' | 'different_models'
  share_values_across_models: boolean
  parameters: {
    temperature: ExperimentalRequestParameter
    top_p: ExperimentalRequestParameter
    top_k: ExperimentalRequestParameter
    frequency_penalty: ExperimentalRequestParameter
    presence_penalty: ExperimentalRequestParameter
  }
}

interface ExperimentalRequestParameter {
  enabled: boolean
  distribution?: string
}

interface VoteRequestPayload {
  choice: string
  feedback?: string
}

interface VoteResponse {
  id: string
  status: string
  choice: string
  feedback: string | null
  winner_provider_name: string | null
  winner_model_name: string | null
  can_vote?: boolean
  models?: Array<{
    slot: string
    model_name: string
    provider_name: string
    provider_display_name: string
    is_winner: boolean
  }>
  turns: Array<{
    turn_number: number
    prompt: string
    responses: Array<{
      slot: string
      response_text: string
      is_winner: boolean
      improvement_text?: string | null
    }>
  }>
  experiment: {
    model_mode: 'same_model' | 'different_models'
    share_values_across_models: boolean
    parameters: {
      temperature: ApiExperimentParameter
      top_p: ApiExperimentParameter
      top_k: ApiExperimentParameter
      frequency_penalty: ApiExperimentParameter
      presence_penalty: ApiExperimentParameter
    }
  } | null
}

interface ApiExperimentParameter {
  enabled: boolean
  distribution: string | null
  slot_a_value: number | null
  slot_b_value: number | null
}

interface EditResponsePayload {
  response_text: string
}

export interface ExperimentalVoteSubmitResult {
  outcome: ExperimentalVoteOutcome
  battle: ArenaBattle
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
  slot: string,
): T | null {
  if (!responses) {
    return null
  }

  const normalizedSlot = slot.toUpperCase()
  return responses.find((response) => response.slot?.toUpperCase?.() === normalizedSlot) ?? null
}

function toArenaTurn(
  turn:
    | BattleStateResponse['turns'][number]
    | VoteResponse['turns'][number],
): ArenaTurn {
  const responses = turn.responses as Array<{
    slot: string
    response_text: string
    improvement_text?: string | null
  }>
  const answerA = getResponseBySlot(responses, 'A')
  const answerB = getResponseBySlot(responses, 'B')

  if (!answerA || !answerB) {
    throw new Error('Battle turn is missing answer slots A/B.')
  }

  return {
    turnNumber: turn.turn_number,
    prompt: turn.prompt,
    answerA: answerA.response_text,
    answerB: answerB.response_text,
    answerAImprovementText: answerA.improvement_text ?? null,
    answerBImprovementText: answerB.improvement_text ?? null,
  }
}

export function toArenaBattle(response: BattleStateResponse): ArenaBattle {
  return {
    battleId: response.id,
    status: response.status,
    canVote: response.can_vote,
    turns: response.turns.map(toArenaTurn),
  }
}

function toArenaBattleFromVote(response: VoteResponse): ArenaBattle {
  return {
    battleId: response.id,
    status: response.status,
    canVote: response.can_vote ?? false,
    turns: response.turns.map(toArenaTurn),
  }
}

function toExperimentalStartPayload(
  prompt: string,
  setup: ExperimentalSetup,
): ExperimentalBattleRequest {
  return {
    prompt,
    model_mode: setup.modelMode === 'same' ? 'same_model' : 'different_models',
    share_values_across_models: setup.parameterMode === 'same',
    parameters: {
      temperature: {
        enabled: setup.parameters.temperature.enabled,
        distribution: setup.parameters.temperature.enabled
          ? setup.parameters.temperature.distribution
          : undefined,
      },
      top_p: {
        enabled: setup.parameters.topP.enabled,
        distribution: setup.parameters.topP.enabled
          ? setup.parameters.topP.distribution
          : undefined,
      },
      top_k: {
        enabled: setup.parameters.topK.enabled,
        distribution: setup.parameters.topK.enabled
          ? setup.parameters.topK.distribution
          : undefined,
      },
      frequency_penalty: {
        enabled: setup.parameters.frequencyPenalty.enabled,
        distribution: setup.parameters.frequencyPenalty.enabled
          ? setup.parameters.frequencyPenalty.distribution
          : undefined,
      },
      presence_penalty: {
        enabled: setup.parameters.presencePenalty.enabled,
        distribution: setup.parameters.presencePenalty.enabled
          ? setup.parameters.presencePenalty.distribution
          : undefined,
      },
    },
  }
}

function toVoteMessage(winner: ExperimentalVoteOutcome['winner'], vote: VoteChoice): string {
  if (winner === 'modelA') {
    return 'Model 1 won this round.'
  }

  if (winner === 'modelB') {
    return 'Model 2 won this round.'
  }

  if (vote === 'bothGood') {
    return 'You marked both models as good.'
  }

  if (vote === 'bothBad') {
    return 'You marked both models as not good.'
  }

  return 'Round saved successfully.'
}

function toExperimentParameterResult(parameter: ApiExperimentParameter) {
  return {
    enabled: parameter.enabled,
    distribution: parameter.distribution,
    answer1Value: parameter.slot_a_value,
    answer2Value: parameter.slot_b_value,
  }
}

export async function startExperimentalBattle(
  prompt: string,
  setup: ExperimentalSetup,
): Promise<ArenaBattle> {
  const response = await httpPost<BattleStateResponse, ExperimentalBattleRequest>(
    '/api/experimental-arena/battles/',
    toExperimentalStartPayload(prompt, setup),
  )

  return toArenaBattle(response)
}

export function startExperimentalBattleStream(
  prompt: string,
  setup: ExperimentalSetup,
  handlers: ArenaStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return streamSseRequest(
    '/api/experimental-arena/battles/stream/',
    toExperimentalStartPayload(prompt, setup),
    {
      signal,
      onEvent: (event) => handlers.onEvent(event as Parameters<ArenaStreamHandlers['onEvent']>[0]),
    },
  )
}

export async function continueExperimentalBattle(
  battleId: string,
  prompt: string,
): Promise<ArenaBattle> {
  const response = await httpPost<BattleStateResponse, { prompt: string }>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/turns/`,
    { prompt },
  )

  return toArenaBattle(response)
}

export function continueExperimentalBattleStream(
  battleId: string,
  prompt: string,
  handlers: ArenaStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return streamSseRequest(
    `/api/arena/battles/${encodeURIComponent(battleId)}/turns/stream/`,
    { prompt },
    {
      signal,
      onEvent: (event) => handlers.onEvent(event as Parameters<ArenaStreamHandlers['onEvent']>[0]),
    },
  )
}

export async function getExperimentalBattleDetails(battleId: string): Promise<ArenaBattle> {
  const response = await httpGet<BattleStateResponse>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/`,
  )

  return toArenaBattle(response)
}

export async function submitExperimentalVote(
  battleId: string,
  vote: VoteChoice,
): Promise<ExperimentalVoteSubmitResult> {
  const response = await httpPost<VoteResponse, VoteRequestPayload>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/vote/`,
    toApiVotePayload(vote),
  )

  if (!response.experiment) {
    throw new Error('Experimental vote response is missing experiment details.')
  }

  const voteModels = Array.isArray(response.models) ? response.models : []
  const answerA = getResponseBySlot(voteModels, 'A') ?? voteModels[0] ?? null
  const answerB = getResponseBySlot(voteModels, 'B') ?? voteModels[1] ?? null
  const winnerResponse = voteModels.find((entry) => entry.is_winner)
  const choice = response.choice?.toUpperCase()
  const winner =
    winnerResponse?.slot?.toUpperCase?.() === 'A' || choice === 'A'
      ? 'modelA'
      : winnerResponse?.slot?.toUpperCase?.() === 'B' || choice === 'B'
        ? 'modelB'
        : 'tie'

  return {
    battle: toArenaBattleFromVote(response),
    outcome: {
    winner,
    message: toVoteMessage(winner, vote),
    choice: vote,
    winnerModelName: response.winner_model_name,
    winnerProviderName: response.winner_provider_name,
    answer1ModelName: answerA?.model_name ?? 'Model 1',
    answer2ModelName: answerB?.model_name ?? 'Model 2',
    answer1ProviderDisplayName: answerA?.provider_display_name ?? 'Unknown provider',
    answer2ProviderDisplayName: answerB?.provider_display_name ?? 'Unknown provider',
    parameters: {
      answer1: {
        temperature: response.experiment.parameters.temperature.slot_a_value,
        topP: response.experiment.parameters.top_p.slot_a_value,
        topK: response.experiment.parameters.top_k.slot_a_value,
        frequencyPenalty: response.experiment.parameters.frequency_penalty.slot_a_value,
        presencePenalty: response.experiment.parameters.presence_penalty.slot_a_value,
      },
      answer2: {
        temperature: response.experiment.parameters.temperature.slot_b_value,
        topP: response.experiment.parameters.top_p.slot_b_value,
        topK: response.experiment.parameters.top_k.slot_b_value,
        frequencyPenalty: response.experiment.parameters.frequency_penalty.slot_b_value,
        presencePenalty: response.experiment.parameters.presence_penalty.slot_b_value,
      },
    },
    experiment: {
      modelMode: response.experiment.model_mode,
      shareValuesAcrossModels: response.experiment.share_values_across_models,
      parameters: {
        temperature: toExperimentParameterResult(response.experiment.parameters.temperature),
        topP: toExperimentParameterResult(response.experiment.parameters.top_p),
        topK: toExperimentParameterResult(response.experiment.parameters.top_k),
        frequencyPenalty: toExperimentParameterResult(
          response.experiment.parameters.frequency_penalty,
        ),
        presencePenalty: toExperimentParameterResult(
          response.experiment.parameters.presence_penalty,
        ),
      },
    },
    },
  }
}

export async function submitExperimentalResponseImprovement(
  battleId: string,
  turnNumber: number,
  side: ApiSlot,
  improvementText: string,
): Promise<ArenaBattle> {
  const response = await httpPatch<BattleStateResponse, EditResponsePayload>(
    `/api/arena/battles/${encodeURIComponent(battleId)}/turns/${turnNumber}/responses/${side}/`,
    {
      response_text: improvementText,
    },
  )

  return toArenaBattle(response)
}
