import { api } from 'src/boot/axios'

class AuthService {
  async login(credentials: { userName: string; password: string }) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  }

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  }
}

export default new AuthService()
