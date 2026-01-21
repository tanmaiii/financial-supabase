# 🚀 Quick Start - Supabase Filtering

## Cách nhanh nhất để bắt đầu

### 1️⃣ Sử dụng trong Component (3 dòng code!)

```tsx
import { useTransactions } from "@/hooks/useTransactions";

export default function MyPage() {
  const { transactions, isLoading } = useTransactions();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {transactions.map((t) => (
        <div key={t.id}>
          {t.note} - ${t.amount}
        </div>
      ))}
    </div>
  );
}
```

### 2️⃣ Thêm Filtering (Copy-paste là xong!)

```tsx
const { transactions, isLoading, updateFilters } = useTransactions({
  initialFilters: { type: "expense" }, // Optional initial filters
});

// Update filter bất cứ lúc nào
const filterByExpense = () => updateFilters({ type: "expense" });
const filterByDate = () =>
  updateFilters({
    dateFrom: "2026-01-01",
    dateTo: "2026-01-31",
  });
```

### 3️⃣ Sử dụng Advanced Filters Component

```tsx
import AdvancedFilters from "@/components/pages/transactions/advanced-filters";
import { useTransactions } from "@/hooks/useTransactions";

export default function MyPage() {
  const { transactions, updateFilters } = useTransactions();

  return (
    <div>
      <AdvancedFilters
        onDateRangeChange={(from, to) =>
          updateFilters({ dateFrom: from, dateTo: to })
        }
        onCategoryChange={(id) => updateFilters({ categoryId: id })}
        onAmountRangeChange={(min, max) =>
          updateFilters({ minAmount: min, maxAmount: max })
        }
        onTypeChange={(type) => updateFilters({ type })}
        onSearchChange={(search) => updateFilters({ search })}
      />

      {transactions.map((t) => (
        <div key={t.id}>{t.note}</div>
      ))}
    </div>
  );
}
```

### 4️⃣ Delete Transactions

```tsx
const { deleteTransactions, refetch } = useTransactions();

const handleDelete = async (ids: string[]) => {
  try {
    await deleteTransactions(ids);
    // Data tự động refresh!
  } catch (error) {
    alert("Delete failed!");
  }
};
```

## 🎯 Tất cả Filters có sẵn

```tsx
updateFilters({
  dateFrom: "2026-01-01", // Từ ngày
  dateTo: "2026-01-31", // Đến ngày
  categoryId: "uuid-here", // Lọc theo category
  accountId: "uuid-here", // Lọc theo account
  minAmount: 100, // Số tiền tối thiểu
  maxAmount: 1000, // Số tiền tối đa
  type: "expense", // income | expense | transfer
  search: "coffee", // Tìm trong note
});
```

## 💡 Tips

**Reset filters:**

```tsx
const { resetFilters } = useTransactions();
<button onClick={resetFilters}>Clear Filters</button>;
```

**Debounce search:**

```tsx
import { useDebounce } from "@/hooks/useTransactions";
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  updateFilters({ search: debouncedSearch });
}, [debouncedSearch]);
```

**Refresh data:**

```tsx
const { refetch } = useTransactions();
<button onClick={refetch}>Refresh</button>;
```

## 📚 Xem thêm

- Chi tiết: `docs/transaction-service.md`
- Examples: `docs/advanced-filters-examples.md`
- Tổng hợp: `docs/SUMMARY.md`

---

**Xong! Chỉ vậy thôi! 🎉**
