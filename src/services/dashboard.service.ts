import { createClient } from "@/lib/supabase/client";
import { TransactionFromDB } from "./transaction.service";

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  incomeChange: number; // Percentage change from last month
  expenseChange: number; // Percentage change from last month
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategorySpending {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

class DashboardService {
  private supabase = createClient();

  /**
   * Tính tổng balance từ transactions và savings funds
   * Balance = (Tổng thu nhập - Tổng chi phí) - Tổng số tiền trong quỹ tiết kiệm
   */
  async getTotalBalance(): Promise<number> {
    try {
      // Lấy tất cả transactions
      const { data: transactions, error: transError } = await this.supabase
        .from("transactions")
        .select("amount, type");

      if (transError) {
        console.error("Error fetching transactions for balance:", transError);
        return 0;
      }

      // Tính tổng thu nhập
      const totalIncome =
        transactions
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      // Tính tổng chi phí
      const totalExpenses =
        transactions
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      // Lấy tổng số tiền trong các quỹ tiết kiệm
      const { data: savingFunds, error: savingsError } = await this.supabase
        .from("saving_funds")
        .select("current_amount");

      if (savingsError) {
        console.error("Error fetching saving funds for balance:", savingsError);
      }

      const totalSavings =
        savingFunds?.reduce(
          (sum, fund) => sum + (fund.current_amount || 0),
          0,
        ) || 0;

      // Balance = Thu nhập - Chi phí - Tiết kiệm
      return totalIncome - totalExpenses - totalSavings;
    } catch (error) {
      console.error("Error in getTotalBalance:", error);
      return 0;
    }
  }

  /**
   * Lấy tổng income/expenses cho tháng hiện tại
   */
  async getCurrentMonthStats(): Promise<{
    income: number;
    expenses: number;
  }> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const dateFrom = firstDayOfMonth.toISOString().split("T")[0];
      const dateTo = lastDayOfMonth.toISOString().split("T")[0];

      const { data, error } = await this.supabase
        .from("transactions")
        .select("amount, type")
        .gte("transaction_date", dateFrom)
        .lte("transaction_date", dateTo);

      if (error) {
        console.error("Error fetching current month stats:", error);
        return { income: 0, expenses: 0 };
      }

      const income =
        data
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      const expenses =
        data
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      return { income, expenses };
    } catch (error) {
      console.error("Error in getCurrentMonthStats:", error);
      return { income: 0, expenses: 0 };
    }
  }

  /**
   * Lấy stats của tháng trước để so sánh
   */
  async getLastMonthStats(): Promise<{
    income: number;
    expenses: number;
  }> {
    try {
      const now = new Date();
      const firstDayOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const dateFrom = firstDayOfLastMonth.toISOString().split("T")[0];
      const dateTo = lastDayOfLastMonth.toISOString().split("T")[0];

      const { data, error } = await this.supabase
        .from("transactions")
        .select("amount, type")
        .gte("transaction_date", dateFrom)
        .lte("transaction_date", dateTo);

      if (error) {
        console.error("Error fetching last month stats:", error);
        return { income: 0, expenses: 0 };
      }

      const income =
        data
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      const expenses =
        data
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0) || 0;

      return { income, expenses };
    } catch (error) {
      console.error("Error in getLastMonthStats:", error);
      return { income: 0, expenses: 0 };
    }
  }

  /**
   * Tính phần trăm thay đổi
   */
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Lấy dashboard stats tổng hợp
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [totalBalance, currentMonth, lastMonth] = await Promise.all([
        this.getTotalBalance(),
        this.getCurrentMonthStats(),
        this.getLastMonthStats(),
      ]);

      const incomeChange = this.calculatePercentageChange(
        currentMonth.income,
        lastMonth.income,
      );

      const expenseChange = this.calculatePercentageChange(
        currentMonth.expenses,
        lastMonth.expenses,
      );

      return {
        totalBalance,
        monthlyIncome: currentMonth.income,
        monthlyExpenses: currentMonth.expenses,
        incomeChange,
        expenseChange,
      };
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        incomeChange: 0,
        expenseChange: 0,
      };
    }
  }

  /**
   * Lấy dữ liệu 6 tháng gần nhất cho chart
   */
  async getLast6MonthsData(): Promise<MonthlyData[]> {
    try {
      const months: MonthlyData[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const dateFrom = firstDay.toISOString().split("T")[0];
        const dateTo = lastDay.toISOString().split("T")[0];

        const { data, error } = await this.supabase
          .from("transactions")
          .select("amount, type")
          .gte("transaction_date", dateFrom)
          .lte("transaction_date", dateTo);

        if (error) {
          console.error(`Error fetching data for month ${i}:`, error);
          continue;
        }

        const income =
          data
            ?.filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0) || 0;

        const expenses =
          data
            ?.filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0) || 0;

        months.push({
          month: date
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase(),
          income,
          expenses,
        });
      }

      return months;
    } catch (error) {
      console.error("Error in getLast6MonthsData:", error);
      return [];
    }
  }

  /**
   * Lấy spending by category cho tháng hiện tại
   */
  async getCurrentMonthCategorySpending(): Promise<CategorySpending[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const dateFrom = firstDayOfMonth.toISOString().split("T")[0];
      const dateTo = lastDayOfMonth.toISOString().split("T")[0];

      const { data, error } = await this.supabase
        .from("transactions")
        .select(
          `
          amount,
          type,
          categories:category_id(id, name, color)
        `,
        )
        .eq("type", "expense")
        .gte("transaction_date", dateFrom)
        .lte("transaction_date", dateTo);

      if (error) {
        console.error("Error fetching category spending:", error);
        return [];
      }

      // Group by category
      const categoryMap = new Map<string, { amount: number; color?: string }>();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.forEach((transaction: any) => {
        const categoryName = transaction.categories?.name || "Uncategorized";
        const categoryColor = transaction.categories?.color;
        const current = categoryMap.get(categoryName) || {
          amount: 0,
          color: categoryColor,
        };
        categoryMap.set(categoryName, {
          amount: current.amount + transaction.amount,
          color: categoryColor,
        });
      });

      // Calculate total for percentages
      const total = Array.from(categoryMap.values()).reduce(
        (sum, cat) => sum + cat.amount,
        0,
      );

      // Convert to array and calculate percentages
      const categories: CategorySpending[] = Array.from(categoryMap.entries())
        .map(([name, data]) => ({
          name,
          value: data.amount,
          percentage: total > 0 ? (data.amount / total) * 100 : 0,
          color: data.color || undefined,
        }))
        .sort((a, b) => b.value - a.value); // Sort by amount descending

      return categories;
    } catch (error) {
      console.error("Error in getCurrentMonthCategorySpending:", error);
      return [];
    }
  }

  /**
   * Lấy recent transactions (5 giao dịch gần nhất)
   */
  async getRecentTransactions(limit: number = 5): Promise<TransactionFromDB[]> {
    try {
      const { data, error } = await this.supabase
        .from("transactions")
        .select(
          `
          *,
          categories:category_id(id, name, type, icon, color),
          account:account_id(id, name, type)
        `,
        )
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent transactions:", error);
        return [];
      }

      return data as TransactionFromDB[];
    } catch (error) {
      console.error("Error in getRecentTransactions:", error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
