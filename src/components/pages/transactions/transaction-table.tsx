import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import TransactionRow from "./transaction-row";
import { Transaction } from "./types";

interface TransactionTableProps {
  transactions: Transaction[];
  selectedIds: string[];
  hoveredRow: string | null;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: () => void;
  onSetHoveredRow: (id: string | null) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TransactionTable({
  transactions,
  selectedIds,
  hoveredRow,
  onToggleSelection,
  onSetHoveredRow,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const t = useTranslations("transactions");
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.date")}</TableHead>
            <TableHead>{t("table.merchant_description")}</TableHead>
            <TableHead>{t("table.category")}</TableHead>
            <TableHead>{t("table.account")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="text-right">{t("table.amount")}</TableHead>
            <TableHead className="text-right">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <p className="text-muted-foreground">
                  {t("table.no_transactions")}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction, index) => (
              <TransactionRow
                key={index}
                transaction={transaction}
                isSelected={selectedIds.includes(transaction.id)}
                isHovered={hoveredRow === transaction.id}
                onToggleSelection={onToggleSelection}
                onMouseEnter={() => onSetHoveredRow(transaction.id)}
                onMouseLeave={() => onSetHoveredRow(null)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
