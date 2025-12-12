import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(5)

  // Automatic redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2>Page Not Found</h2>
        <p className="error-message">
          The page <code>{location.pathname}</code> does not exist.
        </p>

        <div className="error-suggestions">
          <p>You might want to:</p>
          <ul>
            <li>Check the URL for typos</li>
            <li>Go back to the previous page</li>
            <li>Start from the home page</li>
          </ul>
        </div>

        <div className="error-actions">
          <button
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>

        <p className="auto-redirect">
          Redirecting to home in <strong>{countdown}</strong> seconds...
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage