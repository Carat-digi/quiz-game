const jwt = require('jsonwebtoken')
const User = require('../models/user')
const AppError = require('../utils/appError')
const asyncHandler = require('./asyncHandler')
const config = require('../utils/config')

const authenticate = asyncHandler(async (req, res, next) => {
  let token
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }
  
  if (!token) {
    throw new AppError('Not authorized', 401)
  }
  
  const decoded = jwt.verify(token, config.JWT_SECRET)
  req.user = await User.findById(decoded.id)
  
  next()
})

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.root !== 'admin') {
    throw new AppError('Access denied. Admin rights required', 403)
  }
  next()
})

module.exports = { authenticate, requireAdmin }