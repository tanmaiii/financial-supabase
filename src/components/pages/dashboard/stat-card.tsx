import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  amount: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export default function StatCard({
  title,
  amount,
  subtext,
  trend,
  icon,
}: StatCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-border/50">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {trend && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </div>
          )}
          {icon && <div className="text-primary">{icon}</div>}
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">{amount}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
