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

/**
 * API: POST /api/auction/kick
 * kickData: {
 *  productId: String,
 *  bidderId: String
 * }
 * Returns: {
 * message: String, 
 * }
 */
export const kickBidder = async (axiosInstance, kickData) => {
  try {
    const response = await axiosInstance.post("/auction/kick", kickData);

    return response.data;
  } catch (error) {
    throw error;
  }   
};