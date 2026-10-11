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

export function getAuthErrorMessage(error: { message?: string; code?: string } | null | undefined): string {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return 'Email chưa được xác nhận. Hãy mở liên kết trong hộp thư (kể cả thư rác), rồi đăng nhập lại.';
  }

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return 'Email hoặc mật khẩu không đúng.';
  }

  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    /already registered|already exists/i.test(message)
  ) {
    return 'Email này đã có tài khoản. Hãy chuyển sang Đăng nhập.';
  }

  if (code === 'over_request_rate_limit' || /rate limit|too many requests/i.test(message)) {
    return 'Bạn thao tác quá nhanh. Đợi một lúc rồi thử lại.';
  }

  if (code === 'weak_password' || /password should be at least/i.test(message)) {
    return 'Mật khẩu quá yếu. Hãy dùng ít nhất 6 ký tự.';
  }

  if (code === 'email_address_invalid' || /email address.*invalid/i.test(message)) {
    return 'Địa chỉ email không hợp lệ.';
  }

  return message || 'Không thể đăng nhập. Vui lòng thử lại.';
}
