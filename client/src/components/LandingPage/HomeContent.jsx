import { Card } from "flowbite-react";
import ProductCarousel from "./ProductCarousel";
import ProductCardP from "../Product/ProductCardP";
import { useState, useEffect } from "react";
import { getFirstProducts } from "../../api/productService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// const products = [
//   {
//     id: 1,
//     name: "Vintage Camera Canon AE-1 Program",
//     image: "/img/image1.jpg",
//     currentPrice: 2500000,
//     buyNowPrice: 3500000,
//     highestBidder: "NguyenVanA",
//     postedDate: "2025-11-10",
//     endDate: "2025-11-25",
//     bidCount: 15,
//   },
//   {
//     id: 2,
//     name: "MacBook Pro 2023 M3 Chip 16GB RAM",
//     image: "/img/image2.jpg",
//     currentPrice: 35000000,
//     buyNowPrice: 42000000,
//     highestBidder: "TranThiB",
//     postedDate: "2025-11-12",
//     endDate: "2025-11-22",
//     bidCount: 28,
//   },
//   {
//     id: 3,
//     name: "Đồng hồ Rolex Submariner Date",
//     image: "/img/image3.jpg",
//     currentPrice: 180000000,
//     buyNowPrice: null,
//     highestBidder: "LeVanC",
//     postedDate: "2025-11-08",
//     endDate: "2025-11-30",
//     bidCount: 42,
//   },
//   {
//     id: 4,
//     name: "iPhone 15 Pro Max 256GB Natural Titanium",
//     image: "/img/image4.jpg",
//     currentPrice: 28000000,
//     buyNowPrice: 32000000,
//     highestBidder: "PhamThiD",
//     postedDate: "2025-11-15",
//     endDate: "2025-11-20",
//     bidCount: 35,
//   },
//   {
//     id: 5,
//     name: "Sony PlayStation 5 Console + 2 Controllers",
//     image: "/img/image5.jpg",
//     currentPrice: 12000000,
//     buyNowPrice: 15000000,
//     highestBidder: "HoangVanE",
//     postedDate: "2025-11-05",
//     endDate: "2025-11-18",
//     bidCount: 22,
//   },
// ];

const HomeContent = () => {
  const [endingSoonProducts, setEndingSoonProducts] = useState([]);
  const [mostBidsProducts, setMostBidsProducts] = useState([]);
  const [highestPriceProducts, setHighestPriceProducts] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch top 5 products ending soon for carousel
        const endingSoonData = await getFirstProducts(
          { page: 1, limit: 5, sortBy: "endingSoon" },
          axiosPrivate
        );
        setEndingSoonProducts(endingSoonData.products || []);

        // Fetch top 5 products with most bids
        const mostBidsData = await getFirstProducts(
          { page: 1, limit: 5, sortBy: "mostBids" },
          axiosPrivate
        );
        setMostBidsProducts(mostBidsData.products || []);

        // Fetch top 5 products with highest price
        const highestPriceData = await getFirstProducts(
          { page: 1, limit: 5, sortBy: "highestPrice" },
          axiosPrivate
        );
        setHighestPriceProducts(highestPriceData.products || []);
      } catch (error) {
        console.error("Lỗi khi lấy products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {/* Top 5 products ending soon - Carousel */}
      <div className="max-w-[380px] sm:max-w-[500px] lg:max-w-[675px] mx-auto p-3">
        <ProductCarousel products={endingSoonProducts} />
      </div>
      <div>
        {/* Top 5 products with most bids */}
        <div className="mb-6">
          <div className="text-2xl font-bold ml-5 text-gray-800 px-3">
            Nhiều Lượt Ra Giá Nhất
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-3">
            {mostBidsProducts.map((product) => (
              <div key={product.id}>
                <ProductCardP product={product} />
              </div>
            ))}
          </div>
        </div>
        {/* Top 5 products with highest price */}
        <div className="mb-10">
          <div className="text-2xl font-bold ml-5 text-gray-800 px-3">
            Giá Cao Nhất
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-3">
            {highestPriceProducts.map((product) => (
              <div key={product.id}>
                <ProductCardP product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
