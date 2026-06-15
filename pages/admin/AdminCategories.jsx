import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { categoryEndpoints } from '../../api/endpoints'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './AdminCategories.module.css'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryEndpoints.getAll()
      setCategories(data)
    } catch {
      toast.error('Failed to load categories')
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await categoryEndpoints.create({ categoryName: newName.trim() })
      toast.success('Category created')
      setNewName('')
      fetchCategories()
    } catch {
      toast.error('Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  const handleSave = async (id) => {
    if (!editName.trim()) return
    setSavingId(id)
    try {
      await categoryEndpoints.update(id, { categoryName: editName.trim() })
      toast.success('Category updated')
      setEditingId(null)
      fetchCategories()
    } catch {
      toast.error('Failed to update category')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    setDeletingId(id)
    try {
      await categoryEndpoints.delete(id)
      toast.success('Category deleted')
      fetchCategories()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div>
            <Link to="/admin" className={styles.breadcrumb}>← Admin</Link>
            <h1 className={styles.heading}>Categories</h1>
          </div>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} className={styles.createForm}>
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.createInput}
          />
          <Button type="submit" variant="primary" size="md" loading={creating}>
            Add category
          </Button>
        </form>

        {/* List */}
        <div className={styles.list}>
          <AnimatePresence>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                className={styles.row}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                {editingId === cat.id ? (
                  <div className={styles.editRow}>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <Button variant="primary" size="sm" loading={savingId === cat.id} onClick={() => handleSave(cat.id)}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className={styles.catName}>{cat.categoryName}</span>
                    <div className={styles.rowActions}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingId(cat.id); setEditName(cat.categoryName) }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === cat.id}
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {categories.length === 0 && (
            <p className={styles.empty}>No categories yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  )
}
