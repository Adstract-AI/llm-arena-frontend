import { httpGet, httpPost } from '../../../shared/network/httpClient'
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
