import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { userEndpoints } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './Profile.module.css'

export default function Profile() {
  const { updateUser } = useAuth() // Consume context method to sync top header states on save
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })
  const [initialLoading, setInitialLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      try {
        const { data } = await userEndpoints.getProfile()
        if (isMounted) {
          const profileData = data?.data || data
          setProfile(profileData)
          setProfileForm({ 
            username: profileData?.username || '', 
            email: profileData?.email || '' 
          })
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        if (isMounted) setInitialLoading(false)
      }
    }
    fetch()
    return () => { isMounted = false }
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!profileForm.username.trim() || !profileForm.email.trim()) {
      toast.error('Username and Email cannot be empty')
      return
    }

    setProfileLoading(true)
    try {
      const { data } = await userEndpoints.updateProfile(profileForm)
      toast.success('Profile updated successfully')
      
      const updatedData = data?.data || data
      setProfile((p) => ({ ...p, username: updatedData.username, email: updatedData.email }))
      
      // Keep global Context Providers synchronized with local database changes
      if (updateUser) {
        updateUser({ username: updatedData.username, email: updatedData.email })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    // Strict password evaluation rule mirroring your exact UX helper hint
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-B|C-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/
    
    if (!passwordForm.oldPassword) {
      setErrors({ oldPassword: 'Current password is required' })
      return
    }

    if (!passwordRegex.test(passwordForm.newPassword)) {
      setErrors({ 
        newPassword: 'Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character.' 
      })
      return
    }

    setPasswordLoading(true)
    try {
      await userEndpoints.updatePassword(passwordForm)
      toast.success('Password updated successfully')
      setPasswordForm({ oldPassword: '', newPassword: '' })
      setErrors({})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.sidebarSkeleton}>
            <div className={styles.avatarSkeleton} />
            <div className={styles.lineSkeleton} style={{ width: '60%', height: '16px' }} />
            <div className={styles.lineSkeleton} style={{ width: '80%', height: '12px' }} />
          </div>
          <div className={styles.forms}>
            <div className={styles.sectionSkeleton}>
              <div className={styles.lineSkeleton} style={{ width: '30%', height: '14px', marginBottom: '24px' }} />
              <div className={styles.lineSkeleton} style={{ width: '100%', height: '40px', marginBottom: '16px' }} />
              <div className={styles.lineSkeleton} style={{ width: '100%', height: '40px' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <aside className={styles.sidebar}>
          <div className={styles.avatar}>
            <span>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <h1 className={styles.username}>{profile?.username || 'User Profile'}</h1>
          <p className={styles.email}>{profile?.email || 'No email attached'}</p>
          <div className={styles.roles}>
            {profile?.role?.map((r) => (
              <span key={r} className={styles.role}>
                {r.replace('ROLE_', '')}
              </span>
            )) || profile?.roles?.map((r) => (
              <span key={r} className={styles.role}>
                {typeof r === 'string' ? r.replace('ROLE_', '') : r.name?.replace('ROLE_', '')}
              </span>
            ))}
          </div>
        </aside>

        <div className={styles.forms}>
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className={styles.sectionTitle}>Profile details</h2>
            <form onSubmit={handleProfileUpdate} className={styles.form}>
              <Input
                label="Username"
                value={profileForm.username}
                onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <div className={styles.actionRow}>
                <Button type="submit" variant="primary" size="md" loading={profileLoading}>
                  Save changes
                </Button>
              </div>
            </form>
          </motion.section>

          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.08 }}
          >
            <h2 className={styles.sectionTitle}>Change password</h2>
            <form onSubmit={handlePasswordUpdate} className={styles.form}>
              <Input
                label="Current password"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))
                  setErrors((prev) => ({ ...prev, oldPassword: null }))
                }}
                error={errors.oldPassword}
                required
              />
              <Input
                label="New password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  setErrors((prev) => ({ ...prev, newPassword: null }))
                }}
                error={errors.newPassword}
                hint="Min. 8 chars, uppercase, lowercase, number, and special character"
                required
              />
              <div className={styles.actionRow}>
                <Button type="submit" variant="secondary" size="md" loading={passwordLoading}>
                  Update password
                </Button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  )
}