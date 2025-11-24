export const getUserBasicProfile = async (axiosInstance) => {
  try {
    const response = await axiosInstance.get("/users");

    return response.data;
  } catch (error) {
    throw error;
  }
};
