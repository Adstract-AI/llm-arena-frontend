import axios, { AxiosError } from 'axios'
import { env } from '../config/env'

if (!env.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not set. Configure it in your .env file.')
}

const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

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

export async function httpGet<T>(path: string): Promise<T> {
  try {
    const response = await http.get<T>(path)
    return response.data
  } catch (error) {
    throw new Error(parseErrorMessage(error))
  }
}

export async function httpPost<TResponse, TBody extends object>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  try {
    const response = await http.post<TResponse>(path, body)
    return response.data
  } catch (error) {
    throw new Error(parseErrorMessage(error))
  }
}
