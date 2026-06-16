import axios from 'axios'

// ─────────────────────────────────────────────────────────────
// Shared headers
// ─────────────────────────────────────────────────────────────

const defaultHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
}

// ─────────────────────────────────────────────────────────────
// Axios instances
// ─────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: defaultHeaders,
})

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL,
  headers: defaultHeaders,
})

export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
  headers: defaultHeaders,
})

export const paypalApi = axios.create({
  baseURL: import.meta.env.VITE_PAYPAL_BASE_URL,
  headers: defaultHeaders,
})

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────

const getAccessToken = () =>
  localStorage.getItem('accessToken')

const getRefreshToken = () =>
  localStorage.getItem('refreshToken')

const setTokens = (
  accessToken,
  refreshToken
) => {
  localStorage.setItem(
    'accessToken',
    accessToken
  )

  if (refreshToken) {
    localStorage.setItem(
      'refreshToken',
      refreshToken
    )
  }
}

export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

// ─────────────────────────────────────────────────────────────
// Refresh
// ─────────────────────────────────────────────────────────────

let isRefreshing = false
let failedQueue = []

const processQueue = (
  error,
  token = null
) => {
  failedQueue.forEach(
    ({ resolve, reject }) => {
      if (error) reject(error)
      else resolve(token)
    }
  )

  failedQueue = []
}

const refreshAccessToken =
  async () => {
    const refreshToken =
      getRefreshToken()

    if (!refreshToken) {
      throw new Error(
        'No refresh token'
      )
    }

    const response =
      await axios.post(
        import.meta.env
          .VITE_REFRESH_URL,
        {
          refreshToken,
        },
        {
          headers:
            defaultHeaders,
        }
      )

    const {
      accessToken,
      refreshToken:
        newRefresh,
    } = response.data.data

    setTokens(
      accessToken,
      newRefresh
    )

    return accessToken
  }

// ─────────────────────────────────────────────────────────────
// Attach token + ngrok header
// ─────────────────────────────────────────────────────────────

const attachToken = (
  config
) => {
  config.headers =
    config.headers || {}

  config.headers[
    'ngrok-skip-browser-warning'
  ] = 'true'

  const token =
    getAccessToken()

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`
  }

  return config
}

api.interceptors.request.use(
  attachToken
)

userApi.interceptors.request.use(
  attachToken
)

paypalApi.interceptors.request.use(
  attachToken
)

// ─────────────────────────────────────────────────────────────
// Auto refresh
// ─────────────────────────────────────────────────────────────

const handle401 = (
  axiosInstance
) => {
  axiosInstance.interceptors.response.use(
    (response) =>
      response,

    async (error) => {
      const original =
        error.config

      if (
        error.response
          ?.status ===
          401 &&
        !original._retry
      ) {
        if (
          isRefreshing
        ) {
          return new Promise(
            (
              resolve,
              reject
            ) => {
              failedQueue.push(
                {
                  resolve,
                  reject,
                }
              )
            }
          ).then(
            (
              token
            ) => {
              original.headers.Authorization =
                `Bearer ${token}`

              return axiosInstance(
                original
              )
            }
          )
        }

        original._retry =
          true

        isRefreshing =
          true

        try {
          const newToken =
            await refreshAccessToken()

          processQueue(
            null,
            newToken
          )

          original.headers.Authorization =
            `Bearer ${newToken}`

          return axiosInstance(
            original
          )
        } catch (
          err
        ) {
          processQueue(
            err
          )

          clearTokens()

          window.location.href =
            '/login'

          return Promise.reject(
            err
          )
        } finally {
          isRefreshing =
            false
        }
      }

      return Promise.reject(
        error
      )
    }
  )
}

handle401(api)
handle401(userApi)
handle401(paypalApi)