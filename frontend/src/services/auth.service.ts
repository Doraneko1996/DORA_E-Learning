import axios from 'axios'

export const AuthService = {
  login: async (credentials: { userName: string; password: string }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      return response.data
    } catch (error) {
      throw error
    }
  },

  logout: async () => {
    try {
      const response = await axios.post('/api/auth/logout')
      return response.data
    } catch (error) {
      throw error
    }
  },
}
