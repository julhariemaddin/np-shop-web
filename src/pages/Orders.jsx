import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { orderEndpoints, paypalEndpoints } from '../api/endpoints'
import styles from './Orders.module.css'

const orderStatusStyles = {
  PENDING_PAYMENT: 'pending',
  CONFIRMED: 'processing',
  DELIVERED: 'completed',
  PAYMENT_FAILED: 'cancelled',
  PAYMENT_PROCESSING: 'processing',
  PAYMENT_CANCELED: 'cancelled',
  CANCELLED: 'cancelled',
}

const paymentStatusStyles = {
  PAID: 'completed',
  FAILED: 'cancelled',
  PENDING_PAYMENT: 'pending',
  CANCEL: 'cancelled',
  PROCESSING: 'processing',
  TIMEOUT: 'cancelled',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [payingOrder, setPayingOrder] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const cancelled = searchParams.get('cancelled')

    if (success === 'true') {
      toast.success('SYSTEM CLEARED // PAYMENT VERIFIED')
      searchParams.delete('success')
      setSearchParams(searchParams)
    } else if (cancelled === 'true') {
      toast.error('[!] WARNING // TRANSACTION ABORTED')
      searchParams.delete('cancelled')
      setSearchParams(searchParams)
    }
  }, [searchParams, setSearchParams])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Streamlined: Only fetching orders now since productName is in the payload
      const ordersRes = await orderEndpoints.getAll({ page, size: 10 })
      setOrders(ordersRes.data.content || [])
      setTotalPages(ordersRes.data.totalPages || 0)
    } catch (err) {
      toast.error('[!] SYSTEM FAULT // DATA UNREACHABLE')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePay = async (e, orderId) => {
    e.stopPropagation() 
    setPayingOrder(orderId)
    try {
      toast.loading('HANDSHAKE INITIATED // SECURING ROUTE...', { id: 'payment-toast' })
      const { data } = await paypalEndpoints.createPayment(orderId)
      toast.success('REDIRECTING TO GATEWAY...', { id: 'payment-toast' })
      window.location.href = data.approvalUrl
    } catch (err) {
      toast.error('[!] CONNECTION FAILED', { id: 'payment-toast' })
    } finally {
      setPayingOrder(null)
    }
  }

  const handleDelete = async (e, orderId) => {
    e.stopPropagation()
    try {
      await orderEndpoints.delete(orderId)
      toast.success('RECORD EXPUNGED // ORDER DELETED')
      fetchData() 
    } catch {
      toast.error('[!] OVERRIDE DENIED // DELETION FAILED')
    }
  }

  const toggleAccordion = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id))
  }

  // --- STARK LOADING STATE ---
  if (loading) {
    return (
      <div className={styles.loadWrap}>
        <div className={styles.terminalSpinner} />
        <p className={styles.terminalText}>PINGING DATABASE // RETRIEVING LOGS...</p>
      </div>
    )
  }

  // --- STARK EMPTY STATE ---
  if (!orders || orders.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.systemEyebrow}>[!] NULL REFERENCE</span>
        <h2 className={styles.emptyTitle}>NO TRANSACTIONS LOGGED</h2>
        <p className={styles.emptySub}>The registry is empty. Establish a baseline order to populate this matrix.</p>
        <Link to="/products" className={styles.systemLink}>
          <button className={styles.actionBtn}>
            INITIALIZE COMMERCE MODULE
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        
        <div className={styles.topBar}>
          <div>
            <span className={styles.systemEyebrow}>SYSTEM LOG</span>
            <h1 className={styles.heading}>ORDER REGISTRY</h1>
          </div>
          <div className={styles.countBadge}>
            TOTAL RECORDS: {orders.length}
          </div>
        </div>

        <div className={styles.list}>
          {orders.map((order, i) => {
            const isExpanded = expandedId === order.orderId
            const orderStatus = order.status
            const paymentStatus = order.payment?.status || 'PENDING_PAYMENT'

            const isPaymentFailed = ['FAILED', 'CANCEL', 'TIMEOUT'].includes(paymentStatus)
            const isOrderFailed = ['PAYMENT_FAILED', 'PAYMENT_CANCELED', 'CANCELLED'].includes(orderStatus)
            
            const needsRetry = isPaymentFailed || isOrderFailed
            const needsInitialPay = paymentStatus === 'PENDING_PAYMENT' || orderStatus === 'PENDING_PAYMENT'
            const showPayButton = needsRetry || needsInitialPay

            return (
              <motion.div
                key={order.orderId}
                className={styles.monolithCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <div 
                  className={styles.orderHeader} 
                  onClick={() => toggleAccordion(order.orderId)}
                >
                  <div className={styles.headerPrimary}>
                    <div className={styles.idWrap}>
                      <span className={styles.cardKicker}>// ID:</span>
                      <p className={styles.orderId}>{order.orderId.slice(0, 8).toUpperCase()}</p>
                      <span className={`${styles.statusBadge} ${styles[orderStatusStyles[orderStatus] || 'pending']}`}>
                        {orderStatus?.replace('_', ' ') || 'PENDING'}
                      </span>
                    </div>
                    <p className={styles.orderDate}>
                      TS: {new Date(order.createdAt).toISOString().replace('T', ' // ').substring(0, 22)}
                    </p>
                  </div>

                  <div className={styles.headerSecondary}>
                    <span className={styles.orderTotal}>
                      ₱{parseFloat(order.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <div className={styles.toggleText}>
                      {isExpanded ? '[ - ] CLOSE' : '[ + ] VIEW'}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={styles.expandedContent}
                    >
                      <div className={styles.horizontalLaserBeam} />
                      
                      <div className={styles.orderItems}>
                        <div className={styles.expandedHeader}>
                          <h4 className={styles.sectionTitle}>// DATA PAYLOAD</h4>
                          <div className={styles.innerPaymentStatus}>
                            <span className={styles.paymentLabel}>GATEWAY STATUS:</span>
                            <span className={`${styles.statusBadge} ${styles[paymentStatusStyles[paymentStatus] || 'pending']}`}>
                              {paymentStatus}
                            </span>
                          </div>
                        </div>

                        {order.orderItems.map((item, idx) => {
                          // Directly resolving from the backend payload. Fallback added just in case of legacy null records.
                          const resolvedName = item.productName || `ITEM_HASH_${item.productId?.slice(0, 8).toUpperCase() || 'UNKNOWN'}`
                          return (
                            <div key={item.id || idx} className={styles.orderItem}>
                              <div className={styles.itemMain}>
                                <span className={styles.itemIndex}>0{idx + 1}</span>
                                <div className={styles.itemDetails}>
                                  <span className={styles.orderItemName}>{resolvedName}</span>
                                  <span className={styles.orderItemQty}>QUANTITY: {item.quantity}</span>
                                </div>
                              </div>
                              <span className={styles.orderItemPrice}>
                                ₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className={styles.orderActions}>
                        {showPayButton && (
                          <div className={styles.paymentActionBox}>
                            <div className={styles.actionTextWrap}>
                              <span className={styles.systemEyebrow}>ACTION REQUIRED</span>
                              <p className={styles.actionPrompt}>
                                {needsRetry 
                                  ? "[!] PREVIOUS HANDSHAKE FAILED. AWAITING RETRY COMMAND." 
                                  : "AWAITING GATEWAY INITIALIZATION TO PROCESS PAYLOAD."}
                              </p>
                            </div>
                            <button
                              className={`${styles.actionBtn} ${needsRetry ? styles.btnDanger : styles.btnPrimary}`}
                              disabled={payingOrder === order.orderId}
                              onClick={(e) => handlePay(e, order.orderId)}
                            >
                              {payingOrder === order.orderId 
                                ? 'EXECUTING...' 
                                : needsRetry ? 'EXECUTE OVERRIDE // RETRY' : 'INITIATE PAYPAL_GATEWAY'}
                            </button>
                          </div>
                        )}
                        
                        <div className={styles.secondaryActions}>
                          {(orderStatus !== 'DELIVERED' && paymentStatus !== 'PAID' && orderStatus !== 'CANCELLED') && (
                            <button
                              className={styles.ghostBtn}
                              onClick={(e) => handleDelete(e, order.orderId)}
                            >
                              [ TERMINATE RECORD ]
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.ghostBtn} 
              disabled={page === 0} 
              onClick={() => setPage((p) => p - 1)}
            >
              [ &lt; ] PREV
            </button>
            <span className={styles.pageInfo}>BLOCK {page + 1} OF {totalPages}</span>
            <button 
              className={styles.ghostBtn} 
              disabled={page + 1 >= totalPages} 
              onClick={() => setPage((p) => p + 1)}
            >
              NEXT [ &gt; ]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}