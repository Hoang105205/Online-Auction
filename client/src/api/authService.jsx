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

// Hàm xử lý logic gọi API Xác thực OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosPublic.post("/auth/verify-otp", { email, otp });
    return response.data; // Trả về kết quả xác thực OTP
  } catch (error) {
    throw error;
  }
};

// Hàm xử lý logic gọi API Quên mật khẩu
export const forgotPassword = async (email) => {
  try {
    const response = await axiosPublic.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm xử lý logic gọi API Xác thực OTP Quên mật khẩu (lấy resetToken)
export const verifyForgotPasswordOtp = async (email, otp) => {
  try {
    const response = await axiosPublic.post(
      "/auth/verify-forgot-password-otp",
      { email, otp }
    );
    return response.data; // { message, resetToken }
  } catch (error) {
    throw error;
  }
};

// Hàm xử lý logic gọi API Đặt lại mật khẩu (dùng resetToken)
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosPublic.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
