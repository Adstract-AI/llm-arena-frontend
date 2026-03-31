import type { VoteOutcome } from '../arena/types'

export type ExperimentalModelMode = 'same' | 'different'
export type ExperimentalParameterMode = 'random' | 'same'
export type ExperimentalDistributionType = 'uniform' | 'normal' | 'triangular'
export type ExperimentalParameterKey =
  | 'temperature'
  | 'topP'
  | 'topK'
  | 'frequencyPenalty'
  | 'presencePenalty'

export interface ExperimentalParameterSetting {
  enabled: boolean
  distribution: ExperimentalDistributionType
}

export type ExperimentalParameterSettings = Record<
  ExperimentalParameterKey,
  ExperimentalParameterSetting
>

export interface ExperimentalSetup {
  modelMode: ExperimentalModelMode
  parameterMode: ExperimentalParameterMode
  parameters: ExperimentalParameterSettings
}

export interface ExperimentalParameterValues {
  temperature: number
  topP: number
  topK: number
  frequencyPenalty: number
  presencePenalty: number
}

export interface ExperimentalParameterReveal {
  answer1: ExperimentalParameterValues
  answer2: ExperimentalParameterValues
}

export interface ExperimentalVoteOutcome extends VoteOutcome {
  parameters: ExperimentalParameterReveal
}
