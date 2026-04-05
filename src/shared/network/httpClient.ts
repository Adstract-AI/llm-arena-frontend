import axios, { AxiosError } from 'axios'
import { env } from '../config/env'
import {
  clearStoredAuthSession,
  getStoredAuthTokens,
  persistAccessToken,
} from '../../features/auth/storage'

if (!env.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not set. Configure it in your .env file.')
}

const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

interface RequestOptions {
  auth?: boolean
}

type AuthFailureHandler = () => void

let refreshPromise: Promise<string> | null = null
let authFailureHandler: AuthFailureHandler | null = null

export function registerAuthFailureHandler(handler: AuthFailureHandler) {
  authFailureHandler = handler

  return () => {
    if (authFailureHandler === handler) {
      authFailureHandler = null
    }
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = http
      .post<{ access: string }>('/api/auth/token/refresh/', { refresh: refreshToken })
      .then((response) => {
        persistAccessToken(response.data.access)
        return response.data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function parseErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>
    const status = axiosError.response?.status
    const data = axiosError.response?.data
    return (
      data?.detail ??
      data?.message ??
      (status ? `Request failed with status ${status}` : 'Network request failed')
    )
  }

  return error instanceof Error ? error.message : 'Network request failed'
}

export async function httpGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('get', path, undefined, options)
}

export async function httpPost<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse, TBody>('post', path, body, options)
}

export async function httpPatch<TResponse, TBody extends object>(
  path: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse, TBody>('patch', path, body, options)
}

export async function httpDelete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
  return request<TResponse>('delete', path, undefined, options)
}

async function request<TResponse, TBody extends object | undefined = undefined>(
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  body?: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  const requiresAuth = options?.auth ?? true
  const tokens = requiresAuth ? getStoredAuthTokens() : null
  const headers =
    requiresAuth && tokens?.accessToken
      ? { Authorization: `Bearer ${tokens.accessToken}` }
      : undefined

  try {
    const response =
      method === 'get'
        ? await http.get<TResponse>(path, { headers })
        : method === 'post'
          ? await http.post<TResponse>(path, body, { headers })
          : method === 'delete'
            ? await http.delete<TResponse>(path, { headers })
          : await http.patch<TResponse>(path, body, { headers })
    return response.data
  } catch (error) {
    if (
      requiresAuth &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      tokens?.refreshToken
    ) {
      try {
        const nextAccessToken = await refreshAccessToken(tokens.refreshToken)
        const retryHeaders = { Authorization: `Bearer ${nextAccessToken}` }
        const retryResponse =
          method === 'get'
            ? await http.get<TResponse>(path, { headers: retryHeaders })
            : method === 'post'
              ? await http.post<TResponse>(path, body, { headers: retryHeaders })
              : method === 'delete'
                ? await http.delete<TResponse>(path, { headers: retryHeaders })
              : await http.patch<TResponse>(path, body, { headers: retryHeaders })

        return retryResponse.data
      } catch (refreshError) {
        clearStoredAuthSession()
        authFailureHandler?.()
        throw new Error(parseErrorMessage(refreshError))
      }
    }

    throw new Error(parseErrorMessage(error))
  }
}
