# User Initialization Service

## Tổng quan

Hệ thống tự động khởi tạo dữ liệu mặc định cho người dùng mới khi họ đăng nhập/đăng ký lần đầu tiên. Điều này đảm bảo mọi user đều có một bộ categories và accounts cơ bản để bắt đầu sử dụng ứng dụng ngay lập tức.

## Dữ liệu mặc định được tạo

### Categories (14 categories)

#### Income Categories (5 loại)

1. **Salary** 💼 - Màu xanh lá (#10b981)
2. **Freelance** 💻 - Màu xanh dương (#3b82f6)
3. **Investment** 📈 - Màu tím (#8b5cf6)
4. **Gift** 🎁 - Màu hồng (#ec4899)
5. **Other Income** 💰 - Màu cyan (#06b6d4)

#### Expense Categories (9 loại)

1. **Food & Dining** 🍔 - Màu vàng cam (#f59e0b)
2. **Transportation** 🚗 - Màu đỏ (#ef4444)
3. **Shopping** 🛍️ - Màu hồng (#ec4899)
4. **Entertainment** 🎬 - Màu tím (#8b5cf6)
5. **Bills & Utilities** 📄 - Màu cyan (#06b6d4)
6. **Healthcare** 🏥 - Màu xanh lá (#10b981)
7. **Education** 📚 - Màu xanh dương (#3b82f6)
8. **Housing** 🏠 - Màu indigo (#6366f1)
9. **Other Expense** 💸 - Màu slate (#64748b)

### Accounts (3 accounts)

1. **Cash** - Tiền mặt (balance: 0 VND)
2. **Bank Account** - Tài khoản ngân hàng (balance: 0 VND)
3. **Credit Card** - Thẻ tín dụng (balance: 0 VND)

## Cách hoạt động

### 1. Auto-initialization Flow

```
User đăng nhập/đăng ký
    ↓
AuthContext nhận user object
    ↓
Gọi userInitService.initializeNewUser(userId)
    ↓
Kiểm tra: User đã có categories chưa?
    ├─ Có → Skip (return false)
    └─ Không → Tạo dữ liệu mặc định
        ↓
    Tạo song song:
    - createDefaultCategories()
    - createDefaultAccounts()
        ↓
    ✅ User sẵn sàng sử dụng app
```

### 2. Thời điểm khởi tạo

Dữ liệu được tạo tự động tại **3 thời điểm**:

1. **Khi app load** (useEffect trong AuthProvider)
   - Kiểm tra session hiện tại
   - Nếu có user, khởi tạo nếu cần

2. **Khi auth state thay đổi** (onAuthStateChange callback)
   - User vừa đăng nhập thành công
   - Tự động khởi tạo dữ liệu

3. **Sau khi signIn/signUp thành công**
   - Đảm bảo không bỏ sót trường hợp nào

### 3. Idempotent Design

Service được thiết kế **idempotent** - có thể gọi nhiều lần mà không tạo dữ liệu trùng lặp:

```typescript
async checkUserInitialized(userId: string): Promise<boolean> {
  // Kiểm tra xem user đã có categories chưa
  const { data: categories } = await this.supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  // Nếu đã có ít nhất 1 category → đã initialized
  return (categories?.length || 0) > 0;
}
```

## API Reference

### `userInitService.initializeNewUser(userId: string)`

Khởi tạo đầy đủ dữ liệu cho user mới.

**Parameters:**

- `userId` (string): ID của user cần khởi tạo

**Returns:**

- `Promise<boolean>`:
  - `true` nếu đã tạo dữ liệu mới
  - `false` nếu user đã có dữ liệu rồi

**Example:**

```typescript
const initialized = await userInitService.initializeNewUser(user.id);
if (initialized) {
  console.log("Created default data for new user");
} else {
  console.log("User already has data");
}
```

### `userInitService.checkUserInitialized(userId: string)`

Kiểm tra xem user đã được khởi tạo chưa.

**Returns:**

- `Promise<boolean>`: `true` nếu đã có dữ liệu

### `userInitService.createDefaultCategories(userId: string)`

Tạo categories mặc định cho user.

**Returns:**

- `Promise<Category[]>`: Danh sách categories đã tạo

### `userInitService.createDefaultAccounts(userId: string)`

Tạo accounts mặc định cho user.

**Returns:**

- `Promise<Account[]>`: Danh sách accounts đã tạo

### `userInitService.resetUserData(userId: string)`

⚠️ **NGUY HIỂM**: Xóa TẤT CẢ dữ liệu và tạo lại default data.

**Use cases:**

- Testing
- User muốn reset về trạng thái ban đầu
- Admin tools

## Customization

### Thêm/Sửa Default Categories

Chỉnh sửa trong `src/services/user-init.service.ts`:

```typescript
private defaultCategories: DefaultCategory[] = [
  {
    name: "Your Custom Category",
    type: "income", // hoặc "expense"
    icon: "🎯", // Emoji icon
    color: "#10b981", // Hex color
  },
  // ...
];
```

### Thêm/Sửa Default Accounts

```typescript
private defaultAccounts: DefaultAccount[] = [
  {
    name: "Savings Account",
    type: "savings",
    balance: 1000000, // Initial balance
    currency: "VND",
  },
  // ...
];
```

### Tùy chỉnh theo Locale

Bạn có thể tạo categories khác nhau dựa trên locale của user:

```typescript
private getDefaultCategories(locale: string): DefaultCategory[] {
  if (locale === 'vi') {
    return [
      { name: "Lương", type: "income", icon: "💼", color: "#10b981" },
      // ... categories tiếng Việt
    ];
  } else {
    return [
      { name: "Salary", type: "income", icon: "💼", color: "#10b981" },
      // ... English categories
    ];
  }
}
```

## Database Schema Requirements

Service này yêu cầu các bảng sau phải có cấu trúc:

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Accounts Table

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'VND',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing

### Test với user mới

1. Tạo account mới trong Supabase hoặc qua UI
2. Đăng nhập
3. Kiểm tra console logs:
   ```
   Initializing new user xxx-xxx-xxx...
   Created 14 default categories for user xxx-xxx-xxx
   Created 3 default accounts for user xxx-xxx-xxx
   Successfully initialized user xxx-xxx-xxx
   New user initialized with default data
   ```
4. Verify trong database:

   ```sql
   SELECT COUNT(*) FROM categories WHERE user_id = 'xxx-xxx-xxx';
   -- Should return 14

   SELECT COUNT(*) FROM accounts WHERE user_id = 'xxx-xxx-xxx';
   -- Should return 3
   ```

### Test với existing user

1. Đăng nhập với account đã có data
2. Kiểm tra console:
   ```
   User xxx-xxx-xxx already initialized
   ```
3. Không có categories/accounts mới được tạo

## Troubleshooting

### Lỗi: "Error creating default categories"

**Nguyên nhân:**

- Database constraints (unique, foreign key)
- User không có quyền insert
- Schema không đúng

**Giải pháp:**

1. Kiểm tra RLS policies trong Supabase
2. Verify schema tables
3. Check logs trong Supabase Dashboard

### Categories/Accounts không được tạo

**Nguyên nhân:**

- Service bị skip do user đã có data
- Lỗi silent trong try-catch

**Giải pháp:**

1. Check console logs
2. Gọi trực tiếp: `await userInitService.initializeNewUser(userId)`
3. Hoặc reset: `await userInitService.resetUserData(userId)`

### Duplicate data

**Nguyên nhân:**

- Service được gọi từ nhiều nơi cùng lúc
- Race condition

**Giải pháp:**

- Service đã có protection với `checkUserInitialized()`
- Nếu vẫn xảy ra, thêm unique constraint trong database

## Best Practices

1. ✅ **Không gọi service nhiều lần không cần thiết**
   - Service tự động được gọi trong AuthContext
   - Chỉ gọi thủ công khi thực sự cần

2. ✅ **Error handling**
   - Service đã có try-catch
   - Lỗi được log nhưng không block user flow

3. ✅ **Performance**
   - Dùng `Promise.all()` để tạo categories và accounts song song
   - `limit(1)` khi check initialization

4. ✅ **Maintainability**
   - Default data được define ở một nơi duy nhất
   - Dễ dàng customize cho từng market/locale

## Future Enhancements

### Có thể cải tiến:

1. **Localized defaults** - Categories khác nhau theo ngôn ngữ
2. **User preferences** - Cho phép user chọn category set khi onboard
3. **Templates** - Nhiều bộ categories cho các use cases khác nhau (personal, business, etc.)
4. **Migration tool** - Import categories từ apps khác
5. **Analytics** - Track categories nào được dùng nhiều nhất để optimize defaults
