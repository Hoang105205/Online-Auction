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

// Ham xu ly logic lay q&a cua san pham
export const getProductQA = async (productId) => {
  try {
    const response = await axiosPublic.get(`/products/qa/${productId}`);
    return response.data; // Tra ve danh sach Q&A
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

export const getFirstProducts = async (limit = 5) => {
  try {
    const response = await axiosPublic.get(`/products?limit=${limit}`);
    return response.data; // trả về danh sách products
  } catch (error) {
    throw error;
  }
};

export const getProductsByCategory = async (
  category,
  subcategory = null,
  axiosInstance
) => {
  try {
    console.log("API Call - getProductsByCategory:", category, subcategory);
    const response = await axiosInstance.get(
      subcategory
        ? `/products/category/${category}/${subcategory}`
        : `/products/category/${category}`
    );
    return response.data; // trả về danh sách products
  } catch (error) {
    throw error;
  }
};
