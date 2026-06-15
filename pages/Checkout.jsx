import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { orderEndpoints, paypalEndpoints } from '../api/endpoints'
import useCartStore from '../hooks/useCart'
import Button from '../components/common/Button'
import styles from './Checkout.module.css'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const [placingOrder, setPlacingOrder] = useState(false)

  if (!items.length) {
    navigate('/cart')
    return null
  }

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    try {
      const { data: order } = await orderEndpoints.create()
      toast.success('Order placed — redirecting to payment')

      const { data: payment } = await paypalEndpoints.createPayment(order.orderId)
      window.location.href = payment.approvalUrl
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
      setPlacingOrder(false)
    }
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={styles.heading}>Checkout</h1>

        <div className={styles.layout}>
          <section className={styles.orderSummary}>
            <h2 className={styles.sectionTitle}>Order summary</h2>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.productId} className={styles.item}>
                  <div>
                    <p className={styles.itemName}>{item.productName}</p>
                    <p className={styles.itemMeta}>Qty: {item.productQuantity}</p>
                  </div>
                  <span className={styles.itemPrice}>
                    ₱{(item.productPrice * item.productQuantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalPrice}>
                ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </section>

          <section className={styles.payment}>
            <h2 className={styles.sectionTitle}>Payment</h2>
            <p className={styles.paymentInfo}>
              Your order will be placed and you'll be redirected to PayPal to complete the payment securely.
            </p>
            <div className={styles.paypalBadge}>
              <span className={styles.paypalText}>PayPal</span>
            </div>
            <Button
              variant="accent"
              size="lg"
              style={{ width: '100%', marginTop: '20px' }}
              loading={placingOrder}
              onClick={handlePlaceOrder}
            >
              Place order & pay with PayPal
            </Button>
            <Button
              variant="ghost"
              size="md"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={() => navigate('/cart')}
            >
              Back to cart
            </Button>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
