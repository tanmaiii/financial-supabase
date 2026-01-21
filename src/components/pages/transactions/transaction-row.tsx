import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Transaction } from "./types";

interface TransactionRowProps {
  transaction: Transaction;
  isSelected: boolean;
  isHovered: boolean;
  onToggleSelection: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TransactionRow({
  transaction,
  isSelected,
  isHovered,
  onToggleSelection,
  onMouseEnter,
  onMouseLeave,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const t = useTranslations("transactions");
  const Icon = transaction.icon;

  return (
    <TableRow
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group transition-all ${
        isSelected ? "bg-primary/5" : "cursor-pointer"
      }`}
      data-state={isSelected ? "selected" : undefined}
    >
      <TableCell>
        <div className="text-sm font-medium text-foreground">
          {transaction.date}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {transaction.category.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {transaction.merchant}
            </div>
            <div className="text-xs text-muted-foreground">
              {transaction.description}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge
            className="text-white border-0 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: transaction.category.color }}
          >
            {transaction.category.name}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {transaction.account}
        </div>
      </TableCell>
      <TableCell>
        {transaction.status === "verified" ? (
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            {t("status.verified")}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {t("status.review")}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div
          className={`text-sm font-semibold ${
            transaction.amount > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : transaction.amount < 0
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
          }`}
        >
          {transaction.amount > 0 ? "+" : transaction.amount < 0 ? "-" : ""}$
          {Math.abs(transaction.amount).toLocaleString("vi", {
            minimumFractionDigits: 0,
          })}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onEdit(transaction.id)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
