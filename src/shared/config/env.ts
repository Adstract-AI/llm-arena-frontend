declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_API_BASE_URL?: string
    }
  }
}

const apiBaseUrlRaw =
  window.__APP_CONFIG__?.VITE_API_BASE_URL?.trim() ?? import.meta.env.VITE_API_BASE_URL?.trim()
const apiBaseUrl = apiBaseUrlRaw ? apiBaseUrlRaw.replace(/\/+$/, '') : ''

export const env = {
  apiBaseUrl,
}
