import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Edit, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FixedExpense } from "./types";

interface ExpenseRowProps {
  expense: FixedExpense;
  onEdit: (expense: FixedExpense) => void;
  onDelete: (id: string) => void;
  onTogglePaymentStatus: (id: string) => void;
  onToggleActiveStatus: (id: string) => void;
}

export default function ExpenseRow({
  expense,
  onEdit,
  onDelete,
  onTogglePaymentStatus,
  onToggleActiveStatus,
}: ExpenseRowProps) {
  const t = useTranslations("fixed_expenses.row");
  const Icon = expense.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 border-zinc-100 dark:border-zinc-800">
      <div className="flex-1 w-full flex justify-between gap-4 items-center">
        <div className="md:col-span-1 flex items-center gap-2">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${expense.iconBg}`}
          >
            <Icon className={`h-6 w-6 ${expense.iconColor}`} />
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-sm truncate">{expense.name}</h4>
            <p className="text-xs text-muted-foreground">{expense.category}</p>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {expense.status === "active"
              ? t("next_payment")
              : t("last_payment")}
          </div>
          <div className="text-sm font-medium">
            {formatDate(expense.next_billing_date)}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {t("amount")}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold">
              ${expense.amount.toLocaleString()}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              {t(`frequency_${expense.frequency}`)}
            </span>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {t("status")}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={
                expense.payment_status === "paid" ? "default" : "outline"
              }
              className={`h-7 px-3 text-xs ${
                expense.payment_status === "paid"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : ""
              }`}
              onClick={() => onTogglePaymentStatus(expense.id)}
            >
              {expense.payment_status === "paid" ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  {t("paid")}
                </>
              ) : (
                <>
                  <X className="h-3 w-3 mr-1" />
                  {t("unpaid")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {/* Toggle Active Status */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold">
              {expense.status === "active" ? t("active") : t("inactive")}
            </span>
            <div
              onClick={() => onToggleActiveStatus(expense.id)}
              className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${
                expense.status === "active"
                  ? "bg-primary"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  expense.status === "active"
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onEdit(expense)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(expense.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
