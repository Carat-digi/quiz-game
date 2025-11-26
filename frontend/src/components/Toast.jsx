import '../styles/toast.css'

const Toast = ({ message, type, onClose }) => {
  if (!message) return null

  return (
    <div className='content'>
      <div className={`toast toast-${type}`}>
        <span>{message}</span>
        <button onClick={onClose}>x</button>
      </div>
    </div>
  )
}


export default Toast