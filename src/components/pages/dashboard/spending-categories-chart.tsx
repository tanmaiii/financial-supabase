"use client";

import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CategorySpending } from "@/services/dashboard.service";

interface SpendingCategoriesChartProps {
  data: CategorySpending[];
}

const COLORS = [
  "hsl(var(--chart-1))", // Teal/Cyan
  "hsl(var(--chart-5))", // Orange
  "hsl(var(--chart-2))", // Blue
  "hsl(var(--chart-3))", // Purple
  "hsl(var(--chart-4))", // Additional color
];

export default function SpendingCategoriesChart({
  data,
}: SpendingCategoriesChartProps) {
  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Spending Categories</h3>
        <p className="text-sm text-muted-foreground">Monthly Breakdown</p>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <>
          <div className="flex relative flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={data as any[]} // Type assertion for recharts compatibility
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-6">
              <p className="text-3xl font-bold">
                $
                {data
                  .reduce((acc, curr) => acc + curr.value, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">TOTAL</p>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-6 w-full">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      item.color || COLORS[index % COLORS.length],
                  }}
                />
                <span className="text-sm text-muted-foreground flex-1">
                  {item.name}
                </span>
                <span className="text-sm font-medium">
                  ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
          <p>No spending data for this month</p>
        </div>
      )}
    </Card>
  );
}
