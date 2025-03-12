import { api } from 'src/boot/axios'
import type { User } from 'src/types/user.type'

class AdminService {
  // Lấy danh sách admin
  async getList(filters?: never) {
    const response = await api.get('/admins/list', { params: filters })
    return response.data
  }

  // Thêm mới admin
  async create(adminData: Partial<User>) {
    const response = await api.post('/admins/add', adminData)
    return response.data
  }

  // Cập nhật admin
  async update(id: number, adminData: Partial<User>) {
    const response = await api.patch(`/admins/${id}`, adminData)
    return response.data
  }

  // Thay đổi trạng thái admin
  async updateStatus(ids: number[], status: boolean) {
    const response = await api.post('/admins/status', { ids, status })
    return response.data
  }

  // Xóa admin (đơn hoặc hàng loạt)
  async delete(ids: number[]) {
    const response = await api.delete('/admins', { data: { ids } })
    return response.data
  }

  // Reset mật khẩu admin (đơn hoặc hàng loạt)
  async resetPassword(ids: number[]) {
    const response = await api.post('/admins/reset-pw', { ids })
    return response.data
  }
}

export default new AdminService()
