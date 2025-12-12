const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Quiz = require('../src/models/quiz')
const User = require('../src/models/user')
const helper = require('./test_helper')
const config = require('../src/utils/config')

const api = supertest(app)

describe('Quiz tests', () => {
  let adminToken
  let adminUser
  let testQuiz

  beforeEach(async () => {
    await helper.clearDatabase()

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10)
    adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash,
      root: 'admin'
    })
    await adminUser.save()

    // Generate token
    adminToken = jwt.sign(
      { id: adminUser._id, username: adminUser.username, root: adminUser.root },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Create a test quiz
    testQuiz = new Quiz({
      title: 'JavaScript Basics',
      description: 'Test your knowledge',
      category: 'programming',
      timeLimit: null,
      questions: [],
      creator: adminUser._id
    })
    await testQuiz.save()
  })

  after(async () => {
    await helper.closeDatabase()
  })

  describe('GET /api/quizzes - Get list of quizzes', () => {
    test('quizzes are returned in JSON format', async () => {
      const response = await api
        .get('/api/quizzes')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert(response.body.quizzes)
      assert(response.body.pagination)
    })

    test('correct number of quizzes is returned', async () => {
      const response = await api.get('/api/quizzes')

      assert.strictEqual(response.body.quizzes.length, 1)
      assert.strictEqual(response.body.quizzes[0].title, 'JavaScript Basics')
    })
  })

  describe('GET /api/quizzes/:id - Get quiz by ID', () => {
    test('successful retrieval of existing quiz', async () => {
      const quizzes = await helper.quizzesInDb()
      const quizToView = quizzes[0]

      const response = await api
        .get(`/api/quizzes/${quizToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.title, quizToView.title)
    })

    test('404 error for non-existing ID', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/quizzes/${validNonexistingId}`)
        .expect(404)
    })

    test('error for invalid ID', async () => {
      const invalidId = '12345'
      
      await api
        .get(`/api/quizzes/${invalidId}`)
        .expect(400)
    })
  })

  describe('POST /api/quizzes - Create quiz', () => {
    test('admin can create a quiz', async () => {
      const newQuiz = {
        title: 'Node.js Basics',
        description: 'Learn Node.js',
        category: 'programming',
        timeLimit: null,
        questions: []
      }

      await api
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newQuiz)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const quizzes = await helper.quizzesInDb()
      assert.strictEqual(quizzes.length, 2)

      const titles = quizzes.map(q => q.title)
      assert(titles.includes('Node.js Basics'))
    })

    test('cannot create quiz without authentication', async () => {
      const newQuiz = {
        title: 'Test Quiz',
        description: 'Test',
        category: 'test',
        questions: []
      }

      await api
        .post('/api/quizzes')
        .send(newQuiz)
        .expect(401)
    })
  })

  describe('DELETE /api/quizzes/:id - Delete quiz', () => {
    test('admin can delete a quiz', async () => {
      const quizzesAtStart = await helper.quizzesInDb()
      const quizToDelete = quizzesAtStart[0]

      await api
        .delete(`/api/quizzes/${quizToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      const quizzesAtEnd = await helper.quizzesInDb()
      assert.strictEqual(quizzesAtEnd.length, 0)
    })

    test('cannot delete without authentication', async () => {
      const quizzes = await helper.quizzesInDb()
      const quizToDelete = quizzes[0]

      await api
        .delete(`/api/quizzes/${quizToDelete.id}`)
        .expect(401)
    })
  })
})