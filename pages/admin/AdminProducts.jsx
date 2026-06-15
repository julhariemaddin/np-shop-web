import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { productEndpoints, imageEndpoints } from '../../api/endpoints'
import Button from '../../components/common/Button'
import styles from './AdminProducts.module.css'

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleting, setDeleting] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await productEndpoints.getAll({ page, size: 15 })
      setProducts(data.content)
      setTotalPages(data.totalPages)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await productEndpoints.delete(id)
      toast.success('Product deleted')
      fetchProducts()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div>
            <Link to="/admin" className={styles.breadcrumb}>← Admin</Link>
            <h1 className={styles.heading}>Products</h1>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/admin/products/new')}>
            + New product
          </Button>
        </div>

        {loading ? (
          <div className={styles.loadWrap}><div className={styles.spinner} /></div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Product</span>
              <span>Price</span>
              <span>Stock</span>
              <span></span>
            </div>
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                className={styles.tableRow}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <div className={styles.productCell}>
                  {p.mainImage?.url && (
                    <img
                      src={imageEndpoints.getUrl(p.mainImage.url)}
                      alt={p.name}
                      className={styles.thumb}
                    />
                  )}
                  <span className={styles.productName}>{p.name}</span>
                </div>
                <span className={styles.priceCell}>
                  ₱{p.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
                <span className={`${styles.stockCell} ${p.stock === 0 ? styles.outOfStock : ''}`}>
                  {p.stock}
                </span>
                <div className={styles.actions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/products/${p.id}/images`)}
                  >
                    Images
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleting === p.id}
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

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
