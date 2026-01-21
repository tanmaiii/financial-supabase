import { useTranslations } from "next-intl";

interface ExpenseSummaryProps {
  totalMonthly: number;
  activeCount: number;
  annualTotal: number;
  nextPayment?: {
    date: string;
    name: string;
  };
}

export default function ExpenseSummary({
  totalMonthly,
  activeCount,
  annualTotal,
  nextPayment,
}: ExpenseSummaryProps) {
  const t = useTranslations("fixed_expenses.summary");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-800 p-8 text-white shadow-xl shadow-teal-900/10">
      <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 p-24 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-teal-50">
            {t("total_monthly")}
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">
              ${totalMonthly.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-teal-100">
            <div className="h-4 w-4 rounded-full bg-teal-400/30 flex items-center justify-center text-[10px] font-bold">
              i
            </div>
            {t("active_count", { count: activeCount })}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 min-w-[140px]">
            <div className="text-xs text-teal-100 uppercase tracking-wider mb-1">
              {t("next_payment")}
            </div>
            <div className="text-xl font-bold">
              {nextPayment ? formatDate(nextPayment.date) : "-"}
            </div>
            <div className="text-xs text-teal-200 truncate">
              {nextPayment?.name || "-"}
            </div>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 min-w-[140px]">
            <div className="text-xs text-teal-100 uppercase tracking-wider mb-1">
              {t("annual_total")}
            </div>
            <div className="text-xl font-bold">
              ${annualTotal.toLocaleString()}
            </div>
            <div className="text-xs text-teal-200">{t("estimated")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
