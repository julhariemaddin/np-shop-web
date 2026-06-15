import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './Auth.module.css'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/
const userRe = /^[a-zA-Z0-9._-]+$/

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
          <Link to="/" className={styles.logo}>NP<span>.</span></Link>
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
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 chars, mixed case + symbol"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
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
