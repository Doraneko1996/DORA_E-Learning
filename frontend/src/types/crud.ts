// Định nghĩa kiểu dữ liệu cho cột trong bảng
export interface CRUDHeader {
  title: string       // Tiêu đề cột
  key: string        // Khóa để map với dữ liệu
  sortable?: boolean  // Có cho phép sắp xếp không
  width?: string | number  // Độ rộng cột
}

// Cấu hình chung cho CRUD
export interface CRUDConfig {
  title?: string      // Tiêu đề của trang
  apiEndpoint: string // Endpoint API
  headers: CRUDHeader[]  // Cấu hình các cột
  defaultSort?: {     // Sắp xếp mặc định
    key: string      // Cột sắp xếp
    order: 'asc' | 'desc'  // Thứ tự sắp xếp
  }
  totalItems: number
  page: number
  itemsPerPage: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// Định nghĩa kiểu dữ liệu cho item
export interface CRUDItem {
  id: number | string
  [key: string]: string | number | boolean | null | undefined
}
