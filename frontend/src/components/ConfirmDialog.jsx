import '../styles/confirmDialog.css'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, details }) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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

          <p className="confirm-warning">⚠️ This action cannot be undone!</p>
        </div>

        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
