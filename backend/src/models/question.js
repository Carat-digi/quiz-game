const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
  question: String,
  options: [String],
  answerIndex: Number
})

questionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Question', questionSchema)