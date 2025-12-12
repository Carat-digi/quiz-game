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
    // Handle invalid signature error (old token with wrong secret)
    if (error.response?.status === 500 && error.response?.data?.message === 'invalid signature') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post(
          'http://localhost:3001/api/auth/refresh',
          {},
          { withCredentials: true }
        )

        localStorage.setItem('accessToken', data.accessToken)

        // Update user data if provided
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

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

// get list of quizzes with optional search and sorting
export const getQuizzes = async (params = {}) => {
  const response = await api.get('/quizzes', { params })
  return response.data
}

// get a single quiz by ID
export const getQuizById = async (id) => {
  const response = await api.get(`/quizzes/${id}`)
  return response.data
}

// create a new quiz (admin only)
export const createQuiz = async (quizData) => {
  const response = await api.post('/quizzes', quizData)
  return response.data
}

// delete a quiz (admin only)
export const deleteQuiz = async (id) => {
  const response = await api.delete(`/quizzes/${id}`)
  return response.data
}