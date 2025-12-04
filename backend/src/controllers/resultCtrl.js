const User = require('../models/user')
const Quiz = require('../models/quiz')
const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/appError')

// save or update quiz result for a user
exports.saveQuizResult = asyncHandler(async (req, res, next) => {
  const { quizId, answers, timeSpent } = req.body
  
  if (!quizId || !answers) {
    return next(new AppError('Quiz ID and answers are required', 400))
  }

  // get the quiz
  const quiz = await Quiz.findById(quizId).populate('questions')
  
  if (!quiz) {
    return next(new AppError('Quiz not found', 404))
  }

  // Check answers and calculate result
  let correctCount = 0
  quiz.questions.forEach((question, index) => {
    const userAnswer = answers[index]
    if (userAnswer === question.answerIndex) {
      correctCount++
    }
  })

  const totalQuestions = quiz.questions.length
  const percentage = Math.round((correctCount / totalQuestions) * 100)

  // Find the user
  const user = await User.findById(req.user._id)

  // Find existing result for this quiz
  const existingResultIndex = user.quizResults.findIndex(
    r => r.quiz.toString() === quizId
  )

  let isNewBest = false
  let isFirstAttempt = false

  if (existingResultIndex !== -1) {
    // Result already exists - update if new one is better
    const existingResult = user.quizResults[existingResultIndex]
    
    if (correctCount > existingResult.score) {
      // New result is better - update
      existingResult.score = correctCount
      existingResult.totalQuestions = totalQuestions
      existingResult.percentage = percentage
      existingResult.timeSpent = timeSpent || 0
      existingResult.completedAt = new Date()
      existingResult.attempts += 1
      isNewBest = true
    } else {
      // New result is not better - just increment attempts count
      existingResult.attempts += 1
      existingResult.completedAt = new Date()
    }
  } else {
    // First attempt - add new result
    user.quizResults.push({
      quiz: quizId,
      score: correctCount,
      totalQuestions,
      percentage,
      timeSpent: timeSpent || 0,
      attempts: 1,
      completedAt: new Date()
    })
    isNewBest = true
    isFirstAttempt = true
  }

  await user.save()

  res.status(201).json({
    message: 'Result saved successfully',
    result: {
      score: correctCount,
      totalQuestions,
      percentage,
      isNewBest,
      isFirstAttempt,
      currentAttempt: existingResultIndex !== -1 
        ? user.quizResults[existingResultIndex].attempts 
        : 1
    }
  })
})

// Get all results for a user
exports.getUserResults = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'quizResults.quiz',
      select: 'title category difficulty'
    })
    .select('quizResults')

  // Sort by date (latest first)
  const sortedResults = user.quizResults.sort((a, b) => 
    b.completedAt - a.completedAt
  )

  res.json({
    results: sortedResults
  })
})

// Get result for a specific quiz
exports.getQuizResult = asyncHandler(async (req, res, _next) => {
  const { quizId } = req.params

  const user = await User.findById(req.user._id)
    .populate({
      path: 'quizResults.quiz',
      select: 'title category difficulty'
    })

  const result = user.quizResults.find(
    r => r.quiz._id.toString() === quizId
  )

  if (!result) {
    return res.json({ result: null, message: 'No result found for this quiz' })
  }

  res.json({ result })
})

// get user statistics
exports.getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('quizResults')

  const totalQuizzes = user.quizResults.length
  const totalAttempts = user.quizResults.reduce((sum, r) => sum + r.attempts, 0)
  
  const averageScore = totalQuizzes > 0
    ? user.quizResults.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes
    : 0

  const totalTimeSpent = user.quizResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0)

  // Calculate distribution by difficulty categories
  const perfectScores = user.quizResults.filter(r => r.percentage === 100).length

  res.json({
    stats: {
      totalQuizzes,                            // Number of unique quizzes taken
      totalAttempts,                           // Total number of attempts
      averageScore: Math.round(averageScore),  // Average percentage of correct answers
      totalTimeSpent,                          // Total time in seconds
      perfectScores                            // Number of quizzes with a 100% score
    }
  })
})

// Delete result for a quiz (optional)
exports.deleteQuizResult = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params

  const user = await User.findById(req.user._id)

  const resultIndex = user.quizResults.findIndex(
    r => r.quiz.toString() === quizId
  )

  if (resultIndex === -1) {
    return next(new AppError('Result not found', 404))
  }

  user.quizResults.splice(resultIndex, 1)
  await user.save()

  res.json({ message: 'Result deleted successfully' })
})

// Get top results for a quiz (for leaderboard)
exports.getQuizLeaderboard = asyncHandler(async (req, res) => {
  const { quizId } = req.params
  const limit = parseInt(req.query.limit) || 10

  // Find all users who have taken this quiz
  const users = await User.find({
    'quizResults.quiz': quizId
  })
    .select('username quizResults')

  // Extract and sort results
  const leaderboard = users
    .map(user => {
      const result = user.quizResults.find(
        r => r.quiz.toString() === quizId
      )
      return {
        username: user.username,
        score: result.score,
        percentage: result.percentage,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt
      }
    })
    .sort((a, b) => {
      // First by number of correct answers
      if (b.score !== a.score) return b.score - a.score
      // If scores are equal - by time (less time = better)
      return a.timeSpent - b.timeSpent
    })
    .slice(0, limit)

  res.json({ leaderboard })
})