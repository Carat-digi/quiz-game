import { useEffect, useState } from 'react'
import '../styles/toast.css'

const Toast = ({ message, type = 'info', onClose }) => {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setIsClosing(true)
      setTimeout(() => {
        onClose()
        setIsClosing(false)
      }, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className='content'>
      <div className={`toast toast-${type} ${isClosing ? 'closing' : ''}`}>
        <span>{message}</span>
        <button onClick={() => {
          setIsClosing(true)
          setTimeout(() => {
            onClose()
            setIsClosing(false)
          }, 300)
        }}>×</button>
      </div>
    </div>
  )
}

export default Toast