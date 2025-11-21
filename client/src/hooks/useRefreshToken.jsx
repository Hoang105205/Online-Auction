import { axiosPublic } from "../config/axios";
import { useNavigate } from "react-router-dom";

import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const refresh = async () => {
    try {
      const response = await axiosPublic.get("/auth/refresh-token");

      const { accessToken, roles, email, fullName } = response.data;

      setAuth((prev) => {
        console.log("🔄 Đã khôi phục phiên đăng nhập:", { accessToken, roles });
        return {
          ...prev,
          accessToken,
          roles,
          email,
          fullName,
        };
      });

      return accessToken;
    } catch (error) {
      console.error(
        "Refresh token failed, navigating to login:",
        error.response || error
      );
      navigate("/login");

      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
