# Transaction Service - Hướng dẫn sử dụng

## Giới thiệu

Service này cung cấp các method để lấy dữ liệu transactions từ Supabase với đầy đủ tính năng lọc (filtering).

## Cài đặt

Service đã được tích hợp sẵn trong project. Import và sử dụng:

```typescript
import {
  transactionService,
  TransactionFilters,
} from "@/services/transaction.service";
```

## Các method chính

### 1. `getTransactions(filters?: TransactionFilters)`

Lấy danh sách transactions với các filter tùy chọn.

**Ví dụ:**

```typescript
// Lấy tất cả transactions
const allTransactions = await transactionService.getTransactions();

// Lấy transactions trong 30 ngày gần đây
const recentTransactions = await transactionService.getTransactions({
  dateFrom: "2026-01-01",
  dateTo: "2026-01-31",
});

// Lọc theo category
const expenseTransactions = await transactionService.getTransactions({
  categoryId: "category-id-here",
  type: "expense",
});

// Lọc theo khoảng số tiền
const largeTransactions = await transactionService.getTransactions({
  minAmount: 1000,
  maxAmount: 5000,
});

// Kết hợp nhiều filters
const filteredTransactions = await transactionService.getTransactions({
  dateFrom: "2026-01-01",
  dateTo: "2026-01-31",
  categoryId: "category-id",
  accountId: "account-id",
  minAmount: 100,
  type: "expense",
  search: "coffee",
});
```

### 2. `getTransactionCount(filters?: TransactionFilters)`

Đếm tổng số transactions theo filter.

**Ví dụ:**

```typescript
const count = await transactionService.getTransactionCount({
  type: "expense",
  dateFrom: "2026-01-01",
});
console.log(`Total expenses: ${count}`);
```

### 3. `getTransactionById(id: string)`

Lấy chi tiết một transaction theo ID.

**Ví dụ:**

```typescript
const transaction = await transactionService.getTransactionById(
  "transaction-id"
);
```

### 4. `deleteTransactions(ids: string[])`

Xóa nhiều transactions cùng lúc.

**Ví dụ:**

```typescript
await transactionService.deleteTransactions(["id1", "id2", "id3"]);
```

### 5. `updateTransactionsCategory(ids: string[], categoryId: string)`

Cập nhật category cho nhiều transactions.

**Ví dụ:**

```typescript
await transactionService.updateTransactionsCategory(
  ["id1", "id2"],
  "new-category-id"
);
```

## TransactionFilters Interface

```typescript
interface TransactionFilters {
  dateFrom?: string; // Từ ngày (YYYY-MM-DD)
  dateTo?: string; // Đến ngày (YYYY-MM-DD)
  categoryId?: string; // ID của category
  accountId?: string; // ID của account (from hoặc to)
  minAmount?: number; // Số tiền tối thiểu
  maxAmount?: number; // Số tiền tối đa
  type?: "income" | "expense" | "transfer"; // Loại transaction
  search?: string; // Tìm kiếm trong note
}
```

## TransactionFromDB Interface

Dữ liệu trả về từ database:

```typescript
interface TransactionFromDB {
  id: string;
  user_id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  note: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;

  // Relations (được join từ các bảng khác)
  categories?: {
    id: string;
    name: string;
    type: "income" | "expense";
    icon: string | null;
    color: string | null;
  } | null;

  from_account?: {
    id: string;
    name: string;
    type: string;
  } | null;

  to_account?: {
    id: string;
    name: string;
    type: string;
  } | null;
}
```

## Sử dụng trong Component

Xem ví dụ hoàn chỉnh trong `src/components/pages/transactions/index.tsx`:

```typescript
import { useState, useEffect, useCallback } from "react";
import { transactionService, TransactionFilters } from "@/services/transaction.service";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await transactionService.getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Cập nhật filters
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    // Your UI here
  );
}
```

## Tips & Best Practices

1. **Sử dụng useCallback**: Luôn wrap `fetchTransactions` trong `useCallback` để tránh re-render không cần thiết.

2. **Error Handling**: Luôn wrap các API calls trong try-catch để xử lý lỗi.

3. **Loading State**: Hiển thị loading indicator khi đang fetch data.

4. **Filter Optimization**: Chỉ gọi API khi filters thay đổi, sử dụng `useEffect` với dependency là filters.

5. **Debounce Search**: Nếu có search input, nên debounce để tránh gọi API quá nhiều lần.

## Lưu ý

- Tất cả các date phải ở format `YYYY-MM-DD`
- Service tự động sort transactions theo `transaction_date` giảm dần (mới nhất trước)
- Khi filter theo `accountId`, sẽ match cả `from_account_id` và `to_account_id`
- Search sẽ tìm trong trường `note` (case-insensitive)
