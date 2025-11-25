/**
 * Lấy thông tin cơ bản (Họ tên, Email, Địa chỉ)
 * API: GET /api/users
 */
export const getUserBasicProfile = async (axiosInstance) => {
  try {
    const response = await axiosInstance.get("/users");

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật thông tin cơ bản (Họ tên, Email, Địa chỉ)
 * API: PUT /api/users/info
 */
export const updateUserInfo = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.put("/users/info", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Đổi mật khẩu
 * API: PUT /api/users/password
 */
export const updateUserPassword = async (axiosInstance, data) => {
  try {
    const response = await axiosInstance.put("/users/password", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
