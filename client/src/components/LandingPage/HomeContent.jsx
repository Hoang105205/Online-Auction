import { Card } from "flowbite-react";
import ProductCarousel from "./ProductCarousel";
import ProductCardP from "../Product/ProductCardP";
const products = [
  {
    id: 1,
    name: "Vintage Camera Canon AE-1 Program",
    image: "/img/image1.jpg",
    currentPrice: 2500000,
    buyNowPrice: 3500000,
    highestBidder: "NguyenVanA",
    postedDate: "2025-11-10",
    endDate: "2025-11-25",
    bidCount: 15,
  },
  {
    id: 2,
    name: "MacBook Pro 2023 M3 Chip 16GB RAM",
    image: "/img/image2.jpg",
    currentPrice: 35000000,
    buyNowPrice: 42000000,
    highestBidder: "TranThiB",
    postedDate: "2025-11-12",
    endDate: "2025-11-22",
    bidCount: 28,
  },
  {
    id: 3,
    name: "Đồng hồ Rolex Submariner Date",
    image: "/img/image3.jpg",
    currentPrice: 180000000,
    buyNowPrice: null,
    highestBidder: "LeVanC",
    postedDate: "2025-11-08",
    endDate: "2025-11-30",
    bidCount: 42,
  },
  {
    id: 4,
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    image: "/img/image4.jpg",
    currentPrice: 28000000,
    buyNowPrice: 32000000,
    highestBidder: "PhamThiD",
    postedDate: "2025-11-15",
    endDate: "2025-11-20",
    bidCount: 35,
  },
  {
    id: 5,
    name: "Sony PlayStation 5 Console + 2 Controllers",
    image: "/img/image5.jpg",
    currentPrice: 12000000,
    buyNowPrice: 15000000,
    highestBidder: "HoangVanE",
    postedDate: "2025-11-05",
    endDate: "2025-11-18",
    bidCount: 22,
  },
];

const HomeContent = () => {
  const temp = ["1", "2", "3", "4", "5"];
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <div className="max-w-[380px] sm:max-w-[500px] lg:max-w-[675px] mx-auto p-3">
        <ProductCarousel />
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-3">
          {products.map((product, i) => (
            <ProductCardP key={i} product={product} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-3">
          {products.map((product, i) => (
            <ProductCardP key={i} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
