import { api } from 'src/boot/axios'
import type { User } from 'src/types/user.type'

class ManagerService {
  // Lấy danh sách manager
  async getList(filters?: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await api.get('/managers/list', { params: filters })
    return response.data
  }

  // Thêm mới manager
  async create(adminData: Partial<User>) {
    const response = await api.post('/managers/add', adminData)
    return response.data
  }

  // Cập nhật manager
  async update(id: number, adminData: Partial<User>) {
    const response = await api.patch(`/managers/${id}`, adminData)
    return response.data
  }

  // Thay đổi trạng thái manager (đơn hoặc hàng loạt)
  async updateStatus(ids: number[], status: boolean) {
    const response = await api.post('/managers/status', { ids, status })
    return response.data
  }

  // Xóa manager (đơn hoặc hàng loạt)
  async delete(ids: number[]) {
    const response = await api.delete('/managers', { data: { ids } })
    return response.data
  }

  // Reset mật khẩu manager (đơn hoặc hàng loạt)
  async resetPassword(ids: number[]) {
    const response = await api.post('/managers/reset-pw', { ids })
    return response.data
  }
}

export default new ManagerService()
