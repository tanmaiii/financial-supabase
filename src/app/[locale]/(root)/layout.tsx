"use client";

import { AppLayout } from "@/components/layouts/app-layout";
import { AuthProvider } from "@/contexts/auth-context";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
