import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { paypalEndpoints } from '../api/endpoints'
import Button from '../components/common/Button'
import styles from './PayPalResult.module.css'

export function PayPalSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {status === 'loading' && (
          <div className={styles.content}>
            <div className={styles.spinner} />
            <h1 className={styles.title}>Confirming payment</h1>
            <p className={styles.message}>Please wait while we securely process your transaction...</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.content}>
            <div className={`${styles.iconWrapper} ${styles.success}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className={styles.title}>Payment confirmed</h1>
            <p className={styles.sub}>Thank you! Your order has been placed and paid for successfully.</p>
            <div className={styles.actions}>
              <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => navigate('/orders')}>
                View my orders
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.content}>
            <div className={`${styles.iconWrapper} ${styles.error}`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.sub}>We couldn't confirm your payment. Please check your orders or try checking out again.</p>
            <div className={styles.actions}>
              <Button variant="accent" size="lg" style={{ width: '100%' }} onClick={() => navigate('/orders')}>
                Check order status
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export function PayPalCancel() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className={styles.content}>
          <div className={`${styles.iconWrapper} ${styles.cancel}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <h1 className={styles.title}>Payment cancelled</h1>
          <p className={styles.sub}>No charge was made. Your order is pending, and you can retry the payment whenever you are ready.</p>
          <div className={styles.actions}>
            <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => navigate('/orders')}>
              View pending orders
            </Button>
            <Button variant="ghost" size="md" style={{ width: '100%', marginTop: '8px' }} onClick={() => navigate('/cart')}>
              Return to cart
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}