import { AxiosError } from 'axios'
import { api } from 'src/boot/axios'
import type { User } from 'src/types/user.type'

class TeacherService {
  // Lấy danh sách giáo viên
  async getList(filters?: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const response = await api.post('/teachers/list', filters)
    return response.data
  }

  // Thêm mới giáo viên
  async create(teacherData: Partial<User>) {
    const response = await api.post('/teachers/add', teacherData)
    return response.data
  }

  // Cập nhật giáo viên
  async update(id: number, teacherData: Partial<User>) {
    const response = await api.patch(`/teachers/${id}`, teacherData)
    return response.data
  }

  // Thay đổi trạng thái giáo viên
  async updateStatus(ids: number[], status: boolean) {
    const response = await api.post('/teachers/status', { ids, status })
    return response.data
  }

  // Xóa giáo viên (đơn hoặc hàng loạt)
  async delete(ids: number[]) {
    const response = await api.delete('/teachers', { data: { ids } })
    return response.data
  }

  // Reset mật khẩu giáo viên (đơn hoặc hàng loạt)
  async resetPassword(ids: number[]) {
    const response = await api.post('/teachers/reset-pw', { ids })
    return response.data
  }

  // Tải file mẫu import giáo viên
  async downloadSampleFile(): Promise<Blob> {
    const response = await api.get('/teachers/import-template', {
      responseType: 'blob', // Nhận dữ liệu dạng Blob
    })
    return response.data
  }

  // Import giáo viên từ file Excel
  async import(file: File): Promise<{ success: boolean; message: string; errorFile?: Blob }> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/teachers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      })
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error) {
      // Kiểm tra lỗi là AxiosError và xử lý response
      if (error instanceof AxiosError) {
        if (error.response?.status === 400 && error.response.data instanceof Blob) {
          return {
            success: false,
            message: 'Có lỗi trong dữ liệu import. Xem file để biết chi tiết lỗi',
            errorFile: error.response.data, // File lỗi được trả về từ server
          }
        }
        // Ném lại lỗi nếu không phải trường hợp 400 với Blob
        throw new AxiosError(
          error.response?.data?.message || 'Lỗi khi import giáo viên',
          error.code,
          error.config,
          error.request,
          error.response,
        )
      }
      // Trường hợp lỗi không phải từ Axios
      throw new Error('Lỗi không xác định khi import giáo viên')
    }
  }

  // Xuất danh sách giáo viên ra file Excel
  async export(filters?: Record<string, any>): Promise<Blob> {  // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const response = await api.post('/teachers/export', filters, {
        responseType: 'blob', // Nhận dữ liệu dạng Blob
      })
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new AxiosError(
          error.response?.data?.message || 'Lỗi khi xuất danh sách giáo viên',
          error.code,
          error.config,
          error.request,
          error.response,
        )
      }
      throw new Error('Lỗi không xác định khi xuất danh sách giáo viên')
    }
  }
}

export default new TeacherService()
