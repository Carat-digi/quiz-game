const mongoose = require('mongoose')
const User = require('../src/models/user')
const Quiz = require('../src/models/quiz')

const initialUsers = [
  {
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuv', // hashed password
    root: 'user'
  },
  {
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
    root: 'admin'
  }
]

const initialQuizzes = [
  {
    title: 'JavaScript Basics',
    description: 'Test your knowledge of JavaScript fundamentals',
    category: 'programming',
    timeLimit: null,
    questions: [] // Empty array because questions are references to ObjectId
  }
]

const nonExistingId = async () => {
  const quiz = new Quiz({
    title: 'temp',
    description: 'temp',
    category: 'temp',
    questions: []
  })
  await quiz.save()
  await quiz.deleteOne()
  
  return quiz._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const quizzesInDb = async () => {
  const quizzes = await Quiz.find({})
  return quizzes.map(q => q.toJSON())
}

const clearDatabase = async () => {
  await User.deleteMany({})
  await Quiz.deleteMany({})
}

const closeDatabase = async () => {
  await mongoose.connection.close()
}

module.exports = {
  initialUsers,
  initialQuizzes,
  nonExistingId,
  usersInDb,
  quizzesInDb,
  clearDatabase,
  closeDatabase
} 