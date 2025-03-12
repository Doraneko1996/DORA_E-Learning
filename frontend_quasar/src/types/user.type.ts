export interface User {
  id: number
  userName: string
  firstName: string
  lastName: string
  status: boolean
  createdAt: string | null
  updatedAt: string | null
  gender?: string | null
  dob?: string | null
  phoneNumber?: string | null
  email?: string | null
  address?: string | null
  district?: string | null
  province?: string | null
}
