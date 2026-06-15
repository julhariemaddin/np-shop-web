import styles from './Input.module.css'

export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className={`${styles.group} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.hasError : ''}`} {...props} />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
