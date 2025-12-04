import { axiosPrivate } from "../config/axios";

// System configuration - client API
export const getSystemConfig = async (axiosInstance) => {
  try {
    const res = await axiosInstance.get("/app_settings");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateSystemConfig = async (axiosInstance, data) => {
  try {
    const res = await axiosInstance.put("/app_settings", data);
    return res.data;
  } catch (error) {
    throw error;
  }
};
export const updateAutoExtendBefore = async (
  axiosInstance,
  autoExtendBefore
) => {
  try {
    const res = await axiosInstance.put("/app_settings/auto-extend-before", {
      autoExtendBefore,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateAutoExtendDuration = async (
  axiosInstance,
  autoExtendDuration
) => {
  try {
    const res = await axiosInstance.put("/app_settings/auto-extend-duration", {
      autoExtendDuration,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateLatestProductTimeConfig = async (
  axiosInstance,
  latestProductTimeConfig
) => {
  try {
    const res = await axiosInstance.put("/app_settings/latest-product-time", {
      latestProductTimeConfig,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateTimeConfigs = async (axiosInstance, payload = {}) => {
  try {
    const res = await axiosInstance.put("/app_settings/time-configs", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Seller requests
// ===== Hoang =====
export const listSellerRequests = async (
  axiosInstance,
  { page = 1, limit = 6, sortBy = "date" }
) => {
  try {
    const res = await axiosInstance.get(`/app_settings/seller-requests`, {
      params: {
        page: page,
        limit: limit,
        sortBy: sortBy,
      },
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const approveSellerRequest = async (axiosInstance, bidderId) => {
  try {
    const res = await axiosInstance.put(
      `/app_settings/seller-requests/${bidderId}/approve`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const rejectSellerRequest = async (axiosInstance, bidderId) => {
  try {
    const res = await axiosInstance.delete(
      `/app_settings/seller-requests/${bidderId}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
// ===== Hoang =====

// Categories
export const getCategories = async (axiosInstance) => {
  try {
    const res = await axiosInstance.get(`/app_settings/categories`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const addCategory = async (axiosInstance, payload) => {
  try {
    const res = await axiosInstance.post(`/app_settings/categories`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (axiosInstance, categoryId, payload) => {
  try {
    const res = await axiosInstance.put(
      `/app_settings/categories/${categoryId}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const removeCategory = async (axiosInstance, categoryId) => {
  try {
    const res = await axiosInstance.delete(
      `/app_settings/categories/${categoryId}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const listUsers = async (
  axiosInstance,
  { page = 1, limit = 20, q = "" } = {}
) => {
  try {
    const res = await axiosInstance.get("/app_settings/users", {
      params: { page, limit, q },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const listProducts = async (
  axiosInstance,
  { page = 1, limit = 20, q = "", status } = {}
) => {
  try {
    const params = { page, limit, q };
    if (status) params.status = status;
    const res = await axiosInstance.get("/app_settings/products", { params });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const removeProduct = async (axiosInstance, productId) => {
  try {
    const res = await axiosInstance.delete(
      `/app_settings/products/${productId}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getCategoryBySlug = async (axiosInstance, slug) => {
  try {
    const res = await axiosInstance.get(`/app_settings/categories/${slug}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSystemConfig,
  updateSystemConfig,
  updateAutoExtendBefore,
  updateAutoExtendDuration,
  updateLatestProductTimeConfig,
  updateTimeConfigs,
  listSellerRequests,
  approveSellerRequest,
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
  listUsers,
  listProducts,
  getCategoryBySlug,
};
