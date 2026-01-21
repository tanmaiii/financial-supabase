# Savings I18n Implementation Plan

## ✅ Completed

1. Added i18n keys to `en.json` and `vi.json`
2. Updated `savings-header.tsx` with i18n

## 📋 Remaining Files to Update

Due to the extensive changes needed, here's a summary of files that need i18n integration:

### 1. **savings-stats.tsx**

Replace hard-coded text with:

- `t("stats.total_saved")`
- `t("stats.active_goals")`
- `t("stats.goals_completed")`
- Use `t("stats.of_target", { percent: progressPercentage })`
- Use `t("stats.total_goals", { count: stats.totalGoals })`
- Use conditional: `stats.activeGoals > 0 ? t("stats.in_progress", { count: stats.activeGoals }) : t("stats.all_completed")`

### 2. **active-goals.tsx**

Replace hard-coded text with:

- `t("active_goals")` for header
- `t("loading_goals")` for loading state
- `t("no_goals_title")` and `t("no_goals_description")` for empty state

### 3. **add-savings-modal.tsx**

This is the largest file with many strings:

- Modal titles: `t("add_modal.add_title")`, `t("add_modal.edit_title")`
- All form labels and placeholders
- Success/error messages
- Button text

### 4. **add-money-modal.tsx**

Replace all user-facing text with i18n keys from `add_money_modal` section

### 5. **SavingsGoalCard/index.tsx**

Replace button text and status labels with i18n from ` goal_card` section

## 🚀 Quick Fix Option

Since there are many files, you have two options:

### Option A: Manual Update (Recommended for learning)

I can update each file one by one and you can review the changes.

### Option B: Batch Update (Faster)

I'll update all files at once in the next turn.

Which option would you prefer? Or would you like me to continue with the batch update now?

## Sample Implementation

Here's how `savings-stats.tsx` would look with i18n:

```tsx
"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/common/StatCard";
import { savingsService } from "@/services/savings.service";
import { useTranslations } from "next-intl";

// ... interfaces ...

export default function SavingsStats() {
  const t = useTranslations("savings.stats");
  const [stats, setStats] = useState<SavingsStatsData | null>(null);
  // ... state and useEffect ...

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
```
