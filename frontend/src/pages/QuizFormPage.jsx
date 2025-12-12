import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createQuiz } from '../api/quiz'
import Toast from '../components/Toast'
import '../styles/quizFormPage.css'

const QuizFormPage = () => {
  const navigate = useNavigate()

  // state for main quiz data
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    timeLimit: ''
  })

  // state for array of questions
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''], // default 4 options
      answerIndex: 0
    }
  ])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  // handle changes in main quiz data
  const handleQuizChange = (e) => {
    const { name, value } = e.target
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // handle changes in question text
  const handleQuestionChange = (questionIndex, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].question = value
    setQuestions(updatedQuestions)
  }

  // handle changes in option text
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setQuestions(updatedQuestions)
  }

  // handle changes in correct answer selection
  const handleAnswerIndexChange = (questionIndex, answerIndex) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answerIndex = answerIndex
    setQuestions(updatedQuestions)
  }

  // add new option to question
  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].options.push('')
    setQuestions(updatedQuestions)
  }

  // remove option from question
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions]
    // cannot remove if less than 2 options
    if (updatedQuestions[questionIndex].options.length <= 2) {
      setToast({ message: 'Must have at least 2 options', type: 'error' })
      return
    }
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    // If the correct answer was removed, reset to 0
    if (updatedQuestions[questionIndex].answerIndex >= updatedQuestions[questionIndex].options.length) {
      updatedQuestions[questionIndex].answerIndex = 0
    }
    setQuestions(updatedQuestions)
  }

  // add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        answerIndex: 0
      }
    ])
  }

  // remove question
  const removeQuestion = (questionIndex) => {
    if (questions.length <= 1) {
      setToast({ message: 'Must have at least 1 question', type: 'error' })
      return
    }
    const updatedQuestions = questions.filter((_, index) => index !== questionIndex)
    setQuestions(updatedQuestions)
  }

  // validate form before submission
  const validateForm = () => {
    if (!quizData.title.trim()) {
      setError('Enter quiz title')
      return false
    }
    if (!quizData.category.trim()) {
      setError('Select category')
      return false
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        setError(`Fill in the text of question ${i + 1}`)
        return false
      }
      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 answer options`)
        return false
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Fill in option ${j + 1} in question ${i + 1}`)
          return false
        }
      }
    }

    return true
  }

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Prepare data for submission
      const submitData = {
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        // Convert time limit from minutes to seconds
        timeLimit: quizData.timeLimit ? parseFloat(quizData.timeLimit) * 60 : null,
        questions: questions
      }

      await createQuiz(submitData)
      navigate('/my') // Redirect to home after successful creation
    } catch (err) {
      const errorMessage = err.response?.data?.message
        || err.response?.data?.error
        || 'Error creating quiz'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <div className="quiz-form-page">
        <div className="container">
          <h1 className="page-title">Create New Quiz</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Basic quiz information */}
            <section className="quiz-info-section">
              <div className="quiz-info-container">
                <h2 className="section-title quiz-info-title">Basic Information</h2>

                <div className="form-group quiz-title">
                  <label htmlFor="title">Quiz Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={quizData.title}
                    onChange={handleQuizChange}
                    placeholder="Enter quiz title"
                    required
                  />
                </div>

                <div className="form-group quiz-description">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={quizData.description}
                    onChange={handleQuizChange}
                    placeholder="Describe the quiz"
                    rows="3"
                  />
                </div>

                <div className="form-group quiz-category">
                  <label htmlFor="category">Category *</label>
                  <select
                    className="category-select"
                    id="category"
                    name="category"
                    value={quizData.category}
                    onChange={handleQuizChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="science">Science</option>
                    <option value="history">History</option>
                    <option value="geography">Geography</option>
                    <option value="sports">Sports</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="technology">Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group quiz-time-limit">
                  <label htmlFor="timeLimit">Time Limit (minutes)</label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={quizData.timeLimit}
                    onChange={handleQuizChange}
                    placeholder="Leave empty for unlimited time"
                    min="0"
                    step="0.5" // allow half-minute increments
                  />
                </div>
              </div>
            </section>

            {/* Questions Section */}
            <section className="questions-section">
              <div className="questions-container">
                <h2 className="section-title">Questions</h2>

                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="question-block">
                    <div className="question-header2">
                      <h3>Question {questionIndex + 1}</h3>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="btn-remove"
                        >
                        X
                        </button>
                      )}
                    </div>

                    <div className="form-group question-text">
                      <label>Question Text *</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                        placeholder="Enter question text"
                        required
                      />
                    </div>

                    <div className="options-group">
                      <div className="options-header">
                        <div>Answer Options *</div>
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="btn-add-option"
                        >
                        + Add Option
                        </button>
                      </div>
                      <div className="options-instruction">
                        <small>Select the correct answer by choosing the corresponding radio button.</small>
                      </div>
                      <div className="options-list">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="option-item">
                            <input
                              type="radio"
                              name={`answer-${questionIndex}`}
                              checked={question.answerIndex === optionIndex}
                              onChange={() => handleAnswerIndexChange(questionIndex, optionIndex)}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              required
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                className="btn-remove-option"
                              >
                              ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-add-question"
                >
                + Add Question
                </button>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my')}
                className="btn-cancel"
                disabled={loading}
              >
              Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default QuizFormPage