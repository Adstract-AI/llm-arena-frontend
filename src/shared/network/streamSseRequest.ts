import { env } from '../config/env'
import {
  clearStoredAuthSession,
  getStoredAuthTokens,
  persistAccessToken,
} from '../../features/auth/storage'
import { createRateLimitError } from './rateLimit'

interface StreamSseRequestOptions {
  auth?: boolean
  signal?: AbortSignal
  onEvent: (event: SseMessage) => void | Promise<void>
}

export interface SseMessage<TData = unknown> {
  event: string
  data: TData
}

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${env.apiBaseUrl}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(async (response) => {
        const data = await readJsonSafely<{ access?: string; detail?: string; message?: string }>(
          response,
        )

        if (!response.ok || !data?.access) {
          throw new Error(
            data?.detail ??
              data?.message ??
              `Request failed with status ${response.status}`,
          )
        }

        persistAccessToken(data.access)
        return data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.clone().json()) as T
  } catch {
    return null
  }
}

async function readResponseError(response: Response): Promise<Error> {
  const data = await readJsonSafely<{ detail?: string; message?: string; error?: string; window?: unknown }>(
    response,
  )

  if (response.status === 429) {
    return createRateLimitError(data)
  }

  if (data?.detail || data?.message || data?.error) {
    return new Error(data.detail ?? data.message ?? data.error ?? 'Network request failed')
  }

  try {
    const text = await response.text()
    return new Error(text.trim() || `Request failed with status ${response.status}`)
  } catch {
    return new Error(`Request failed with status ${response.status}`)
  }
}

function parseSseFrame(frame: string): SseMessage | null {
  const lines = frame.split('\n')
  const eventLine = lines.find((line) => line.startsWith('event:'))
  const dataLines = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())

  if (!eventLine || dataLines.length === 0) {
    return null
  }

  const event = eventLine.slice('event:'.length).trim()
  const dataText = dataLines.join('\n')

  try {
    return {
      event,
      data: JSON.parse(dataText) as unknown,
    }
  } catch {
    return {
      event,
      data: dataText,
    }
  }
}

async function openStream<TBody extends object>(
  path: string,
  body: TBody,
  options: StreamSseRequestOptions,
  accessToken?: string,
): Promise<Response> {
  return fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    signal: options.signal,
    headers: {
      Accept: 'text/event-stream, application/json;q=0.9, */*;q=0.8',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

export async function streamSseRequest<TBody extends object>(
  path: string,
  body: TBody,
  options: StreamSseRequestOptions,
): Promise<void> {
  const requiresAuth = options.auth ?? true
  const tokens = requiresAuth ? getStoredAuthTokens() : null
  let response = await openStream(path, body, options, tokens?.accessToken)

  if (requiresAuth && response.status === 401 && tokens?.refreshToken) {
    try {
      const nextAccessToken = await refreshAccessToken(tokens.refreshToken)
      response = await openStream(path, body, options, nextAccessToken)
    } catch (error) {
      clearStoredAuthSession()
      throw error instanceof Error ? error : new Error('Authentication failed.')
    }
  }

  if (!response.ok) {
    throw await readResponseError(response)
  }

  if (!response.body) {
    throw new Error('Streaming response was not available.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n')

      let separatorIndex = buffer.indexOf('\n\n')
      while (separatorIndex !== -1) {
        const frame = buffer.slice(0, separatorIndex).trim()
        buffer = buffer.slice(separatorIndex + 2)

        if (frame) {
          const message = parseSseFrame(frame)
          if (message) {
            await options.onEvent(message)
          }
        }

        separatorIndex = buffer.indexOf('\n\n')
      }

      if (done) {
        const remainingFrame = buffer.trim()
        if (remainingFrame) {
          const message = parseSseFrame(remainingFrame)
          if (message) {
            await options.onEvent(message)
          }
        }
        break
      }
    }
  } finally {
    reader.releaseLock()
  }
}
