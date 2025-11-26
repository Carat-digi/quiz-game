import { useAuth } from '../hooks/authContext'
import { Link, useLocation } from 'react-router-dom'

const NavBar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isCreatePage = location.pathname === '/register'
  return (
    <header className='nav-bar'>
      <div className='nav-bar-title'>
        <h3><Link to="/">QuizGame</Link></h3>
      </div>
      {!user && !isLoginPage && !isCreatePage && (
        <div className='nav-bar-info'>
          <Link to='/login'>Log in</Link>
        </div>
      )}
      {user && (
      <div className='nav-bar-info'>
        <div className='nav-bar-username'>{user.username}</div>
        <div className='nav-bar-logout'>Log out</div>
      </div>
      )}
    </header>
  )
}
export default NavBar