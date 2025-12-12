import axios from 'axios'
import logger from '../utils/logger'

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
    logger.log('Interceptor caught error:', {
      url: originalRequest.url,
      status: error.response?.status,
      message: error.response?.data?.message
    })
    // Handle invalid signature error (old token with wrong secret)
    if (error.response?.status === 500 && error.response?.data?.message === 'invalid signature') {
      logger.log('Invalid token signature detected - clearing auth data')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    // if 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Don't try to refresh on login/register endpoints
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
        logger.log('Skipping refresh for auth endpoint')
        return Promise.reject(error)
      }

      try {
        logger.log('Attempting token refresh...')
        // Request a new accessToken using the refreshToken
        const { data } = await axios.post(
          'http://localhost:3001/api/auth/refresh',
          {},
          { withCredentials: true } // will send refreshToken cookie
        )

        // Save the new accessToken
        localStorage.setItem('accessToken', data.accessToken)

        // Update user data if provided
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        // Trigger event to update auth context
        window.dispatchEvent(new Event('auth-changed'))

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh token also expired - log out
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const registerUser = async ({ username, email, password }) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    })
    return response.data // successful registration response
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unknown error'
    throw new Error(message)
  }
}

export const loginUser = async (body) => {
  try {
    const { data } = await api.post('/auth/login', body)
    return data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unknown error'
    throw new Error(message)
  }
}

export const logoutUser = async () => {
  try {
    const res = await api.post('/auth/logout')
    return res.data
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Unknown error'
    throw new Error(message)
  }
}

// Admin functions
export const getAllUsers = async (search = '') => {
  try {
    const params = search ? { search } : {}
    const { data } = await api.get('/users', { params })
    return data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch users'
    throw new Error(message)
  }
}

export const updateUserRole = async (userId, role) => {
  try {
    const { data } = await api.patch(`/users/${userId}/role`, { role })
    return data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to update user role'
    throw new Error(message)
  }
}

export const getUserById = async (userId) => {
  try {
    const { data } = await api.get(`/users/${userId}`)
    return data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch user'
    throw new Error(message)
  }
}

export const deleteUser = async (userId) => {
  try {
    const { data } = await api.delete(`/users/${userId}`)
    return data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete user'
    throw new Error(message)
  }
}


export default { registerUser, loginUser, logoutUser, getAllUsers, updateUserRole, getUserById, deleteUser }