const express = require('express')
const router = express.Router()
const resultController = require('../controllers/resultCtrl')
const { authenticate } = require('../middleware/auth')

// Public route - leaderboard for a quiz (NO AUTHENTICATION REQUIRED)
router.get('/leaderboard/:quizId', resultController.getQuizLeaderboard)

// All routes below require authentication
router.use(authenticate)

// Get user statistics (MUST be before generic GET route)
router.get('/stats', resultController.getUserStats)

// Get result for a specific quiz (MUST be before generic GET route)
router.get('/quiz/:quizId', resultController.getQuizResult)

// Delete result for a quiz
router.delete('/quiz/:quizId', resultController.deleteQuizResult)

// Save/update quiz result
router.post('/', resultController.saveQuizResult)

// Get all user results (generic - MUST be last)
router.get('/', resultController.getUserResults)

module.exports = router