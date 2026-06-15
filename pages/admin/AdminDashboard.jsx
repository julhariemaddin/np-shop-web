import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './AdminDashboard.module.css'

const sections = [
  {
    to: '/admin/products',
    label: 'Products',
    description: 'Create, edit, and manage products and their images',
    icon: '📦',
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    description: 'Manage product categories and taxonomy',
    icon: '🗂',
  },
]

export default function AdminDashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <h1 className={styles.heading}>Admin</h1>
          <span className={styles.sub}>Store management</span>
        </div>

        <div className={styles.grid}>
          {sections.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <Link to={s.to} className={styles.card}>
                <span className={styles.cardIcon}>{s.icon}</span>
                <h2 className={styles.cardLabel}>{s.label}</h2>
                <p className={styles.cardDesc}>{s.description}</p>
                <span className={styles.arrow}>→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
