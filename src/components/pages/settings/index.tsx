"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Plus, Utensils, Landmark, Wallet } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTheme } from "next-themes";
import { CategoryManagementModal } from "./category-management-modal";
import { AccountManagementModal } from "./account-management-modal";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export default function Settings() {
  const t = useTranslations();
  const { user } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const supabase = createClient();

  // Fetch categories and accounts
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");

      if (categoriesError) throw categoriesError;

      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");

      if (accountsError) throw accountsError;

      setCategories(categoriesData || []);
      setAccounts(accountsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("settings.error_load"));
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase, t]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, fetchData]);

  const handleSaveCategory = async (category: Partial<Category>) => {
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success(t("settings.category_updated"));
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert({
          user_id: user?.id,
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
        });

        if (error) throw error;
        toast.success(t("settings.category_created"));
      }

      fetchData();
      setIsCategoryModalOpen(false);
      setEditingCategory(undefined);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(t("settings.error_save"));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
      toast.success(t("settings.category_deleted"));
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(t("settings.error_delete"));
    }
  };

  const handleSaveAccount = async (account: Partial<Account>) => {
    try {
      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from("accounts")
          .update({
            name: account.name,
            type: account.type,
            balance: account.balance,
            currency: account.currency,
          })
          .eq("id", editingAccount.id);

        if (error) throw error;
        toast.success(t("settings.account_updated"));
      } else {
        // Create new account
        const { error } = await supabase.from("accounts").insert({
          user_id: user?.id,
          name: account.name,
          type: account.type,
          balance: account.balance || 0,
          currency: account.currency || "VND",
        });

        if (error) throw error;
        toast.success(t("settings.account_created"));
      }

      fetchData();
      setIsAccountModalOpen(false);
      setEditingAccount(undefined);
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error(t("settings.error_save"));
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;
      toast.success(t("settings.account_deleted"));
      fetchData();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("settings.error_delete"));
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <Landmark className="w-5 h-5" />;
      case "cash":
        return <Wallet className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getAccountIconStyle = (type: string) => {
    switch (type) {
      case "bank":
        return {
          bg: "bg-purple-100",
          color: "text-purple-600",
        };
      case "cash":
        return {
          bg: "bg-teal-100",
          color: "text-teal-600",
        };
      default:
        return {
          bg: "bg-gray-100",
          color: "text-gray-600",
        };
    }
  };

  // Filter categories by type
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
            {t("nav.settings")} / {t("settings.breadcrumb")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
        </div>
      </div>

      {/* Account Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.account_preferences.title")}</CardTitle>
          <CardDescription>
            {t("settings.account_preferences.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">
                {t("settings.account_preferences.language")}
              </Label>
              <Select
                value={locale}
                onValueChange={(newLocale) => {
                  startTransition(() => {
                    router.replace(pathname, { locale: newLocale });
                  });
                }}
                disabled={isPending}
              >
                <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Theme Mode */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wide">
                {t("settings.account_preferences.theme_mode")}
              </Label>
              <div className="flex bg-muted/40 p-1 rounded-lg w-fit">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={`${
                    theme === "light"
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground"
                  } hover:bg-background hover:text-primary transition-all duration-200`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  {t("settings.account_preferences.light")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={`${
                    theme === "dark"
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground"
                  } hover:bg-background hover:text-primary transition-all duration-200`}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  {t("settings.account_preferences.dark")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.data_management.title")}</CardTitle>
          <CardDescription>
            {t("settings.data_management.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("settings.data_management.categories")}
                </h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary hover:bg-primary/10 gap-1"
                onClick={() => {
                  setEditingCategory(undefined);
                  setIsCategoryModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {t("settings.data_management.add_new")}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.loading")}...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => {
                      setEditingCategory(category);
                      setIsCategoryModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors group"
                  >
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{
                        backgroundColor: `${category.color}20`,
                      }}
                    >
                      <span className="text-xl">{category.icon}</span>
                    </div>
                    <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accounts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Landmark className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("settings.data_management.accounts")}
                </h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-primary hover:bg-primary/10 gap-1"
                onClick={() => {
                  setEditingAccount(undefined);
                  setIsAccountModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {t("settings.data_management.add_new")}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.loading")}...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {accounts.map((account) => {
                  const iconStyle = getAccountIconStyle(account.type);
                  return (
                    <div
                      key={account.id}
                      onClick={() => {
                        setEditingAccount(account);
                        setIsAccountModalOpen(true);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors group"
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${iconStyle.bg} ${iconStyle.color}`}
                      >
                        {getAccountIcon(account.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {account.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.type}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        category={editingCategory}
      />

      <AccountManagementModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(undefined);
        }}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        account={editingAccount}
      />
    </div>
  );
}
