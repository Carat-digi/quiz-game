import { useState } from 'react'
import { AuthContext } from './authContext'

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { 
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })

  const login = (data) => {
    localStorage.setItem("user", JSON.stringify(data))
    setUser(data)
  }

  // clear user data on logout
  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider }