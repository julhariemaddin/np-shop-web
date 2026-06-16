import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { productEndpoints, imageEndpoints } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import useCartStore from '../hooks/useCart'
import Button from '../components/common/Button'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin } = useAuth()
  const addItem = useCartStore((s) => s.addItem)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState([]) 
  const [activeIndex, setActiveIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const [direction, setDirection] = useState(1)
  const timerRef = useRef(null)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data } = await productEndpoints.getById(id)
        setProduct(data)
        
        let compiledImages = []
        let mainImgObj = null

        if (data.mainImage) {
          mainImgObj = { ...data.mainImage, isMain: true }
        } else if (data.imageUrl) {
          mainImgObj = { url: data.imageUrl, id: 'backend-main-url', isMain: true }
        }

        if (mainImgObj) {
          compiledImages.push(mainImgObj)
        }

        if (data.images && data.images.length > 0) {
          const secondaryImages = data.images.filter(
            (img) => img.id !== mainImgObj?.id && img.url !== mainImgObj?.url
          )
          compiledImages = [...compiledImages, ...secondaryImages]
        }

        if (compiledImages.length === 0) {
          compiledImages.push({ url: 'placeholder.jpg', id: 'empty', isMain: true })
        }

        setImages(compiledImages)
        setActiveIndex(0)
      } catch (err) {
        console.error("Error loading product details", err)
        toast.error("Could not load product details")
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProductData()
  }, [id, navigate])

  const handleNext = useCallback(() => {
    if (images.length <= 1) return
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const executeVariableTimer = () => {
      const randomInterval = Math.floor(Math.random() * (5000 - 4000 + 1)) + 4000
      
      timerRef.current = setTimeout(() => {
        handleNext()
        executeVariableTimer()
      }, randomInterval)
    }

    executeVariableTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [images.length, handleNext, isHovered])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Sign in to add items to cart')
      navigate('/login')
      return
    }
    setAddingToCart(true)
    try {
      await addItem(product.id, qty)
      toast.success(`${product.name || product.productName} added to cart`)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return (
    <div className={styles.loadWrap}>
      <div className={styles.loadSpinner} />
    </div>
  )

  if (!product) return null

  const productName = product.name || product.productName || 'Untitled Masterpiece'
  const currentImage = images[activeIndex]

  const sliderVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.02
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        x: { type: 'spring', stiffness: 45, damping: 15 },
        opacity: { duration: 0.45, ease: 'linear' },
        scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
      transition: { 
        x: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.35 }
      }
    })
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span className={styles.crumbDivider}>/</span>
        <Link to="/products">Products</Link>
        <span className={styles.crumbDivider}>/</span>
        <span className={styles.currentCrumb}>{productName}</span>
      </nav>

      <div className={styles.inner}>
        
        <div 
          className={styles.gallery}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.mainImageWrap}>
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={currentImage?.id || activeIndex}
                custom={direction}
                variants={sliderVariants}
                initial="enter"
                animate="center"
                exit="exit"
                src={currentImage?.url ? imageEndpoints.getUrl(currentImage.url) : 'https://via.placeholder.com/600?text=No+Image'}
                alt={productName}
                className={styles.mainImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600?text=No+Image'
                }}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button 
                  className={`${styles.navArrow} ${styles.arrowLeft}`} 
                  onClick={handlePrev}
                  aria-label="Previous image"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <button 
                  className={`${styles.navArrow} ${styles.arrowRight}`} 
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className={styles.playbackIndicator}>
                {isHovered ? 'PAUSED' : 'AUTO-ROTATION'}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.dotTracker}>
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.trackerDot} ${idx === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => {
                    setDirection(idx > activeIndex ? 1 : -1)
                    setActiveIndex(idx)
                  }}
                />
              ))}
            </div>
          )}

          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, idx) => {
                const isActive = idx === activeIndex
                return (
                  <button
                    key={img.id || idx}
                    className={`${styles.thumb} ${isActive ? styles.thumbActive : ''}`}
                    onClick={() => {
                      setDirection(idx > activeIndex ? 1 : -1)
                      setActiveIndex(idx)
                    }}
                  >
                    <img
                      src={imageEndpoints.getUrl(img.url)}
                      alt=""
                      className={styles.thumbImg}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Error'
                      }}
                    />
                    {img.isMain && (
                      <span className={styles.mainBadge}>Cover</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.infoTop}>
            <span className={styles.eyebrowCategory}>Product Identity</span>
            <h1 className={styles.name}>{productName}</h1>
            <div className={styles.priceRow}>
              <span className={styles.currency}>₱</span>
              <span className={styles.price}>
                {Number(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          <p className={styles.description}>
            {product.description || 'No descriptive information provided for this specific item.'}
          </p>

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span className={styles.metaKey}>Availability Matrix</span>
              <span className={`${styles.metaVal} ${product.stock === 0 ? styles.outOfStock : ''}`}>
                {product.stock === 0 ? 'Exhausted Stock' : `${product.stock} Units Available`}
              </span>
            </div>
          </div>

          {(product.stock > 0 && !isAdmin) && (
            <div className={styles.actions}>
              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span className={styles.qtyVal}>{qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                loading={addingToCart}
                className={styles.premiumCartBtn}
                style={{ flex: 1 }}
              >
                Procure Item
              </Button>
            </div>
          )}

          {isAdmin && (
            <div className={styles.adminSection}>
              <div className={styles.divider} />
              <p className={styles.adminLabel}>Administrative Clearance</p>
              <div className={styles.adminActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/products/${id}/edit`)}
                >
                  Edit Specifications
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/products/${id}/images`)}
                >
                  Asset Operations
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}