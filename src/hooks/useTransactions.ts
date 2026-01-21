import { useState, useEffect, useCallback } from "react";
import {
  transactionService,
  TransactionFilters,
  TransactionFromDB,
} from "@/services/transaction.service";

interface UseTransactionsOptions {
  initialFilters?: TransactionFilters;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  transactions: TransactionFromDB[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  updateFilters: (newFilters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
  deleteTransactions: (ids: string[]) => Promise<void>;
  updateCategory: (ids: string[], categoryId: string) => Promise<void>;
}

/**
 * Custom hook để quản lý transactions với filtering
 *
 * @example
 * ```tsx
 * const { transactions, isLoading, updateFilters } = useTransactions({
 *   initialFilters: { type: "expense" }
 * });
 * ```
 */
export function useTransactions(
  options: UseTransactionsOptions = {}
): UseTransactionsReturn {
  const { initialFilters = {}, autoFetch = true } = options;

  const [transactions, setTransactions] = useState<TransactionFromDB[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, count] = await Promise.all([
        transactionService.getTransactions(filters),
        transactionService.getTransactionCount(filters),
      ]);

      setTransactions(data);
      setTotalCount(count);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions. Please try again."
      );
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [fetchTransactions, autoFetch]);

  const updateFilters = useCallback(
    (newFilters: Partial<TransactionFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const deleteTransactionsHandler = useCallback(
    async (ids: string[]) => {
      try {
        await transactionService.deleteTransactions(ids);
        await fetchTransactions(); // Refresh data after delete
      } catch (err) {
        console.error("Error deleting transactions:", err);
        throw err;
      }
    },
    [fetchTransactions]
  );

  const updateCategory = useCallback(
    async (ids: string[], categoryId: string) => {
      try {
        await transactionService.updateTransactionsCategory(ids, categoryId);
        await fetchTransactions(); // Refresh data after update
      } catch (err) {
        console.error("Error updating category:", err);
        throw err;
      }
    },
    [fetchTransactions]
  );

  return {
    transactions,
    totalCount,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilters,
    resetFilters,
    refetch: fetchTransactions,
    deleteTransactions: deleteTransactionsHandler,
    updateCategory,
  };
}

/**
 * Hook để lấy một transaction theo ID
 */
export function useTransaction(id: string | null) {
  const [transaction, setTransaction] = useState<TransactionFromDB | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!id) {
      setTransaction(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactionById(id);
      setTransaction(data);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transaction. Please try again."
      );
      setTransaction(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    isLoading,
    error,
    refetch: fetchTransaction,
  };
}

/**
 * Debounce hook for search
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
