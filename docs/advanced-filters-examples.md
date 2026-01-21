# Ví dụ sử dụng Advanced Filters Component

## Cách tích hợp vào Transactions Page

```tsx
import React, { useState, useEffect, useCallback } from "react";
import AdvancedFilters from "./advanced-filters";
import {
  transactionService,
  TransactionFilters,
} from "@/services/transaction.service";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Fetch categories và accounts cho dropdown
  useEffect(() => {
    async function fetchFilterData() {
      const supabase = createClient();
      const [categoriesRes, accountsRes] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase.from("accounts").select("id, name"),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data);
    }
    fetchFilterData();
  }, []);

  const handleDateRangeChange = (from: string, to: string) => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: from,
      dateTo: to,
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId || undefined,
    }));
  };

  const handleAccountChange = (accountId: string) => {
    setFilters((prev) => ({
      ...prev,
      accountId: accountId || undefined,
    }));
  };

  const handleAmountRangeChange = (min?: number, max?: number) => {
    setFilters((prev) => ({
      ...prev,
      minAmount: min,
      maxAmount: max,
    }));
  };

  const handleTypeChange = (type: "income" | "expense" | "transfer" | "") => {
    setFilters((prev) => ({
      ...prev,
      type: type || undefined,
    }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
    }));
  };

  return (
    <div className="space-y-6">
      <h1>Transactions</h1>

      {/* Advanced Filters */}
      <AdvancedFilters
        onDateRangeChange={handleDateRangeChange}
        onCategoryChange={handleCategoryChange}
        onAccountChange={handleAccountChange}
        onAmountRangeChange={handleAmountRangeChange}
        onTypeChange={handleTypeChange}
        onSearchChange={handleSearchChange}
        categories={categories}
        accounts={accounts}
      />

      {/* Transaction Table */}
      {/* ... */}
    </div>
  );
}
```

## Hoặc sử dụng với debounce cho search

```tsx
import { useState, useCallback } from "react";
import { debounce } from "lodash"; // hoặc tự implement debounce

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});

  // Debounced search để tránh gọi API quá nhiều
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setFilters((prev) => ({
        ...prev,
        search: search || undefined,
      }));
    }, 500), // Đợi 500ms sau khi user ngừng gõ
    []
  );

  const handleSearchChange = (search: string) => {
    debouncedSearch(search);
  };

  return (
    <AdvancedFilters
      onSearchChange={handleSearchChange}
      // ... other props
    />
  );
}
```

## Custom Debounce Implementation

Nếu không muốn dùng lodash:

```tsx
import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
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

// Sử dụng
export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch || undefined,
    }));
  }, [debouncedSearch]);

  return (
    <AdvancedFilters
      onSearchChange={setSearchTerm}
      // ... other props
    />
  );
}
```

## Reset Filters

Thêm nút reset để clear tất cả filters:

```tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});

  const resetFilters = () => {
    setFilters({});
    // Có thể cần reset state của AdvancedFilters component
    // bằng cách dùng key prop
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Transactions</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Reset Filters
        </Button>
      </div>

      <AdvancedFilters
        key={JSON.stringify(filters)} // Force re-render khi reset
        // ... props
      />
    </div>
  );
}
```

## Active Filters Display

Hiển thị các filter đang active:

```tsx
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});

  const removeFilter = (key: keyof TransactionFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-2">
              From: {filters.dateFrom}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeFilter("dateFrom")}
              />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-2">
              To: {filters.dateTo}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeFilter("dateTo")}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-2">
              Type: {filters.type}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeFilter("type")}
              />
            </Badge>
          )}
          {/* Add more active filter badges */}
        </div>
      )}

      <AdvancedFilters /* ... */ />
    </div>
  );
}
```
