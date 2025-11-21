import { axiosPublic } from "../config/axios";

// Hàm xử lý logic gọi API Đăng nhập
export const login = async (email, password) => {
  try {
    const response = await axiosPublic.post("/auth/login", { email, password });
    return response.data; // Trả về { accessToken, roles, email }
  } catch (error) {
    // Ném lỗi để component UI có thể bắt được và hiển thị
    throw error;
  }
};

// Hàm xử lý logic gọi API Đăng ký
export const signup = async (userData) => {
  try {
    const response = await axiosPublic.post("/auth/signup", userData);
    return response.data; // Trả về thông tin user đã tạo
  } catch (error) {
    throw error;
  }
};
