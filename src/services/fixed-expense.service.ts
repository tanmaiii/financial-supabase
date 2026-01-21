import { createClient } from "@/lib/supabase/client";

export interface FixedExpenseFilters {
  search?: string;
  status?: "active" | "inactive";
  payment_status?: "paid" | "unpaid";
}

export interface FixedExpenseFromDB {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  account_id: string | null;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  auto_create: boolean;
  is_active: boolean;
  payment_status: "paid" | "unpaid";
  note: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  categories?: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
    color: string | null;
  };
  account?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

class FixedExpenseService {
  private supabase = createClient();

  /**
   * Lấy danh sách fixed expenses (recurring transactions)
   */
  async getFixedExpenses(filters?: FixedExpenseFilters) {
    try {
      let query = this.supabase
        .from("recurring_transactions")
        .select(
          `
          *,
          categories:category_id(id, name, type, icon, color),
          account:account_id(id, name, type)
        `,
        )
        .eq("type", "expense") // Chỉ lấy expenses
        .order("next_occurrence", { ascending: true });

      // Apply filters
      if (filters) {
        if (filters.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }

        if (filters.status) {
          query = query.eq("is_active", filters.status === "active");
        }

        if (filters.payment_status) {
          query = query.eq("payment_status", filters.payment_status);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching fixed expenses:", error);
        throw error;
      }

      return data as FixedExpenseFromDB[];
    } catch (error) {
      console.error("Error in getFixedExpenses:", error);
      throw error;
    }
  }

  /**
   * Tự động reset payment status nếu đã qua ngày thanh toán
   * và tính toán next_occurrence tiếp theo dựa trên frequency
   */
  async autoResetExpiredPayments() {
    try {
      const { data, error } = await this.supabase
        .from("recurring_transactions")
        .select("*")
        .eq("type", "expense")
        .eq("payment_status", "paid")
        .lt("next_occurrence", new Date().toISOString().split("T")[0]);

      if (error) {
        console.error("Error fetching expired payments:", error);
        return;
      }

      if (!data || data.length === 0) return;

      // Update each expired payment
      for (const expense of data) {
        const nextDate = this.calculateNextOccurrence(
          expense.next_occurrence,
          expense.frequency,
        );

        await this.updateFixedExpense(expense.id, {
          payment_status: "unpaid",
          next_occurrence: nextDate,
        });
      }

      console.log(`Auto-reset ${data.length} expired payments`);
    } catch (error) {
      console.error("Error in autoResetExpiredPayments:", error);
    }
  }

  /**
   * Tính toán next_occurrence dựa trên frequency
   */
  private calculateNextOccurrence(
    currentDate: string,
    frequency: "daily" | "weekly" | "monthly" | "yearly",
  ): string {
    const date = new Date(currentDate);

    switch (frequency) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.toISOString().split("T")[0];
  }

  /**
   * Lấy fixed expense theo ID
   */
  async getFixedExpenseById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("recurring_transactions")
        .select(
          `
          *,
          categories:category_id(id, name, type, icon, color),
          account:account_id(id, name, type)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching fixed expense:", error);
        throw error;
      }

      return data as FixedExpenseFromDB;
    } catch (error) {
      console.error("Error in getFixedExpenseById:", error);
      throw error;
    }
  }

  /**
   * Tạo fixed expense mới
   */
  async createFixedExpense(data: {
    name: string;
    amount: number;
    category_id: string;
    account_id?: string;
    frequency?: "daily" | "weekly" | "monthly" | "yearly";
    start_date: string;
    next_occurrence: string;
    is_active?: boolean;
    note?: string;
  }) {
    try {
      const { data: userData } = await this.supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Prepare insert data with proper formatting
      const insertData = {
        user_id: userData.user.id,
        name: data.name,
        amount: data.amount,
        type: "expense" as const,
        category_id: data.category_id,
        account_id: data.account_id || null,
        frequency: data.frequency || "monthly",
        start_date: data.start_date, // Already in YYYY-MM-DD format
        next_occurrence: data.next_occurrence, // Already in YYYY-MM-DD format
        auto_create: false,
        is_active: data.is_active ?? true,
        payment_status: "unpaid" as const,
        note: data.note || null,
      };

      console.log("Creating fixed expense with data:", insertData);

      const { data: newExpense, error } = await this.supabase
        .from("recurring_transactions")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Error creating fixed expense:", error);
        throw error;
      }

      return newExpense;
    } catch (error) {
      console.error("Error in createFixedExpense:", error);
      throw error;
    }
  }

  /**
   * Cập nhật fixed expense
   */
  async updateFixedExpense(
    id: string,
    data: {
      name?: string;
      amount?: number;
      category_id?: string;
      account_id?: string;
      frequency?: "daily" | "weekly" | "monthly" | "yearly";
      next_occurrence?: string;
      is_active?: boolean;
      payment_status?: "paid" | "unpaid";
      note?: string;
    },
  ) {
    try {
      const { data: updated, error } = await this.supabase
        .from("recurring_transactions")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating fixed expense:", error);
        throw error;
      }

      return updated;
    } catch (error) {
      console.error("Error in updateFixedExpense:", error);
      throw error;
    }
  }

  /**
   * Xóa fixed expense
   */
  async deleteFixedExpense(id: string) {
    try {
      const { error } = await this.supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting fixed expense:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteFixedExpense:", error);
      throw error;
    }
  }

  /**
   * Toggle payment status
   * Khi chuyển sang "paid": tạo transaction thực sự VÀ cập nhật next_occurrence
   * Khi chuyển sang "unpaid": xóa transaction đã tạo
   */
  async togglePaymentStatus(id: string, currentStatus: "paid" | "unpaid") {
    try {
      const newStatus = currentStatus === "paid" ? "unpaid" : "paid";

      // Lấy thông tin chi tiết của fixed expense
      const fixedExpense = await this.getFixedExpenseById(id);

      if (!fixedExpense) {
        throw new Error("Fixed expense not found");
      }

      // Nếu chuyển sang "paid", tạo transaction
      if (newStatus === "paid") {
        const { data: userData } = await this.supabase.auth.getUser();

        if (!userData.user) {
          throw new Error("User not authenticated");
        }

        // Tạo transaction với ngày next_occurrence
        const { error: transactionError } = await this.supabase
          .from("transactions")
          .insert([
            {
              amount: fixedExpense.amount,
              type: fixedExpense.type,
              category_id: fixedExpense.category_id,
              account_id: fixedExpense.account_id,
              note: `${fixedExpense.name} - Thanh toán định kỳ`,
              transaction_date: fixedExpense.next_occurrence,
              recurring_transaction_id: fixedExpense.id,
              user_id: userData.user.id,
            },
          ]);

        if (transactionError) {
          console.error("Error creating transaction:", transactionError);
          throw transactionError;
        }

        // Tính next_occurrence tiếp theo dựa trên frequency
        const nextDate = this.calculateNextOccurrence(
          fixedExpense.next_occurrence,
          fixedExpense.frequency,
        );

        // Cập nhật payment status và next_occurrence
        return this.updateFixedExpense(id, {
          payment_status: newStatus,
          next_occurrence: nextDate,
        });
      } else {
        // Nếu chuyển sang "unpaid", xóa transaction đã tạo
        const { error: deleteError } = await this.supabase
          .from("transactions")
          .delete()
          .eq("recurring_transaction_id", id);

        if (deleteError) {
          console.error("Error deleting transaction:", deleteError);
          throw deleteError;
        }

        // Chỉ cập nhật payment status
        return this.updateFixedExpense(id, { payment_status: newStatus });
      }
    } catch (error) {
      console.error("Error in togglePaymentStatus:", error);
      throw error;
    }
  }

  /**
   * Toggle active status
   */
  async toggleActiveStatus(id: string, currentStatus: boolean) {
    return this.updateFixedExpense(id, { is_active: !currentStatus });
  }
}

export const fixedExpenseService = new FixedExpenseService();
