const express = require('express')
const router = express.Router()
const userController = require('../controllers/userCtrl')
const { authenticate, requireAdmin } = require('../middleware/auth')

// All routes require authentication and admin rights
router.use(authenticate)
router.use(requireAdmin)

// Get all users
router.get('/', userController.getAllUsers)

// Get user by ID
router.get('/:userId', userController.getUserById)

// Update user role
router.patch('/:userId/role', userController.updateUserRole)

// Delete user
router.delete('/:userId', userController.deleteUser)

module.exports = router
