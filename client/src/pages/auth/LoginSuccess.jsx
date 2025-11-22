import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../hooks/useRefreshToken";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { refresh } = useRefreshToken();

  useEffect(() => {
    const confirmLogin = async () => {
      try {
        // Gọi refresh() để đồng bộ hóa phiên đăng nhập
        // Hook này sẽ tự động nạp Roles, Email... vào Context
        await refresh();
        
        // Thành công -> Chuyển về trang chủ
        navigate("/");
      } catch (error) {
        console.error("Lỗi xác thực Google:", error);
        // Nếu lỗi -> Quay về trang login
        navigate("/login");
      }
    };

    confirmLogin();
  }, [navigate, refresh]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Đang đăng nhập...</h2>
      <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát.</p>
    </div>
  );
};

export default LoginSuccess;