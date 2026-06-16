import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className={styles.link}>Return home →</Link>
      </motion.div>
    </div>
  )
}
