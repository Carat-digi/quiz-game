import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserStats, getUserResults } from '../api/result'
import { useAuth } from '../hooks/authContext'
import AdminManagement from '../components/AdminManagement'
import logger from '../utils/logger'
import '../styles/profilePage.css'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('profileActiveTab')
    return savedTab || 'stats'
  })
  const [stats, setStats] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, resultsData] = await Promise.all([
        getUserStats(),
        getUserResults()
      ])
      setStats(statsData.stats)
      setResults(resultsData.results)
    } catch (error) {
      logger.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}`)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        {user?.root === 'admin' && (
          <div className="admin-badge">
            <span className="admin-icon">👑</span>
            <span className="admin-label">Admin</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('stats')
            localStorage.setItem('profileActiveTab', 'stats')
          }}
        >
          My Statistics
        </button>
        {user?.root === 'admin' && (
          <button
            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin')
              localStorage.setItem('profileActiveTab', 'admin')
            }}
          >
            User Management
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <>
          {stats && (
            <div className="stats-section">
              <h2>Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Quizzes Completed</h3>
                  <p className="stat-value">{stats.totalQuizzes}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Attempts</h3>
                  <p className="stat-value">{stats.totalAttempts}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Score</h3>
                  <p className="stat-value">{stats.averageScore}%</p>
                </div>
                <div className="stat-card">
                  <h3>Perfect Scores</h3>
                  <p className="stat-value">{stats.perfectScores}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Time</h3>
                  <p className="stat-value">{Math.floor(stats.totalTimeSpent / 60)} min</p>
                </div>
              </div>
            </div>
          )}

          <div className="results-section">
            <h2>Your Best Results</h2>
            {results.length === 0 ? (
              <p>No quizzes completed yet. Start your first quiz!</p>
            ) : (
              <div className="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Category</th>
                      <th>Best Score</th>
                      <th>Percentage</th>
                      <th>Attempts</th>
                      <th>Last Played</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => (
                      <tr key={result._id}>
                        <td>{result.quiz?.title || 'Unknown'}</td>
                        <td>{result.quiz?.category || 'N/A'}</td>
                        <td>{result.score}/{result.totalQuestions}</td>
                        <td>
                          <span className={`percentage ${result.percentage === 100 ? 'perfect' : ''}`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td>{result.attempts}</td>
                        <td>{new Date(result.completedAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleQuizClick(result.quiz?.id || result.quiz?._id)}
                            className="retry-btn"
                          >
                            Play Again
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'admin' && user?.root === 'admin' && (
        <AdminManagement />
      )}
    </div>
  )
}

export default ProfilePage