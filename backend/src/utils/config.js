require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key'

module.exports = { 
  MONGODB_URI, 
  PORT, 
  JWT_SECRET, 
  JWT_REFRESH_SECRET 
}