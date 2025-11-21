import { axiosPrivate } from "../config/axios";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import { useEffect } from "react";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    // REQUEST Interceptor: Gắn Access Token
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE Interceptor: Xử lý 401
    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        // Kiểm tra 401 VÀ chưa được thử lại
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          // Lấy token mới
          const newAccessToken = await refresh();

          // Cập nhật Request Header
          prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Thực hiện lại request ban đầu
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [auth, setAuth, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;
