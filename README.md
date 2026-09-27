# ☕ CoffeeShop - Dynamic Web App

Website cửa hàng cà phê trực tuyến với giao diện hiện đại và backend TypeScript + SQLite.

## 🏗️ Kiến trúc

```
Coffee shop/
├── src/                    # TypeScript backend source
│   ├── server.ts           # Entry point - Express server
│   ├── database.ts         # SQLite schema & connection
│   ├── auth.ts             # JWT middleware
│   └── routes/
│       ├── auth.ts         # Register, Login, Profile APIs
│       ├── orders.ts       # Orders CRUD API
│       └── feedbacks.ts    # Feedback submission API
├── js/                     # Frontend JavaScript
│   ├── data.js             # Product/category data
│   ├── api.js              # Frontend API client (talks to backend)
│   ├── auth-ui.js          # Login/Register modal UI
│   ├── cart.js             # Shopping cart + checkout modal
│   └── main.js             # Page logic (carousel, products, contact)
├── css/style.css           # Complete design system
├── images/                 # Banner & product images
├── data/                   # CSV data files
├── index.html              # Trang chủ
├── products.html           # Trang sản phẩm
├── contact.html            # Trang liên hệ
├── coffeeshop.db           # SQLite database (tự tạo khi chạy)
├── tsconfig.json           # TypeScript config
├── .env                    # Environment variables
└── dist/                   # Built JS output
```

## 🗄️ Database Schema (SQLite)

| Table | Description |
|-------|-------------|
| `users` | Khách hàng đăng ký/đăng nhập |
| `orders` | Đơn hàng đặt qua website |
| `order_items` | Chi tiết sản phẩm trong từng đơn |
| `feedbacks` | Phản hồi từ form Liên hệ |

## 🚀 Khởi chạy

### Yêu cầu
- Node.js v18+
- npm

### Cài đặt & Chạy

```bash
# Cài dependencies (nếu chưa có)
npm install

# Build TypeScript
npm run build

# Chạy server production
npm start
```

Server chạy tại: **http://localhost:3000**

### Development (hot reload)
```bash
npm run dev:watch
```

## 📡 REST API

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| GET  | `/api/auth/me` | Lấy thông tin tài khoản (cần token) |
| PUT  | `/api/auth/profile` | Cập nhật hồ sơ (cần token) |
| PUT  | `/api/auth/change-password` | Đổi mật khẩu (cần token) |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/orders` | Đặt hàng (guest hoặc đã đăng nhập) |
| GET  | `/api/orders` | Lấy danh sách đơn hàng (cần token) |
| GET  | `/api/orders/:id` | Xem chi tiết đơn hàng (cần token) |
| GET  | `/api/orders/track` | Tra cứu đơn hàng bằng order_id và phone (public) |

### Feedbacks
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/feedbacks` | Gửi phản hồi (public) |
| GET  | `/api/feedbacks` | Xem danh sách phản hồi (admin) |

### Health
```
GET /api/health
```

## 🔐 Authentication

Sử dụng **JWT Bearer Token**. Sau khi đăng ký/đăng nhập, token được lưu vào `localStorage` tự động.

```http
Authorization: Bearer <token>
```
