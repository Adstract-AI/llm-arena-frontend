import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  continueChat,
  continueChatStream,
  getAvailableChatModels,
  startChat,
  startChatStream,
} from '../api/chatApi'
import type { ChatModel, ChatUiMessage } from '../types'
import { useAuth } from '../../auth/context/AuthContext'
import { AuthGateCard } from '../../auth/components/AuthGateCard'
import {
  readLocalJson,
  removeLocalJson,
  writeLocalJson,
} from '../../../shared/storage/localJsonStorage'
import { FriendlyErrorToast } from '../../../shared/components/FriendlyErrorToast'
import { createClientId } from '../../../shared/crypto/id'
import { env } from '../../../shared/config/env'
import { isRateLimitError } from '../../../shared/network/rateLimit'
import { useI18n } from '../../../shared/localisation/I18nContext'

const CHAT_SESSION_STORAGE_KEY = 'makarena-chat-session-v1'

interface ChatSessionSnapshot {
  sessionId: string | null
  messages: ChatUiMessage[]
  selectedModelName: string
  inputValue: string
}

function createMessage(role: ChatUiMessage['role'], content: string): ChatUiMessage {
  return {
    id: `${role}-${createClientId()}`,
    role,
    content,
  }
}

function readChatSessionSnapshot(): ChatSessionSnapshot | null {
  return readLocalJson<ChatSessionSnapshot>(CHAT_SESSION_STORAGE_KEY)
}

