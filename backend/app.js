const express = require('express')
const mongoose = require('mongoose')

const config = require('./src/utils/config')
const logger = require('./src/utils/logger')
const authRouter = require('./src/routes/auth')

const app = express()

// connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((err) => {
    logger.error('error connecting to MongoDB:', err.message)
  })

app.use(express.static('dist'))
app.use(express.json())

// API routes
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Backend!</h1>')
})

module.exports = app