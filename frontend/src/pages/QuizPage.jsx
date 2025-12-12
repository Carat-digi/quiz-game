import { useAuth } from '../hooks/authContext'
import { useState, useEffect, useCallback } from 'react'
import { getQuizzes } from '../api/quiz'
import QuizTile from '../components/QuizTile'
import { useNavigate } from 'react-router-dom'
import logger from '../utils/logger'
import '../styles/quizPage.css'

const QuizPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('alphabetical')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getQuizzes({ search, sort, page, limit: 30 })
      setQuizzes(data.quizzes)
      setPagination(data.pagination)
    } catch (error) {
      logger.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }, [search, sort, page])

  useEffect(() => {
    loadQuizzes()
  }, [loadQuizzes])

  const handleCreateQuiz = () => {
    logger.log('Create Quiz button clicked')
    navigate('/quiz/create')
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1) // reset to first page on new search
  }

  const handleSortChange = (e) => {
    setSort(e.target.value)
    setPage(1)
  }

  const handleQuizDelete = (deletedQuizId) => {
    // update state to remove deleted quiz
    setQuizzes(prev => prev.filter(quiz => quiz.id !== deletedQuizId))
  }

  return (
    <div className="quiz-page">
      <div className="quiz-controls">
        <div className="quiz-search">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="quiz-actions-bar">
          <div className="quiz-sort">
            <label htmlFor="sort" className="sort-label">Sort by:</label>
            <select id="sort" name="sort" value={sort} onChange={handleSortChange} className="sort-select">
              <option value="alphabetical">A-Z</option>
              <option value="dateAdded">Date Add</option>
            </select>
          </div>
          {user?.root === 'admin' && (
            <div className="quiz-create"> {/* for admins only */ }
              <button onClick={handleCreateQuiz} className="create-quiz-button">New Quiz</button> {/* or + icon */}
            </div>
          )}
        </div>
      </div>
      <div className="quiz-list-grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="quiz-list">
              {quizzes.map(quiz => (
                <QuizTile
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={handleQuizDelete}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button
                  disabled={!pagination.hasMore}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
export default QuizPage