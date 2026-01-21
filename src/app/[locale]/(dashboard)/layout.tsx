"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { AppLayout } from "@/components/layouts/app-layout";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
