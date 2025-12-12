import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuizById } from '../api/quiz'
import { saveQuizResult, getQuizResult } from '../api/result'
import Leaderboard from '../components/Leaderboard'
import logger from '../utils/logger'
import '../styles/quizDetailPage.css'

const QuizDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Quiz data states
  const [quiz, setQuiz] = useState(null)
  const [previousResult, setPreviousResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [answerIndexMapping, setAnswerIndexMapping] = useState([]) // Maps shuffled indices to original indices
  // Quiz progress states
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [startTime, setStartTime] = useState(null)
  // Result states
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [resultInfo, setResultInfo] = useState(null)
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [timerExpired, setTimerExpired] = useState(false)

  const loadQuiz = useCallback(async () => {
    try {
      const data = await getQuizById(id)
      setQuiz(data)
      // Shuffle options for each question
      const shuffled = data.questions.map(question => {
        const optionsWithIndex = question.options.map((option, index) => ({
          text: option,
          originalIndex: index
        }))

        // Fisher-Yates shuffle
        for (let i = optionsWithIndex.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]]
        }
        // Find new index of correct answer
        const newAnswerIndex = optionsWithIndex.findIndex(
          item => item.originalIndex === question.answerIndex
        )
        return {
          ...question,
          options: optionsWithIndex.map(item => item.text),
          answerIndex: newAnswerIndex,
          optionsWithIndex: optionsWithIndex // Store for mapping back to original indices
        }
      })
      setShuffledQuestions(shuffled)
      // Create mapping for converting shuffled answer indices back to original indices
      const mapping = shuffled.map(q =>
        q.optionsWithIndex.map(opt => opt.originalIndex)
      )
      logger.log('DEBUG: Answer index mapping created:', mapping)
      setAnswerIndexMapping(mapping)
      setAnswers(new Array(data.questions.length).fill(null))
      setStartTime(Date.now()) // start timer
    } catch (error) {
      logger.error('Error loading quiz:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadPreviousResult = useCallback(async () => {
    try {
      const { result } = await getQuizResult(id)
      setPreviousResult(result)
    } catch (error) {
      logger.error('Error loading previous result:', error)
    }
  }, [id])

  useEffect(() => {
    loadQuiz()
    loadPreviousResult()
  }, [loadQuiz, loadPreviousResult])

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = useCallback(async () => {
    logger.log('handleSubmit called, quiz:', quiz)
    if (!quiz) {
      logger.error('Quiz is null or undefined')
      return
    }
    const quizId = quiz.id || quiz._id
    if (!quizId) {
      logger.error('Quiz missing id or _id:', Object.keys(quiz))
      return
    }

    // Calculate score using shuffled questions
    let correctCount = 0
    shuffledQuestions.forEach((question, index) => {
      if (answers[index] === question.answerIndex) {
        correctCount++
      }
    })
    setScore(correctCount)

    // Convert answers back to original indices before sending to server
    const originalAnswers = answers.map((answerIndex, questionIndex) => {
      if (answerIndex === null || answerIndex === undefined) {
        return null
      }
      // Get the original index from the mapping
      if (!answerIndexMapping[questionIndex]) {
        logger.warn(`No mapping found for question ${questionIndex}`)
        return answerIndex // Fallback to shuffled index if no mapping
      }

      const originalIndex = answerIndexMapping[questionIndex][answerIndex]
      logger.log(`Question ${questionIndex}: shuffled answer ${answerIndex} -> original ${originalIndex}`)

      // Ensure originalIndex is a number
      if (typeof originalIndex === 'undefined') {
        logger.warn(`Undefined original index for question ${questionIndex}, shuffled ${answerIndex}`)
        return null
      }

      return originalIndex
    })

    logger.log('Original answers to send:', originalAnswers)
    logger.log('Quiz ID:', quizId)
    logger.log('Time spent:', Math.floor((Date.now() - startTime) / 1000))

    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    // Save result on the server
    try {
      const result = await saveQuizResult(quizId, originalAnswers, timeSpent)
      setResultInfo(result.result)

      logger.log('Result saved:', result)
    } catch (error) {
      logger.error('Error saving result:', error)
      if (error.response) {
        logger.error('Response status:', error.response.status)
        logger.error('Response data:', error.response.data)
      }
    }

    setShowResults(true)
  }, [quiz, answers, startTime, shuffledQuestions, answerIndexMapping])

  useEffect(() => {
    // if quiz has time limit, start countdown
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit)

      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimerExpired(true)
            handleSubmit() // Automatically submit when time expires
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [quiz, handleSubmit])

  if (loading) return <div>Loading...</div>
  if (!quiz) return <NotFoundPage />

  if (showResults) {
    const quizId = quiz.id || quiz._id
    if (!quizId) {
      logger.error('Cannot display results: quiz.id is missing')
      return <NotFoundPage />
    }
    const percentage = Math.round((score / quiz.questions.length) * 100)
    return (
      <div className="quiz-results">
        <h1>Quiz Completed!</h1>

        <div className="result-info">
          <h2>Your Score: {score} / {quiz.questions.length}</h2>
          <p>Percentage: {percentage}%</p>

          {resultInfo && (
            <>
              {resultInfo.isFirstAttempt && (
                <p className="first-attempt">🎉 First completion!</p>
              )}

              {!resultInfo.isFirstAttempt && resultInfo.isNewBest && (
                <p className="new-best">🏆 New Personal Best!</p>
              )}

              {!resultInfo.isFirstAttempt && !resultInfo.isNewBest && (
                <p className="not-best">
                  Your best: {previousResult?.score}/{previousResult?.totalQuestions}
                  ({previousResult?.percentage}%)
                </p>
              )}

              <p>Total attempts: {resultInfo.currentAttempt}</p>
            </>
          )}
        </div>

        <Leaderboard quizId={quizId} />

        <div className="result-actions">
          <button onClick={() => navigate('/my')}>Back to Quizzes</button>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    )
  }

  const question = shuffledQuestions[currentQuestion]

  return (
    <div className="quiz-detail">
      <h1>{quiz.title}</h1>

      {quiz.timeLimit && (
        <div className="timer-display">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          {timeRemaining < 30 && <span className="warning"> ⚠️</span>}
        </div>
      )}

      {previousResult && (
        <div className="previous-result-banner">
          Your best: {previousResult.score}/{previousResult.totalQuestions}
          ({previousResult.percentage}%) - Attempts: {previousResult.attempts}
        </div>
      )}

      <div className="quiz-progress">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </div>

      <div className="question">
        <h2>{question.question}</h2>
        <div className="options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={answers[currentQuestion] === index ? 'selected' : ''}
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button onClick={handleSubmit} disabled={timerExpired || !quiz}>Submit</button>
        ) : (
          <button onClick={handleNext} disabled={timerExpired || !quiz}>Next</button>
        )}
      </div>
    </div>
  )
}

export default QuizDetailPage