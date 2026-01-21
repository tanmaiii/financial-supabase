import { createClient } from "@/lib/supabase/client";
import type { AuthError, User } from "@supabase/supabase-js";

export interface AuthResponse {
  data?: User | null;
  error?: AuthError | null;
  message?: string;
}

export class AuthService {
  private supabase = createClient();

  /**
   * Đăng ký tài khoản mới với email và password
   */
  async signUp(email: string, password: string, metadata?: { name?: string }) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return {
          data: null,
          error,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: data.user,
        error: null,
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        message: "Đã xảy ra lỗi trong quá trình đăng ký",
      };
    }
  }

  /**
   * Đăng nhập với email và password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          data: null,
          error,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: data.user,
        error: null,
        message: "Đăng nhập thành công!",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        message: "Đã xảy ra lỗi trong quá trình đăng nhập",
      };
    }
  }

  /**
   * Đăng nhập với Google OAuth
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          data: null,
          error,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: null,
        error: null,
        message: "Đang chuyển hướng đến Google...",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        message: "Đã xảy ra lỗi khi đăng nhập với Google",
      };
    }
  }

  /**
   * Đăng xuất
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          data: null,
          error,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: null,
        error: null,
        message: "Đăng xuất thành công!",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        message: "Đã xảy ra lỗi khi đăng xuất",
      };
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) {
        return {
          data: null,
          error,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: user,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        message: "Không thể lấy thông tin người dùng",
      };
    }
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          data: null,
          error,
          message: this.getErrorMessage(error),
        };
      }

      return {
        data: null,
        error: null,
        message:
          "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
        message: "Đã xảy ra lỗi khi đặt lại mật khẩu",
      };
    }
  }

  /**
   * Chuyển đổi error message sang tiếng Việt
   */
  private getErrorMessage(error: AuthError): string {
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Email hoặc mật khẩu không chính xác",
      "User already registered": "Email này đã được đăng ký",
      "Email not confirmed": "Email chưa được xác nhận",
      "Invalid email": "Email không hợp lệ",
      "Password should be at least 6 characters":
        "Mật khẩu phải có ít nhất 6 ký tự",
      "User not found": "Không tìm thấy người dùng",
      "Email rate limit exceeded":
        "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
    };

    return (
      errorMessages[error.message] ||
      error.message ||
      "Đã xảy ra lỗi không xác định"
    );
  }

  /**
   * Lắng nghe thay đổi trạng thái xác thực
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
