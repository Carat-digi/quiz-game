import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
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
    console.log('Interceptor caught error:', {
      url: originalRequest.url,
      status: error.response?.status,
      message: error.response?.data?.message
    })
    // if 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Don't try to refresh on login/register endpoints
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register')) {
        console.log('Skipping refresh for auth endpoint')
        return Promise.reject(error)
      }
      
      try {
        console.log('Attempting token refresh...')
        // Request a new accessToken using the refreshToken
        const { data } = await axios.post(
          'http://localhost:3001/api/auth/refresh',
          {},
          { withCredentials: true } // will send refreshToken cookie
        )
        
        // Save the new accessToken
        localStorage.setItem('accessToken', data.accessToken)
        
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
      password,
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


export default { registerUser, loginUser, logoutUser }