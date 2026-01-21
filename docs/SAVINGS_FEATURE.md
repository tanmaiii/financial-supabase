# Savings Goals Feature - Hướng Dẫn Sử Dụng

## Tổng Quan

Tính năng Savings Goals cho phép người dùng tạo và quản lý các mục tiêu tiết kiệm, theo dõi tiến độ và thêm tiền vào các mục tiêu.

## Các Tính Năng Chính

### 1. **Xem Danh Sách Mục Tiêu Tiết Kiệm**

- Hiển thị tất cả mục tiêu tiết kiệm với thông tin chi tiết
- Chế độ xem: Grid hoặc List
- Phân loại trạng thái: On-track, Behind, Done
- Hiển thị tiến độ bằng phần trăm và thanh progress

### 2. **Thống Kê Tổng Quan**

- **Total Saved**: Tổng số tiền đã tiết kiệm
- **Active Goals**: Số mục tiêu đang hoạt động
- **Goals Completed**: Số mục tiêu đã hoàn thành

### 3. **Thêm Mục Tiêu Mới**

- Click nút "Add New Goal" ở góc trên bên phải
- Điền các thông tin:
  - Goal Name (bắt buộc)
  - Description (tùy chọn)
  - Target Amount (bắt buộc)
  - Initial Amount (tùy chọn)
  - Target Date (tùy chọn)
  - Icon (chọn từ danh sách)
  - Color (chọn từ bảng màu)

### 4. **Thêm Tiền Vào Mục Tiêu**

- Hover vào card của mục tiêu
- Click nút "Add Money"
- Nhập số tiền muốn thêm
- Có các nút quick add: $100, $500, $1,000, Complete Goal
- Xem preview số tiền mới và tiến độ sau khi thêm
- Thêm ghi chú (tùy chọn)

### 5. **Sửa Mục Tiêu**

- Hover vào card của mục tiêu
- Click button Edit (icon bút)
- Cập nhật thông tin
- Lưu thay đổi

### 6. **Xóa Mục Tiêu**

- Hover vào card của mục tiêu
- Click button Delete (icon thùng rác)
- Xác nhận xóa trong dialog
- ⚠️ Lưu ý: Xóa mục tiêu sẽ xóa luôn lịch sử đóng góp

## Cấu Trúc Code

### Services

```
src/services/savings.service.ts
```

- `getSavingFunds()` - Lấy danh sách mục tiêu
- `createSavingFund()` - Tạo mục tiêu mới
- `updateSavingFund()` - Cập nhật mục tiêu
- `deleteSavingFund()` - Xóa mục tiêu
- `addContribution()` - Thêm tiền vào mục tiêu
- `getSavingsStats()` - Lấy thống kê

### Components

```
src/components/pages/savings/
├── index.tsx                 # Main savings page
├── savings-header.tsx        # Header với nút Add Goal
├── savings-stats.tsx         # Thống kê tổng quan
├── active-goals.tsx          # Danh sách mục tiêu
├── add-savings-modal.tsx     # Modal thêm/sửa mục tiêu
└── add-money-modal.tsx       # Modal thêm tiền
```

### Database Tables

```sql
-- Bảng saving_funds: Lưu thông tin mục tiêu
-- Bảng saving_contributions: Lưu lịch sử đóng góp
```

## Cách Chạy

### 1. Cài Đặt Dependencies

```bash
npm install
# sonner đã được cài đặt cho toast notifications
```

### 2. Seed Dữ Liệu Mẫu

```bash
# Chạy file migration trong Supabase SQL Editor
supabase/migrations/003_seed_savings_data.sql
```

### 3. Chạy Development Server

```bash
npm run dev
```

### 4. Truy Cập Trang Savings

```
http://localhost:3000/[locale]/savings
```

## Icons Có Sẵn

- 🏠 Home
- 🚗 Car
- ✈️ Travel
- 💡 Emergency
- 🎁 Gift
- 🎓 Education
- ❤️ Health
- 💻 Technology
- 🐷 Savings
- 💍 Wedding

## Colors Có Sẵn

- Blue (#3b82f6)
- Green (#10b981)
- Orange (#f59e0b)
- Red (#ef4444)
- Purple (#8b5cf6)
- Pink (#ec4899)
- Teal (#14b8a6)
- Amber (#f97316)

## Tính Năng Đặc Biệt

### Auto-Calculate Status

Hệ thống tự động tính toán trạng thái dựa trên:

- **Done**: current_amount >= target_amount
- **Behind**: Tiến độ thực tế < tiến độ kỳ vọng 15%
- **On-track**: Tiến độ bình thường

### Real-time Updates

- Tất cả thống kê và danh sách được cập nhật ngay sau khi thêm/sửa/xóa
- Toast notifications cho mọi hành động

### Responsive Design

- Mobile-friendly
- Grid layout tự động điều chỉnh theo màn hình
- Chế độ Dark mode support

## Troubleshooting

### Không thấy dữ liệu?

1. Kiểm tra kết nối Supabase
2. Đảm bảo đã chạy migration schema
3. Chạy seed data script
4. Kiểm tra console log để xem lỗi

### Toast không hiển thị?

- Đảm bảo Toaster component đã được thêm vào layout
- Kiểm tra package sonner đã được cài đặt

### Lỗi authentication?

- Đảm bảo user đã đăng nhập
- Kiểm tra RLS policies trong Supabase

## Phát Triển Tiếp

### Có thể thêm:

- [ ] Edit contribution history
- [ ] Recurring automatic contributions
- [ ] Goal templates
- [ ] Charts và graphs
- [ ] Export reports
- [ ] Goal sharing/collaboration
- [ ] Notifications khi gần deadline
- [ ] Integration với transactions

## Support

Nếu gặp vấn đề, kiểm tra:

1. Console logs
2. Network tab (Supabase requests)
3. Database RLS policies
4. User authentication status
