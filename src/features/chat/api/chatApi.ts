import { httpGet, httpPost } from '../../../shared/network/httpClient'
import { streamSseRequest, type SseMessage } from '../../../shared/network/streamSseRequest'
import type { ChatMessageResponse, ChatModel } from '../types'

interface ChatModelDto {
  name: string
  external_model_id: string
  description: string
}

interface ChatMessageResponseDto {
  session_id: string
  response_text: string
  model_name: string
  provider_name: string
}

interface SendChatMessageRequest {
  provider_name: string
  model_name: string
  message: string
  session_id?: string
}

export type ChatStreamEventName =
  | 'session_created'
  | 'session_loaded'
  | 'response_started'
  | 'response_delta'
  | 'response_completed'
  | 'response_failed'
  | 'done'

export type ChatStreamEvent = SseMessage & {
  event: ChatStreamEventName
}

export interface ChatStreamHandlers {
  onEvent: (event: ChatStreamEvent) => void | Promise<void>
}

export async function getAvailableChatModels(): Promise<ChatModel[]> {
  const response = await httpGet<ChatModelDto[]>('/api/chat/models/')

  return response.map((model) => ({
    name: model.name,
    externalModelId: model.external_model_id,
    description: model.description,
  }))
}

export async function startChat(
  modelName: string,
  message: string,
): Promise<ChatMessageResponse> {
  return sendMessage({ provider_name: 'finki', model_name: modelName, message })
}

export function startChatStream(
  modelName: string,
  message: string,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return sendMessageStream(
    { provider_name: 'finki', model_name: modelName, message },
    handlers,
    signal,
  )
}

export async function continueChat(
  sessionId: string,
  modelName: string,
  message: string,
): Promise<ChatMessageResponse> {
  return sendMessage({
    provider_name: 'finki',
    model_name: modelName,
    message,
    session_id: sessionId,
  })
}

export function continueChatStream(
  sessionId: string,
  modelName: string,
  message: string,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return sendMessageStream(
    {
      provider_name: 'finki',
      model_name: modelName,
      message,
      session_id: sessionId,
    },
    handlers,
    signal,
  )
}

async function sendMessage(payload: SendChatMessageRequest): Promise<ChatMessageResponse> {
  const response = await httpPost<ChatMessageResponseDto, SendChatMessageRequest>(
    '/api/chat/messages/',
    payload,
  )

  return {
    sessionId: response.session_id,
    responseText: response.response_text,
    modelName: response.model_name,
    providerName: response.provider_name,
  }
}

function sendMessageStream(
  payload: SendChatMessageRequest,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return streamSseRequest('/api/chat/messages/stream/', payload, {
    signal,
    onEvent: (event) => handlers.onEvent(event as ChatStreamEvent),
  })
}
