export type RateLimitWindow = 'minute' | 'hour' | 'day'

export class RateLimitError extends Error {
  readonly window: RateLimitWindow

  constructor(window: RateLimitWindow) {
    super(getRateLimitMessage(window))
    this.name = 'RateLimitError'
    this.window = window
  }
}

interface RateLimitPayload {
  window?: unknown
}

export function normalizeRateLimitWindow(value: unknown): RateLimitWindow {
  if (value === 'minute' || value === 'hour') {
    return value
  }

  return 'day'
}

export function createRateLimitError(payload: RateLimitPayload | null): RateLimitError {
  return new RateLimitError(normalizeRateLimitWindow(payload?.window))
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

export function getRateLimitMessage(window: RateLimitWindow): string {
  if (window === 'minute') {
    return 'You have reached the minute limit. Please try again later.'
  }

  if (window === 'hour') {
    return 'You have reached the hourly limit. Please try again later.'
  }

  return 'You have reached the daily limit. Please try again later.'
}

export function getRateLimitPlaceholder(window: RateLimitWindow): string {
  if (window === 'minute') {
    return 'Minute limit reached. Try again later.'
  }

  if (window === 'hour') {
    return 'Hourly limit reached. Try again later.'
  }

  return 'Daily limit reached. Try again later.'
}
