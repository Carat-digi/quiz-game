const mongoose = require('mongoose')

const quizSchema = mongoose.Schema({
  title: String,
  description: String,
  category: String,
  timeLimit: {  
    type: Number,  // in seconds
    default: null  // null = without time limit
  },
  questions: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question' 
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }, 
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

quizSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Quiz', quizSchema)