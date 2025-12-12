import '../styles/confirmDialog.css'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  details = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  icon = '⚠️'
}) => {
  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } finally {
      onClose()
    }
  }

  return (
    <div className="confirm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`confirm-dialog ${danger ? 'danger' : 'neutral'}`} onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-header ${danger ? 'danger' : 'neutral'}`}>
          <h2 className='confirm-title'>
            <span className="confirm-icon" aria-hidden>{icon}</span>
            {title}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="confirm-body">
          <p className="confirm-message">{message}</p>

          {details && details.length > 0 && (
            <ul className="confirm-details">
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onClose}>
            {cancelLabel}
          </button>
          <button className={`btn-confirm ${danger ? 'danger' : 'neutral'}`} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
