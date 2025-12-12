import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { registerUser } from '../api/user'
import '../styles/registerAndLoginPage.css'

const RegisterPage = ({ showToast }) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  const createHandle = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    try {
      await registerUser({ username: form.username, email: form.email, password: form.password })
      showToast('Registration successful!', 'success')
      setForm({ email: '', username: '', password: '', confirmPassword: '' })
      navigate('/login')
    }
    catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div className='register-page'>
      <h1>Create Account</h1>
      <form onSubmit={createHandle} className='register-form'>
        <div className='celsForm'>
          <label htmlFor='email'>Email</label>
          <input type='email' name='email' value={form.email} onChange={handleChange} id='email' required />
        </div>
        <div className='celsForm'>
          <label htmlFor='username'>Username</label>
          <input type='text' name='username' value={form.username} onChange={handleChange} id='username' required />
        </div>
        <div className='celsForm'>
          <label htmlFor='password'>Password</label>
          <input type='password' name='password' value={form.password} onChange={handleChange} id='password' required />
        </div>
        <div className='celsForm'>
          <label htmlFor='confirmPassword'>Confirm Password</label>
          <input type='password' name='confirmPassword' value={form.confirmPassword} onChange={handleChange} id='confirmPassword' required />
        </div>
        <div className='celsFormBut'>
          <button type='submit'>Register</button>
        </div>
      </form>
      <div className='login-redirect'>
        <div className='redirect-text'>Already have an account?</div>
        <div className='redirect-link'>
          <Link to='/login'>Log in</Link>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage