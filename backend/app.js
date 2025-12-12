const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const config = require('./src/utils/config')
const logger = require('./src/utils/logger')
const authRouter = require('./src/routes/authRout')
const quizRouter = require('./src/routes/quizRout')
const resultRouter = require('./src/routes/resultRout')
const AppError = require('./src/utils/appError')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()

// connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((err) => {
    logger.error('error connecting to MongoDB:', err.message)
  })

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.static('dist'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

// API routes
app.use('/api/auth', authRouter)
app.use('/api/quizzes', quizRouter)
app.use('/api/results', resultRouter)

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Backend!</h1>')
})

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
})

app.use(errorHandler)

module.exports = app