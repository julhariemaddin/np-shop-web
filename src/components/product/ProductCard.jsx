import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { imageEndpoints } from '../../api/endpoints'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { id, name, price, mainImage, stock } = product
  const imgUrl = mainImage?.url
    ? imageEndpoints.getUrl(mainImage.url)
    : null

  return (
    <motion.article
      className={`${styles.card} card h-100 overflow-hidden rounded-4 shadow-sm`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/products/${id}`} className={styles.link}>
        <div className={`${styles.imageWrap} position-relative`}>
          {imgUrl ? (
            <img src={imgUrl} alt={name} className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.placeholder}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
          {stock === 0 && <span className={`${styles.outOfStock} badge rounded-pill`}>Out of stock</span>}
        </div>

        <div className={`${styles.info} d-flex align-items-start justify-content-between gap-3 p-4`}>
          <h3 className={styles.name}>{name}</h3>
          <span className={styles.price}>
            <span className={styles.currency}>₱</span>
            {price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
