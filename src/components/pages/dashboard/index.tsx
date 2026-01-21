"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import DashboardHeader from "./dashboard-header";
import IncomeExpensesChart from "./income-expenses-chart";
import RecentTransactions from "./recent-transactions";
import SpendingCategoriesChart from "./spending-categories-chart";
import StatCard from "./stat-card";
import {
  CategorySpending,
  dashboardService,
  DashboardStats,
  MonthlyData,
} from "@/services/dashboard.service";
import { TransactionFromDB } from "@/services/transaction.service";

export default function Dashboard() {
  const t = useTranslations("dashboard");

  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    incomeChange: 0,
    expenseChange: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>(
    [],
  );
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionFromDB[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, monthlyChartData, categoryData, transactionsData] =
          await Promise.all([
            dashboardService.getDashboardStats(),
            dashboardService.getLast6MonthsData(),
            dashboardService.getCurrentMonthCategorySpending(),
            dashboardService.getRecentTransactions(5),
          ]);

        setStats(statsData);
        setMonthlyData(monthlyChartData);
        setCategorySpending(categoryData);
        setRecentTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">{t("loading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t("total_balance")}
          amount={`$${stats.totalBalance.toLocaleString()}`}
          subtext={t("updated_just_now")}
          trend={
            stats.incomeChange !== 0
              ? {
                  value: `${stats.incomeChange > 0 ? "+" : ""}${stats.incomeChange.toFixed(1)}%`,
                  isPositive: stats.incomeChange > 0,
                }
              : undefined
          }
        />
        <StatCard
          title={t("monthly_income")}
          amount={`$${stats.monthlyIncome.toLocaleString()}`}
          subtext={t("current_month")}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title={t("monthly_expenses")}
          amount={`$${stats.monthlyExpenses.toLocaleString()}`}
          subtext={
            stats.expenseChange !== 0
              ? `${Math.abs(stats.expenseChange).toFixed(1)}% ${
                  stats.expenseChange > 0 ? t("higher") : t("lower")
                } ${t("than_last_month")}`
              : t("same_as_last_month")
          }
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IncomeExpensesChart data={monthlyData} />
        <SpendingCategoriesChart data={categorySpending} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
