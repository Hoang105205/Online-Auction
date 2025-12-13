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

/**
 * Lấy đánh giá của người dùng với phân trang và bộ lọc
 * API: GET /api/users/feedback
 */
export const getUserFeedback = async (
  axiosInstance,
  page = 1,
  filter = "all",
  limit = 5
) => {
  try {
    const response = await axiosInstance.get("/users/feedback", {
      params: {
        page: page,
        filter: filter,
        limit: limit,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách theo dõi của người dùng với phân trang và sắp xếp
 * API: GET /api/users/watchlist
 */
export const getWatchList = async (
  axiosInstance,
  { page = 1, limit = 3, sort = "newest" }
) => {
  try {
    const response = await axiosInstance.get("/users/watchlist", {
      params: {
        page,
        limit,
        sort,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Thêm sản phẩm vào danh sách theo dõi
 * API: POST /api/users/watchlist
 */
export const addToWatchList = async (axiosInstance, productId) => {
  try {
    const response = await axiosInstance.post(`/users/watchlist`, {
      productId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa sản phẩm khỏi danh sách theo dõi
 * API: DELETE /api/users/watchlist
 */
export const removeFromWatchList = async (axiosInstance, productId) => {
  try {
    const response = await axiosInstance.delete(`/users/watchlist`, {
      data: { productId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách đấu giá người dùng đã tham gia với phân trang và bộ lọc
 * API: GET /api/users/participating-auctions
 */
export const getParticipatingAuctions = async (
  axiosInstance,
  { page = 1, limit = 3, filter = "all" }
) => {
  try {
    const response = await axiosInstance.get("/users/participating-auctions", {
      params: {
        page,
        limit,
        filter,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách sản phẩm của người dùng với phân trang
 * API: GET /api/users/my-products
 */
export const getMyProducts = async (axiosInstance, { page = 1, limit = 3 }) => {
  try {
    const response = await axiosInstance.get("/users/my-products", {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi yêu cầu trở thành người bán
 * API: POST /api/users/request-seller
 */
export const requestSeller = async (axiosInstance) => {
  try {
    const response = await axiosInstance.post("/users/request-seller");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách sản phẩm người dùng đã thắng đấu giá với phân trang
 * API: GET /api/users/won-products
 */
export const getWonProducts = async (axiosInstance, { page = 1, limit = 3 }) => {
  try {
    const response = await axiosInstance.get("/users/won-products", {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};