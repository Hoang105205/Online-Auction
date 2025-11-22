import { useParams, Link, useLocation } from "react-router-dom";
import ProductCardP from "../Product/ProductCardP";

export default function CategoryProduct() {
  const { breadcrumb } = useParams();
  const location = useLocation();

  // Support both old single-param route and new multi-segment wildcard route.
  // If route is `/category/*`, extract segments after `/category/`.
  const pathAfterCategory = location.pathname.startsWith("/category/")
    ? location.pathname.replace(/^\/category\//, "")
    : breadcrumb || "";

  const decoded = decodeURIComponent(pathAfterCategory || "");

  // Demo: filter products based on breadcrumb label
  // In real app -> fetch products by category from API.
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

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-6">
        <nav className="mb-4 flex items-center gap-3">
          <Link to="/" className="text-sm text-gray-500 hover:underline">Trang chủ</Link>
          {decoded && (() => {
            const segments = decoded.split('/');
            return segments.map((seg, i) => {
              const isLast = i === segments.length - 1;
              const to = "/category/" + segments.slice(0, i + 1).map(encodeURIComponent).join('/');
              return (
                <span key={i} className="flex items-center gap-3">
                  <span className="text-gray-300">/</span>
                  {isLast ? (
                    <span className="text-sm font-semibold">{seg}</span>
                  ) : (
                    <Link to={to} className="text-sm text-gray-500 hover:underline">{seg}</Link>
                  )}
                </span>
              );
            });
          })()}
        </nav>

        <h1 className="text-2xl font-bold mb-4">{decoded.split('/').slice(-1)[0] || decoded}</h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, _) => (
            <div key={product.id} className="max-w-[380px] mx-auto">
              <ProductCardP product={product} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}