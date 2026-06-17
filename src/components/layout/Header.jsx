import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import useCartStore from '../../hooks/useCart'
import styles from './Header.module.css'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
)

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const items = useCartStore((s) => s.items)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const cartCount = items.reduce((sum, i) => sum + i.productQuantity, 0)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>NP<span className={styles.logoDot}>.</span></Link>

        <nav className={styles.nav}>
          <Link to="/products" className={styles.navLink}>Shop</Link>
          {isAdmin && <Link to="/admin" className={`${styles.navLink} ${styles.desktopAdminLink}`}>Admin</Link>}
        </nav>

        <div className={styles.actions}>
          <button onClick={toggle} className={styles.iconBtn} aria-label="Toggle theme">
            <div className={styles.iconShift}>{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</div>
          </button>

          {/* Only show Cart if user exists and is NOT admin */}
          {(user && !isAdmin) && (
            <Link to="/cart" className={styles.cartBtn}>
              <CartIcon />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span className={styles.cartBadge} key={cartCount} initial={{ scale: 0.4 }} animate={{ scale: 1 }}>
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button className={`${styles.userBtn} ${menuOpen ? styles.userBtnActive : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
                <UserIcon />
                <span className={styles.usernameLabel}>{user.username}</span>
                <span className={`${styles.chevron} ${menuOpen ? styles.chevronUp : ''}`}>↓</span>
              </button>
              
              <AnimatePresence>
                {menuOpen && (
                  <motion.div className={styles.dropdown} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.userLabelRole}>Signed In As</span>
                      <p className={styles.userLabelEmail}>{user.email || user.username}</p>
                    </div>
                    <div className={styles.dropDivider} />
                    
                    {/* Admin Dashboard Navigation Shortcut inside User Dropdown (Visible on Mobile views) */}
                    {isAdmin && (
                      <Link to="/admin" className={`${styles.dropItem} ${styles.mobileAdminDropdownLink}`} onClick={() => setMenuOpen(false)}>
                        Admin Control Center
                      </Link>
                    )}
                    
                    <Link to="/profile" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Profile Overview</Link>
                    
                    {/* Only show Orders if NOT admin */}
                    {!isAdmin && (
                      <Link to="/orders" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Purchase Orders</Link>
                    )}
                    
                    <div className={styles.dropDivider} />
                    <button className={`${styles.dropItem} ${styles.logoutItem}`} onClick={handleLogout}>Sign out session</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>Sign in</Link>
              <Link to="/register" className={styles.registerBtn}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}