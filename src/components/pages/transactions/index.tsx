"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTransactions } from "@/hooks/useTransactions";
import { createClient } from "@/lib/supabase/client";
import { TransactionFormData } from "@/lib/validations/transactionSchema";
import { TransactionFromDB } from "@/services/transaction.service";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat"; // load on demand
import {
  Car,
  Coffee,
  Heart,
  Home,
  Loader2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { exportTransactionsToExcelWithHeaders } from "@/utils/exportToExcel";
import AddTransactionModal from "./add-edit-transaction-modal";
import TransactionHeader from "./transaction-header";
import TransactionTable from "./transaction-table";
import { Transaction } from "./types";
dayjs.extend(advancedFormat);

// Helper function to convert DB transaction to UI transaction
function convertDBTransactionToUI(
  dbTransaction: TransactionFromDB,
): Transaction {
  // Map icon based on category or default
  const getIcon = () => {
    if (!dbTransaction.categories?.icon) return ShoppingCart;

    const iconMap: Record<string, typeof ShoppingCart> = {
      shopping: ShoppingCart,
      coffee: Coffee,
      home: Home,
      car: Car,
      heart: Heart,
      zap: Zap,
    };

    return iconMap[dbTransaction.categories.icon] || ShoppingCart;
  };

  return {
    id: dbTransaction.id,
    date: dayjs(dbTransaction.transaction_date).format("DD/MM/YYYY"),
    merchant: dbTransaction.categories?.name || "Unknown",
    description: dbTransaction.note || "",
    icon: getIcon(),
    category: {
      name: dbTransaction.categories?.name || "Uncategorized",
      color: dbTransaction.categories?.color || "#808080",
      icon: dbTransaction.categories?.icon || "",
      editable: true,
    },
    account: dbTransaction.account?.name || "Unknown Account",
    status: "verified",
    amount:
      dbTransaction.type === "expense"
        ? -Math.abs(dbTransaction.amount)
        : Math.abs(dbTransaction.amount),
  };
}

export default function Transactions() {
  const t = useTranslations("transactions");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null,
  );
  const [editTransactionId, setEditTransactionId] = useState<string | null>(
    null,
  );
  const [editTransactionData, setEditTransactionData] =
    useState<TransactionFormData | null>(null);
  const supabase = createClient();

  // Use custom hook for transactions management
  const {
    transactions: dbTransactions,
    totalCount,
    isLoading,
    error,
    updateFilters,
    refetch,
    deleteTransactions,
  } = useTransactions();

  // Convert DB transactions to UI format
  const transactions = dbTransactions.map(convertDBTransactionToUI);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === transactions.length
        ? []
        : transactions.map((t) => t.id),
    );
  };

  const handleEdit = async (id: string) => {
    try {
      // Fetch transaction from database
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Transaction not found");

      // Convert to form format
      const formData: TransactionFormData = {
        type: data.type as "income" | "expense",
        amount: data.amount,
        category_id: data.category_id || "",
        account_id: data.account_id || "",
        transaction_date: dayjs(data.transaction_date).format("YYYY-MM-DD"),
        note: data.note || "",
      };

      setEditTransactionId(id);
      setEditTransactionData(formData);
      setIsAddModalOpen(true);
    } catch (error) {
      console.error("Failed to load transaction:", error);
      alert("Không thể tải dữ liệu giao dịch");
    }
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete === null) return;

    try {
      await deleteTransactions([transactionToDelete]);
      refetch();
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleExport = () => {
    try {
      // Get i18n labels for Excel export
      const excelLabels = {
        headers: {
          date: t("export_excel.headers.date"),
          category: t("export_excel.headers.category"),
          description: t("export_excel.headers.description"),
          account: t("export_excel.headers.account"),
          type: t("export_excel.headers.type"),
          amount: t("export_excel.headers.amount"),
          status: t("export_excel.headers.status"),
        },
        typeLabels: {
          income: t("export_excel.type_labels.income"),
          expense: t("export_excel.type_labels.expense"),
        },
        statusLabels: {
          verified: t("export_excel.status_labels.verified"),
          unverified: t("export_excel.status_labels.unverified"),
        },
      };

      const filename = t("export_excel.filename");

      // Export transactions to Excel
      exportTransactionsToExcelWithHeaders(
        transactions,
        excelLabels.headers,
        excelLabels.typeLabels,
        excelLabels.statusLabels,
        filename,
      );

      console.log(t("export_excel.success"));
    } catch (error) {
      console.error("Export error:", error);
      alert(t("export_excel.error"));
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8 space-y-6 animate-fade-in">
        <TransactionHeader
          totalRecords={totalCount}
          onExport={handleExport}
          onManualAdd={() => setIsAddModalOpen(true)}
        />

        {/* <TransactionFilters
          onDateFilterChange={handleDateFilterChange}
          onCategoryFilterChange={handleCategoryFilterChange}
          onAmountFilterChange={handleAmountFilterChange}
        /> */}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              {t("table.loading")}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("table.empty_title")}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {t("table.empty_description")}
            </p>
          </div>
        )}

        {/* Data table */}
        {!isLoading && !error && transactions.length > 0 && (
          <TransactionTable
            transactions={transactions}
            selectedIds={selectedIds}
            hoveredRow={hoveredRow}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
            onSetHoveredRow={setHoveredRow}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) {
            setEditTransactionId(null);
            setEditTransactionData(null);
          }
        }}
        transactionId={editTransactionId}
        initialData={editTransactionData}
        onSuccess={() => {
          console.log("Transaction saved successfully");
          refetch();
          setEditTransactionId(null);
          setEditTransactionData(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete_dialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete_dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
