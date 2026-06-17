import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { productEndpoints, imageEndpoints } from '../../api/endpoints'
import Button from '../../components/common/Button'
import styles from './AdminImageManager.module.css'

export default function AdminImageManager() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchProduct = async () => {
    try {
      const { data } = await productEndpoints.getById(id)
      setProduct(data)
    } catch {
      toast.error('Failed to load product image references')
    }
  }

  useEffect(() => { 
    fetchProduct() 
  }, [id])

  if (!product) return (
    <div className={styles.loadWrap}><div className={styles.spinner} /></div>
  )

  const mainId = product.mainImage?.id
  const safeImagesArray = product.images || []
  const allImages = [product.mainImage, ...safeImagesArray.filter((i) => i.id !== mainId)].filter(Boolean)
  
  // Strict maximum image count limit evaluation boundary
  const isMaxLimitReached = allImages.length >= 5

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Explicit functional double-check safeguard logic
    if (isMaxLimitReached) {
      toast.error('Maximum limit reached. You can only attach up to 5 images per product.')
      return
    }

    setUploading(true)
    try {
      await imageEndpoints.upload(id, file)
      toast.success('Image uploaded successfully')
      fetchProduct()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to permanently delete this image?')) return
    setDeletingId(imageId)
    try {
      await imageEndpoints.delete(imageId)
      toast.success('Image removed successfully')
      fetchProduct()
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div className={styles.headerInfoWrapper}>
            <Link to="/admin/products" className={styles.backButton}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Products List</span>
            </Link>
            <h1 className={styles.heading}>Images — {product.name}</h1>
            <p className={`${styles.counterText} ${isMaxLimitReached ? styles.counterMaxed : ''}`}>
              {allImages.length} / 5 Images {isMaxLimitReached && '(Max Limit Reached)'}
            </p>
          </div>
          
          <label className={`${styles.uploadLabel} ${isMaxLimitReached ? styles.uploadDisabled : ''}`}>
            {uploading ? (
              <span className={styles.uploadSpinner} />
            ) : isMaxLimitReached ? (
              <>Limit Reached</>
            ) : (
              <>+ Add image</>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading || isMaxLimitReached}
              className={styles.uploadInput}
            />
          </label>
        </div>

        <div className={styles.grid}>
          <AnimatePresence>
            {allImages.map((img) => (
              <motion.div
                key={img.id}
                className={styles.imgCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.imgWrap}>
                  <img
                    src={imageEndpoints.getUrl(img.url)}
                    alt=""
                    className={styles.img}
                  />
                  {img.id === mainId && (
                    <span className={styles.mainBadge}>Main</span>
                  )}
                </div>
                {img.id !== mainId ? (
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ width: '100%' }}
                    loading={deletingId === img.id}
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    Delete
                  </Button>
                ) : (
                  <p className={styles.mainNote}>Cannot delete main image</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}