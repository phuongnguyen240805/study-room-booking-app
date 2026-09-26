export function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại!';

  const message = typeof error === 'string' ? error : error.message || '';

  if (
    message.includes('unique_active_booking_slot') ||
    error.code === '23505' ||
    message.includes('duplicate key')
  ) {
    return 'Khung giờ này vừa được sinh viên khác đặt chỗ. Vui lòng chọn một khung giờ khác!';
  }

  if (
    message.includes('Failed to fetch') ||
    message.includes('Network request failed') ||
    message.includes('network')
  ) {
    return 'Không có kết nối mạng. Vui lòng kiểm tra lại đường truyền internet!';
  }

  if (message.includes('cancelled') || message.includes('dismissed')) {
    return 'Bạn đã hủy đăng nhập Google.';
  }

  return message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau!';
}
