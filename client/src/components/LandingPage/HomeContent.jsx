import ProductCarousel from "./ProductCarousel";
import ProductCardP from "../Product/ProductCardP";
import { useState, useEffect } from "react";
import { getFirstProducts } from "../../api/productService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

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
      <div className="py-4">
        <div className="text-2xl font-bold text-center text-gray-800 px-3">
          Sản Phẩm Sắp Kết Thúc
        </div>
        <div className="max-w-[380px] sm:max-w-[500px] lg:max-w-[675px] mx-auto p-3">
          <ProductCarousel products={endingSoonProducts} />
        </div>
      </div>
      <div className="w-full">
        {/* Top 5 products with most bids */}
        <div className="mb-20">
          <div className="text-2xl font-bold ml-5 text-gray-800 px-3">
            Nhiều Lượt Ra Giá Nhất
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-3">
            {mostBidsProducts.map((product) => (
              <div key={product.id}>
                <ProductCardP product={product} />
              </div>
            ))}
          </div>
          {mostBidsProducts.length === 0 && (
            <div className="ml-10 mt-10 text-xl text-gray-500">
              Không có sản phẩm nào để hiển thị.
            </div>
          )}
        </div>
        {/* Top 5 products with highest price */}
        <div className="mb-60">
          <div className="text-2xl font-bold ml-5 text-gray-800 px-3">
            Giá Cao Nhất
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-3">
            {highestPriceProducts.map((product) => (
              <div key={product.id}>
                <ProductCardP product={product} />
              </div>
            ))}
          </div>
          {highestPriceProducts.length === 0 && (
            <div className="ml-10 mt-10 text-xl text-gray-500">
              Không có sản phẩm nào để hiển thị.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
