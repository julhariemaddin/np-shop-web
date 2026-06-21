import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
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
  
  const [showTosModal, setShowTosModal] = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')

  useEffect(() => {
    const isAccepted = localStorage.getItem('np_shop_tos_accepted')
    if (!isAccepted) {
      setShowTosModal(true)
    }
  }, [])

  useEffect(() => {
    async function verifyBackendStatus() {
      try {
        const res = fetch('/server/check')
        if (res.ok) {
          setServerStatus('online')
        } else {
          setServerStatus('offline')
        }
      } catch (err) {
        setServerStatus('offline')
      }
    }
    verifyBackendStatus()
  }, [])

  const handleAcceptTerms = () => {
    localStorage.setItem('np_shop_tos_accepted', 'true')
    setShowTosModal(false)
    toast.success('System cleared // Access granted')
  }

  return (
    <div className={styles.page}>
      
      {/* Stark Blockout Terms and Conditions Overlay */}
      {showTosModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            <div className={styles.modalHeader}>
              <span className={styles.modalEyebrow}>[!] SYSTEM SECURITY NOTICE</span>
              <h2 className={styles.modalHeading}>TERMS OF SERVICE // REGISTRATION REGULATION</h2>
            </div>
            
            <div className={styles.modalBodyText}>
              <p>Review environment baseline metrics before proceeding to platform architecture interactions:</p>
              
              <div className={styles.warningBox}>
                <span className={styles.boxTag}>// 01 / SANDBOX DEPLOYMENT</span>
                <p>This engine operates exclusively within a mock sandbox financial wrapper. No actual transactions or standard payment routes are live.</p>
              </div>

              <div className={styles.warningBox}>
                <span className={styles.boxTag}>// 02 / DATA RETENTION</span>
                <p>The host administrator maintains full administrative system state privileges. Credentials and text variables map directly inside backend records. Use dummy credentials only.</p>
              </div>
              
              <p className={styles.modalFooterNote}>Execution of click sequence below sets validation flag to true and unlocks the workspace grid.</p>
            </div>

            <button className={styles.modalAcceptBtn} onClick={handleAcceptTerms}>
              ACCEPT TERMS & OPEN INTERFACE
            </button>
            
          </div>
        </div>
      )}

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
              Shop
            </button>
          </div>

        </div>
      </div>

      {/* Layout */}
      <div className={styles.body}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>

          {/* Server Connectivity Panel */}
          <div className={styles.serverPanel}>
            <p className={styles.sidebarLabel}>SYSTEM NODE</p>
            <div className={styles.serverStatusRow}>
              <span className={`${styles.statusIndicator} ${styles[serverStatus]}`} />
              <span className={styles.serverStatusText}>
                {serverStatus === 'checking' && 'PINGING INSTANCE...'}
                {serverStatus === 'online' && 'SERVER // ONLINE'}
                {serverStatus === 'offline' && 'Homie server is down , backend dev is to broke to afford a vps , try again later or contact the dev for a testing'}
              </span>
            </div>
          </div>

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