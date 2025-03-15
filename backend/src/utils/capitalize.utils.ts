// Hàm tiện ích để viết hoa chữ cái đầu mỗi từ
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};