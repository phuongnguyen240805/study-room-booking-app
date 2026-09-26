import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';
import { Profile } from '../types/auth';

WebBrowser.maybeCompleteAuthSession();

function extractParamsFromUrl(urlString: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!urlString) return params;

  try {
    const questionIndex = urlString.indexOf('?');
    const hashIndex = urlString.indexOf('#');

    // Extract search query params (?code=... or ?error=...)
    if (questionIndex !== -1) {
      const search =
        hashIndex !== -1 && hashIndex > questionIndex
          ? urlString.substring(questionIndex + 1, hashIndex)
          : urlString.substring(questionIndex + 1);
      new URLSearchParams(search).forEach((v, k) => {
        params[k] = v;
      });
    }

    // Extract hash fragment params (#access_token=... or #error=...)
    if (hashIndex !== -1) {
      const hash = urlString.substring(hashIndex + 1);
      new URLSearchParams(hash).forEach((v, k) => {
        params[k] = v;
      });
    }
  } catch (e) {
    console.warn('[Google Auth] Lỗi trích xuất params từ URL:', e);
  }

  return params;
}

export const authService = {
  async signInWithGoogle(): Promise<{ success: boolean; error?: string; session?: any }> {
    try {
      // In Expo Go, makeRedirectUri({ path: 'auth/callback' }) creates an exp:// redirect URI.
      // In Standalone APK, it automatically creates a vku-study-room:// redirect URI from app.json.
      const redirectUrl = AuthSession.makeRedirectUri({
        path: 'auth/callback',
      });

      console.log('[Google Auth] Redirect URI đang dùng:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        console.error('[Google Auth] Lỗi signInWithOAuth:', error);
        return { success: false, error: error.message };
      }

      if (!data?.url) {
        return { success: false, error: 'Không thể tạo liên kết đăng nhập Google từ Supabase.' };
      }

      console.log('[Google Auth] Mở AuthSession trình duyệt...');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
        showInRecents: false,
      });
      console.log('[Google Auth] Kết quả WebBrowser:', JSON.stringify(result));

      if (result.type === 'success' && result.url) {
        console.log('[Google Auth] Callback URL thành công:', result.url);
        const params = extractParamsFromUrl(result.url);
        console.log('[Google Auth] Keys nhận được:', Object.keys(params));

        if (params.error || params.error_description) {
          const errorMsg = decodeURIComponent(
            params.error_description || params.error || 'Xác thực Google bị từ chối.'
          );
          console.error('[Google Auth] Lỗi từ OAuth Provider:', errorMsg);
          return { success: false, error: errorMsg };
        }

        if (params.code) {
          console.log('[Google Auth] Đang đổi code lấy session...');
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(params.code);
          if (exchangeError) {
            console.error('[Google Auth] Lỗi exchangeCodeForSession:', exchangeError);
            return { success: false, error: exchangeError.message };
          }
          return { success: true, session: exchangeData.session };
        } else if (params.access_token && params.refresh_token) {
          console.log('[Google Auth] Đang thiết lập session từ tokens...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (sessionError) {
            console.error('[Google Auth] Lỗi setSession:', sessionError);
            return { success: false, error: sessionError.message };
          }
          return { success: true, session: sessionData.session };
        }

        return {
          success: false,
          error: 'Không tìm thấy mã xác thực (code/token) trong phản hồi chuyển hướng.',
        };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return {
          success: false,
          error:
            'Trình duyệt xác thực đã bị đóng hoặc ứng dụng không nhận được URL chuyển hướng. Vui lòng kiểm tra lại cấu hình Redirect URLs trong Supabase.',
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[Google Auth] Ngoại lệ signInWithGoogle:', err);
      return { success: false, error: err.message || 'Lỗi không xác định khi đăng nhập Google.' };
    }
  },

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi đăng nhập bằng email.' };
    }
  },

  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; session?: any; error?: string; needConfirmation?: boolean }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        return { success: true, session: data.session };
      } else if (data.user) {
        return { success: true, needConfirmation: true };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi đăng ký tài khoản.' };
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Lỗi lấy profile:', error.message);
      return null;
    }
    return data;
  },
};
