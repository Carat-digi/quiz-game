import { useAuth } from '../hooks/authContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const NavBar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isCreatePage = location.pathname === '/register'
  const navigate = useNavigate()

  const { logout } = useAuth()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleUser = () => {
    navigate('/profile')
  }

  return (
    <header className='nav-bar'>
      <div className='nav-bar-title'>
        {user && (<h3><Link to="/my">QuizGame</Link></h3>)}
        {!user && (<h3><Link to="/">QuizGame</Link></h3>)}
      </div>
      {!user && !isLoginPage && !isCreatePage && (
        <div className='nav-bar-info'>
          <Link to='/login'>Log in</Link>
        </div>
      )}
      {user && (
        <div className='nav-bar-info'>
          <div className='nav-bar-user'>
            {user?.root === 'admin' && (<span className="admin-icon">👑</span>)}
            <div className='nav-bar-username' onClick={handleUser}>{user.username}</div>
          </div>
          <div className='nav-bar-logout' onClick={handleLogout}>Log out</div>
        </div>
      )}
    </header>
  )
}
export default NavBar