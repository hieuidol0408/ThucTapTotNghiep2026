# QLCongViecKhoa - Hệ thống Quản lý Công việc Khoa IT-STU

Dự án quản lý công việc và nhân sự tại Khoa Công nghệ Thông tin - STU, được phát triển bằng React (Frontend) và Express (Backend) với cơ sở dữ liệu MySQL.

## 🛠️ Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên.
- **MySQL / MariaDB**: Sử dụng qua WAMPServer (Port 3307 cho MariaDB hoặc 3306 cho MySQL).
- **Trình duyệt**: Chrome, Edge, Firefox, etc.

## 🚀 Hướng dẫn cài đặt

1.  **Tải mã nguồn (Clone)**:
    ```bash
    git clone [LINK_GITHUB_CUA_BAN]
    cd Code
    ```

2.  **Cài đặt thư viện**:
    Mở terminal tại thư mục gốc và chạy:
    ```bash
    # Cài đặt thư viện cho Backend
    cd backend
    npm install

    # Cài đặt thư viện cho Frontend
    cd ../frontend
    npm install
    ```

3.  **Cấu hình Môi trường**:
    Tạo file `.env` trong thư mục `backend/` với nội dung sau:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=
    DB_NAME=qlcongvieckhoa
    DB_PORT=3307
    JWT_SECRET=your_jwt_secret_key
    PORT=8080
    ```

4.  **Thiết lập Cơ sở dữ liệu**:
    - Mở WAMPServer và truy cập `phpMyAdmin`.
    - Tạo database tên là `qlcongvieckhoa`.
    - Import hoặc chạy các lệnh SQL trong file `setup.sql` ở thư mục gốc.

## 🏃 Cách chạy ứng dụng

1.  **Xây dựng Giao diện (Build Frontend)**:
    Tại thư mục `frontend/`, chạy lệnh:
    ```bash
    npm run build
    ```

2.  **Khởi động Máy chủ (Start Backend)**:
    Tại thư mục `backend/`, chạy lệnh:
    ```bash
    node server.js
    ```

3.  **Truy cập**:
    Mở trình duyệt và truy cập: **http://localhost:8080**

## 🔑 Tài khoản dùng thử
- **User**: `admin`
- **Pass**: `admin123`
