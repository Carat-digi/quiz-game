import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { deleteQuiz } from '../api/quiz'
import { useState } from 'react'
import Toast from './Toast'
import logger from '../utils/logger'

const QuizTile = ({ quiz, onDelete }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  const handleClick = () => {
    navigate(`/quiz/${quiz.id}`)
  }

  const handleDelete = async (e) => {
    // Logic to handle quiz deletion
    logger.log('Delete Quiz button clicked')
    e.stopPropagation()

    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"?\n\nThis will:\n` +
      '- Delete the quiz\n' +
      `- Delete all ${quiz.questions?.length || 0} questions\n` +
      '- Remove all user results for this quiz\n\n' +
      'This action cannot be undone!'
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      await deleteQuiz(quiz.id)

      // notification showing success
      setToast({ message: 'Quiz deleted successfully!', type: 'success' })

      // callback or state update to remove the quiz from the list
      if (onDelete) {
        onDelete(quiz.id)
      }

    } catch (error) {
      logger.error('Error deleting quiz:', error)
      setToast({ message: error.response?.data?.error || 'Failed to delete quiz', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <div className="quiz-tile">
        <h3>{quiz.title}</h3>
        <p className="quiz-description">{quiz.description}</p>
        <div className="quiz-footer">
          <div className="quiz-meta">
            {quiz.timeLimit && (
              <span className="quiz-timer">
                ⏱️ {Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}
              </span>
            )}
            <span className="quiz-category">{quiz.category}</span>
            <span className="quiz-creator">By: {quiz.creator?.username || 'QuizMan'}</span>
          </div>
          <div className="quiz-actions">
            <button onClick={handleClick} className="btn-take-quiz">Take Quiz</button>
            {user?.root === 'admin' && (
              <button className="btn-quiz-delete" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Quiz'}</button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default QuizTile