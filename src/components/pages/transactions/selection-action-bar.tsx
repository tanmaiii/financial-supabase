import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface SelectionActionBarProps {
  selectedCount: number;
  onCategorize?: () => void;
  onTag?: () => void;
  onDelete?: () => void;
}

export default function SelectionActionBar({
  selectedCount,
  onCategorize,
  onTag,
  onDelete,
}: SelectionActionBarProps) {
  const t = useTranslations("transactions");

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <Card className="bg-slate-900 dark:bg-slate-800 text-white border-0 shadow-2xl px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">
            {t("selection.selected_count", { count: selectedCount })}
          </span>
        </div>

        <div className="h-6 w-px bg-slate-700 dark:bg-slate-600" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800 dark:hover:bg-slate-700 gap-2"
            onClick={onCategorize}
          >
            <Tag className="w-4 h-4" />
            {t("selection.categorize")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800 dark:hover:bg-slate-700 gap-2"
            onClick={onTag}
          >
            <Tag className="w-4 h-4" />
            {t("selection.tag")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-500/10 gap-2"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            {t("selection.delete")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
