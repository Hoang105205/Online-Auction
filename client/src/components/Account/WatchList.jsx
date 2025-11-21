import { Card, Button } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import ProductCardP from "../Product/ProductCardP"

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
  {
    id: 6,
    name: "Tranh sơn dầu phong cảnh cổ điển",
    image: "/img/image1.jpg",
    currentPrice: 8500000,
    buyNowPrice: null,
    highestBidder: "VuThiF",
    postedDate: "2025-11-01",
    endDate: "2025-11-16",
    bidCount: 18,
  },
];

export default function WatchList() {
  const count = products.length;

  return (
    <>
      <h2 className="text-lg font-bold p-4">Yêu thích ({count})</h2>
      <div className="w-full grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {products.map((item, i) => (
          <ProductCardP product={product} />
        ))}
      </div>
    </>
  );
}
