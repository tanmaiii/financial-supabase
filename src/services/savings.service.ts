import { createClient } from "@/lib/supabase/client";

export interface SavingFund {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  account_id: string | null;
  icon: string | null;
  color: string | null;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface SavingContribution {
  id: string;
  saving_fund_id: string;
  transaction_id: string | null;
  amount: number;
  contribution_date: string;
  note: string | null;
  user_id: string;
  created_at: string;
}

export interface CreateSavingFundInput {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
  account_id?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateSavingFundInput {
  name?: string;
  target_amount?: number;
  deadline?: string;
  account_id?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface CreateContributionInput {
  saving_fund_id: string;
  amount: number;
  contribution_date?: string;
  note?: string;
  transaction_id?: string;
}

class SavingsService {
  private supabase = createClient();

  /**
   * Lấy tất cả saving funds của user
   */
  async getSavingFunds() {
    try {
      const { data, error } = await this.supabase
        .from("saving_funds")
        .select(
          `
          *,
          account:account_id(id, name, type)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saving funds:", error);
        throw error;
      }

      return data as SavingFund[];
    } catch (error) {
      console.error("Error in getSavingFunds:", error);
      throw error;
    }
  }

  /**
   * Lấy saving fund theo ID
   */
  async getSavingFundById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("saving_funds")
        .select(
          `
          *,
          account:account_id(id, name, type)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching saving fund:", error);
        throw error;
      }

      return data as SavingFund;
    } catch (error) {
      console.error("Error in getSavingFundById:", error);
      throw error;
    }
  }

  /**
   * Tạo mới saving fund
   */
  async createSavingFund(input: CreateSavingFundInput) {
    try {
      const { data: userData } = await this.supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // Sanitize input - convert empty strings to null
      const sanitizedInput = {
        name: input.name,
        target_amount: input.target_amount,
        current_amount: input.current_amount || 0,
        deadline:
          input.deadline && input.deadline.trim() !== ""
            ? input.deadline
            : null,
        account_id: input.account_id || null,
        icon: input.icon || null,
        color: input.color || null,
        description:
          input.description && input.description.trim() !== ""
            ? input.description
            : null,
        user_id: userData.user.id,
      };

      console.log("Creating saving fund with data:", sanitizedInput);

      const { data, error } = await this.supabase
        .from("saving_funds")
        .insert(sanitizedInput)
        .select()
        .single();

      if (error) {
        console.error("Error creating saving fund:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      return data as SavingFund;
    } catch (error) {
      console.error("Error in createSavingFund:", error);
      throw error;
    }
  }

  /**
   * Cập nhật saving fund
   */
  async updateSavingFund(id: string, input: UpdateSavingFundInput) {
    try {
      const { data, error } = await this.supabase
        .from("saving_funds")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating saving fund:", error);
        throw error;
      }

      return data as SavingFund;
    } catch (error) {
      console.error("Error in updateSavingFund:", error);
      throw error;
    }
  }

  /**
   * Xóa saving fund
   */
  async deleteSavingFund(id: string) {
    try {
      const { error } = await this.supabase
        .from("saving_funds")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting saving fund:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteSavingFund:", error);
      throw error;
    }
  }

  /**
   * Thêm tiền vào saving fund
   */
  async addContribution(input: CreateContributionInput) {
    try {
      const { data: userData } = await this.supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      // 1. Tạo contribution record
      const { data: contribution, error: contributionError } =
        await this.supabase
          .from("saving_contributions")
          .insert({
            ...input,
            contribution_date:
              input.contribution_date || new Date().toISOString(),
            user_id: userData.user.id,
          })
          .select()
          .single();

      if (contributionError) {
        console.error("Error creating contribution:", contributionError);
        throw contributionError;
      }

      // 2. Cập nhật current_amount của saving fund
      const { data: savingFund, error: fundError } = await this.supabase
        .from("saving_funds")
        .select("current_amount")
        .eq("id", input.saving_fund_id)
        .single();

      if (fundError) {
        console.error("Error fetching saving fund:", fundError);
        throw fundError;
      }

      const newAmount = (savingFund.current_amount || 0) + input.amount;

      const { error: updateError } = await this.supabase
        .from("saving_funds")
        .update({
          current_amount: newAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.saving_fund_id);

      if (updateError) {
        console.error("Error updating saving fund amount:", updateError);
        throw updateError;
      }

      return contribution as SavingContribution;
    } catch (error) {
      console.error("Error in addContribution:", error);
      throw error;
    }
  }

  /**
   * Lấy contributions của một saving fund
   */
  async getContributions(savingFundId: string) {
    try {
      const { data, error } = await this.supabase
        .from("saving_contributions")
        .select("*")
        .eq("saving_fund_id", savingFundId)
        .order("contribution_date", { ascending: false });

      if (error) {
        console.error("Error fetching contributions:", error);
        throw error;
      }

      return data as SavingContribution[];
    } catch (error) {
      console.error("Error in getContributions:", error);
      throw error;
    }
  }

  /**
   * Lấy thống kê savings
   */
  async getSavingsStats() {
    try {
      const funds = await this.getSavingFunds();

      const totalSaved = funds.reduce(
        (sum, fund) => sum + (fund.current_amount || 0),
        0,
      );
      const totalTarget = funds.reduce(
        (sum, fund) => sum + fund.target_amount,
        0,
      );
      const completedGoals = funds.filter(
        (fund) => fund.current_amount >= fund.target_amount,
      ).length;
      const activeGoals = funds.filter(
        (fund) => fund.current_amount < fund.target_amount,
      ).length;

      return {
        totalSaved,
        totalTarget,
        completedGoals,
        activeGoals,
        totalGoals: funds.length,
      };
    } catch (error) {
      console.error("Error in getSavingsStats:", error);
      throw error;
    }
  }
}

export const savingsService = new SavingsService();
