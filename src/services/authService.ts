import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Profile } from '../types/auth';
import { getAuthErrorMessage } from '../utils/errorUtils';

WebBrowser.maybeCompleteAuthSession();

export type AuthResult = {
  success: boolean;
  error?: string;
  errorCode?: string;
  session?: Session | null;
  needConfirmation?: boolean;
};

const exchangedCodes = new Set<string>();

function authFailure(error: { message?: string; code?: string } | null | undefined): AuthResult {
  return {
    success: false,
    error: getAuthErrorMessage(error),
    errorCode: error?.code,
  };
}

export function getAuthRedirectUrl(): string {
  return AuthSession.makeRedirectUri({
    path: 'auth/callback',
  });
}

function extractParamsFromUrl(urlString: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!urlString) return params;

  try {
    const questionIndex = urlString.indexOf('?');
    const hashIndex = urlString.indexOf('#');

    if (questionIndex !== -1) {
      const search =
        hashIndex !== -1 && hashIndex > questionIndex
          ? urlString.substring(questionIndex + 1, hashIndex)
          : urlString.substring(questionIndex + 1);
      new URLSearchParams(search).forEach((v, k) => {
        params[k] = v;
      });
    }

    if (hashIndex !== -1) {
      const hash = urlString.substring(hashIndex + 1);
      new URLSearchParams(hash).forEach((v, k) => {
        params[k] = v;
      });
    }
  } catch (e) {
    console.warn('[Auth] Lỗi trích xuất params từ URL:', e);
  }

  return params;
}

export function isAuthCallbackUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('auth/callback') ||
    url.includes('access_token=') ||
    url.includes('code=') ||
    url.includes('error_description=')
  );
}

export const authService = {
  async completeSessionFromUrl(url: string, flowId?: string | null): Promise<AuthResult> {
    const params = extractParamsFromUrl(url);

    if (params.error || params.error_description) {
      const raw = decodeURIComponent(params.error_description || params.error || 'Xác thực bị từ chối.');
      return authFailure({ message: raw, code: params.error });
    }

    if (params.code) {
      if (exchangedCodes.has(params.code)) {
        const session = await this.getCurrentSession();
        return session
          ? { success: true, session }
          : { success: false, error: 'Mã xác thực đã được dùng. Hãy thử đăng nhập lại.' };
      }
      exchangedCodes.add(params.code);

      const { data, error } = await supabase.auth.exchangeCodeForSession(
        params.code,
        flowId ? { flowId } : undefined
      );
      if (error) {
        const session = await this.getCurrentSession();
        if (session) return { success: true, session };
        return authFailure(error);
      }
      return { success: true, session: data.session };
    }

    if (params.access_token && params.refresh_token) {
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error) return authFailure(error);
      return { success: true, session: data.session };
    }

    return {
      success: false,
      error: 'Không tìm thấy mã xác thực trong đường dẫn chuyển hướng.',
    };
  },

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const redirectUrl = getAuthRedirectUrl();
      console.log('[Google Auth] Redirect URI đang dùng:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('[Google Auth] Lỗi signInWithOAuth:', error);
        return authFailure(error);
      }

      if (!data?.url) {
        return { success: false, error: 'Không thể tạo liên kết đăng nhập Google từ Supabase.' };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
        showInRecents: false,
      });
      console.log('[Google Auth] Kết quả WebBrowser:', result.type);

      if (result.type === 'success' && result.url) {
        return await this.completeSessionFromUrl(result.url, data.flowId);
      }

      const existing = await this.getCurrentSession();
      if (existing) {
        return { success: true, session: existing };
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return {
          success: false,
          error:
            'Trình duyệt xác thực đã đóng trước khi đăng nhập xong. Nếu bạn vừa chọn tài khoản Google, hãy thử lại.',
        };
      }

      return { success: false, error: 'Đăng nhập Google chưa hoàn tất.' };
    } catch (err: any) {
      console.error('[Google Auth] Ngoại lệ signInWithGoogle:', err);
      return { success: false, error: err.message || 'Lỗi không xác định khi đăng nhập Google.' };
    }
  },

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return authFailure(error);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi đăng nhập bằng email.' };
    }
  },

  async signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) return authFailure(error);

      if (data.session) {
        return { success: true, session: data.session };
      }
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'Email này đã có tài khoản. Hãy chuyển sang Đăng nhập.',
          errorCode: 'email_exists',
        };
      }
      if (data.user) {
        return { success: true, needConfirmation: true };
      }

      return { success: true, needConfirmation: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi đăng ký tài khoản.' };
    }
  },

  async resendSignupEmail(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: getAuthRedirectUrl() },
      });
      if (error) return authFailure(error);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không gửi lại được email xác nhận.' };
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
