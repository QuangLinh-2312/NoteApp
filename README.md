# NoteApp - Ứng dụng Ghi Chú Pro

Ứng dụng ghi chú full-stack: đa người dùng, JWT, Markdown, danh mục tùy chỉnh, thùng rác, phiên bản, chia sẻ có phân quyền, đồng bộ và cài đặt giao diện (sáng / tối / theo hệ thống).

## Tính năng

### Đăng nhập & dữ liệu riêng
- Đăng ký / đăng nhập JWT
- Mỗi user có ghi chú, danh mục và cài đặt riêng

### Ghi chú (CRUD đầy đủ)
- Tạo, đọc, sửa, xóa ghi chú với màu sắc, tags, checklist
- Ghim, yêu thích, lưu trữ
- Markdown + xem trước (React Markdown, remark-gfm)
- Nhắc nhở (Reminder) trên từng ghi chú
- Sao chép ghi chú nhanh
- Tìm kiếm thông minh trong tiêu đề, nội dung, tags, checklist
- Lọc theo: Tất cả / Đang dùng / Yêu thích / Lưu trữ / Nhắc nhở
- Sắp xếp theo: Ngày tạo / Tiêu đề / Màu sắc / Cập nhật

### Danh mục
- Danh mục mặc định: Cá nhân, Công việc, Học tập, Ý tưởng
- **Custom Categories**: tạo, sửa, xóa danh mục tùy chỉnh với màu sắc
- Quản lý danh mục qua nút **Thêm danh mục** và **Quản lý danh mục** trên thanh tiêu đề

### Thùng rác & Lịch sử phiên bản
- Xóa tạm → Thùng rác → Khôi phục hoặc Xóa vĩnh viễn
- Cleanup tự động định kỳ phía server
- Lịch sử phiên bản ghi chú — xem và khôi phục về bản cũ

### Chia sẻ ghi chú (hoàn chỉnh)
- Chia sẻ theo email với 2 mức quyền: **Chỉ xem** hoặc **Xem & Chỉnh sửa**
- Xem danh sách người đang được chia sẻ ngay trong modal
- **Sửa quyền** trực tiếp không cần xóa/tạo lại
- **Thu hồi quyền** từng người
- Người nhận xem ghi chú được chia sẻ trong mục **Được chia sẻ**
- Người nhận có thể tự xóa ghi chú khỏi danh sách của mình
- Frontend tự động ẩn nút Sửa/Xóa/Chia sẻ nếu user chỉ có quyền đọc
- Backend chặn mọi thao tác ghi nếu không có quyền `write`

### Thống kê & Nhật ký
- Modal thống kê tổng hợp: tổng ghi chú, ghim, yêu thích, lưu trữ, phân bố danh mục
- Activity log: lịch sử hoạt động theo API

### Đồng bộ
- Nút **Sync** thủ công + polling tự động mỗi 30 giây
- Trạng thái đồng bộ hiển thị indicator ở góc màn hình

### Giao diện (UX)
- **Sáng / Tối / Theo hệ thống** — lưu vào `UserSettings` API và `localStorage`
- **Toast thông báo** tự động biến mất sau 2 giây (không cần nhấn "Đã hiểu")
- Sidebar tự động ẩn trên mobile, click ngoài để đóng
- Hỗ trợ chọn nhiều ghi chú và xóa hàng loạt
- Xem theo dạng lưới (Grid) hoặc danh sách (List)

### Dữ liệu
- Xuất toàn bộ ghi chú ra file JSON
- Nhập ghi chú từ file JSON

### Dữ liệu mẫu (Seed)
```bash
cd backend
node seed.js
```
Tạo 10 ghi chú mẫu cho tài khoản mặc định.

## Cài đặt và chạy

### Yêu cầu
- **Node.js** 18.x trở lên
- **MongoDB** 4.x trở lên
- **Redis** (tùy chọn — cache; server vẫn chạy nếu Redis không có)

### Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```
MONGODB_URI=mongodb://localhost:27017/notes-app
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

Chạy:
```bash
npm run dev   # development (nodemon)
npm start     # production
```

Server HTTP + Socket.io mặc định: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
```

Tùy chọn tạo `.env` trong `frontend`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Chạy:
```bash
npm start
```

Ứng dụng: `http://localhost:3000`

## Cấu trúc dự án

