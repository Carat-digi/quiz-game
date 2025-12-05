const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('Basic API tests', () => {
  beforeEach(async () => {
    await helper.clearDatabase()
  })

  after(async () => {
    await helper.closeDatabase()
  })

  test('root endpoint returns HTML', async () => {
    await api
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
  })

  test('non-existent endpoint returns 404', async () => {
    await api
      .get('/api/nonexistent')
      .expect(404)
  })

  test('GET request to /api/auth without endpoint returns 404', async () => {
    await api
      .get('/api/auth')
      .expect(404)
  })

  test('GET request to /api/quizz returns json', async () => {
    const response = await api
      .get('/api/quizz')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body !== null)
  })
})