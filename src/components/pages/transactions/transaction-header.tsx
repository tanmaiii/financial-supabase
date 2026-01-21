import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface TransactionHeaderProps {
  totalRecords: number;
  onExport?: () => void;
  onManualAdd?: () => void;
}

export default function TransactionHeader({
  totalRecords,
  onExport,
  onManualAdd,
}: TransactionHeaderProps) {
  const t = useTranslations("transactions");

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span className="text-primary font-medium">FINANCE</span>
        <span>/</span>
        <span className="uppercase tracking-wide">{t("breadcrumb")}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", { total: totalRecords.toLocaleString() })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 hover:bg-secondary/80"
            onClick={onExport}
          >
            <Download className="w-4 h-4" />
            {t("export")}
          </Button>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
            onClick={onManualAdd}
          >
            <Plus className="w-4 h-4" />
            {t("manual_add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
