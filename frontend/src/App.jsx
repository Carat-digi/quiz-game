import { Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import RequireAuth from './components/RequireAuth'
import Toast from './components/Toast'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import QuizPage from './pages/QuizPage'
import NotFoundPage from './pages/NotFoundPage'
import Footer from './components/Footer'

const App = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const [toast, setToast] = useState({ message: '', type: '' })
  const showToast = ( message, type ) => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 4000)
  }

  return (
    <>
      {!isHomePage && <NavBar />}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage showToast={showToast} />} />
        <Route path="/register" element={<RegisterPage showToast={showToast} />} />
        <Route path="/my" element={
          <RequireAuth>
            <QuizPage />
          </RequireAuth>
        }/>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
