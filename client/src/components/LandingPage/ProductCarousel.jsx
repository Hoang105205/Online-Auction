import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { HiHeart } from "react-icons/hi";
import { toast } from "react-toastify";
import { addToWatchList } from "../../api/userService";
import useAuth from "../../hooks/useAuth";

import ProductCardC from "./ProductCardC";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

import "swiper/css";
import "swiper/css/pagination";

export default function ProductCarousel({ products }) {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const handleAddToWatchlist = async (productId) => {
    if (!auth?.accessToken) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách theo dõi.");
      return;
    }
    try {
      const result = await addToWatchList(axiosPrivate, productId);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi thêm vào danh sách theo dõi."
      );
    }
  };

  // Don't render Swiper until products are loaded
  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-xl text-gray-500">
          Không có sản phẩm nào để hiển thị.
        </div>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      slidesPerView={1}
      spaceBetween={20}
      loop={products.length > 1} // Only enable loop if we have more than 1 slide
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        el: ".custom-pagination",
      }}>
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          {/* Watchlist Button */}
          <button
            onClick={() => handleAddToWatchlist(product.id)}
            className="absolute z-10 top-3 left-3 p-2 rounded-full shadow-lg transition-all duration-300 
                         bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 hover:scale-110
                         border border-gray-200"
            aria-label="Add to watchlist"
            title="Thêm vào danh sách theo dõi">
            <HiHeart className="w-6 h-6" />
          </button>
          <ProductCardC product={product} />
        </SwiperSlide>
      ))}
      <div className="custom-pagination mt-4 flex justify-center"></div>
    </Swiper>
  );
}
