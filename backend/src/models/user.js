const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: String,
  root: { type: String, enum: ['user', 'admin'], default: 'user' },
  score: [
    {
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      },
      bestScore: {
        type: Number,
        default: 0
      }
    }
  ],
  createdQuizzes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

module.exports = mongoose.model('User', userSchema)