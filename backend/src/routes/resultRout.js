const express = require('express')
const router = express.Router()
const resultController = require('../controllers/resultCtrl')
const { authenticate } = require('../middleware/auth')

// all routes below require authentication
router.use(authenticate)

// Save/update quiz result
router.post('/', resultController.saveQuizResult)

// Get all user results
router.get('/', resultController.getUserResults)

// Get user statistics
router.get('/stats', resultController.getUserStats)

// Get result for a specific quiz
router.get('/quiz/:quizId', resultController.getQuizResult)

// Delete result for a quiz
router.delete('/quiz/:quizId', resultController.deleteQuizResult)

// Public route - leaderboard for a quiz
router.get('/leaderboard/:quizId', resultController.getQuizLeaderboard)

module.exports = router