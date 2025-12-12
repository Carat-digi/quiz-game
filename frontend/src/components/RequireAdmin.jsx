import { useAuth } from '../hooks/authContext'
import { Navigate } from 'react-router-dom'

const RequireAdmin = ({ children }) => {
  const { user } = useAuth()

  // not authorized as admin — redirect to home
  if (!user || user?.root !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireAdmin
