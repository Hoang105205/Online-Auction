======================================================================
HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI DỰ ÁN AUCTIFY
======================================================================

Tài liệu này hướng dẫn chi tiết các bước thiết lập môi trường, cấu hình 
biến môi trường và vận hành hệ thống Website Đấu giá Trực tuyến Auctify.

----------------------------------------------------------------------
1. CẤU TRÚC THƯ MỤC
----------------------------------------------------------------------
Dự án bao gồm 3 thư mục chính nằm ngang hàng nhau:

- client/: Mã nguồn Frontend (ReactJS + Vite).
- server/: Mã nguồn Backend (Node.js + Express).
- db/:     Chứa script khởi tạo dữ liệu mẫu (Seed Data).

----------------------------------------------------------------------
2. YÊU CẦU HỆ THỐNG (PREREQUISITES)
----------------------------------------------------------------------
Để chạy dự án, máy tính cần cài đặt:
1. Node.js (Phiên bản v16 trở lên).
2. Tài khoản MongoDB Atlas (Cloud Database).

----------------------------------------------------------------------
3. THIẾT LẬP DATABASE (MONGODB ATLAS)
----------------------------------------------------------------------
Dự án sử dụng MongoDB Atlas. Vui lòng thực hiện các bước sau để lấy 
chuỗi kết nối (Connection String):

1. Đăng nhập tại: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo một Cluster mới (nếu chưa có).
3. Vào mục "Security" -> "Database Access": Tạo một User mới 
   (Lưu lại Username và Password).
4. Vào mục "Security" -> "Network Access": Thêm địa chỉ IP "0.0.0.0/0" 
   (Allow Access from Anywhere).
5. Lấy Connection String:
   - Bấm "Connect" -> Chọn "Drivers".
   - Copy chuỗi kết nối.
   - Ví dụ format: mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/auctify_db

----------------------------------------------------------------------
4. KHỞI TẠO DỮ LIỆU MẪU (SEED DATA)
----------------------------------------------------------------------
Bước này giúp tạo sẵn Admin, User, Danh mục và Sản phẩm mẫu.

Bước 1: Mở Terminal, di chuyển vào thư mục db:
   cd db

Bước 2: Cài đặt thư viện:
   npm install

Bước 3: Tạo file ".env" (nếu chưa có) trong thư mục db với nội dung sau:
   (Lưu ý: Thay <username> và <password> bằng tài khoản và mật khẩu thật của bạn)

   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/auctify_db
   SALT_ROUNDS=10

Bước 4: Chạy lệnh nạp dữ liệu:
   node seed.js

   -> Khi thấy thông báo "SEED DATA THÀNH CÔNG!" là hoàn tất.

   [THÔNG TIN TÀI KHOẢN DEMO]
   - Admin:  admin@gmail.com   (Pass: test1234)
   - Seller: seller@gmail.com  (Pass: test1234)
   - Bidder: bidder1@gmail.com (Pass: test1234)

----------------------------------------------------------------------
5. CÀI ĐẶT & CHẠY BACKEND (SERVER)
----------------------------------------------------------------------

Bước 1: Mở Terminal mới, di chuyển vào thư mục server:
   cd server

Bước 2: Cài đặt thư viện:
   npm install

Bước 3: Tạo file ".env" trong thư mục server và điền đầy đủ thông tin:

   # --- CẤU HÌNH SERVER & DB ---
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/auctify_db
   SALT_ROUNDS=10
   
   # --- URL CLIENT ---
   CLIENT_URL=http://localhost:5173

   # --- JWT SECRETS (Bảo mật token) ---
   ACCESS_TOKEN_SECRET=your_long_access_token_secret_string
   REFRESH_TOKEN_SECRET=your_long_refresh_token_secret_string

   # --- GOOGLE OAUTH ---
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

   # --- EMAIL CONFIGURATION (Gmail App Password) ---
   # Mật khẩu ứng dụng có dạng 16 ký tự: "xxxx xxxx xxxx xxxx"
   EMAIL_USER=your_email
   EMAIL_PASS="xxxx xxxx xxxx xxxx"

   # --- RECAPTCHA SERVER KEY ---
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

   # --- CLOUDINARY (Upload ảnh) ---
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Bước 4: Khởi chạy Server:
   npm start

   -> Server sẽ chạy tại: http://localhost:3000

----------------------------------------------------------------------
6. CÀI ĐẶT & CHẠY FRONTEND (CLIENT)
----------------------------------------------------------------------

Bước 1: Mở Terminal mới, di chuyển vào thư mục client:
   cd client

Bước 2: Cài đặt thư viện:
   npm install

Bước 3: Tạo file ".env" trong thư mục client với nội dung sau:

   # --- KẾT NỐI BACKEND ---
   VITE_API_URL=http://localhost:3000
   
   # --- GOOGLE SERVICES (Client Keys) ---
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   
   # --- TINYMCE (Soạn thảo văn bản) ---
   VITE_TINYMCE_API_KEY=your_tinymce_api_key
   
   # --- CLOUDINARY ---
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

Bước 4: Khởi chạy Frontend:
   npm run dev

   -> Truy cập trình duyệt tại: http://localhost:5173

----------------------------------------------------------------------
7. CHECKLIST KIỂM TRA
----------------------------------------------------------------------
Để đảm bảo chương trình chạy đúng, vui lòng kiểm tra:

1. Truy cập http://localhost:5173.
2. Đăng nhập với tài khoản Admin (admin@gmail.com / test1234).
3. Kiểm tra trang chủ đã hiển thị danh sách sản phẩm mẫu từ bước Seed Data.
4. Thử chức năng Đăng ký (Kiểm tra Email xem có nhận được mã OTP không).
5. Thử chức năng Đăng nhập bằng Google.

======================================================================
(C) 2026 Auctify Project - Tài liệu hướng dẫn triển khai.
======================================================================