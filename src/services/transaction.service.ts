import { createClient } from "@/lib/supabase/client";

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: "income" | "expense" | "transfer";
  search?: string;
}

export interface TransactionFromDB {
  id: string;
  user_id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category_id: string | null;
  account_id: string | null;
  note: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  // Relations
  categories?: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
    color: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

class TransactionService {
  private supabase = createClient();

  /**
   * Lấy danh sách transactions với filters
   */
  async getTransactions(filters?: TransactionFilters) {
    try {
      let query = this.supabase
        .from("transactions")
        .select(
          `
          *,
          categories:category_id(id, name, type, icon, color),
          account:account_id(id, name, type)
        `
        )
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters) {
        // Filter by date range
        if (filters.dateFrom) {
          query = query.gte("transaction_date", filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte("transaction_date", filters.dateTo);
        }

        // Filter by category
        if (filters.categoryId) {
          query = query.eq("category_id", filters.categoryId);
        }

        // Filter by account (from or to)
        if (filters.accountId) {
          query = query.eq("account_id", filters.accountId);
        }

        // Filter by amount range
        if (filters.minAmount !== undefined) {
          query = query.gte("amount", filters.minAmount);
        }
        if (filters.maxAmount !== undefined) {
          query = query.lte("amount", filters.maxAmount);
        }

        // Filter by type
        if (filters.type) {
          query = query.eq("type", filters.type);
        }

        // Filter by search (note or description)
        if (filters.search) {
          query = query.ilike("note", `%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return data as TransactionFromDB[];
    } catch (error) {
      console.error("Error in getTransactions:", error);
      throw error;
    }
  }

  /**
   * Lấy tổng số transactions theo filters
   */
  async getTransactionCount(filters?: TransactionFilters) {
    try {
      let query = this.supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      // Apply same filters as getTransactions
      if (filters) {
        if (filters.dateFrom) {
          query = query.gte("transaction_date", filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte("transaction_date", filters.dateTo);
        }
        if (filters.categoryId) {
          query = query.eq("category_id", filters.categoryId);
        }
        if (filters.accountId) {
          query = query.or(
            `from_account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`
          );
        }
        if (filters.minAmount !== undefined) {
          query = query.gte("amount", filters.minAmount);
        }
        if (filters.maxAmount !== undefined) {
          query = query.lte("amount", filters.maxAmount);
        }
        if (filters.type) {
          query = query.eq("type", filters.type);
        }
        if (filters.search) {
          query = query.ilike("note", `%${filters.search}%`);
        }
      }

      const { count, error } = await query;

      if (error) {
        console.error("Error counting transactions:", error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getTransactionCount:", error);
      throw error;
    }
  }

  /**
   * Lấy transaction theo ID
   */
  async getTransactionById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("transactions")
        .select(
          `
          *,
          categories:category_id(id, name, type, icon, color),
          account:account_id(id, name, type)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        throw error;
      }

      return data as TransactionFromDB;
    } catch (error) {
      console.error("Error in getTransactionById:", error);
      throw error;
    }
  }

  /**
   * Xóa transactions
   */
  async deleteTransactions(ids: string[]) {
    try {
      const { error } = await this.supabase
        .from("transactions")
        .delete()
        .in("id", ids);

      if (error) {
        console.error("Error deleting transactions:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteTransactions:", error);
      throw error;
    }
  }

  /**
   * Update category cho nhiều transactions
   */
  async updateTransactionsCategory(ids: string[], categoryId: string) {
    try {
      const { error } = await this.supabase
        .from("transactions")
        .update({ category_id: categoryId })
        .in("id", ids);

      if (error) {
        console.error("Error updating transactions:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in updateTransactionsCategory:", error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
