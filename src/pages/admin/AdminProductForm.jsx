import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { productEndpoints, categoryEndpoints, imageEndpoints } from '../../api/endpoints'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import styles from './AdminProductForm.module.css'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const MAX_NAME = 100
  const MAX_DESC = 1000

  const [form, setForm] = useState({
    name: '', description: '', stock: '', price: '', categoryId: '',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [errors, setErrors] = useState({})
  const [isDragOver, setIsDragOver] = useState(false)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const modalRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const { data: catData } = await categoryEndpoints.getAll()
        if (isMounted) setCategories(catData)

        if (isEdit) {
          const { data: prodData } = await productEndpoints.getById(id)
          if (isMounted) {
            setForm({
              name: prodData.name || '',
              description: prodData.description || '',
              stock: prodData.stock ?? 0,
              price: prodData.price ?? 0,
              categoryId: prodData.categoryId || '',
            })
            
            // Fixed image preview loading
            const rawUrl = prodData.imageUrl || prodData.mainImage?.url
            if (rawUrl) {
              setPreview(imageEndpoints.getUrl(rawUrl))
            }
          }
        }
      } catch (err) {
        toast.error('Failed to load initial form configuration data')
      } finally {
        if (isMounted) setInitialLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [id, isEdit])

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setSearchQuery('')
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [modalOpen])

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setErrors((er) => ({ ...er, file: undefined }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setErrors((er) => ({ ...er, file: undefined }))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (form.price === '' || Number(form.price) < 0) e.price = 'Must be 0 or more'
    if (form.stock === '' || Number(form.stock) < 0) e.stock = 'Must be 0 or more'
    if (!form.categoryId) e.categoryId = 'Required'
    if (!isEdit && !file) e.file = 'Main image is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { 
      setErrors(errs)
      toast.error('Please resolve validation errors before continuing')
      return 
    }

    setLoading(true)
    const formData = new FormData()
    
    const submissionForm = {
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      stock: form.stock === '' ? 0 : Number(form.stock)
    }

    formData.append('requestProduct', new Blob([JSON.stringify(submissionForm)], { type: 'application/json' }))
    if (file) formData.append('file', file)

    try {
      if (isEdit) {
        await productEndpoints.update(id, formData)
        toast.success('Product updated successfully')
      } else {
        await productEndpoints.create(formData)
        toast.success('Product created successfully')
      }
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product information')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, maxLen) => (e) => {
    let val = e.target.value

    if (e.target.type === 'number') {
      val = val === '' ? '' : Number(val).toString()
    }

    if (maxLen && val.length > maxLen) return

    setForm((f) => ({ ...f, [field]: val }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const selectCategory = (categoryId) => {
    setForm((f) => ({ ...f, categoryId }))
    setErrors((er) => ({ ...er, categoryId: undefined }))
    setModalOpen(false)
  }

  const selectedCategoryName = categories.find(c => c.id === form.categoryId)?.categoryName
  const filteredCategories = categories.filter(c =>
    c.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (initialLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.topBar}>
            <div className={styles.lineSkeleton} style={{ width: '85px', height: '32px', marginBottom: '12px' }} />
            <div className={styles.lineSkeleton} style={{ width: '240px', height: '32px' }} />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.fields}>
              <div className={styles.lineSkeleton} style={{ width: '100%', height: '48px' }} />
              <div className={styles.lineSkeleton} style={{ width: '100%', height: '100px' }} />
            </div>
            <div className={styles.lineSkeleton} style={{ width: '100%', aspectRatio: '1/1' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link to="/admin/products" className={styles.backButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Products</span>
          </Link>
          <h1 className={styles.heading}>{isEdit ? 'Edit product' : 'New product'}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.fields}>
              <div className={styles.inputContainerWithCounter}>
                <Input 
                  label="Name" 
                  value={form.name} 
                  onChange={handleInputChange('name', MAX_NAME)} 
                  error={errors.name} 
                  placeholder="e.g. Minimalist Leather Wallet"
                  required 
                />
                <span className={styles.characterCounter}>
                  {form.name.length} / {MAX_NAME}
                </span>
              </div>
              
              <div className={styles.group}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Description</label>
                  <span className={styles.characterCounter}>
                    {form.description.length} / {MAX_DESC}
                  </span>
                </div>
                <textarea
                  className={`${styles.textarea} ${errors.description ? styles.hasError : ''}`}
                  value={form.description}
                  onChange={handleInputChange('description', MAX_DESC)}
                  rows={5}
                  placeholder="Describe the structural architecture, fit, and aesthetic choices..."
                  required
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
                  onChange={handleInputChange('price')}
                  error={errors.price}
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleInputChange('stock')}
                  error={errors.stock}
                  placeholder="0"
                  required
                />
              </div>

              <div className={styles.group}>
                <label className={styles.label}>Category</label>
                <button
                  type="button"
                  className={`${styles.modalSelectorTrigger} ${errors.categoryId ? styles.hasError : ''}`}
                  onClick={() => setModalOpen(true)}
                >
                  <span className={selectedCategoryName ? styles.triggerFilledText : styles.triggerPlaceholderText}>
                    {selectedCategoryName || 'Select product category...'}
                  </span>
                  <span className={styles.triggerBadge}>Browse</span>
                </button>
                {errors.categoryId && <span className={styles.error}>{errors.categoryId}</span>}
              </div>
            </div>

            <div className={styles.imageCol}>
              <p className={styles.label}>{isEdit ? 'Replace main image' : 'Main image *'}</p>
              <div 
                className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''} ${errors.file ? styles.dropzoneError : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className={styles.previewImg} />
                ) : (
                  <div className={styles.dropPlaceholder}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Drag image here or click to upload</span>
                    {isEdit && <span className={styles.optionalHint}>Optional — leave blank to keep current asset</span>}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFile} className={styles.fileInput} />
              </div>
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

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div 
            className={styles.modalContent} 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Select Category</h3>
                <p className={styles.modalSubtitle}>Total items loaded: {categories.length}</p>
              </div>
              <button 
                type="button" 
                className={styles.modalCloseButton} 
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalSearchWrapper}>
              <input 
                type="text"
                placeholder="Search category collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.modalSearchInput}
                autoFocus
              />
            </div>

            <div className={styles.modalScrollContainer}>
              <div 
                className={`${styles.modalOptionRow} ${form.categoryId === '' ? styles.modalOptionActive : ''}`}
                onClick={() => selectCategory('')}
              >
                <span>None (Clear Selection)</span>
              </div>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((c) => (
                  <div
                    key={c.id}
                    className={`${styles.modalOptionRow} ${form.categoryId === c.id ? styles.modalOptionActive : ''}`}
                    onClick={() => selectCategory(c.id)}
                  >
                    <span>{c.categoryName}</span>
                    {form.categoryId === c.id && <span className={styles.checkMark}>✓</span>}
                  </div>
                ))
              ) : (
                <div className={styles.noResultsState}>
                  No categories matched "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}