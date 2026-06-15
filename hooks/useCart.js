import { create } from 'zustand'
import { cartEndpoints } from '../api/endpoints'

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: null,

  setCart: (cart) => {
    set({
      items: cart?.cartItemList ?? [],
      total: cart?.total ?? 0,
    })
  },

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await cartEndpoints.get()
      get().setCart(data)
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (productId, productQuantity) => {
    try {
      const { data } = await cartEndpoints.addItem({ productId, productQuantity })
      get().setCart(data)
    } catch (err) {
      throw err
    }
  },

  removeItem: async (productId) => {
    try {
      const { data } = await cartEndpoints.removeItem(productId)
      get().setCart(data)
    } catch (err) {
      throw err
    }
  },

  clearCart: async () => {
    try {
      await cartEndpoints.clearCart()
      set({ items: [], total: 0 })
    } catch (err) {
      throw err
    }
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.productQuantity, 0),
}))

export default useCartStore
