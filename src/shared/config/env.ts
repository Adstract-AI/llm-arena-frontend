const apiBaseUrlRaw = import.meta.env.VITE_API_BASE_URL?.trim()
const apiBaseUrl = apiBaseUrlRaw ? apiBaseUrlRaw.replace(/\/+$/, '') : ''

export const env = {
  apiBaseUrl,
}
