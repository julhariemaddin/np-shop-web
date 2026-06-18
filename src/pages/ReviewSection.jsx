import { useState, useEffect, useCallback, useMemo } from 'react'
import { reviewEndpoints } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './ReviewSection.module.css'

export default function ReviewSection({ productId }) {
  const { isAuthenticated, isAdmin } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Persist sort preference for when the user returns to the page
  const [sort, setSort] = useState(() => {
    return localStorage.getItem('reviewSortPreference') || 'createdAt,DESC'
  })
  
  // Form State
  const [newReview, setNewReview] = useState({ rating: 5, description: '' })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      // THE FIX: We pass the raw sort string directly so Spring Boot understands it!
      const res = await reviewEndpoints.getReviews(productId, { 
        page: 0, 
        size: 20, 
        sort: sort 
      })
      setReviews(res.data.content)
    } catch (err) {
      console.error("Error loading reviews", err)
    } finally {
      setLoading(false)
    }
  }, [productId, sort])

  // Fetch and save sort preference whenever sort/modal changes
  useEffect(() => {
    localStorage.setItem('reviewSortPreference', sort)
    if (isModalOpen) {
      fetchReviews()
    }
  }, [sort, fetchReviews, isModalOpen])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isModalOpen])

  const handlePostReview = async (e) => {
    e.preventDefault()
    if (!newReview.description.trim()) return toast.error("Please enter a review")
    
    setIsSubmitting(true)
    try {
      await reviewEndpoints.post({ 
        productId, 
        ...newReview 
      })
      toast.success("Review posted successfully")
      setNewReview({ rating: 5, description: '' })
      fetchReviews() 
    } catch (err) {
      toast.error("Failed to post review")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Client-Side fallback sort to keep the UI snappy
  const sortedReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return []
    
    const [property, direction] = sort.split(',')
    
    return [...reviews].sort((a, b) => {
      if (property === 'rating') {
        return direction === 'DESC' ? b.rating - a.rating : a.rating - b.rating
      } 
      
      if (property === 'createdAt') {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return direction === 'DESC' ? dateB - dateA : dateA - dateB
      }
      
      return 0
    })
  }, [reviews, sort])

  // Helper to render static stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    ))
  }

  return (
    <>
      {/* Trigger Button on the main page */}
      <button onClick={() => setIsModalOpen(true)} className={styles.openModalBtn}>
        View Customer Reviews
      </button>

      {/* Floating Modal Overlay */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Customer Reviews</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              {/* Form Section */}
              {isAuthenticated && !isAdmin ? (
                <form onSubmit={handlePostReview} className={styles.reviewForm}>
                  <span className={styles.formEyebrow}>Write a Review</span>
                  
                  {/* Interactive Star Rating */}
                  <div className={styles.interactiveStars} onMouseLeave={() => setHoveredStar(0)}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <span 
                        key={num}
                        className={num <= (hoveredStar || newReview.rating) ? styles.starFilled : styles.starEmpty}
                        onMouseEnter={() => setHoveredStar(num)}
                        onClick={() => setNewReview({ ...newReview, rating: num })}
                      >
                        ★
                      </span>
                    ))}
                    <span className={styles.ratingText}>{newReview.rating} out of 5</span>
                  </div>

                  <textarea 
                    className={styles.reviewTextarea}
                    placeholder="Share your detailed feedback about this product..."
                    value={newReview.description}
                    onChange={(e) => setNewReview({...newReview, description: e.target.value})}
                  />
                  <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                    {isSubmitting ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              ) : isAuthenticated && isAdmin ? (
                <div className={styles.adminNotice}>
                  <p>* Administrators cannot post reviews.</p>
                </div>
              ) : null}

              {/* Controls & List Header */}
              <div className={styles.listControls}>
                <span className={styles.resultCount}>Recent Feedback</span>
                <select 
                  className={styles.sortSelect} 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="createdAt,DESC">Newest First</option>
                  <option value="createdAt,ASC">Oldest First</option>
                  <option value="rating,DESC">Highest Rated</option>
                  <option value="rating,ASC">Lowest Rated</option>
                </select>
              </div>

              {/* Review List */}
              <div className={styles.reviewList}>
                {loading ? (
                  <div className={styles.loadingState}>Loading reviews...</div>
                ) : sortedReviews.length === 0 ? (
                  <div className={styles.emptyState}>No reviews yet. Be the first to review!</div>
                ) : (
                  sortedReviews.map(r => (
                    <div key={r.id} className={styles.reviewCard}>
                      <div className={styles.reviewCardHeader}>
                        <div className={styles.reviewerInfo}>
                          <div className={styles.avatar}>{r.accountUsername.charAt(0).toUpperCase()}</div>
                          <span className={styles.reviewerName}>{r.accountUsername}</span>
                        </div>
                        <div className={styles.starDisplay}>
                          {renderStars(r.rating)}
                        </div>
                      </div>
                      <p className={styles.reviewDescription}>{r.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}