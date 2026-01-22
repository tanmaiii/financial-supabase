"use client";

import { Card } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlyData } from "@/services/dashboard.service";
import { useTranslations } from "next-intl";

interface IncomeExpensesChartProps {
  data: MonthlyData[];
}

export default function IncomeExpensesChart({
  data,
}: IncomeExpensesChartProps) {
  const t = useTranslations("dashboard.income_vs_expenses");

  return (
    <Card className="p-6 col-span-1 lg:col-span-2">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            // formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            formatter={(value: string) => (
              <span className="text-sm text-foreground capitalize">
                {t(value as "income" | "expenses")}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
