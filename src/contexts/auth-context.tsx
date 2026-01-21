"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { userInitService } from "@/services/user-init.service";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: boolean; message?: string }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { name?: string },
  ) => Promise<{ error: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ error: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      const { data } = await authService.getCurrentUser();
      setUser(data);

      // Khởi tạo user mới nếu cần
      if (data) {
        try {
          await userInitService.initializeNewUser(data.id);
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      }

      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (user) => {
      setUser(user);

      // Khởi tạo user mới khi đăng nhập
      if (user) {
        try {
          const initialized = await userInitService.initializeNewUser(user.id);
          if (initialized) {
            console.log("New user initialized with default data");
          }
        } catch (error) {
          console.error("Error initializing user on auth change:", error);
        }
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);

    if (result.error) {
      return { error: true, message: result.message };
    }

    setUser(result.data);

    // Khởi tạo dữ liệu cho user mới đăng nhập
    if (result.data) {
      try {
        await userInitService.initializeNewUser(result.data.id);
      } catch (error) {
        console.error("Error initializing user after sign in:", error);
      }
    }

    return { error: false, message: result.message };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string },
  ) => {
    const result = await authService.signUp(email, password, metadata);

    if (result.error) {
      return { error: true, message: result.message };
    }

    setUser(result.data);

    // Khởi tạo dữ liệu cho user mới đăng ký
    if (result.data) {
      try {
        await userInitService.initializeNewUser(result.data.id);
      } catch (error) {
        console.error("Error initializing user after sign up:", error);
      }
    }

    return { error: false, message: result.message };
  };

  const signInWithGoogle = async () => {
    const result = await authService.signInWithGoogle();

    if (result.error) {
      return { error: true, message: result.message };
    }

    return { error: false, message: result.message };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
