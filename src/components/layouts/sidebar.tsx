"use client";

import { Button } from "@/components/ui/button";
import menuItems from "@/constants/menuData";
import {
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleCollapsed = () => onCollapsedChange(!collapsed);

  // Lấy thông tin user khi component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await authService.getCurrentUser();
      setUser(data);
    };

    fetchUser();

    // Lắng nghe sự thay đổi auth state
    const { data: authListener } = authService.onAuthStateChange(
      (currentUser) => {
        setUser(currentUser);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await authService.signOut();

    if (!error) {
      router.push("/login");
    } else {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 h-16 ${
              collapsed ? "px-2 justify-center" : "px-4 justify-between"
            }`}
          >
            {!collapsed && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-white">
                  <Wallet />
                </div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Alex Finance
                </h1>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="hidden lg:flex cursor-pointer"
              >
                {collapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* <Separator /> */}

          {/* Navigation */}
          <nav
            className={`flex-1 overflow-y-auto ${collapsed ? "p-2" : "p-4"}`}
          >
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        collapsed ? "justify-center px-2" : ""
                      } ${
                        isActive
                          ? "bg-zinc-100 dark:bg-zinc-800"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                      title={collapsed ? t(item.label) : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{t(item.label)}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          {user && (
            <div
              className={`border-t border-zinc-200 dark:border-zinc-800 ${
                collapsed ? "p-2" : "p-4"
              }`}
            >
              {collapsed ? (
                // Collapsed view - just icons
                <div className="flex flex-col gap-2">
                  <div
                    className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary"
                    title={user.email || "User"}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-zinc-700 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    title={tAuth("logout")}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // Expanded view
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                        {user.user_metadata?.name || "User"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full justify-start gap-2 text-zinc-700 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800"
                  >
                    <LogOut className="h-4 w-4" />
                    {tAuth("logout")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
