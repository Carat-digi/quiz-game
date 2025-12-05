const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const User = require('../src/models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('Authentication tests', () => {
  after(async () => {
    await helper.closeDatabase()
  })

  describe('POST /api/auth/register - Registration', () => {
    beforeEach(async () => {
      await helper.clearDatabase()
    })

    test('registration with valid data', async () => {
      const usersAtStart = await helper.usersInDb()
      
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      await api
        .post('/api/auth/register')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
      
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes('testuser'))
    })

    test('registration fails without username', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'password123'
      }

      await api
        .post('/api/auth/register')
        .send(newUser)
        .expect(400)
    })

    test('registration fails with existing email', async () => {
      // Create the first user
      const passwordHash = await bcrypt.hash('password', 10)
      const user = new User({
        username: 'existing',
        email: 'existing@example.com',
        passwordHash
      })
      await user.save()

      // Try to create a second user with the same email
      const newUser = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123'
      }

      await api
        .post('/api/auth/register')
        .send(newUser)
        .expect(400)
    })
  })

  describe('POST /api/auth/login - Login', () => {
    beforeEach(async () => {
      await helper.clearDatabase()
      
      // Create a test user before each test
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash
      })
      await user.save()
    })

    test('successful login with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await api
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert(response.body.user)
      assert.strictEqual(response.body.user.username, 'testuser')
    })

    test('login fails with incorrect password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      await api
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)
    })

    test('login fails without email', async () => {
      const credentials = {
        password: 'password123'
      }

      await api
        .post('/api/auth/login')
        .send(credentials)
        .expect(400)
    })
  })

  describe('POST /api/auth/logout - Logout', () => {
    test('successful logout', async () => {
      await api
        .post('/api/auth/logout')
        .expect(200)
    })
  })
})