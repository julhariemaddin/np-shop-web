import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './Auth.module.css'

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)

export default function Login() {
  const { login } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const validate = () => {
    const e = {}
    if (!form.username) e.username = 'Username is required'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.username}`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.header}>
          <Link 
            to="/" 
            className={`${styles.logoContainer} ${theme === 'dark' ? styles.logoDark : ''}`}
          >
            <img 
              src="/favicon.png" 
              alt="NP-Shop Logo" 
              className={styles.logoImage}
            />
          </Link>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Username"
            type="text"
            placeholder="your_username"
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoFocus
          />
          
          <div className={styles.passwordContainer}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
            />
            <button
              type="button"
              className={styles.peekButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
            Sign in
          </Button>
        </form>

        <p className={styles.footer}>
          No account?{' '}
          <Link to="/register" className={styles.link}>Register here</Link>
        </p>
      </motion.div>
    </div>
  )
}