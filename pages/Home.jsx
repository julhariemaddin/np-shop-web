import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './Home.module.css'

const categories = [
  {
    id: 'cat-1',
    title: 'Daily Essentials',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
    tag: 'ESSENTIALS'
  },
  {
    id: 'cat-2',
    title: 'Gift Picks',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
    tag: 'LIMITED'
  },
  {
    id: 'cat-3',
    title: 'Fresh Arrivals',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
    tag: 'NEW DROPS'
  }
]

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      
      {/* ─── Header Strip ─── */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          <div className={styles.stripLeft}>
            <span className={styles.eyebrow}>System Interface v1.0</span>
            <h1 className={styles.heroTitle}>NP SHOP</h1>
          </div>
          
          <div className={styles.navActions}>
            <Link to="/products" className={styles.navLink}>Catalog</Link>
            <button onClick={() => navigate('/register')} className={styles.exploreBtn}>
              Join Vault
            </button>
          </div>
        </div>
      </div>

      {/* ─── Structural Workspace Layout ─── */}
      <div className={styles.body}>
        
        {/* ─── Sidebar Branding Column ─── */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Manifesto</p>
          <div className={styles.manifestoFrame}>
            <p className={styles.manifestoText}>
              A raw, calculated digital interface built for exceptional items. No fluff. Instant browsing. Zero radius architecture.
            </p>
          </div>
          
          <div className={styles.monochromeBadge}>
            STATUS // SECURE_NODE
          </div>
        </aside>

        {/* ─── Main Content Grid Matrix ─── */}
        <section className={styles.main}>
          <div className={styles.topBar}>
            <p className={styles.resultLabel}>CURATED VAULTS</p>
            <span className={styles.countBadge}>{categories.length} Indexes</span>
          </div>

          {/* Featured Monolith Spire Card */}
          <div 
            className={styles.monolithCard}
            onClick={() => navigate('/products')}
          >
            <div className={styles.monolithImgWrap}>
              <img 
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80" 
                alt="Premium Lineup Showcase" 
                className={styles.monolithImg}
              />
              <div className={styles.horizontalLaserBeam} />
            </div>
            <div className={styles.monolithBody}>
              <span className={styles.eyebrow} style={{ color: 'var(--neon-glow-secondary)' }}>
                EDITIONS / VOL 4
              </span>
              <h2 className={styles.monolithTitle}>PREMIUM LINEUP ARCHITECTURE</h2>
              <p className={styles.monolithDesc}>
                Handcrafted hardware components, raw materials, and tactical desktop items configured for high-performance stations.
              </p>
              <div className={styles.monolithFooter}>
                <span className={styles.monolithStatus}>SYSTEM // DATA_ACCESS</span>
                <span className={styles.textLink}>UNLOCK SPIRE →</span>
              </div>
            </div>
          </div>

          {/* Sub-vault Categories Grid Matrix */}
          <div className={styles.grid}>
            {categories.map((cat, index) => (
              <div 
                key={cat.id}
                className={`${styles.productCard} ${hoveredCard === cat.id ? styles.productCardActive : ''}`}
                onMouseEnter={() => setHoveredCard(cat.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate('/products')}
              >
                <div className={styles.productImgWrap}>
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className={styles.productImg} 
                    loading="lazy" 
                  />
                  {/* The Request Horizontal Laser Line Animation Overlay */}
                  <div className={styles.horizontalLaserBeam} />
                </div>
                
                <div className={styles.productBody}>
                  <span className={styles.cardKicker}>
                    0{index + 1} // {cat.tag}
                  </span>
                  <h3 className={styles.productTitle}>{cat.title}</h3>
                  
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>VIEW COLLECTION</span>
                    <button className={styles.exploreBtn}>Explore</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>
    </div>
  )
}