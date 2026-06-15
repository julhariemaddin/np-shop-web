import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import useCartStore from '../hooks/useCart'
import Button from '../components/common/Button'
import styles from './Cart.module.css'

export default function Cart() {
  const { items, total, loading, fetchCart, removeItem, clearCart } = useCartStore()

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId)
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const handleClear = async () => {
    try {
      await clearCart()
      toast.success('Cart cleared')
    } catch {
      toast.error('Failed to clear cart')
    }
  }

  if (loading) return (
    <div className={styles.empty}>
      <div className={styles.spinner} />
    </div>
  )

  if (!items.length) return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>Your cart is empty</p>
      <p className={styles.emptySubtitle}>Browse our products and add something you like.</p>
      <Link to="/products">
        <Button variant="primary" size="lg" style={{ marginTop: '24px' }}>
          Browse products
        </Button>
      </Link>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.topBar}>
            <h1 className={styles.heading}>Cart</h1>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          </div>

          <div className={styles.itemList}>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  className={styles.item}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.productName}</p>
                    <div className={styles.itemMeta}>
                      <span>Qty: {item.productQuantity}</span>
                      <span className={styles.dot}>·</span>
                      <span>₱{item.productPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })} each</span>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemTotal}>
                      ₱{(item.productPrice * item.productQuantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(item.productId)}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span className={styles.summaryPrice}>
              ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className={styles.summaryDivider} />
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span className={styles.summaryPrice}>
              ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Link to="/checkout">
            <Button variant="primary" size="lg" style={{ width: '100%', marginTop: '20px' }}>
              Proceed to checkout
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  )
}
