import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign } from "lucide-react";
import { TransactionFromDB } from "@/services/transaction.service";
import { format } from "date-fns";
import dayjs from "dayjs";

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
  return (
    <Card className="p-6 lg:col-span-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <Button variant="link" className="text-primary hover:text-primary/80">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                DATE
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                CATEGORY
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                DESCRIPTION
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                AMOUNT
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                STATUS
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
                          {transaction.categories?.name || "Uncategorized"}
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
                        COMPLETED
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
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
