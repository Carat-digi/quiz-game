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
import QuizDetailPage from './pages/QuizDetailPage'
import RequireAdmin from './components/RequireAdmin'
import QuizFormPage from './pages/QuizFormPage'
import ProfilePage from './pages/ProfilePage'
import RequireGuest from './components/RequireGuest'

const App = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const [toast, setToast] = useState({ message: '', type: '' })
  const showToast = ( message, type ) => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 5000)
  }

  return (
    <>
      <div className="app">
        {!isHomePage && <NavBar />}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
        <main className="app-main">
          <Routes>
            <Route path="/" element={
              <RequireGuest>
                <HomePage />
              </RequireGuest>
            } />
            <Route path="/login" element={
              <RequireGuest>
                <LoginPage showToast={showToast} />
              </RequireGuest>
            } />
            <Route path="/register" element={
              <RequireGuest>
                <RegisterPage showToast={showToast} />
              </RequireGuest>
            } />
            <Route path="/my" element={
              <RequireAuth>
                <QuizPage />
              </RequireAuth>
            }/>
            <Route path="/quiz/:id" element={
              <RequireAuth>
                <QuizDetailPage />
              </RequireAuth>
            }/>
            <Route path="/quiz/create" element={
              <RequireAuth>
                <RequireAdmin>
                  <QuizFormPage />
                </RequireAdmin>
              </RequireAuth>
            }/>
            <Route path="/profile" element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }/>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
