import { axiosPrivate } from "../config/axios";

// System configuration - client API
export const getSystemConfig = async () => {
  try {
    const res = await axiosPrivate.get("/system");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateSystemConfig = async (data) => {
  try {
    const res = await axiosPrivate.put("/system", data);
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
    const res = await axiosPrivate.put("/system/auto-extend", {
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
    const res = await axiosPrivate.put("/system/latest-product-time", {
      latestProductTimeConfig,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateTimeConfigs = async (payload = {}) => {
  try {
    const res = await axiosPrivate.put("/system/time-configs", payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Seller requests
export const addSellerRequest = async ({ dateEnd } = {}) => {
  try {
    const res = await axiosPrivate.post("/system/seller-requests", { dateEnd });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const listSellerRequests = async (populate = false) => {
  try {
    const res = await axiosPrivate.get(
      `/system/seller-requests?populate=${populate ? 1 : 0}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const approveSellerRequest = async (bidderId) => {
  try {
    const res = await axiosPrivate.put(
      `/system/seller-requests/${bidderId}/approve`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  try {
    const res = await axiosPrivate.get(`/system/categories`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const addCategory = async (payload) => {
  try {
    const res = await axiosPrivate.post(`/system/categories`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (categoryId, payload) => {
  try {
    const res = await axiosPrivate.put(
      `/system/categories/${categoryId}`,
      payload
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const removeCategory = async (categoryId) => {
  try {
    const res = await axiosPrivate.delete(`/system/categories/${categoryId}`);
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
};
