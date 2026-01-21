# Testing Examples

## 🧪 How to Test the Filtering System

### Manual Testing Checklist

#### ✅ Basic Functionality

- [ ] Transactions load on page load
- [ ] Loading spinner shows during fetch
- [ ] No console errors
- [ ] Data displays correctly in table

#### ✅ Filtering Tests

##### Date Range Filter

```
1. Select "Last 7 days"
   → Should show only transactions from last 7 days

2. Select "Last 30 days"
   → Should show only transactions from last 30 days

3. Select "Last 90 days"
   → Should show only transactions from last 90 days
```

##### Category Filter

```
1. Select a specific category (e.g., "Food & Dining")
   → Should show only transactions with that category

2. Clear category filter
   → Should show all transactions again
```

##### Amount Range Filter

```
1. Select "0-100"
   → Should show only transactions between $0-$100

2. Select "100-500"
   → Should show only transactions between $100-$500

3. Select "1000+"
   → Should show only transactions >= $1000
```

##### Type Filter

```
1. Select "Income"
   → Should show only income transactions

2. Select "Expense"
   → Should show only expense transactions

3. Select "Transfer"
   → Should show only transfer transactions
```

##### Search Filter

```
1. Type "coffee" in search
   → Should show only transactions with "coffee" in the note

2. Clear search
   → Should show all transactions
```

##### Combined Filters

```
1. Select date range + category + amount range
   → Should show transactions matching ALL filters

2. Clear one filter
   → Should update results accordingly
```

#### ✅ CRUD Operations

##### Create

```
1. Click "Add Transaction" button
2. Fill in form
3. Click "Submit"
   → Should add transaction and refresh list
   → New transaction should appear in table
```

##### Delete

```
1. Select one or more transactions
2. Click "Delete" button
3. Confirm deletion
   → Should delete selected transactions
   → List should refresh without deleted items
```

### Browser Console Tests

Open browser console and run these:

#### Test 1: Check Service

```javascript
import { transactionService } from "@/services/transaction.service";

// Get all transactions
const all = await transactionService.getTransactions();
console.log("All transactions:", all);

// Get with filters
const filtered = await transactionService.getTransactions({
  type: "expense",
  minAmount: 100,
});
console.log("Filtered transactions:", filtered);

// Count
const count = await transactionService.getTransactionCount();
console.log("Total count:", count);
```

#### Test 2: Check Filters

```javascript
// In browser console, check current filters
// (if you expose them in window object for debugging)
console.log("Current filters:", filters);
```

### Network Tab Verification

1. Open browser DevTools → Network tab
2. Perform filter operation
3. Check Supabase requests:
   - ✅ Should see POST to `/rest/v1/transactions`
   - ✅ Request payload should include filter params
   - ✅ Response should contain filtered data

### Database Verification

In Supabase Studio:

```sql
-- Check total transactions for current user
SELECT COUNT(*) FROM transactions WHERE user_id = 'your-user-id';

-- Check specific filter
SELECT * FROM transactions
WHERE user_id = 'your-user-id'
  AND type = 'expense'
  AND amount >= 100
  AND transaction_date >= '2026-01-01'
ORDER BY transaction_date DESC;
```

## 🔬 Unit Testing (Optional)

If you want to add automated tests:

### Test Service Layer

```typescript
// transaction.service.test.ts
import { transactionService } from "@/services/transaction.service";

describe("TransactionService", () => {
  test("getTransactions should return array", async () => {
    const result = await transactionService.getTransactions();
    expect(Array.isArray(result)).toBe(true);
  });

  test("getTransactions with filters should apply them", async () => {
    const result = await transactionService.getTransactions({
      type: "expense",
      minAmount: 100,
    });

    result.forEach((t) => {
      expect(t.type).toBe("expense");
      expect(t.amount).toBeGreaterThanOrEqual(100);
    });
  });

  test("getTransactionCount should return number", async () => {
    const count = await transactionService.getTransactionCount();
    expect(typeof count).toBe("number");
  });
});
```

### Test Hook

```typescript
// useTransactions.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useTransactions } from "@/hooks/useTransactions";

describe("useTransactions", () => {
  test("should load transactions on mount", async () => {
    const { result } = renderHook(() => useTransactions());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions.length).toBeGreaterThan(0);
  });

  test("updateFilters should trigger refetch", async () => {
    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCount = result.current.transactions.length;

    // Update filters
    result.current.updateFilters({ type: "expense" });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Count might be different after filtering
    expect(result.current.transactions.every((t) => t.type === "expense")).toBe(
      true
    );
  });
});
```

## 🐛 Common Issues & Solutions

### Issue 1: No data showing

**Check:**

- [ ] User is logged in
- [ ] Database has transactions for this user
- [ ] RLS policies are correct
- [ ] Console for errors

### Issue 2: Filters not working

**Check:**

- [ ] Filter state is updating (React DevTools)
- [ ] Service is receiving correct filters
- [ ] Network request has correct params
- [ ] Database query is correct

### Issue 3: Slow loading

**Check:**

- [ ] Database indexes on frequently filtered columns
- [ ] Not fetching too much data
- [ ] Consider pagination

### Issue 4: Type errors

**Check:**

- [ ] Types match between DB and UI
- [ ] Conversion function is correct
- [ ] No null/undefined issues

## 📊 Performance Testing

### Load Test

```
1. Add 100+ transactions to database
2. Load page
   → Should load in < 2 seconds

3. Apply filters
   → Should filter in < 500ms
```

### Stress Test

```
1. Rapidly change filters
   → Should handle without errors
   → Should debounce search properly

2. Select/deselect many items
   → UI should remain responsive
```

## ✅ Acceptance Criteria

Before considering feature complete:

- [x] ✅ Transactions load from Supabase
- [x] ✅ All filters work correctly
- [x] ✅ Create new transaction works
- [x] ✅ Delete transactions works
- [x] ✅ Loading states show properly
- [x] ✅ Error states show properly
- [x] ✅ Empty states show properly
- [x] ✅ TypeScript has no errors
- [x] ✅ No console errors in browser
- [x] ✅ RLS ensures data privacy
- [x] ✅ Code is documented
- [x] ✅ Examples provided

---

## 🎯 Quick Test Script

Run this checklist in order:

```
□ Start dev server
□ Open page in browser
□ Check: Data loads ✓
□ Check: No console errors ✓
□ Filter by date ✓
□ Filter by category ✓
□ Filter by amount ✓
□ Search by keyword ✓
□ Combine multiple filters ✓
□ Add new transaction ✓
□ Delete transaction ✓
□ Refresh page (data persists) ✓
```

If all ✓, you're good to go! 🎉
