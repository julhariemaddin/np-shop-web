import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/
const userRe = /^[a-zA-Z0-9._-]+$/

export default function Register() {
  const { register } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.username) e.username = 'Username is required'
    else if (form.username.length < 3 || form.username.length > 20)
      e.username = 'Must be 3–20 characters'
    else if (!userRe.test(form.username))
      e.username = 'Letters, numbers, dots, dashes, underscores only'

    if (!form.email) e.email = 'Email is required'
    else if (!emailRe.test(form.email)) e.email = 'Invalid email format'

    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    else if (!passRe.test(form.password))
      e.password = 'Must include uppercase, lowercase, number, and special character'

    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form)
      toast.success('Account created — sign in to continue')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
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
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join NP Shop to start shopping</p>
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
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
          
          <div className={styles.passwordContainer}>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 chars, mixed case + symbol"
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
            Create account
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}