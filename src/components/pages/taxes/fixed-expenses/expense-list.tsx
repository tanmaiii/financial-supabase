import { Card } from "@/components/ui/card";
import ExpenseRow from "./expense-row";
import { FixedExpense } from "./types";
import { useTranslations } from "next-intl";

interface ExpenseListProps {
  expenses: FixedExpense[];
  onEdit: (expense: FixedExpense) => void;
  onDelete: (id: string) => void;
  onTogglePaymentStatus: (id: string) => void;
  onToggleActiveStatus: (id: string) => void;
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onTogglePaymentStatus,
  onToggleActiveStatus,
}: ExpenseListProps) {
  const t = useTranslations("fixed_expenses");
  if (expenses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">{t("empty_state")}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePaymentStatus={onTogglePaymentStatus}
          onToggleActiveStatus={onToggleActiveStatus}
        />
      ))}
    </div>
  );
}
