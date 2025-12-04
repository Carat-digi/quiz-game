const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizCtrl')
const { authenticate, requireAdmin } = require('../middleware/auth')

//public routes
router.get('/', quizController.getQuizzes)
router.get('/:id', quizController.getQuizById)


//protected routes
router.post('/', authenticate, requireAdmin, quizController.createQuiz)
router.delete('/:id', authenticate, requireAdmin, quizController.deleteQuiz)

module.exports = router