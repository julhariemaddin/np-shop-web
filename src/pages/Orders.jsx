import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { orderEndpoints, paypalEndpoints, productEndpoints } from '../api/endpoints'
import Button from '../components/common/Button'
import styles from './Orders.module.css'

// 1. Explicitly Map Your Backend Order Statuses
const orderStatusStyles = {
  PENDING_PAYMENT: 'pending',
  CONFIRMED: 'processing',
  DELIVERED: 'completed',
  PAYMENT_FAILED: 'cancelled',
  PAYMENT_PROCESSING: 'processing',
  PAYMENT_CANCELED: 'cancelled',
  CANCELLED: 'cancelled',
}

// 2. Explicitly Map Your Backend Payment Statuses
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
  const [productNames, setProductNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [payingOrder, setPayingOrder] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // Handle PayPal return URLs
  useEffect(() => {
    const success = searchParams.get('success')
    const cancelled = searchParams.get('cancelled')

    if (success === 'true') {
      toast.success('Payment approved! Your order is now processing.')
      searchParams.delete('success')
      setSearchParams(searchParams)
    } else if (cancelled === 'true') {
      toast.error('Payment was cancelled. You can retry from your orders list.')
      searchParams.delete('cancelled')
      setSearchParams(searchParams)
    }
  }, [searchParams, setSearchParams])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderEndpoints.getAll({ page, size: 10 }),
        productEndpoints.getAll()
      ])

      const nameMap = {}
      if (productsRes.data && productsRes.data.content) {
        productsRes.data.content.forEach((product) => {
          nameMap[product.id] = product.name
        })
      }

      setProductNames(nameMap)
      setOrders(ordersRes.data.content || [])
      setTotalPages(ordersRes.data.totalPages || 0)
    } catch (err) {
      toast.error('Failed to load order data')
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
      toast.loading('Initiating secure payment...', { id: 'payment-toast' })
      const { data } = await paypalEndpoints.createPayment(orderId)
      toast.success('Redirecting to PayPal...', { id: 'payment-toast' })
      window.location.href = data.approvalUrl
    } catch (err) {
      toast.error('Failed to initiate payment', { id: 'payment-toast' })
    } finally {
      setPayingOrder(null)
    }
  }

  const handleDelete = async (e, orderId) => {
    e.stopPropagation()
    try {
      await orderEndpoints.delete(orderId)
      toast.success('Order deleted successfully')
      fetchData() 
    } catch {
      toast.error('Failed to delete order')
    }
  }

  const toggleAccordion = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id))
  }

  if (loading) {
    return (
      <div className={styles.loadWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Fetching your orders...</p>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No orders yet</p>
        <p className={styles.emptySub}>Looks like you haven't made any purchases.</p>
        <Link to="/products">
          <Button variant="primary" size="md" style={{ marginTop: '16px' }}>
            Browse products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <h1 className={styles.heading}>Order History</h1>
          <span className={styles.count}>{orders.length} total orders</span>
        </div>

        <div className={styles.list}>
          {orders.map((order, i) => {
            const isExpanded = expandedId === order.orderId
            
            // 3. Extract exact statuses safely
            const orderStatus = order.status || 'PENDING_PAYMENT'
            const paymentStatus = order.payment?.status || 'PENDING_PAYMENT'

            // 4. Strict Logic for Payment Buttons based on your arrays
            const isPaymentFailed = ['FAILED', 'CANCEL', 'TIMEOUT'].includes(paymentStatus)
            const isOrderFailed = ['PAYMENT_FAILED', 'PAYMENT_CANCELED'].includes(orderStatus)
            
            const needsRetry = isPaymentFailed || isOrderFailed
            const needsInitialPay = paymentStatus === 'PENDING_PAYMENT' || orderStatus === 'PENDING_PAYMENT'
            const showPayButton = needsRetry || needsInitialPay

            return (
              <motion.div
                key={order.orderId}
                className={styles.orderCard}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {/* Outer Card: ORDER STATUS */}
                <div 
                  className={styles.orderHeader} 
                  onClick={() => toggleAccordion(order.orderId)}
                >
                  <div className={styles.headerPrimary}>
                    <div className={styles.idWrap}>
                      <p className={styles.orderId}>#{order.orderId.slice(0, 8).toUpperCase()}</p>
                      <span className={`${styles.status} ${styles[orderStatusStyles[orderStatus] || 'pending']}`}>
                        {orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-PH', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className={styles.headerSecondary}>
                    <span className={styles.orderTotal}>
                      ₱{parseFloat(order.totalPrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={styles.chevron}
                    >
                      ▼
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Details: PAYMENT STATUS & ITEMS */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.expandedContent}
                    >
                      <div className={styles.detailsDivider} />
                      
                      <div className={styles.orderItems}>
                        <div className={styles.expandedHeader}>
                          <h4 className={styles.sectionTitle}>Order Items</h4>
                          
                          {/* Inner Card: PAYMENT STATUS */}
                          <div className={styles.innerPaymentStatus}>
                            <span className={styles.paymentLabel}>Payment Status:</span>
                            <span className={`${styles.status} ${styles[paymentStatusStyles[paymentStatus] || 'pending']}`}>
                              {paymentStatus}
                            </span>
                          </div>
                        </div>

                        {order.orderItems.map((item) => {
                          const resolvedName = productNames[item.productId] || `Product ID: ${item.productId.slice(0, 8)}`

                          return (
                            <div key={item.id} className={styles.orderItem}>
                              <div className={styles.itemMain}>
                                <span className={styles.orderItemName}>{resolvedName}</span>
                                <span className={styles.orderItemQty}>Qty: {item.quantity}</span>
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
                            <p className={styles.actionPrompt}>
                              {needsRetry 
                                ? "Your previous payment attempt failed or timed out. Please try again." 
                                : "Awaiting payment to process your order."}
                            </p>
                            <Button
                              variant={needsRetry ? "danger" : "accent"}
                              size="md"
                              loading={payingOrder === order.orderId}
                              onClick={(e) => handlePay(e, order.orderId)}
                            >
                              {needsRetry ? 'Retry Payment' : 'Pay with PayPal'}
                            </Button>
                          </div>
                        )}
                        
                        <div className={styles.secondaryActions}>
                          {/* Only allow deleting if not already completed/delivered */}
                          {(orderStatus !== 'DELIVERED' && paymentStatus !== 'PAID') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(e, order.orderId)}
                            >
                              Cancel & Delete Order
                            </Button>
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
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </Button>
            <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}