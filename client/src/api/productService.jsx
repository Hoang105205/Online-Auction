import { axiosPublic } from "../config/axios";

// Ham xu ly logic API lay thong tin co ban cua san pham
export const getProductBasicDetails = async (productId) => {
  try {
    const response = await axiosPublic.get(`/products/${productId}`);
    return response.data; // Tra ve { detail }
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic API lay thong tin auction cua san pham
export const getProductAuction = async (productId) => {
  try {
    const response = await axiosPublic.get(`/products/auction/${productId}`);
    return response.data; // Tra ve { auction }
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic lay phan mo ta san pham
export const getProductDescription = async (productId) => {
  try {
    const response = await axiosPublic.get(
      `/products/description/${productId}`
    );
    return response.data; // Tra ve description string
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic lay phan lich su dau gia cua san pham
export const getAuctionHistory = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.get(
      `/products/auction-history/${productId}`
    );
    return response.data; // Tra ve { numberOfBids, historyList }
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic lay public q&a cua san pham
export const getProductPublicQA = async (productId) => {
  try {
    const response = await axiosPublic.get(`/products/public-qa/${productId}`);
    return response.data; // Tra ve danh sach public Q&A
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic lay private q&a cua san pham
export const getProductPrivateQA = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.get(
      `/products/private-qa/${productId}`
    );
    return response.data; // Tra ve danh sach private Q&A
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic lay san pham lien quan
export const getRelatedProducts = async (productId) => {
  try {
    const response = await axiosPublic.get(`/products/related/${productId}`);
    return response.data; // Tra ve mang related products
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic cap nhat phan mo ta san pham
export const updateDescription = async (
  productId,
  description,
  axiosInstance
) => {
  try {
    const response = await axiosInstance.put(
      `/products/description/${productId}`,
      { description }
    );
    return response.data; // Tra ve { product, message }
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic them cau hoi moi cho san pham
export const addQuestion = async (
  productId,
  message,
  type = "public",
  axiosInstance
) => {
  try {
    const response = await axiosInstance.post(`/products/qa/${productId}`, {
      message,
      type,
    });
    return response.data; // Tra ve {chat, message}
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic them cau tra loi moi cho san pham
export const addReply = async (productId, chatId, message, axiosInstance) => {
  try {
    const response = await axiosInstance.post(
      `/products/qa/${productId}/reply/${chatId}`,
      { message }
    );
    return response.data; // Tra ve { chat, message }
  } catch (error) {
    throw error;
  }
};

// Ham xu ly logic them cau hoi moi cho san pham
export const addPrivateChat = async (
  productId,
  message,
  type = "private",
  axiosInstance
) => {
  try {
    const response = await axiosInstance.post(
      `/products/private-chat/${productId}`,
      {
        message,
        type,
      }
    );
    return response.data; // Tra ve {chat, message}
  } catch (error) {
    throw error;
  }
};

export const addProduct = async (product, axiosInstance) => {
  try {
    if (product instanceof FormData) {
      const response = await axiosInstance.post("/products", product, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    // Nếu là JSON
    const response = await axiosInstance.post("/products", product);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFirstProducts = async (
  { page = 1, limit = 5, sortBy = "", search = "" },
  axiosInstance
) => {
  try {
    const response = await axiosInstance.get(
      `/products?page=${page}&limit=${limit}&sortBy=${sortBy}&search=${search}`
    );
    return response.data; // trả về danh sách products
  } catch (error) {
    throw error;
  }
};

export const getProductsByCategory = async (
  {
    category,
    subcategory = null,
    page = 1,
    limit = 8,
    sortBy = "",
    search = "",
  },
  axiosInstance
) => {
  try {
    const response = await axiosInstance.get(
      subcategory
        ? `/products/category/${category}/${subcategory}?limit=${limit}&page=${page}&sortBy=${sortBy}&search=${search}`
        : `/products/category/${category}?limit=${limit}&page=${page}&sortBy=${sortBy}&search=${search}`
    );
    return response.data; // trả về danh sách products
  } catch (error) {
    throw error;
  }
};
