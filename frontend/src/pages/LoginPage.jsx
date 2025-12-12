import { useState } from 'react'
import '../styles/registerAndLoginPage.css'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api/user'
import { useAuth } from '../hooks/authContext'
import logger from '../utils/logger'

const LoginPage = ({ showToast }) => {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await loginUser({ email: form.email, password: form.password })
      logger.log('Login response:', res)
      login(res.accessToken, res.user)
      logger.log('Navigating to /my')
      setForm({ email: '', password: '' })
      navigate('/my')
    } catch (err) {
      logger.error('Login error:', err)
      showToast(err.message, 'error')
    }
  }
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  return (
    <div className='login-page'>
      <h1>Login Account</h1>
      <form onSubmit={handleLogin} className='login-form'>
        <div className='celsForm'>
          <label htmlFor='email'>Email:</label>
          <input
            type='text'
            id='email'
            value={form.email}
            onChange={handleChange}
            name='email'
          />
        </div>
        <div className='celsForm'>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            value={form.password}
            onChange={handleChange}
            autoComplete='off'
            name='password'
          />
        </div>
        <div className='celsFormBut'>
          <button type='submit'>Login</button>
        </div>
      </form>
      <div className='login-redirect'>
        <div className='redirect-text'>Don't have an account?</div>
        <div className='redirect-link'>
          <Link to='/register'>Register</Link>
        </div>
      </div>
    </div>
  )
}
export default LoginPage