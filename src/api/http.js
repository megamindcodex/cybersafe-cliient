import axios from 'axios'

export const AUTH_TOKEN_STORAGE_KEY = 'esut_cybersafe_token'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Unwraps the backend's `{ data: {...} }` / `{ error: {...} }` envelope so
// call sites can work directly with the payload or a normalized error.
http.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const apiError = error.response?.data?.error

    return Promise.reject({
      code: apiError?.code ?? 'NETWORK_ERROR',
      message: apiError?.message ?? 'Unable to reach the server. Please try again.',
    })
  },
)

export default http
