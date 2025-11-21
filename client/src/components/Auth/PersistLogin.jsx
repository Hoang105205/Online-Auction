import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../../hooks/useRefreshToken"; // Hook mà ta vừa sửa
import useAuth from "../../hooks/useAuth";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    // Biến cờ để tránh memory leak nếu component unmount giữa chừng
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        // Gọi hàm refresh.
        // Hàm này sẽ tự động gửi Cookie đi và tự động setAuth lại.
        await refresh();
      } catch (err) {
        // Nếu lỗi (Token hết hạn hoặc không có), ta chỉ log ra console
        // Không làm gì cả, auth vẫn rỗng -> Giao diện sẽ hiển thị như Guest
        console.log("Không thể khôi phục phiên đăng nhập:", err);
      } finally {
        // Dù thành công hay thất bại, cũng phải tắt loading để hiện trang web
        if (isMounted) setIsLoading(false);
      }
    };

    // LOGIC QUYẾT ĐỊNH:
    // Nếu KHÔNG CÓ Access Token (do F5) -> Gọi verifyRefreshToken
    // Nếu ĐÃ CÓ Access Token (do vừa login xong) -> Không cần check, hiện trang luôn
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {
        isLoading ? (
          <div className="flex justify-center items-center h-screen">
            Đang tải dữ liệu...
          </div>
        ) : (
          <Outlet />
        ) // Render các route con (MainLayout, AccountLayout...)
      }
    </>
  );
};

export default PersistLogin;
