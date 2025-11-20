import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function ProductCarousel() {
  const items = [
    {
      id: 1,
      img: "/img/image1.jpg",
      name: "TESTING 1 GAMEPAD PAPAMBIA",
      category: "Điện tử - PlayStation",
      price: "20.000.000 đ",
      buyNow: "300.000.000 đ",
      seller: "AnhVinhDonLua",
      countdown: "01 : 07 : 25 : 49",
    },
    {
      id: 2,
      img: "/img/image1.jpg",
      name: "TESTING 1 GAMEPAD PAPAMBIA",
      category: "Điện tử - PlayStation",
      price: "20.000.000 đ",
      buyNow: "300.000.000 đ",
      seller: "AnhVinhDonLua",
      countdown: "01 : 07 : 25 : 49",
    },
    {
      id: 3,
      img: "/img/image1.jpg",
      name: "TESTING 1 GAMEPAD PAPAMBIA",
      category: "Điện tử - PlayStation",
      price: "20.000.000 đ",
      buyNow: "300.000.000 đ",
      seller: "AnhVinhDonLua",
      countdown: "01 : 07 : 25 : 49",
    },
  ];

  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1}
      spaceBetween={20}
      loop={true}
      autoplay={true}
      pagination={{ clickable: true }}
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          {/* Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl p-5 shadow-md">
            {/* IMAGE BLOCK */}
            <div>
              <img
                src={item.img}
                className=" rounded-xl"
              />

              <p className="mt-3 text-red-500 font-bold text-lg text-center animate-pulse">
                CHỈ CÒN {item.countdown}
              </p>
            </div>
            {/* TEXT INFO */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold leading-snug">
                {item.name}
              </h3>

              <p className="mt-1 mb-4 text-gray-500 text-base">
                {item.category}
              </p>

              <p className="text-lg mb-2">
                Giá hiện tại:
                <span className="text-red-600 font-bold">
                  {" "}{item.price}
                </span>
              </p>

              <p className="text-lg">
                Mua ngay:
                <span className="text-red-600 font-bold">
                  {" "}{item.buyNow}
                </span>
              </p>

              {/* Seller + Votes */}
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span>{item.seller}</span>

                {/* Upvote */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-green-200 rounded text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1l3 6H5l3-6zm0 14l-3-6h6l-3 6z" />
                  </svg>
                  120
                </span>

                {/* Downvote */}
                <span className="flex items-center gap-1 px-2 py-0.5 border border-red-200 rounded text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4 rotate-180"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1l3 6H5l3-6zm0 14l-3-6h6l-3 6z" />
                  </svg>
                  5
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <div className="custom-pagination mt-4 flex justify-center"></div>
    </Swiper>
  );
}