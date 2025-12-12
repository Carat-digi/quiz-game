import { useState } from 'react'
import { logoutUser } from '../api/user'
import { AuthContext } from './authContext'
import logger from '../utils/logger'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (err) {
        logger.error('Failed to parse user from localStorage', err)
        localStorage.removeItem('user')
        return null
      }
    }
    return null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('accessToken')
    return !!(token && user)
  })

  const login = (accessToken, userData) => {
    logger.log('Login called with:', { accessToken, userData })
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
    logger.log('Login completed')
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      logger.error('Logout error:', error)
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}