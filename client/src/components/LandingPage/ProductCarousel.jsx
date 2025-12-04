import { useEffect, useState } from "react";
import { getFirstProducts } from "../../api/productService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import ProductCardC from "./ProductCardC";
import { HiHeart } from "react-icons/hi";
import "swiper/css";
import "swiper/css/pagination";

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getFirstProducts(5); // gọi API client
        setProducts(data); // gán dữ liệu vào state
      } catch (error) {
        console.error("Lỗi khi lấy products:", error);
      }
    };

    fetchProducts();
  }, []);
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      slidesPerView={1}
      spaceBetween={20}
      loop={true}
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
          <button
            //onClick={}
            className="absolute z-10 top-2 left-2 p-2  rounded-full shadow transition-colors duration-300 
            bg-gray-300 text-gray-400 hover:bg-white hover:text-red-500">
            <HiHeart className="w-5 h-5" />
          </button>
          <ProductCardC product={product} />
        </SwiperSlide>
      ))}
      <div className="custom-pagination mt-4 flex justify-center"></div>
    </Swiper>
  );
}
