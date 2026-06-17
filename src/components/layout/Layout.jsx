import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './Header'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>NP<span>.</span></span>
          <p>© {new Date().getFullYear()} NP Shop. All rights reserved.</p>
        </div>
      </footer>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}