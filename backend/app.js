const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const config = require('./src/utils/config')
const logger = require('./src/utils/logger')
const authRouter = require('./src/routes/authRout')
const quizRouter = require('./src/routes/quizRout')
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
app.use(express.json())
app.use(cookieParser())

// API routes
app.use('/api/auth', authRouter)
app.use('/api/quizz', quizRouter)

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Backend!</h1>')
})

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler)

module.exports = app