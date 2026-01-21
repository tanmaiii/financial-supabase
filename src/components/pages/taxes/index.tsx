"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCategoryIcon,
  getCategoryIconStyle,
} from "@/lib/utils/category-icons";
import { fixedExpenseService } from "@/services/fixed-expense.service";
import { Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AddEditFixedExpenseModal from "./fixed-expenses/add-edit-modal";
import ExpenseList from "./fixed-expenses/expense-list";
import ExpenseSummary from "./fixed-expenses/expense-summary";
import { FixedExpense, FixedExpenseFormData } from "./fixed-expenses/types";

export default function FixedExpenses() {
  const t = useTranslations("fixed_expenses");
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<
    (FixedExpenseFormData & { id: string }) | undefined
  >();
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from database
  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);

      // Auto-reset expired payments first
      await fixedExpenseService.autoResetExpiredPayments();

      const data = await fixedExpenseService.getFixedExpenses();

      // Convert DB data to UI format
      const uiExpenses: FixedExpense[] = data.map((exp) => {
        const categoryName = exp.categories?.name || "Other";
        const iconStyle = getCategoryIconStyle(categoryName);

        return {
          id: exp.id,
          name: exp.name,
          category: categoryName,
          amount: exp.amount,
          frequency: exp.frequency,
          next_billing_date: exp.next_occurrence,
          status: exp.is_active ? "active" : "inactive",
          payment_status: exp.payment_status,
          icon: getCategoryIcon(categoryName),
          iconBg: iconStyle.bg,
          iconColor: iconStyle.color,
          categoryId: exp.category_id,
          accountId: exp.account_id || undefined,
          note: exp.note || undefined,
        };
      });

      setExpenses(uiExpenses);
    } catch (error) {
      console.error("Error loading expenses:", error);
      alert(t("error_load"));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate totals
  const activeExpenses = expenses.filter((e) => e.status === "active");

  // Helper function to convert to monthly amount based on frequency
  const convertToMonthlyAmount = (amount: number, frequency: string) => {
    switch (frequency) {
      case "daily":
        return amount * 30; // Approx 30 days per month
      case "weekly":
        return amount * 4.33; // Approx 4.33 weeks per month
      case "monthly":
        return amount;
      case "yearly":
        return amount / 12;
      default:
        return amount;
    }
  };

  const totalMonthly = activeExpenses.reduce(
    (sum, e) => sum + convertToMonthlyAmount(e.amount, e.frequency),
    0,
  );
  const annualTotal = totalMonthly * 12;
  const nextPayment = activeExpenses.sort(
    (a, b) =>
      new Date(a.next_billing_date).getTime() -
      new Date(b.next_billing_date).getTime(),
  )[0];

  // Handle add/edit expense
  const handleSaveExpense = async (data: FixedExpenseFormData, id?: string) => {
    try {
      if (id) {
        // Update existing
        await fixedExpenseService.updateFixedExpense(id, {
          name: data.name,
          amount: data.amount,
          category_id: data.category_id,
          account_id: data.account_id,
          frequency: data.frequency,
          next_occurrence: data.next_occurrence,
          is_active: data.is_active,
          note: data.note,
        });
      } else {
        // Create new
        await fixedExpenseService.createFixedExpense({
          name: data.name,
          amount: data.amount,
          category_id: data.category_id,
          account_id: data.account_id,
          frequency: data.frequency,
          start_date: data.next_occurrence,
          next_occurrence: data.next_occurrence,
          is_active: data.is_active,
          note: data.note,
        });
      }

      // Reload expenses
      await loadExpenses();
      setEditingExpense(undefined);
    } catch (error) {
      console.error("Error saving expense:", error);
      throw error; // Re-throw to let modal handle error display
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;

    try {
      await fixedExpenseService.deleteFixedExpense(deleteExpenseId);
      await loadExpenses();
      setDeleteExpenseId(null);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert(t("error_delete"));
    }
  };

  // Handle edit click
  const handleEditClick = (expense: FixedExpense) => {
    setEditingExpense({
      id: expense.id,
      name: expense.name,
      category_id: expense.categoryId || "",
      amount: expense.amount,
      frequency: expense.frequency,
      next_occurrence: expense.next_billing_date,
      is_active: expense.status === "active",
      account_id: expense.accountId,
      note: expense.note,
    });
    setShowAddEditModal(true);
  };

  // Handle toggle payment status
  const handleTogglePaymentStatus = async (id: string) => {
    try {
      const expense = expenses.find((e) => e.id === id);
      if (!expense) return;

      await fixedExpenseService.togglePaymentStatus(id, expense.payment_status);
      await loadExpenses();
    } catch (error) {
      console.error("Error toggling payment status:", error);
      alert(t("error_update_payment"));
    }
  };

  // Handle toggle active status
  const handleToggleActiveStatus = async (id: string) => {
    try {
      const expense = expenses.find((e) => e.id === id);
      if (!expense) return;

      await fixedExpenseService.toggleActiveStatus(
        id,
        expense.status === "active",
      );
      await loadExpenses();
    } catch (error) {
      console.error("Error toggling active status:", error);
      alert(t("error_update_status"));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
          {t("title")}
        </h1>

        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
            />
          </div>

          <Button
            onClick={() => {
              setEditingExpense(undefined);
              setShowAddEditModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("add_button")}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <ExpenseSummary
        totalMonthly={totalMonthly}
        activeCount={activeExpenses.length}
        annualTotal={annualTotal}
        nextPayment={
          nextPayment
            ? {
                date: nextPayment.next_billing_date,
                name: nextPayment.name,
              }
            : undefined
        }
      />

      {/* Active Subscriptions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {t("list_title", { count: filteredExpenses.length })}
          </h3>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        ) : (
          <ExpenseList
            expenses={filteredExpenses}
            onEdit={handleEditClick}
            onDelete={setDeleteExpenseId}
            onTogglePaymentStatus={handleTogglePaymentStatus}
            onToggleActiveStatus={handleToggleActiveStatus}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddEditFixedExpenseModal
        open={showAddEditModal}
        onOpenChange={(open) => {
          setShowAddEditModal(open);
          if (!open) setEditingExpense(undefined);
        }}
        onSuccess={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteExpenseId}
        onOpenChange={(open) => !open && setDeleteExpenseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete_dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("delete_dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
