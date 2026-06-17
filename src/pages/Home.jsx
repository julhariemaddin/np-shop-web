import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Home.module.css'

const categories = [
  {
    id: 'cat-1',
    title: 'Daily Essentials',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
    tag: 'EVERYDAY'
  },
  {
    id: 'cat-2',
    title: 'Gift Picks',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
    tag: 'SPECIAL'
  },
  {
    id: 'cat-3',
    title: 'Fresh Arrivals',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
    tag: 'NEW DROPS'
  }
]

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className={styles.page}>
      
      {/* ─── Header Strip ─── */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          <div className={styles.stripLeft}>
            <span className={styles.eyebrow}>Online Store</span>
            <h1 className={styles.heroTitle}>NP SHOP</h1>
          </div>
          
          <div className={styles.navActions}>
            <button onClick={() => navigate('/products')} className={styles.navBtnShop}>
              Shop
            </button>
            
            {/* This button only shows up if the user is NOT signed in */}
            {!isAuthenticated && (
              <button onClick={() => navigate('/login')} className={styles.navBtnSignIn}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Structural Workspace Layout ─── */}
      <div className={styles.body}>
        
        {/* ─── Sidebar Branding Column ─── */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>About Us</p>
          <div className={styles.manifestoFrame}>
            <p className={styles.manifestoText}>
              We sell high-quality, long-lasting items. Simple browsing, fast checkout, and no distractions.
            </p>
          </div>
          
          <div className={styles.monochromeBadge}>
            SECURE SHOPPING
          </div>
        </aside>

        {/* ─── Main Content Grid Matrix ─── */}
        <section className={styles.main}>
          <div className={styles.topBar}>
            <p className={styles.resultLabel}>OUR COLLECTIONS</p>
            <span className={styles.countBadge}>{categories.length} Sections</span>
          </div>

          {/* Featured Large Card */}
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
                SPECIAL SELECTION
              </span>
              <h2 className={styles.monolithTitle}>PREMIUM ITEMS</h2>
              <p className={styles.monolithDesc}>
                Great items, raw materials, and clean desktop tools made for your home or work setup.
              </p>
              <div className={styles.monolithFooter}>
                <span className={styles.monolithStatus}>STATUS // READY</span>
                <span className={styles.textLink}>SEE ALL →</span>
              </div>
            </div>
          </div>

          {/* Product Categories Grid */}
          <div className={styles.grid}>
            {categories.map((cat, index) => (
              <div 
                key={cat.id}
                className={styles.productCard}
                onClick={() => navigate('/products')}
              >
                <div className={styles.productImgWrap}>
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className={styles.productImg} 
                    loading="lazy"
                  />
                  <div className={styles.horizontalLaserBeam} />
                </div>
                
                <div className={styles.productBody}>
                  <span className={styles.cardKicker}>
                    0{index + 1} // {cat.tag}
                  </span>
                  <h3 className={styles.productTitle}>{cat.title}</h3>
                  
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>VIEW PRODUCTS</span>
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