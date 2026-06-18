import axios from 'axios';

// ─── Shared Configuration ─────────────────────────────────────────────────────

const defaultHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true', // Centralized ngrok fix
};

// ─── Axios Instances ──────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: defaultHeaders,
});

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL,
  headers: defaultHeaders,
});

export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
  headers: defaultHeaders,
});

export const paypalApi = axios.create({
  baseURL: import.meta.env.VITE_PAYPAL_BASE_URL,
  headers: defaultHeaders,
});

// ─── Token Helpers ────────────────────────────────────────────────────────────

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ─── Refresh Logic ────────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(import.meta.env.VITE_REFRESH_URL, { refreshToken }, { headers: defaultHeaders });
  
  const { accessToken, refreshToken: newRefresh } = response.data.data;
  setTokens(accessToken, newRefresh);
  return accessToken;
};

// ─── Interceptors ────────────────────────────────────────────────────────────

const attachToken = (config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

// Apply request interceptor
[api, userApi, paypalApi].forEach(instance => instance.interceptors.request.use(attachToken));

// Apply 401 response interceptor
const handle401 = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          processQueue(err);
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
};

[api, userApi, paypalApi].forEach(handle401);