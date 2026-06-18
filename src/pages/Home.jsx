import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

const categories = [
  {
    id: 'cat-1',
    title: 'Daily Essentials',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
  tag: 'LOWKEY FIRE'
  },
  {
    id: 'cat-2',
    title: 'Gift Picks',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80',
    tag: 'USE DAILY'
  },
  {
    id: 'cat-3',
    title: 'Fresh Arrivals',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
    tag: 'BEST DROPPED'
  }
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>

          <div className={styles.stripLeft}>
            <span className={styles.eyebrow}>
              SHOP SMART
            </span>

            <h1 className={styles.heroTitle}>
              NP SHOP
            </h1>
          </div>

          <div className={styles.navActions}>
            <button
              onClick={() => navigate('/products')}
              className={styles.navBtnShop}
            >
              Shop →
            </button>
          </div>

        </div>
      </div>

      {/* Layout */}
      <div className={styles.body}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>

          <p className={styles.sidebarLabel}>
            About Us
          </p>

          <div className={styles.manifestoFrame}>
            <p className={styles.manifestoText}>
              Good stuff. No extra steps.
            </p>
          </div>

          <div className={styles.monochromeBadge}>
            SAFE • FAST • SIMPLE
          </div>

        </aside>

        {/* Main */}
        <section className={styles.main}>

          <div className={styles.topBar}>
            <p className={styles.resultLabel}>
              WHAT PEOPLE ARE CLICKING
            </p>

            <span className={styles.countBadge}>
              {categories.length} collections
            </span>
          </div>

          {/* Featured */}
          <div
            className={styles.monolithCard}
            onClick={() => navigate('/products')}
          >

            <div className={styles.monolithImgWrap}>
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                alt="Featured products"
                className={styles.monolithImg}
              />

              <div className={styles.horizontalLaserBeam} />
            </div>

            <div className={styles.monolithBody}>

              <span
                className={styles.eyebrow}
                style={{
                  color: 'var(--neon-glow-secondary)'
                }}
              >
                CURATED PICKS
              </span>

              <h2 className={styles.monolithTitle}>
                GOOD STUFF ONLY
              </h2>

              <p className={styles.monolithDesc}>
                Products worth keeping /
                no clutter, no endless scrolling.
              </p>

              <div className={styles.monolithFooter}>

                <span className={styles.monolithStatus}>
                  LIVE // SHOP NOW
                </span>

                <u className={styles.textLink}>
                  SEE WHAT’S IN HERE
                </u>

              </div>

            </div>

          </div>

          {/* Grid */}
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

                  <h3 className={styles.productTitle}>
                    {cat.title}
                  </h3>

                  <div className={styles.productFooter}>

                    <span className={styles.productPrice}>
                      TAKE A LOOK
                    </span>

                    <button className={styles.exploreBtn}>
                      OPEN
                    </button>

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