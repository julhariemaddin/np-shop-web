import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { productEndpoints, imageEndpoints } from '../../api/endpoints'
import Button from '../../components/common/Button'
import styles from './AdminImageManager.module.css'

export default function AdminImageManager() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // 1. Prevent routing errors: You cannot manage images for a product that hasn't been created yet
  useEffect(() => {
    if (id === 'new') {
      toast.error('Please save the product first before managing images.')
      navigate('/admin/products')
    }
  }, [id, navigate])

  const fetchProduct = useCallback(async () => {
    if (id === 'new') return

    setIsLoading(true)
    try {
      const { data } = await productEndpoints.getById(id)
      setProduct(data)
    } catch (error) {
      toast.error('Failed to load product image references')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { 
    fetchProduct() 
  }, [fetchProduct])

  // Proper loading state evaluation to prevent infinite spinners on failed network requests
  if (isLoading) {
    return (
      <div className={styles.loadWrap}>
        <div className={styles.spinner} />
      </div>
    )
  }

  // Fallback UI if the product failed to load completely
  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.inner} style={{ textAlign: 'center', paddingTop: '40px' }}>
          <h2 className={styles.heading} style={{ marginBottom: '16px' }}>Product not found</h2>
          <Button onClick={() => navigate('/admin/products')} variant="primary">
            Back to Products List
          </Button>
        </div>
      </div>
    )
  }

  const mainId = product.mainImage?.id
  
  // 2. The Fix: Safely extract the array whether the backend returns a raw array or a paginated object (.content)
  const rawImages = product.images || []
  const safeImagesArray = Array.isArray(rawImages) ? rawImages : rawImages.content || []
  
  // Filter out the main image from the safe array so it doesn't duplicate, then filter out nulls
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
      await fetchProduct()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to permanently delete this image?')) return
    
    setDeletingId(imageId)
    try {
      await imageEndpoints.delete(imageId)
      toast.success('Image removed successfully')
      await fetchProduct()
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