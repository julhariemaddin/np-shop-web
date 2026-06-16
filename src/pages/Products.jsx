import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { productEndpoints, categoryEndpoints } from '../api/endpoints'
import styles from './Products.module.css'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
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

  // Safely strips regex characters of their execution value
  const highlightText = (text, searchWord) => {
    if (!searchWord || !searchWord.trim() || !text) return text
    const cleanSearch = searchWord.trim()
    
    // Escape standard regular expression token bounds safely
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

  return (
    <div className={styles.page}>
      {/* Header Strip */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          <div className={styles.stripLeft}>
            <span className={styles.eyebrow}>Curated Collection</span>
            <h1 className={styles.heroTitle}>Discover</h1>
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
              placeholder="Search products..."
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
          <ul className={styles.categoryList}>
            <li>
              <button
                className={`${styles.catItem} ${!selectedCategory || isSearching ? styles.catActive : ''}`}
                onClick={() => setSelectedCategory(null)}
                disabled={isSearching}
              >
                All Masterpieces
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
        </aside>

        <section className={styles.main}>
          <div className={styles.topBar}>
            <p className={styles.resultLabel}>
              {isSearching
                ? `Results for "${debouncedQuery}"`
                : selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.categoryName
                  : 'All Products'}
            </p>
            {!loading && (
              <span className={styles.countBadge}>{filteredProducts.length} Items</span>
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
              <p className={styles.emptyTitle}>No items matched</p>
              <p className={styles.emptyHint}>Try refining your current search keywords.</p>
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
                  const displayTitle = product.name || product.productName || 'Untitled Product'
                  const targetImage = getProductMainImage(product)

                  return (
                    <div 
                      className={styles.productCard} 
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <div className={styles.productImgWrap}>
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL}/image/${targetImage}`} 
                          alt={displayTitle} 
                          className={styles.productImg}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=No+Image+Found'
                          }}
                        />
                      </div>
                      <div className={styles.productBody}>
                        <h3 className={styles.productTitle}>
                          {highlightText(displayTitle, debouncedQuery)}
                        </h3>
                        <p className={styles.productDescription}>
                          {highlightText(product.description || 'No description available for this item.', debouncedQuery)}
                        </p>
                        <div className={styles.productFooter}>
                          <span className={styles.productPrice}>
                            Public Price: ₱{Number(product.price || 0).toFixed(2)}
                          </span>
                          <button 
                            className={styles.exploreBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/products/${product.id}`)
                            }}
                          >
                            Explore
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
                ← Prev
              </button>
              <span className={styles.pageInfo}>{page + 1} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}