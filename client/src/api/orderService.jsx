import { axiosPublic } from "../config/axios";

export const getOrderByProductId = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.get(`/orders/product/${productId}`);
    return response.data; // Tra ve order object
  } catch (error) {
    throw error;
  }
};
