import { useState, useEffect, useRef, useCallback } from 'react'
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
      setProducts(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { 
    fetchProducts() 
  }, [fetchProducts])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to permanently delete this product?')) return
    setDeleting(id)
    try {
      await productEndpoints.delete(id)
      toast.success('Product deleted successfully')
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
            <Link to="/admin" className={styles.backButton}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Admin Dashboard</span>
            </Link>
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
              <span className={styles.actionsHeadLabel}>Actions</span>
            </div>
            
            {products.length > 0 ? (
              products.map((p, i) => (
                <motion.div
                  key={p.id}
                  className={styles.tableRow}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                >
                  <div className={styles.productCell}>
                    {p.mainImage?.url ? (
                      <img
                        src={imageEndpoints.getUrl(p.mainImage.url)}
                        alt={p.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbFallback}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                    <span className={styles.productName}>{p.name}</span>
                  </div>
                  
                  <span className={styles.priceCell}>
                    ₱{p.price?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  
                  <span className={`${styles.stockCell} ${p.stock === 0 ? styles.outOfStock : ''}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                  </span>
                  
                  <div className={styles.actions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/products/${p.id}/edit`);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/products/${p.id}/images`);
                      }}
                    >
                      Images
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting === p.id}
                      onClick={(e) => handleDelete(e, p.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className={styles.emptyStateContainer}>
                <p>No products available. Click "+ New product" to get started.</p>
              </div>
            )}
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
