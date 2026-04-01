import type { VoteOutcome } from '../arena/types'

export type ExperimentalModelMode = 'same' | 'different'
export type ExperimentalParameterMode = 'random' | 'same'
export type ExperimentalDistributionType = 'uniform' | 'normal' | 'beta'
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
  temperature: number | null
  topP: number | null
  topK: number | null
  frequencyPenalty: number | null
  presencePenalty: number | null
}

export interface ExperimentalParameterReveal {
  answer1: ExperimentalParameterValues
  answer2: ExperimentalParameterValues
}

export interface ExperimentalVoteParameterResult {
  enabled: boolean
  distribution: string | null
  answer1Value: number | null
  answer2Value: number | null
}

export interface ExperimentalVoteParameterResults {
  temperature: ExperimentalVoteParameterResult
  topP: ExperimentalVoteParameterResult
  topK: ExperimentalVoteParameterResult
  frequencyPenalty: ExperimentalVoteParameterResult
  presencePenalty: ExperimentalVoteParameterResult
}

export interface ExperimentalResultDetails {
  modelMode: 'same_model' | 'different_models'
  shareValuesAcrossModels: boolean
  parameters: ExperimentalVoteParameterResults
}

export interface ExperimentalVoteOutcome extends VoteOutcome {
  parameters: ExperimentalParameterReveal
  experiment: ExperimentalResultDetails
}