export function ChatPage() {
  const { isAuthenticated, isInitializing } = useAuth()
  const { strings } = useI18n()
  const savedSession = useMemo(readChatSessionSnapshot, [])
  const [models, setModels] = useState<ChatModel[]>([])
  const [selectedModelName, setSelectedModelName] = useState(
    savedSession?.selectedModelName ?? '',
  )
  const [sessionId, setSessionId] = useState<string | null>(savedSession?.sessionId ?? null)
  const [messages, setMessages] = useState<ChatUiMessage[]>(savedSession?.messages ?? [])
  const [inputValue, setInputValue] = useState(savedSession?.inputValue ?? '')
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const modelMenuRef = useRef<HTMLDivElement | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)


  useEffect(() => {
    if (isInitializing) {
      return
    }

    if (!isAuthenticated) {
      setModels([])
      setSelectedModelName('')
      setSessionId(null)
      setMessages([])
      setInputValue('')
      setIsLoadingModels(false)
      removeLocalJson(CHAT_SESSION_STORAGE_KEY)
      return
    }

    let isMounted = true

    async function loadModels() {
      setIsLoadingModels(true)
      setError(null)
      try {
        const data = await getAvailableChatModels()
        if (!isMounted) {
          return
        }

        setModels(data)
        if (data.length > 0) {
          setSelectedModelName((current) => current || data[0].name)
        }
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : strings.chat.couldNotLoadModels,
        )
      } finally {
        if (isMounted) {
          setIsLoadingModels(false)
        }
      }
    }

    void loadModels()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, isInitializing, strings.chat.couldNotLoadModels])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    if (!sessionId && messages.length === 0 && !inputValue.trim()) {
      removeLocalJson(CHAT_SESSION_STORAGE_KEY)
      return
    }

    writeLocalJson<ChatSessionSnapshot>(CHAT_SESSION_STORAGE_KEY, {
      sessionId,
      messages,
      selectedModelName,
      inputValue,
    })
  }, [inputValue, isAuthenticated, messages, selectedModelName, sessionId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!modelMenuRef.current) {
        return
      }

      if (!modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (sessionId || isSending) {
      setIsModelMenuOpen(false)
    }
  }, [sessionId, isSending])

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort()
    }
  }, [])

  function getPayloadText(payload: unknown, key: 'text' | 'response_text' | 'error'): string {
    if (!payload || typeof payload !== 'object' || !(key in payload)) {
      return ''
    }

    const value = (payload as Record<string, unknown>)[key]
    return typeof value === 'string' ? value : ''
  }

  function getPayloadSessionId(payload: unknown): string {
    if (!payload || typeof payload !== 'object' || !('session_id' in payload)) {
      return ''
    }

    const value = (payload as Record<string, unknown>).session_id
    return typeof value === 'string' ? value : ''
  }

  function upsertAssistantMessage(
    messageId: string,
    updater: (message: ChatUiMessage) => ChatUiMessage,
  ) {
    setMessages((previous) => {
      const existingMessage = previous.find((message) => message.id === messageId)

      if (!existingMessage) {
        return [
          ...previous,
          updater({
            id: messageId,
            role: 'assistant',
            content: '',
            status: 'streaming',
          }),
        ]
      }

      return previous.map((message) => (message.id === messageId ? updater(message) : message))
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed || !selectedModelName || isSending) {
      return
    }

    setError(null)
    setInputValue('')
    setMessages((previous) => [...previous, createMessage('user', trimmed)])
    setIsSending(true)

    try {
      if (env.enableStreaming) {
        const assistantMessageId = `assistant-${createClientId()}`
        const abortController = new AbortController()
        streamAbortRef.current = abortController

        const handleStreamEvent = async (event: string, data: unknown) => {
          if (event === 'session_created' || event === 'session_loaded') {
            const nextSessionId = getPayloadSessionId(data)
            if (nextSessionId) {
              setSessionId(nextSessionId)
            }
            return
          }

          if (event === 'response_started') {
            upsertAssistantMessage(assistantMessageId, (message) => ({
              ...message,
              status: 'streaming',
            }))
            return
          }

          if (event === 'response_delta') {
            const text = getPayloadText(data, 'text')
            if (!text) {
              return
            }

            upsertAssistantMessage(assistantMessageId, (message) => ({
              ...message,
              content: `${message.content}${text}`,
              status: 'streaming',
            }))
            return
          }

          if (event === 'response_completed') {
            const responseText = getPayloadText(data, 'response_text')
            const nextSessionId = getPayloadSessionId(data)
            if (nextSessionId) {
              setSessionId(nextSessionId)
            }
            upsertAssistantMessage(assistantMessageId, (message) => ({
              ...message,
              content: responseText || message.content,
              status: 'complete',
            }))
            return
          }

          if (event === 'response_failed') {
            setMessages((previous) =>
              previous.filter((message) => message.id !== assistantMessageId),
            )
            setError(getPayloadText(data, 'error') || strings.chat.responseFailed)
            return
          }

          if (event === 'done') {
            const responseText = getPayloadText(data, 'response_text')
            const nextSessionId = getPayloadSessionId(data)
            if (nextSessionId) {
              setSessionId(nextSessionId)
            }
            upsertAssistantMessage(assistantMessageId, (message) => ({
              ...message,
              content: responseText || message.content,
              status: 'complete',
            }))
          }
        }

        await (sessionId
          ? continueChatStream(
              sessionId,
              selectedModelName,
              trimmed,
              {
                onEvent: ({ event, data }) => handleStreamEvent(event, data),
              },
              abortController.signal,
            )
          : startChatStream(
              selectedModelName,
              trimmed,
              {
                onEvent: ({ event, data }) => handleStreamEvent(event, data),
              },
              abortController.signal,
            ))

        return
      }

      const response = sessionId
        ? await continueChat(sessionId, selectedModelName, trimmed)
        : await startChat(selectedModelName, trimmed)

      setSessionId(response.sessionId)
      setMessages((previous) => [
        ...previous,
        createMessage('assistant', response.responseText),
      ])
    } catch (sendError) {
      if (sendError instanceof DOMException && sendError.name === 'AbortError') {
        return
      }

      if (isRateLimitError(sendError)) {
        setError(sendError.message)
        return
      }

      setError(
        sendError instanceof Error ? sendError.message : strings.chat.couldNotSendMessage,
      )
    } finally {
      streamAbortRef.current = null
      setIsSending(false)
    }
  }

  function resetSession() {
    streamAbortRef.current?.abort()
    setSessionId(null)
    setMessages([])
    setInputValue('')
    setError(null)
    removeLocalJson(CHAT_SESSION_STORAGE_KEY)
  }

  function selectModel(modelName: string) {
    setSelectedModelName(modelName)
    setIsModelMenuOpen(false)
  }

  const modelMenuDisabled = isLoadingModels || isSending || Boolean(sessionId)
  const hasNoModels = !isLoadingModels && models.length === 0

  if (!isInitializing && !isAuthenticated) {
    return (
      <section className="chat-session">
        <AuthGateCard
          title={strings.auth.chatGateTitle}
          description={strings.auth.chatGateDescription}
          returnPath="/chat"
        />
      </section>
    )
  }

  return (
    <section className="chat-session">
      {messages.length === 0 ? (
        <div className="page-card page-card--helper">
          <p className="eyebrow">{strings.chat.eyebrow}</p>
          <h2>{strings.chat.introTitle}</h2>
          <p>{strings.chat.introBody}</p>
          {hasNoModels ? (
            <div className="arena-note" aria-label={strings.chat.noActiveModelsTitle}>
              <strong>{strings.chat.noActiveModelsTitle}</strong>
              <span>{strings.chat.noActiveModelsBody}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <FriendlyErrorToast
          message={strings.chat.problemTitle}
          detail={error}
        />
      ) : null}

      <section className="chat-space" aria-live="polite">
        {(
          messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === 'user'
                  ? 'chat-message chat-message--user'
                  : 'chat-message chat-message--assistant'
              }
            >
              {message.role === 'assistant' ? (
                <p className="chat-message__role chat-message__role--model">
                  {selectedModelName || strings.chat.modelFallback}
                </p>
              ) : null}
              {message.role === 'assistant' ? (
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                  {message.status === 'streaming' ? (
                    <div className="typing-indicator typing-indicator--inline" aria-label={strings.chat.generatingResponse}>
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="chat-message__text">{message.content}</p>
              )}
            </article>
          ))
        )}

        {isSending && !env.enableStreaming ? (
          <article className="chat-message chat-message--assistant chat-message--loading">
            <p className="chat-message__role chat-message__role--model">
              {selectedModelName || strings.chat.modelFallback}
            </p>
            <div className="typing-indicator" aria-label={strings.chat.generatingResponse}>
              <span />
              <span />
              <span />
            </div>
          </article>
        ) : null}
      </section>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <label htmlFor="chat-message-input" className="sr-only">
          {strings.chat.messageLabel}
        </label>
        <div className="chat-composer">
          <div className="chat-composer__toolbar">
            <div className="chat-composer__model-picker" ref={modelMenuRef}>
              <button
                type="button"
                className="chat-composer__model-trigger"
                onClick={() => setIsModelMenuOpen((current) => !current)}
                disabled={modelMenuDisabled && !hasNoModels}
                aria-haspopup="listbox"
                aria-expanded={isModelMenuOpen}
              >
                <span className="chat-composer__model-trigger-text">
                  {selectedModelName || (hasNoModels ? strings.chat.noActiveModels : strings.chat.chooseModel)}
                </span>
                <KeyboardArrowDownRoundedIcon
                  aria-hidden="true"
                  className={
                    isModelMenuOpen
                      ? 'chat-composer__model-caret chat-composer__model-caret--open'
                      : 'chat-composer__model-caret'
                  }
                />
              </button>

              {isModelMenuOpen && (!modelMenuDisabled || hasNoModels) ? (
                <ul className="chat-composer__model-menu" role="listbox" aria-label={strings.chat.chooseModelList}>
                  <li className="chat-composer__model-menu-title" aria-hidden="true">
                    {strings.chat.selectModel}
                  </li>
                  {hasNoModels ? (
                    <li className="chat-composer__model-menu-title" aria-hidden="true">
                      {strings.chat.noActiveModelsMenu}
                    </li>
                  ) : null}
                  {models.map((model) => {
                    const tooltipId = `chat-model-info-${model.name.replace(/[^a-zA-Z0-9-_]/g, '-')}`

                    return (
                    <li
                      key={model.name}
                      className={
                        model.name === selectedModelName
                          ? 'chat-composer__model-option-row chat-composer__model-option-row--selected'
                          : 'chat-composer__model-option-row'
                      }
                    >
                      <button
                        type="button"
                        className="chat-composer__model-option"
                        onClick={() => selectModel(model.name)}
                        role="option"
                        aria-selected={model.name === selectedModelName}
                      >
                        <span className="chat-composer__model-option-label">{model.name}</span>
                      </button>
                      <span className="chat-composer__model-info-wrap">
                        <button
                          type="button"
                          className="chat-composer__model-info"
                          aria-label={strings.chat.aboutModel(model.name)}
                          aria-describedby={tooltipId}
                          onClick={(event) => {
                            event.stopPropagation()
                          }}
                        >
                          <InfoOutlinedIcon
                            aria-hidden="true"
                            className="chat-composer__model-info-icon"
                          />
                        </button>
                        <span
                          id={tooltipId}
                          role="tooltip"
                          className="chat-composer__model-tooltip"
                        >
                          {model.description || strings.chat.noDescription}
                        </span>
                      </span>
                    </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>

            <button
              type="button"
              className="chat-composer__new-session"
              onClick={resetSession}
              disabled={messages.length === 0}
            >
              {strings.chat.newSession}
            </button>
          </div>

          <div className="chat-composer__input-row">
            <input
              id="chat-message-input"
              className="chat-composer__input"
              placeholder={strings.chat.placeholder}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isLoadingModels || isSending || !selectedModelName}
            />
            <button
              type="submit"
              className="chat-composer__send"
              disabled={
                isLoadingModels ||
                isSending ||
                !selectedModelName ||
                !inputValue.trim()
              }
              aria-label={isSending ? strings.chat.sendingMessage : strings.chat.sendMessage}
            >
              <SendRoundedIcon aria-hidden="true" className="chat-composer__send-icon" />
            </button>
          </div>


        </div>
      </form>
    </section>
  )
}
