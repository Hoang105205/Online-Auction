/**
 * API: POST /api/auction/bid
 * bidData: {
 *  productId: String,
 *  bidAmount: Number
 * }
 * 
 * Returns: {
 *  message: String,
 * }
 */
export const placeBid = async (axiosInstance, bidData) => {
  try {
    const response = await axiosInstance.post("/auction/bid", bidData);

    return response.data;
  } catch (error) {
    throw error;
  }
};