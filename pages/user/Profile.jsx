import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { userEndpoints } from '../../api/endpoints'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './Profile.module.css'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await userEndpoints.getProfile()
        setProfile(data.data)
        setProfileForm({ username: data.data.username, email: data.data.email })
      } catch {
        toast.error('Failed to load profile')
      }
    }
    fetch()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const { data } = await userEndpoints.updateProfile(profileForm)
      toast.success('Profile updated')
      setProfile((p) => ({ ...p, username: data.data.username, email: data.data.email }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 8) {
      setErrors({ newPassword: 'At least 8 characters' })
      return
    }
    setPasswordLoading(true)
    try {
      await userEndpoints.updatePassword(passwordForm)
      toast.success('Password updated')
      setPasswordForm({ oldPassword: '', newPassword: '' })
      setErrors({})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.sidebar}>
          <div className={styles.avatar}>
            <span>{profile?.username?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
          <p className={styles.username}>{profile?.username}</p>
          <p className={styles.email}>{profile?.email}</p>
          <div className={styles.roles}>
            {profile?.role?.map((r) => (
              <span key={r} className={styles.role}>
                {r.replace('ROLE_', '')}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.forms}>
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={styles.sectionTitle}>Profile details</h2>
            <form onSubmit={handleProfileUpdate} className={styles.form}>
              <Input
                label="Username"
                value={profileForm.username}
                onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Button type="submit" variant="primary" size="md" loading={profileLoading}>
                Save changes
              </Button>
            </form>
          </motion.section>

          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className={styles.sectionTitle}>Change password</h2>
            <form onSubmit={handlePasswordUpdate} className={styles.form}>
              <Input
                label="Current password"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))}
              />
              <Input
                label="New password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  setErrors({})
                }}
                error={errors.newPassword}
                hint="Min. 8 chars, uppercase, lowercase, number, and special character"
              />
              <Button type="submit" variant="secondary" size="md" loading={passwordLoading}>
                Update password
              </Button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