```
NoteApp/
├── backend/
│   ├── config/
│   │   └── redis.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── noteController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── cache.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── CustomCategory.js
│   │   ├── Note.js
│   │   ├── NoteVersion.js
│   │   ├── ShareNote.js
│   │   ├── SyncState.js
│   │   ├── User.js
│   │   └── UserSettings.js
│   ├── repositories/
│   │   └── noteRepository.js       ← kiểm tra quyền write trước mọi thao tác sửa
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   ├── shares.js               ← CRUD share + cập nhật quyền (PUT /:shareId)
│   │   ├── ai.js
│   │   ├── analytics.js
│   │   ├── settings.js
│   │   ├── categories.js
│   │   ├── activities.js
│   │   └── sync.js
│   ├── services/
│   │   └── noteService.js
│   ├── socket/
│   │   └── index.js
│   ├── utils/
│   │   ├── cleanup.js
│   │   └── reminders.js
│   ├── seed.js                     ← tạo dữ liệu mẫu
│   ├── server.js
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/
        │   ├── CustomCategories.jsx  ← Thêm/Quản lý danh mục tùy chỉnh
        │   ├── ErrorBoundary.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── notes/
        │       ├── ActivityLogModal.jsx
        │       ├── NoteCard.jsx      ← ẩn nút theo quyền (isOwner / canWrite)
        │       ├── ShareModal.jsx    ← chia sẻ + xem/sửa/xóa quyền từng người
        │       ├── StatsModal.jsx
        │       ├── VersionsModal.jsx
        │       └── ViewNoteModal.jsx
        ├── config/
        │   └── env.js
        ├── constants/
        │   └── noteColors.js
        ├── context/
        │   ├── AuthContext.js
        │   └── AppDialogContext.js
        ├── hooks/
        │   └── useSocket.js
        ├── App.js
        ├── index.js
        ├── index.css
        ├── theme.js
        └── NotesApp.jsx             ← component chính, quản lý toàn bộ state
```

## API Endpoints

Base URL: `/api` — các route được bảo vệ cần header: `Authorization: Bearer <token>`.

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | User hiện tại |

### Notes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notes` | Danh sách ghi chú |
| GET | `/api/notes/:id` | Một ghi chú |
| POST | `/api/notes` | Tạo ghi chú |
| PUT | `/api/notes/:id` | Cập nhật (kiểm tra quyền write) |
| DELETE | `/api/notes/:id` | Xóa tạm (thùng rác) |
| DELETE | `/api/notes/:id/permanent` | Xóa vĩnh viễn |
| POST | `/api/notes/:id/restore` | Khôi phục từ thùng rác |
| GET | `/api/notes/trash/all` | Danh sách thùng rác |
| GET | `/api/notes/:id/versions` | Lịch sử phiên bản |
| POST | `/api/notes/:id/versions/:versionId/restore` | Khôi phục phiên bản |

### Shares (Chia sẻ)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/shares` | Chia sẻ ghi chú |
| GET | `/api/shares/shared-with-me` | Ghi chú được chia sẻ với mình |
| GET | `/api/shares/note/:noteId` | Danh sách người được chia sẻ |
| PUT | `/api/shares/:shareId` | Cập nhật quyền (read/write) |
| DELETE | `/api/shares/:shareId` | Thu hồi chia sẻ (chủ sở hữu hoặc người nhận) |

### Custom Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Danh sách danh mục |
| POST | `/api/categories` | Tạo danh mục |
| PUT | `/api/categories/:id` | Sửa danh mục |
| DELETE | `/api/categories/:id` | Xóa danh mục |

### Settings
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/settings` | Lấy cài đặt (gồm `theme`: `light`/`dark`/`auto`) |
| PUT | `/api/settings` | Cập nhật cài đặt |
| GET | `/api/settings/backup` | Backup ghi chú (JSON) |

### Activities
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/activities` | Lịch sử hoạt động |
| DELETE | `/api/activities/cleanup` | Dọn dẹp log cũ |

### Analytics
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/analytics/overview` | Tổng quan |
| GET | `/api/analytics/timeline` | Timeline |

### Sync
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/sync/state` | Trạng thái đồng bộ |
| GET | `/api/sync/changes` | Các thay đổi |
| POST | `/api/sync/push` | Đẩy thay đổi |

## Phân quyền chia sẻ

```
ShareNote {
  noteId       → ghi chú được chia sẻ
  ownerId      → chủ sở hữu
  sharedWithId → người nhận
  permission   → "read" | "write"
}
```

- **read**: chỉ xem — frontend ẩn nút Sửa/Ghim/Yêu thích/Xóa, backend từ chối PUT
- **write**: xem và sửa — có đầy đủ quyền chỉnh sửa nội dung

## Công nghệ

### Backend
- Node.js, Express
- MongoDB, Mongoose
- JWT, bcryptjs
- Helmet, CORS, express-rate-limit (1000 req/15 phút), mongo-sanitize, compression
- Socket.io
- Redis / ioredis (tùy chọn)

### Frontend
- React 19, Create React App
- Tailwind CSS
- Lucide React (icons)
- React Markdown + remark-gfm
- Socket.io-client

## Ghi chú vận hành

- **Rate limit**: 1000 request/IP/15 phút, trả về JSON khi vượt quá
- **Cleanup**: ghi chú trong thùng rác bị xóa vĩnh viễn tự động theo lịch (`utils/cleanup.js`)
- **Reminders**: interval kiểm tra mỗi phút phía server (`utils/reminders.js`)
- **Toast**: thông báo nổi tự biến mất sau 2 giây, không cần tương tác

## Bảo mật

- Mật khẩu hash (bcrypt)
- JWT có thời hạn
- Middleware `authenticate` bảo vệ toàn bộ route cần đăng nhập
- `noteRepository.findWritableById` kiểm tra quyền write trước mọi thao tác PUT/PATCH
- NoSQL injection sanitize (mongo-sanitize)
- Security headers (Helmet)

## License

MIT
