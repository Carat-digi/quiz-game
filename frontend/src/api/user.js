import axios from 'axios'

export const registerUser = async ({ username, email, password }) => {
  try {
    const response = await axios.post('/api/auth/register', {
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

export const loginUser = async ({ email, password }) => {
  try {
    const res = await axios.post('/api/auth/login', { email, password })
    return res.data
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unknown error'
    throw new Error(message)
  }
}


// default export kept for compatibility with any default imports
export default { registerUser, loginUser }