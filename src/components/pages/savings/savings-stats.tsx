"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/common/StatCard";
import { savingsService } from "@/services/savings.service";
import { useTranslations } from "next-intl";

interface SavingsStatsData {
  totalSaved: number;
  totalTarget: number;
  completedGoals: number;
  activeGoals: number;
  totalGoals: number;
}

export default function SavingsStats() {
  const t = useTranslations("savings.stats");
  const [stats, setStats] = useState<SavingsStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await savingsService.getSavingsStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching savings stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const progressPercentage =
    stats.totalTarget > 0
      ? ((stats.totalSaved / stats.totalTarget) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title={t("total_saved")}
        amount={`$${stats.totalSaved.toLocaleString()}`}
        trend={{
          value: t("of_target", { percent: progressPercentage }),
          isPositive: true,
        }}
      />

      <StatCard
        title={t("active_goals")}
        amount={stats.activeGoals.toString()}
        subtext={t("total_goals", { count: stats.totalGoals })}
      />

      <StatCard
        title={t("goals_completed")}
        amount={stats.completedGoals.toString()}
        subtext={
          stats.activeGoals > 0
            ? t("in_progress", { count: stats.activeGoals })
            : t("all_completed")
        }
      />
    </div>
  );
}
