import { useAuth } from '../hooks/authContext'
import { Navigate, useLocation } from 'react-router-dom'

const RequireAuth = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // not authorized — redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  // authorized — return children components
  return children
}

export default RequireAuth