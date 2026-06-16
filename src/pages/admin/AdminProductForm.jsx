import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { productEndpoints, categoryEndpoints } from '../../api/endpoints'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './AdminProductForm.module.css'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '', description: '', stock: 0, price: 0, categoryId: '',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    categoryEndpoints.getAll().then(({ data }) => setCategories(data)).catch(() => {})
    if (isEdit) {
      productEndpoints.getById(id).then(({ data }) => {
        setForm({
          name: data.name,
          description: data.description,
          stock: data.stock,
          price: data.price,
          categoryId: data.categoryId,
        })
      }).catch(() => toast.error('Failed to load product'))
    }
  }, [id, isEdit])

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const validate = () => {
    const e = {}
    if (!form.name) e.name = 'Required'
    if (!form.description) e.description = 'Required'
    if (form.price < 0) e.price = 'Must be 0 or more'
    if (form.stock < 0) e.stock = 'Must be 0 or more'
    if (!form.categoryId) e.categoryId = 'Required'
    if (!isEdit && !file) e.file = 'Main image is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const formData = new FormData()
    formData.append('requestProduct', new Blob([JSON.stringify(form)], { type: 'application/json' }))
    if (file) formData.append('file', file)

    try {
      if (isEdit) {
        await productEndpoints.update(id, formData)
        toast.success('Product updated')
      } else {
        await productEndpoints.create(formData)
        toast.success('Product created')
      }
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div>
            <Link to="/admin/products" className={styles.breadcrumb}>← Products</Link>
            <h1 className={styles.heading}>{isEdit ? 'Edit product' : 'New product'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fields}>
              <Input label="Name" value={form.name} onChange={set('name')} error={errors.name} />
              <div className={styles.group}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={`${styles.textarea} ${errors.description ? styles.hasError : ''}`}
                  value={form.description}
                  onChange={set('description')}
                  rows={4}
                  placeholder="Describe this product"
                />
                {errors.description && <span className={styles.error}>{errors.description}</span>}
              </div>
              <div className={styles.row}>
                <Input
                  label="Price (₱)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set('price')}
                  error={errors.price}
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={set('stock')}
                  error={errors.stock}
                />
              </div>

              <div className={styles.group}>
                <label className={styles.label}>Category</label>
                <select
                  className={`${styles.select} ${errors.categoryId ? styles.hasError : ''}`}
                  value={form.categoryId}
                  onChange={set('categoryId')}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
                {errors.categoryId && <span className={styles.error}>{errors.categoryId}</span>}
              </div>
            </div>

            <div className={styles.imageCol}>
              <p className={styles.label}>{isEdit ? 'Replace main image' : 'Main image *'}</p>
              <label className={styles.dropzone}>
                {preview ? (
                  <img src={preview} alt="Preview" className={styles.previewImg} />
                ) : (
                  <div className={styles.dropPlaceholder}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Click to upload</span>
                    {isEdit && <span className={styles.optionalHint}>Optional — leave blank to keep current</span>}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} />
              </label>
              {errors.file && <span className={styles.error}>{errors.file}</span>}
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" size="md" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
