import { api, authApi, userApi, paypalApi } from './client'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authEndpoints = {
  register: (data) => authApi.post('/register', data),
  login: (data) => authApi.post('/sign-in', data),
}

// ─── User / Profile ───────────────────────────────────────────────────────────

export const userEndpoints = {
  getProfile: () => userApi.get(''),
  updateProfile: (data) => userApi.patch('/profile', data),
  updatePassword: (data) => userApi.patch('/password', data),
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const productEndpoints = {
  getAll: (params) => api.get('/product', { params }),
  getById: (id) => api.get(`/product/${id}`),
  search: (keyword, params) => api.get(`/product/search/${keyword}`, { params }),
  create: (formData) =>
    api.post('/product', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/product/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/product/${id}`),
}

// ─── Images ───────────────────────────────────────────────────────────────────

export const imageEndpoints = {
  upload: (productId, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/image/${productId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (imageId) => api.delete(`/image/${imageId}`),
  getUrl: (url) => `${import.meta.env.VITE_API_BASE_URL}/image/${url}`,
  fetchBlobUrl: async (filename) => {
    try {
      const response = await api.get(`/image/${filename}`, { responseType: 'blob' })
      return URL.createObjectURL(response.data)
    } catch (error) {
      console.error('Failed to resolve asset pipeline:', error)
      return '/placeholder.png'
    }
  }
}
// Server

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoryEndpoints = {
  getAll: () => api.get('/category'),
  getById: (id) => api.get(`/category/${id}`),
  create: (data) => api.post('/category', data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cartEndpoints = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  removeItem: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orderEndpoints = {
  create: () => api.post('/order'),
  getAll: (params) => api.get('/order', { params }),
  getById: (id) => api.get(`/order/${id}`),
  delete: (id) => api.delete(`/order/${id}`),
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
// ADDED THIS BLOCK BELOW
export const reviewEndpoints = {
  post: (data) => api.post('/product/review', data),
  getReviews: (productId, params) => api.get(`/product/review/${productId}`, { params }),
}

// ─── PayPal ───────────────────────────────────────────────────────────────────

export const paypalEndpoints = {
  createPayment: (orderId) => paypalApi.post('/payment', { orderId }),
  capturePayment: (token) => paypalApi.get('/capture', { params: { token } }),
  cancelPayment: (token) => paypalApi.get('/cancel', { params: { token } }),
}