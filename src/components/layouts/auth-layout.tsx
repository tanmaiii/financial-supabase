"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Home, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative">
      {/* Home Button - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm lg:bg-white lg:text-zinc-900 lg:hover:bg-zinc-100"
            title="Về trang chủ"
          >
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 lg:py-12 bg-linear-to-r from-[#24999D] to-[#34d4da]">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white rounded-xl">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Alex Finance</h1>
            </div>
          </div>

          <div className="space-y-6 text-primary">
            <div className="">
              <h2 className="text-white text-4xl font-bold">
                Ghi chú và phân loại tất cả các khoản thu chi một cách dễ dàng
              </h2>
            </div>

            <div className="">
              <h3 className="text-white text-sm">
                Xem báo cáo chi tiết về thu nhập, chi tiêu và xu hướng tài chính
              </h3>
            </div>
          </div>
          <hr className="my-6" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white text-2xl font-bold">100k+</h3>
              <span className="text-sm text-white">Người dùng</span>
            </div>
            <div>
              <h3 className="text-white text-2xl font-bold">$2M+</h3>
              <span className="text-sm text-white">Doanh thu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                FinanceTracker
              </h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          </div>

          {children}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <Link
                href="/terms"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link
                href="/privacy"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Chính sách bảo mật
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
