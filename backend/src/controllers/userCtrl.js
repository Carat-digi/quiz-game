const User = require('../models/user')
const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/appError')

// Get all users (admin only)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { search } = req.query
  
  let query = {}
  if (search) {
    query = {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
  }

  const users = await User.find(query)
    .select('username email root createdAt')
    .sort({ createdAt: -1 })

  res.json({
    users,
    total: users.length
  })
})

// Update user role (admin only)
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { role } = req.body

  if (!role || !['user', 'admin'].includes(role)) {
    throw new AppError('Invalid role. Must be "user" or "admin"', 400)
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // Prevent demoting yourself
  if (user._id.toString() === req.user._id.toString() && role === 'user') {
    throw new AppError('You cannot demote yourself', 400)
  }

  user.root = role
  await user.save()

  res.json({
    message: `User role updated to ${role}`,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      root: user.root
    }
  })
})

// Get user by ID (admin only)
exports.getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params
  
  const user = await User.findById(userId)
    .select('username email root createdAt quizResults')
    .populate('quizResults.quiz', 'title category')

  if (!user) {
    throw new AppError('User not found', 404)
  }

  res.json({ user })
})

// Delete user (admin only)
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404)
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400)
  }

  await User.findByIdAndDelete(userId)

  res.json({
    message: 'User deleted successfully',
    deletedUser: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
})
