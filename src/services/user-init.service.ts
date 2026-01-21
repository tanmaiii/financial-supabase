import { createClient } from "@/lib/supabase/client";

interface DefaultCategory {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

interface DefaultAccount {
  name: string;
  type: string;
  balance: number;
  currency: string;
}

class UserInitService {
  private supabase = createClient();

  /**
   * Danh sách categories mặc định
   */
  private defaultCategories: DefaultCategory[] = [
    // Income categories
    {
      name: "Salary",
      type: "income",
      icon: "💼",
      color: "#10b981",
    },
    {
      name: "Freelance",
      type: "income",
      icon: "💻",
      color: "#3b82f6",
    },
    {
      name: "Investment",
      type: "income",
      icon: "📈",
      color: "#8b5cf6",
    },
    {
      name: "Gift",
      type: "income",
      icon: "🎁",
      color: "#ec4899",
    },
    {
      name: "Other Income",
      type: "income",
      icon: "💰",
      color: "#06b6d4",
    },
    // Expense categories
    {
      name: "Food & Dining",
      type: "expense",
      icon: "🍔",
      color: "#f59e0b",
    },
    {
      name: "Transportation",
      type: "expense",
      icon: "🚗",
      color: "#ef4444",
    },
    {
      name: "Shopping",
      type: "expense",
      icon: "🛍️",
      color: "#ec4899",
    },
    {
      name: "Entertainment",
      type: "expense",
      icon: "🎬",
      color: "#8b5cf6",
    },
    {
      name: "Bills & Utilities",
      type: "expense",
      icon: "📄",
      color: "#06b6d4",
    },
    {
      name: "Healthcare",
      type: "expense",
      icon: "🏥",
      color: "#10b981",
    },
    {
      name: "Education",
      type: "expense",
      icon: "📚",
      color: "#3b82f6",
    },
    {
      name: "Housing",
      type: "expense",
      icon: "🏠",
      color: "#6366f1",
    },
    {
      name: "Other Expense",
      type: "expense",
      icon: "💸",
      color: "#64748b",
    },
  ];

  /**
   * Danh sách accounts mặc định
   */
  private defaultAccounts: DefaultAccount[] = [
    {
      name: "Cash",
      type: "cash",
      balance: 0,
      currency: "VND",
    },
    {
      name: "Bank Account",
      type: "bank",
      balance: 0,
      currency: "VND",
    },
    {
      name: "Credit Card",
      type: "credit_card",
      balance: 0,
      currency: "VND",
    },
  ];

  /**
   * Kiểm tra xem user đã có dữ liệu khởi tạo chưa
   */
  async checkUserInitialized(userId: string): Promise<boolean> {
    try {
      console.log("[UserInit] Checking if user is initialized:", userId);

      // Kiểm tra xem user đã có categories chưa
      const { data: categories, error: categoriesError } = await this.supabase
        .from("categories")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (categoriesError) {
        console.error("[UserInit] Error checking categories:", categoriesError);
        return false;
      }

      const isInitialized = (categories?.length || 0) > 0;
      console.log(
        "[UserInit] User initialized:",
        isInitialized,
        "- Categories found:",
        categories?.length || 0,
      );

      return isInitialized;
    } catch (error) {
      console.error("[UserInit] Error in checkUserInitialized:", error);
      return false;
    }
  }

  /**
   * Tạo categories mặc định cho user
   */
  async createDefaultCategories(userId: string) {
    try {
      console.log("[UserInit] Creating default categories for user:", userId);

      const categoriesToInsert = this.defaultCategories.map((category) => ({
        user_id: userId,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
      }));

      console.log(
        "[UserInit] Categories to insert:",
        categoriesToInsert.length,
      );

      const { data, error } = await this.supabase
        .from("categories")
        .insert(categoriesToInsert)
        .select();

      if (error) {
        console.error(
          "[UserInit] ❌ Error creating default categories:",
          error,
        );
        console.error("[UserInit] Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log(
        `[UserInit] ✅ Created ${data?.length || 0} default categories for user ${userId}`,
      );
      return data;
    } catch (error) {
      console.error("[UserInit] Exception in createDefaultCategories:", error);
      throw error;
    }
  }

  /**
   * Tạo accounts mặc định cho user
   */
  async createDefaultAccounts(userId: string) {
    try {
      console.log("[UserInit] Creating default accounts for user:", userId);

      const accountsToInsert = this.defaultAccounts.map((account) => ({
        user_id: userId,
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
      }));

      console.log("[UserInit] Accounts to insert:", accountsToInsert.length);

      const { data, error } = await this.supabase
        .from("accounts")
        .insert(accountsToInsert)
        .select();

      if (error) {
        console.error("[UserInit] ❌ Error creating default accounts:", error);
        console.error("[UserInit] Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log(
        `[UserInit] ✅ Created ${data?.length || 0} default accounts for user ${userId}`,
      );
      return data;
    } catch (error) {
      console.error("[UserInit] Exception in createDefaultAccounts:", error);
      throw error;
    }
  }

  /**
   * Khởi tạo đầy đủ dữ liệu cho user mới
   * Returns true nếu đã khởi tạo, false nếu user đã có dữ liệu rồi
   */
  async initializeNewUser(userId: string): Promise<boolean> {
    try {
      console.log("[UserInit] 🚀 initializeNewUser called for:", userId);

      // Kiểm tra xem user đã được khởi tạo chưa
      const isInitialized = await this.checkUserInitialized(userId);

      if (isInitialized) {
        console.log(
          `[UserInit] ⏭️ User ${userId} already initialized - skipping`,
        );
        return false;
      }

      console.log(`[UserInit] 🔄 Initializing new user ${userId}...`);

      // Tạo categories và accounts song song
      const results = await Promise.allSettled([
        this.createDefaultCategories(userId),
        this.createDefaultAccounts(userId),
      ]);

      // Check results
      results.forEach((result, index) => {
        const type = index === 0 ? "categories" : "accounts";
        if (result.status === "rejected") {
          console.error(
            `[UserInit] ❌ Failed to create ${type}:`,
            result.reason,
          );
        } else {
          console.log(`[UserInit] ✅ Successfully created ${type}`);
        }
      });

      console.log(`[UserInit] 🎉 Successfully initialized user ${userId}`);
      return true;
    } catch (error) {
      console.error("[UserInit] ❌ Error in initializeNewUser:", error);
      if (error instanceof Error) {
        console.error("[UserInit] Error stack:", error.stack);
      }
      throw error;
    }
  }

  /**
   * Reset dữ liệu về mặc định (dùng cho testing hoặc reset)
   * ⚠️ Thận trọng: sẽ xóa TẤT CẢ dữ liệu của user
   */
  async resetUserData(userId: string) {
    try {
      // Xóa tất cả transactions
      await this.supabase.from("transactions").delete().eq("user_id", userId);

      // Xóa tất cả categories
      await this.supabase.from("categories").delete().eq("user_id", userId);

      // Xóa tất cả accounts
      await this.supabase.from("accounts").delete().eq("user_id", userId);

      // Tạo lại dữ liệu mặc định
      await this.initializeNewUser(userId);

      console.log(`Successfully reset user data for ${userId}`);
      return true;
    } catch (error) {
      console.error("Error in resetUserData:", error);
      throw error;
    }
  }
}

export const userInitService = new UserInitService();
