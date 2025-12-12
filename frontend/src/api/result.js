import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post(
          'http://localhost:3001/api/auth/refresh',
          {},
          { withCredentials: true }
        )

        localStorage.setItem('accessToken', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// save or update quiz result
export const saveQuizResult = async (quizId, answers, timeSpent) => {
  const response = await api.post('/results', {
    quizId,
    answers,
    timeSpent
  })
  return response.data
}

// get all user results
export const getUserResults = async () => {
  const response = await api.get('/results')
  return response.data
}

// get result for a specific quiz
export const getQuizResult = async (quizId) => {
  const response = await api.get(`/results/quiz/${quizId}`)
  return response.data
}

// get user statistics
export const getUserStats = async () => {
  const response = await api.get('/results/stats')
  return response.data
}

// delete result for a quiz
export const deleteQuizResult = async (quizId) => {
  const response = await api.delete(`/results/quiz/${quizId}`)
  return response.data
}

// get quiz leaderboard
export const getQuizLeaderboard = async (quizId, limit = 10) => {
  const response = await api.get(`/results/leaderboard/${quizId}`, {
    params: { limit }
  })
  return response.data
}