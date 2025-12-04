const jwt = require('jsonwebtoken')
const User = require('../models/user')
const AppError = require('../utils/appError')
const asyncHandler = require('./asyncHandler')

const authenticate = asyncHandler(async (req, res, next) => {
  let token
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  
  if (!token) {
    throw new AppError('Not authorized', 401)
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id)
  
  next()
})

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin rights required', 403)
  }
  next()
})

module.exports = { authenticate, requireAdmin }