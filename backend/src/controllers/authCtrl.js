const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const User = require('../models/user')
const asyncHandler = require('../middleware/asyncHandler')

// для куки надо
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret'
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'

// const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret'
const REFRESH_TOKEN_EXPIRES_DAYS = process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30

const NODE_ENV = process.env.NODE_ENV || 'development'

const createToken = (user) => {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })
}

const createRefreshToken = (user) => {
  const token = uuidv4()
  const expiresAt = Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000

  const userId = user._id ? user._id.toString() : (user.id ? user.id.toString() : null)
  if (!userId) {
    throw new Error('createRefreshToken: user id is missing')
  }

  refreshTokensStore.set(token, { userId, expiresAt })
  return token
}

const setRefreshCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30*24*60*60*1000, // 30 days
    path: '/'
  }
  res.cookie('refreshToken', token, cookieOptions)
}

const refreshTokensStore = new Map()

const revokeRefreshToken = (token) => {
  refreshTokensStore.delete(token)
}

const findRefreshToken = (token) => {
  const rec = refreshTokensStore.get(token)
  if (!rec) return null
  if (Date.now() > rec.expiresAt) {
    refreshTokensStore.delete(token)
    return null
  }
  return rec
}

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const userExist = await User.findOne({ $or: [ { username }, { email } ] })
  if (userExist) {
    return res.status(400).json({ message: 'Username or email already in use' })
  }

  const hash = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    passwordHash: hash
  })
  await user.save()
  res.status(201).json({ message: 'User registered successfully' })
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required '})
  }

  const userInBase = await User.findOne({ email })
  const passwordCorrect = userInBase === null
    ? false
    : await bcrypt.compare(password, userInBase.passwordHash)

  if(!(userInBase && passwordCorrect)) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const userForToken = {
    id: userInBase._id,
    username: userInBase.username,
    root: userInBase.root
  }

  const accessToken = createToken(userForToken)
  const refreshToken = createRefreshToken(userForToken)

  setRefreshCookie(res, refreshToken)
  
  res.status(200).json({ accessToken, user: { id: userInBase._id, username: userInBase.username } })
})

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' })
  }

  const storedToken = findRefreshToken(token)
  if (!storedToken) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }

  const userInBase = await User.findById(storedToken.userId)
  if (!userInBase) {
    revokeRefreshToken(token)
    return res.status(401).json({ message: 'User not found' })
  }

  //revoke old
  revokeRefreshToken(token)

  //create new
  const newRefreshToken = createRefreshToken(userInBase)
  setRefreshCookie(res, newRefreshToken)

  const userForToken = {
    id: userInBase._id,
    username: userInBase.username,
    root: userInBase.root
  }

  const accessToken = createToken(userForToken)
  return res.json({ accessToken })
})

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
    if (token) {
    revokeRefreshToken(token)
  }
  res.clearCookie('refreshToken', { path: '/api' })
  return res.json({ status: 'ok' })
})

exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401))
  }
  
  // check if user is admin
  if (req.user.root !== 'admin') {
    return next(new AppError('Admin privileges required', 403))
  }
  
  next()
}