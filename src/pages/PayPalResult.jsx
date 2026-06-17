import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { paypalEndpoints } from '../api/endpoints'
import styles from './PayPalResult.module.css'

export function PayPalSuccess() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { 
      setStatus('error')
      return 
    }

    paypalEndpoints.capturePayment(token)
      .then((res) => {
        // Validating the paymentStatus returned from the backend
        if (res.data?.paymentStatus === 'COMPLETED') {
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [params])

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {status === 'loading' && (
          <>
            <div className={styles.spinner} />
            <p className={styles.message}>Confirming payment…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h1 className={styles.title}>Payment confirmed</h1>
            <p className={styles.sub}>Your order has been placed successfully.</p>
            <Link to="/orders" className={styles.link}>View orders →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className={styles.iconError}>✕</div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.sub}>The payment could not be confirmed. Please check your orders or try again.</p>
            <Link to="/orders" className={styles.link}>View orders →</Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

export function PayPalCancel() {
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      paypalEndpoints.cancelPayment(token).catch(() => {})
    }
  }, [params])

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.iconCancel}>−</div>
        <h1 className={styles.title}>Payment cancelled</h1>
        <p className={styles.sub}>No charge was made. Your cart items are still saved.</p>
        <Link to="/cart" className={styles.link}>Return to cart →</Link>
      </motion.div>
    </div>
  )
}