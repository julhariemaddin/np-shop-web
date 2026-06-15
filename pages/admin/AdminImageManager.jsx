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
    const { data } = await productEndpoints.getById(id)
    setProduct(data)
  }

  useEffect(() => { fetchProduct() }, [id])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await imageEndpoints.upload(id, file)
      toast.success('Image uploaded')
      fetchProduct()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return
    setDeletingId(imageId)
    try {
      await imageEndpoints.delete(imageId)
      toast.success('Image deleted')
      fetchProduct()
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  if (!product) return (
    <div className={styles.loadWrap}><div className={styles.spinner} /></div>
  )

  const mainId = product.mainImage?.id
  const allImages = [product.mainImage, ...product.images.filter((i) => i.id !== mainId)].filter(Boolean)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div>
            <Link to="/admin/products" className={styles.breadcrumb}>← Products</Link>
            <h1 className={styles.heading}>Images — {product.name}</h1>
          </div>
          <label className={styles.uploadLabel}>
            {uploading ? (
              <span className={styles.uploadSpinner} />
            ) : (
              <>+ Add image</>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
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
                {img.id !== mainId && (
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ width: '100%' }}
                    loading={deletingId === img.id}
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    Delete
                  </Button>
                )}
                {img.id === mainId && (
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
