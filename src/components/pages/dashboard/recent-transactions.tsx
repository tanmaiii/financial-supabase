import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PATHS, withLocale } from "@/constants/path";
import { TransactionFromDB } from "@/services/transaction.service";
import dayjs from "dayjs";
import { ArrowRight, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

interface RecentTransactionsProps {
  transactions: TransactionFromDB[];
}

// Helper function to get icon based on category
const getCategoryIcon = (_categoryIcon?: string | null) => {
  // You can map category icons here or use default icons
  return DollarSign; // Default icon
};

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const t = useTranslations("dashboard.recent_transactions");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <Card className="p-6 lg:col-span-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
        </div>
        <Button
          variant="link"
          onClick={() => router.push(withLocale(locale, PATHS.TRANSACTIONS))}
          className="text-primary hover:text-primary/80"
        >
          {t("view_all")}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                {t("table.date")}
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                {t("table.category")}
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                {t("table.description")}
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                {t("table.amount")}
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                {t("table.status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const Icon = getCategoryIcon(transaction.categories?.icon);
                const isIncome = transaction.type === "income";
                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-foreground">
                      {dayjs(transaction.transaction_date).format("DD/MM/YYYY")}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: transaction.categories?.color
                              ? `${transaction.categories.color}20`
                              : "hsl(var(--primary) / 0.1)",
                          }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{
                              color:
                                transaction.categories?.color ||
                                "hsl(var(--primary))",
                            }}
                          />
                        </div>
                        <span className="text-sm text-foreground">
                          {transaction.categories?.name || t("uncategorized")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {transaction.note || "-"}
                    </td>
                    <td
                      className={`py-4 px-4 text-sm font-semibold text-right ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      }`}
                    >
                      {isIncome ? "+" : "-"}$
                      {Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Badge
                        variant="default"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      >
                        {t("status_completed")}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  {t("no_transactions")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
