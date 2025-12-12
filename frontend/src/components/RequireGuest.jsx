import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'

const RequireGuest = ({ children }) => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/my" replace />
  }

  return children
}

export default RequireGuest