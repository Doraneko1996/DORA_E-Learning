// File này dùng để xử lý hiển thị thông báo lỗi cho người dùng

import { AxiosError } from 'axios'

export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = 'Lỗi hệ thống',
): string => {
  if (error instanceof AxiosError) {
    const details = error.response?.data?.details;

    // Xử lý mảng lỗi
    if (Array.isArray(details)) {
      return details.join('\n');
    }

    // Xử lý trường hợp details là string
    if (typeof details === 'string') {
      return details;
    }

    // Fallback các trường hợp khác
    return error.response?.data?.message || error.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}
