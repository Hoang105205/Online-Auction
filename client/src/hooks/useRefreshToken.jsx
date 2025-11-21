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
        console.log("🔄 Đã khôi phục phiên đăng nhập:");
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
      throw error;
    }
  };

  const logout = async () => {
    setAuth({});

    try {
      await axiosPublic.get("/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.response || error);
    }
  };

  return { refresh, logout };
};

export default useRefreshToken;
