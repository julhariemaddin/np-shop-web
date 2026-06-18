import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { productEndpoints, categoryEndpoints, imageEndpoints } from '../api/endpoints'
import styles from './Products.module.css'

// Global client-side Cache Engine ensuring a strict maximum allocation of 50 assets
const BLOB_IMAGE_CACHE = {
  maxSize: 50,
  // Using a Map layout because it naturally preserves original insertion order for key tracking
  store: new Map(),

  get(key) {
    if (!this.store.has(key)) return null;
    
    // Refresh the usage priority state by moving it to the end of the Map
    const value = this.store.get(key);
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  },

  set(key, value) {
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      // Evict and clear memory footprint for the oldest inserted cache asset
      const oldestKey = this.store.keys().next().value;
      const oldestValue = this.store.get(oldestKey);
      
      if (oldestValue && oldestValue.startsWith('blob:')) {
        URL.revokeObjectURL(oldestValue);
      }
      this.store.delete(oldestKey);
    }
    this.store.set(key, value);
  }
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Internal individual component to safely process, manage, and animate Blob loading states
function ProductImage({ product, targetImage, displayTitle }) {
  const [imgSrc, setImgSrc] = useState('')
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    let isCurrentRequest = true;
    setImageLoading(true)

    if (targetImage && targetImage !== 'placeholder.jpg') {
      // Check memory cache registers before issuing an external asynchronous request
      const cachedUrl = BLOB_IMAGE_CACHE.get(targetImage);

      if (cachedUrl) {
        setImgSrc(cachedUrl);
        setImageLoading(false);
      } else {
        imageEndpoints.fetchBlobUrl(targetImage)
          .then((resolvedUrl) => {
            if (!isCurrentRequest) {
              // If component changed goals mid-request, wipe the unneeded blob assignment
              if (resolvedUrl && resolvedUrl.startsWith('blob:')) {
                URL.revokeObjectURL(resolvedUrl);
              }
              return;
            }
            
            BLOB_IMAGE_CACHE.set(targetImage, resolvedUrl);
            setImgSrc(resolvedUrl);
            setImageLoading(false);
          })
          .catch(() => {
            if (isCurrentRequest) {
              setImgSrc('https://placehold.co/300?text=No+Image+Found');
              setImageLoading(false);
            }
          });
      }
    } else {
      setImgSrc('https://placehold.co/300?text=No+Image+Found')
      setImageLoading(false)
    }

    return () => {
      isCurrentRequest = false;
    };
  }, [targetImage])

  return (
    <div className={styles.imageInnerContainer}>
      {imageLoading && (
        <div className={styles.imageLoaderPlaceholder}>
          <div className={styles.shimmerWave} />
        </div>
      )}
      <img 
        src={imgSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
        alt={displayTitle} 
        className={`${styles.productImg} ${imageLoading ? styles.imgHidden : styles.imgVisible}`}
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://placehold.co/300?text=No+Image+Found'
        }}
      />
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [query, setQuery] = useState('')
  
  const debouncedQuery = useDebounce(query, 420)
  const isSearching = debouncedQuery.trim().length > 0
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryEndpoints.getAll()
      setCategories(data)
    } catch (err) {
      console.error("Failed to load categories", err)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let data
      const cleanQuery = debouncedQuery.trim()
      
      if (cleanQuery) {
        const res = await productEndpoints.search(cleanQuery, { page, size: 15 })
        data = res.data
      } else {
        const res = await productEndpoints.getAll({ page, size: 15 })
        data = res.data
      }
      
      setProducts(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      console.error("Failed to fetch products", err)
      setProducts([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQuery])

  useEffect(() => { fetchCategories() }, [fetchCategories])
  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(0) }, [debouncedQuery])

  const filteredProducts = selectedCategory && !isSearching
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
    if (e.target.value.trim().length > 0) {
      setSelectedCategory(null)
    }
  }

  const clearSearch = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const highlightText = (text, searchWord) => {
    if (!searchWord || !searchWord.trim() || !text) return text
    const cleanSearch = searchWord.trim()
    
    const escapedSearch = cleanSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedSearch})`, 'gi'))
    
    return parts.map((part, i) => 
      part.toLowerCase() === cleanSearch.toLowerCase() ? (
        <mark key={i} className={styles.highlight}>{part}</mark>
      ) : (
        part
      )
    )
  }

  const getProductMainImage = (product) => {
    if (product.mainImage?.url || product.mainImage?.imageUrl) {
      return product.mainImage.url || product.mainImage.imageUrl
    }
    
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isMain === true || img.primary === true)
      if (primaryImage) return primaryImage.url || primaryImage.imageUrl
      
      return product.images[0].url || product.images[0].imageUrl
    }
    
    if (product.imageUrl) return product.imageUrl
    return 'placeholder.jpg'
  }

  const formatProductPrice = (priceValue) => {
    const numericPrice = Number(priceValue || 0);
    if (numericPrice % 1 === 0) {
      return numericPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className={styles.page}>
      {/* Header Strip */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          <div className={styles.stripLeft}>
            <span className={styles.eyebrow}>[ verified finds ]</span>
            <h1 className={styles.heroTitle}>The Drop</h1>
          </div>
          
          <div className={styles.searchWrap}>
            <div className={styles.searchIconField}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={handleQueryChange}
              autoComplete="off"
            />
            {query && (
              <button className={styles.clearBtn} onClick={clearSearch} aria-label="Clear search">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body Layout */}
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Categories</p>
          <div className={styles.categoryScrollContainer}>
            <ul className={styles.categoryList}>
              <li>
                <button
                  className={`${styles.catItem} ${!selectedCategory || isSearching ? styles.catActive : ''}`}
                  onClick={() => setSelectedCategory(null)}
                  disabled={isSearching}
                >
                  Everything
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={`${styles.catItem} ${selectedCategory === cat.id && !isSearching ? styles.catActive : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    disabled={isSearching}
                  >
                    {cat.categoryName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className={styles.main}>
          <div className={styles.topBar}>
            <p className={styles.resultLabel}>
              {isSearching
                ? `Results for "${debouncedQuery}"`
                : selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.categoryName
                  : 'All Items'}
            </p>
            {!loading && (
              <span className={styles.countBadge}>{filteredProducts.length} Results</span>
            )}
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div className={styles.skeletonCard} key={i}>
                  <div className={styles.skeletonImg}>
                    <div className={styles.shimmerWave} />
                  </div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '80%', height: '16px' }} />
                    <div className={styles.skeletonLine} style={{ width: '95%', height: '12px' }} />
                    <div className={styles.skeletonLine} style={{ width: '60%', height: '12px' }} />
                    <div className={styles.skeletonRow}>
                      <div className={styles.skeletonLine} style={{ width: '30%', height: '16px' }} />
                      <div className={styles.skeletonLine} style={{ width: '45%', height: '28px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Nothing found</p>
              <p className={styles.emptyHint}>Try a different term.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={debouncedQuery + selectedCategory + page}
                className={styles.grid}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {filteredProducts.map((product) => {
                  const displayTitle = product.name || product.productName || 'Untitled'
                  const targetImage = getProductMainImage(product)

                  return (
                    <div 
                      className={styles.productCard} 
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <div className={styles.productImgWrap}>
                        <ProductImage 
                          product={product} 
                          targetImage={targetImage} 
                          displayTitle={displayTitle} 
                        />
                      </div>
                      <div className={styles.productBody}>
                        <h3 className={styles.productTitle}>
                          {highlightText(displayTitle, debouncedQuery)}
                        </h3>
                        <p className={styles.productDescription}>
                          {highlightText(product.description || 'No info provided.', debouncedQuery)}
                        </p>
                        <div className={styles.productFooter}>
                          <span className={styles.productPrice}>
                            ₱{formatProductPrice(product.price)}
                          </span>
                          <button 
                            className={styles.exploreBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/products/${product.id}`)
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                &lt; Prev
              </button>
              <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next &gt;
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}