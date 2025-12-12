import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/notFoundPage.css'

const NotFoundPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(5)

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
    <main className="nf-page" role="main">
      <section className="nf-card" aria-labelledby="nf-title">
        <div className="nf-body">
          <h1 id="nf-title" className="nf-title">Page Not Found</h1>
          <p className="nf-message">The page <code className="nf-path">{location.pathname}</code> does not exist.</p>

          <ul className="nf-suggestions">
            <li>Check the URL for typos</li>
            <li>Try searching from the home page</li>
            <li>Contact support if you think this is an error</li>
          </ul>

          <div className="nf-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
              aria-label="Go to home page"
            >
              Go to Home
            </button>

            <button
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              Go Back
            </button>
          </div>

          <p className="nf-redirect">Redirecting to home in <strong>{countdown}</strong> second{countdown === 1 ? '' : 's'}…</p>
        </div>
      </section>
    </main>
  )
}

export default NotFoundPage