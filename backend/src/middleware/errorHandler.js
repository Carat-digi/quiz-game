const AppError = require('../utils/appError')

const SendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    error: err,
  })
}

const SendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  }

  console.log('UNEXPECTED ERROR:', err)
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong :(',
  })
}

const handlerValidationError = err => {
  const message = err.details ? err.details.map(d => d.message).join(', ') : err.message
  return new AppError(message, 400)
}

const handlerMongoDuplicate = err => {
  const filed = Object.keys(err.keyValue || {}).join(', ')
  const message = `Duplicate field value: ${filed}. Please use another value`
  return new AppError(message, 409)
}

const handlerJwtError = err => new AppError('Invalid token. Please log in again', 401)

const handlerJwtExpired = err => new AppError('Your token has expired. Please log in again', 401)

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    SendErrorDev(err, res)
  } else {
    let error = {...err, message: err.message, name: err.name}

    if (err.name === 'ValidationError' || err.isJoi) error = handlerValidationError(err)
    if (err.code === 11000) error = handlerMongoDuplicate(err)
    if (err.name === 'JsonWebTokenError') error = handlerJwtError()
    if (err.name === 'TokenExpiredError') error = handlerJwtExpired()

    SendErrorProd(error, res)
  }
}