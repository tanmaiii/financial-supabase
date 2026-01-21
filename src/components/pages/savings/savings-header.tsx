"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface SavingsHeaderProps {
  onAddGoal: () => void;
}

export default function SavingsHeader({ onAddGoal }: SavingsHeaderProps) {
  const t = useTranslations("savings");

  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Button
        onClick={onAddGoal}
        className="bg-primary hover:bg-primary/90 gap-2"
      >
        <Plus className="w-4 h-4" />
        {t("add_goal_button")}
      </Button>
    </div>
  );
}
