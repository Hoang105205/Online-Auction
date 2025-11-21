import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";

// ----------------------------------------------------------------
// 1. AXIOS PUBLIC (Cho các API không cần Token: Signup, Login, Public Data, refresh token)
// ----------------------------------------------------------------
export const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ----------------------------------------------------------------
// 2. AXIOS PRIVATE (Cho các API cần Access Token)
// ----------------------------------------------------------------
export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Cho phép gửi cookies (chứa Refresh Token) tự động với các request
  withCredentials: true,
});
