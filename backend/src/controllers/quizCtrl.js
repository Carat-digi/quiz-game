const Quiz = require('../models/quiz')
const Question = require('../models/question')
const User = require('../models/user')
const asyncHandler = require('../middleware/asyncHandler')
const AppError = require('../utils/appError')

exports.getQuizzes = asyncHandler(async (req, res, _next) => {
  const { 
    search = '', 
    sort = 'alphabetical', 
    page = 1, 
    limit = 30,
    category,
  } = req.query
  
  const query = {}
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  if (category) {
    query.category = category
  }

  let sortOption = {}
  switch(sort) {
  case 'dateAdded':
    sortOption = { createdAt: -1 }
    break
  case 'alphabetical':
  default:
    sortOption = { title: 1 }
    break
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)

  const quizzes = await Quiz.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'username')
    .select('-questions')

  const total = await Quiz.countDocuments(query)

  res.json({
    quizzes,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalQuizzes: total,
      hasMore: skip + quizzes.length < total
    }
  })

})

exports.getQuizById = asyncHandler(async (req, res, next) => {
  const { id } = req.params

  const quiz = await Quiz.findById(id)
    .populate('creator', 'username')
    .populate('questions')

  if (!quiz) {
    return next(new AppError('Quiz not found', 404))
  }

  res.json(quiz)
})

exports.createQuiz = asyncHandler(async (req, res, next) => {
  const { title, description, category, timeLimit, questions } = req.body

  if (!title || !description) {
    return next(new AppError('Title and description are required', 400))
  }

  // add questions if provided
  let questionIds = []
  if (questions && questions.length > 0) {
    const createdQuestions = await Question.insertMany(questions)
    questionIds = createdQuestions.map(q => q._id)
  }

  const quiz = new Quiz({
    title,
    description,
    category,
    timeLimit,
    questions: questionIds,
    creator: req.user._id,
  })

  await quiz.save()

  // add quiz to user's createdQuizzes
  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { createdQuizzes: quiz._id } }
  )

  const populatedQuiz = await Quiz.findById(quiz._id)
    .populate('creator', 'username')
    .populate('questions')

  res.status(201).json(populatedQuiz)
})

exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const { id } = req.params

  const quiz = await Quiz.findById(id)

  if (!quiz) {
    return next(new AppError('Quiz not found', 404))
  }

  // Check permissions: creator or admin
  if (quiz.creator.toString() !== req.user._id.toString() && req.user.root !== 'admin') {
    return next(new AppError('You do not have permission to delete this quiz', 403))
  }

  // Delete all questions associated with the quiz
  await Question.deleteMany({ _id: { $in: quiz.questions } })

  // Remove quiz from creator's createdQuizzes
  await User.findByIdAndUpdate(
    quiz.creator,
    { $pull: { createdQuizzes: quiz._id } }
  )

  // Remove quiz results from ALL users
  await User.updateMany(
    { 'quizResults.quiz': quiz._id },
    { $pull: { quizResults: { quiz: quiz._id } } }
  )

  // Delete the quiz itself
  await Quiz.findByIdAndDelete(id)

  res.json({ message: 'Quiz and all related data deleted successfully' })
})