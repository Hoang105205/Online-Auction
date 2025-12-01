import { axiosPrivate } from "../config/axios";

// System configuration - client API
export const getSystemConfig = async () => {
  try {
    const res = await axiosPrivate.get("/app_settings");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateSystemConfig = async (data) => {
  try {
    const res = await axiosPrivate.put("/app_settings", data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateAutoExtend = async ({
  autoExtendBefore,
  autoExtendDuration,
}) => {
  try {
    const res = await axiosPrivate.put("/app_settings/auto-extend", {
      autoExtendBefore,
      autoExtendDuration,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateLatestProductTimeConfig = async (
  latestProductTimeConfig
) => {
  try {
    const res = await axiosPrivate.put("/app_settings/latest-product-time", {
      latestProductTimeConfig,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateTimeConfigs = async (payload = {}) => {
  try {
    const res = await axiosPrivate.put("/app_settings/time-configs", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Seller requests
export const addSellerRequest = async ({ dateEnd } = {}) => {
  try {
    const res = await axiosPrivate.post("/app_settings/seller-requests", {
      dateEnd,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const listSellerRequests = async (populate = false) => {
  try {
    const res = await axiosPrivate.get(
      `/app_settings/seller-requests?populate=${populate ? 1 : 0}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const approveSellerRequest = async (bidderId) => {
  try {
    const res = await axiosPrivate.put(
      `/app_settings/seller-requests/${bidderId}/approve`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  try {
    const res = await axiosPrivate.get(`/app_settings/categories`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const addCategory = async (payload) => {
  try {
    const res = await axiosPrivate.post(`/app_settings/categories`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (categoryId, payload) => {
  try {
    const res = await axiosPrivate.put(
      `/app_settings/categories/${categoryId}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const removeCategory = async (categoryId) => {
  try {
    const res = await axiosPrivate.delete(
      `/app_settings/categories/${categoryId}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const listUsers = async ({ page = 1, limit = 20, q = "" } = {}) => {
  try {
    const res = await axiosPrivate.get("/app_settings/users", {
      params: { page, limit, q },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const listProducts = async ({
  page = 1,
  limit = 20,
  q = "",
  status,
} = {}) => {
  try {
    const params = { page, limit, q };
    if (status) params.status = status;
    const res = await axiosPrivate.get("/app_settings/products", { params });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const removeProduct = async (productId) => {
  try {
    const res = await axiosPrivate.delete(
      `/app_settings/products/${productId}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSystemConfig,
  updateSystemConfig,
  updateAutoExtend,
  updateLatestProductTimeConfig,
  updateTimeConfigs,
  addSellerRequest,
  listSellerRequests,
  approveSellerRequest,
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
  listUsers,
  listProducts,
};
