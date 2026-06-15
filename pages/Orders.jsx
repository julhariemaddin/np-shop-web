import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { orderEndpoints, paypalEndpoints } from '../api/endpoints'
import Button from '../components/common/Button'
import styles from './Orders.module.css'

const statusColor = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  APPROVED: 'completed',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [payingOrder, setPayingOrder] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await orderEndpoints.getAll({ page, size: 5 })
      setOrders(data.content)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handlePay = async (orderId) => {
    setPayingOrder(orderId)
    try {
      const { data } = await paypalEndpoints.createPayment(orderId)
      window.location.href = data.approvalUrl
    } catch {
      toast.error('Failed to initiate payment')
    } finally {
      setPayingOrder(null)
    }
  }

  const handleDelete = async (orderId) => {
    try {
      await orderEndpoints.delete(orderId)
      toast.success('Order deleted')
      fetchOrders()
    } catch {
      toast.error('Failed to delete order')
    }
  }

  if (loading) return (
    <div className={styles.loadWrap}>
      <div className={styles.spinner} />
    </div>
  )

  if (!orders.length) return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No orders yet</p>
      <Link to="/products">
        <Button variant="primary" size="md" style={{ marginTop: '16px' }}>Browse products</Button>
      </Link>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <h1 className={styles.heading}>Orders</h1>
          <span className={styles.count}>{orders.length} orders</span>
        </div>

        <div className={styles.list}>
          {orders.map((order, i) => (
            <motion.div
              key={order.orderId}
              className={styles.order}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <div className={styles.orderHeader}>
                <div>
                  <p className={styles.orderId}>#{order.orderId.slice(0, 8).toUpperCase()}</p>
                  <p className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className={styles.orderMeta}>
                  <span className={`${styles.status} ${styles[statusColor[order.payment?.status] ?? 'pending']}`}>
                    {order.payment?.status ?? 'PENDING'}
                  </span>
                  <span className={styles.orderTotal}>
                    ₱{order.totalPrice?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.orderItems.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <span className={styles.orderItemName}>
                      {item.productId.slice(0, 8)}
                    </span>
                    <span className={styles.orderItemQty}>× {item.quantity}</span>
                    <span className={styles.orderItemPrice}>
                      ₱{item.getTotalPrice ? item.getTotalPrice().toLocaleString() : (item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.orderActions}>
                {(!order.payment?.status || order.payment?.status === 'PENDING') && (
                  <Button
                    variant="accent"
                    size="sm"
                    loading={payingOrder === order.orderId}
                    onClick={() => handlePay(order.orderId)}
                  >
                    Pay with PayPal
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(order.orderId)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </Button>
            <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
