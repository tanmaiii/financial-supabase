import { LucideIcon } from "lucide-react";

// Database model (from service)
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

// UI Display model
export interface FixedExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_billing_date: string;
  status: "active" | "inactive";
  payment_status: "paid" | "unpaid";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  categoryId?: string;
  accountId?: string;
  note?: string;
}

// Form data for create/update
export interface FixedExpenseFormData {
  name: string;
  category_id: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_occurrence: string;
  is_active: boolean;
  account_id?: string;
  note?: string;
}
