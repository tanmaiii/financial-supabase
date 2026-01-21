# Fixed: UUID Empty String Error

## ❌ Vấn đề

```
Error: invalid input syntax for type uuid: ""
```

## 🔍 Nguyên nhân

PostgreSQL UUID column không chấp nhận empty string `""`. Khi user không chọn account (optional field), form gửi `account_id: ""` thay vì `null` hoặc `undefined`.

## ✅ Giải pháp

### 1. Default Values (Modal)

```tsx
// TRƯỚC (❌)
defaultValues: {
  account_id: "",  // Empty string
  note: "",
}

// SAU (✅)
defaultValues: {
  account_id: undefined,  // Undefined for optional UUID
  note: undefined,
}
```

### 2. Form Submission Cleaning

```tsx
const onSubmit = async (data: FixedExpenseFormData) => {
  // Clean empty strings before sending to service
  const cleanedData = {
    ...data,
    account_id:
      data.account_id && data.account_id.trim() !== ""
        ? data.account_id
        : undefined,
    note: data.note && data.note.trim() !== "" ? data.note : undefined,
  };

  await onSuccess(cleanedData, initialData?.id);
};
```

### 3. Service Layer Handling

Service đã xử lý đúng:

```tsx
const insertData = {
  // ...
  account_id: data.account_id || null, // Convert undefined to null
  note: data.note || null,
};
```

## 📋 Checklist Fix

- [x] Đổi default values từ `""` → `undefined`
- [x] Clean data trước khi submit (trim empty strings)
- [x] Service convert `undefined` → `null` cho database
- [x] Types đã correct (`account_id?: string`)

## 🎯 Kết quả

Bây giờ có thể:

- ✅ Thêm expense với hoặc không có account
- ✅ Empty strings tự động convert thành `null`
- ✅ No more UUID validation errors

## 💡 Best Practice

**Luôn luôn:**

1. Optional UUID fields → use `undefined` as default
2. Clean form data trước khi gửi API
3. Convert `undefined` → `null` ở service layer
4. Never send empty string `""` cho UUID columns
