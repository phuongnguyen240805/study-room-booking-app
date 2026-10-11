import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useBookingStore } from '../stores/useBookingStore';

export const LoginScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const handleEmailSubmit = async () => {
    if (inFlightRef.current || loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email/gmail.');
      return;
    }
    if (!password) {
      Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Thông báo', 'Mật khẩu xác nhận không trùng khớp.');
        return;
      }
    }

    inFlightRef.current = true;
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await authService.signInWithEmail(trimmedEmail, password);
        if (!res.success) {
          if (res.errorCode === 'email_not_confirmed') {
            Alert.alert(
              'Email chưa xác nhận',
              res.error || 'Hãy mở liên kết trong hộp thư rồi đăng nhập lại.',
              [
                { text: 'Đóng', style: 'cancel' },
                {
                  text: 'Gửi lại email',
                  onPress: () => {
                    authService.resendSignupEmail(trimmedEmail).then((sent) => {
                      Alert.alert(
                        sent.success ? 'Đã gửi lại' : 'Chưa gửi được',
                        sent.success
                          ? 'Kiểm tra hộp thư và thư rác, bấm liên kết xác nhận, rồi đăng nhập lại.'
                          : sent.error || 'Không gửi lại được email xác nhận.'
                      );
                    });
                  },
                },
              ]
            );
          } else {
            Alert.alert('Đăng nhập thất bại', res.error || 'Email hoặc mật khẩu không đúng.');
          }
        } else if (res.session) {
          useBookingStore.getState().setSession(res.session);
          if (res.session.user) {
            const profile = await authService.getProfile(res.session.user.id);
            useBookingStore.getState().setProfile(profile);
          }
        }
      } else {
        const res = await authService.signUpWithEmail(trimmedEmail, password, fullName);
        if (!res.success) {
          Alert.alert('Đăng ký thất bại', res.error || 'Không thể tạo tài khoản.');
        } else if (res.needConfirmation) {
          Alert.alert(
            'Đăng ký thành công! ✉️',
            'Vui lòng kiểm tra hộp thư email của bạn để xác nhận tài khoản trước khi đăng nhập.',
            [{ text: 'Đã hiểu', onPress: () => setAuthMode('login') }]
          );
        } else if (res.session) {
          useBookingStore.getState().setSession(res.session);
          if (res.session.user) {
            const profile = await authService.getProfile(res.session.user.id);
            useBookingStore.getState().setProfile(profile);
          }
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi hệ thống', err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (inFlightRef.current || loading) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const res = await authService.signInWithGoogle();
      if (!res.success && res.error) {
        Alert.alert('Đăng nhập chưa hoàn tất', res.error);
      } else if (res.session) {
        useBookingStore.getState().setSession(res.session);
        if (res.session.user) {
          const profile = await authService.getProfile(res.session.user.id);
          useBookingStore.getState().setProfile(profile);
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi đăng nhập', err.message || 'Không thể đăng nhập Google lúc này.');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="school" size={48} color="#0284C7" />
            </View>
            <Text style={styles.appName}>VKU STUDY ROOM</Text>
            <Text style={styles.tagline}>Hệ thống đặt phòng tự học thông minh</Text>
          </View>

          {/* Mode Switch Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authMode === 'login' && styles.tabButtonActive]}
              onPress={() => setAuthMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>
                Đăng Nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, authMode === 'signup' && styles.tabButtonActive]}
              onPress={() => setAuthMode('signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>
                Đăng Ký
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formCard}>
            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên sinh viên</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ Email / Gmail</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="sinhvien@vku.udn.vn / gmail"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={authMode === 'signup' ? 'Tối thiểu 6 ký tự' : 'Mật khẩu của bạn'}
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {authMode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-check-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#64748B"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleEmailSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {authMode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google OAuth Button */}
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="google" size={22} color="#EA4335" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#0284C7',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
  },
  eyeBtn: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: '#0284C7',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  googleIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
  },
});
