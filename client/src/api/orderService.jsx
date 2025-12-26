import { axiosPublic } from "../config/axios";

export const getOrderByProductId = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.get(`/orders/product/${productId}`);
    return response.data; // Tra ve order object
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.post(`/orders/${productId}/cancel`);
    return response.data; // Tra ve message
  } catch (error) {
    throw error;
  }
};

export const submitPaymentInfo = async (
  productId,
  paymentData,
  axiosInstance
) => {
  try {
    const formData = new FormData();
    formData.append("fullName", paymentData.fullName);
    formData.append("address", paymentData.address);
    formData.append("paymentProof", paymentData.paymentProof);

    const response = await axiosInstance.post(
      `/orders/${productId}/payment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitShippingInfo = async (
  productId,
  shippingProof,
  axiosInstance
) => {
  try {
    const formData = new FormData();
    formData.append("shippingProof", shippingProof);

    const response = await axiosInstance.post(
      `/orders/${productId}/shipping`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmDelivery = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.post(
      `/orders/${productId}/confirm-delivery`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const closeOrder = async (productId, axiosInstance) => {
  try {
    const response = await axiosInstance.post(`/orders/${productId}/close`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateReviewDraft = async (
  productId,
  reviewData,
  axiosInstance
) => {
  try {
    const response = await axiosInstance.put(
      `/orders/${productId}/rating-draft`,
      {
        isGood: reviewData.isGood,
        content: reviewData.content,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
