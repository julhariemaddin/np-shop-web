import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './AdminDashboard.module.css'

const BoxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const CategoryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const sections = [
  { 
    to: '/admin/products', 
    label: 'Products', 
    description: 'Inventory management and asset control',
    icon: <BoxIcon />
  },
  { 
    to: '/admin/categories', 
    label: 'Categories', 
    description: 'Taxonomy and product organization',
    icon: <CategoryIcon />
  },
]

export default function AdminDashboard() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.subtitle}>Store management and operational controls</p>
      </header>

      <nav className={styles.navGrid}>
        {sections.map((s, i) => (
          <motion.div
            key={s.to}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Link to={s.to} className={styles.navCard}>
              <div className={styles.iconContainer}>{s.icon}</div>
              <div className={styles.textWrap}>
                <h2 className={styles.cardTitle}>{s.label}</h2>
                <p className={styles.cardDesc}>{s.description}</p>
              </div>
              <span className={styles.arrow}>→</span>
            </Link>
          </motion.div>
        ))}
      </nav>
    </div>
  )
}