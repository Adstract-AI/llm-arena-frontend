export interface ChatModel {
  name: string
  externalModelId: string
  description: string
}

export interface ChatMessageResponse {
  sessionId: string
  responseText: string
  modelName: string
  providerName: string
}

export interface ChatUiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}
