import { useParams, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
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

  // UI state: search + simple filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [hasBuyNow, setHasBuyNow] = useState(false);
  // Applied filters (only used when user clicks "Áp dụng")
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedMin, setAppliedMin] = useState("");
  const [appliedMax, setAppliedMax] = useState("");
  const [appliedHasBuyNow, setAppliedHasBuyNow] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

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

  // Apply search and simple filters to products (client-side demo) — memoized
  const filteredProducts = useMemo(() => {
    const s = (appliedSearch || "").toLowerCase();
    const min = appliedMin === "" ? null : Number(appliedMin);
    const max = appliedMax === "" ? null : Number(appliedMax);
    return products.filter((p) => {
      const matchesSearch = !s || p.name.toLowerCase().includes(s);
      const price = Number(p.currentPrice || 0);
      const minOk = min === null || price >= min;
      const maxOk = max === null || price <= max;
      const buyNowOk = !appliedHasBuyNow || (p.buyNowPrice != null);
      return matchesSearch && minOk && maxOk && buyNowOk;
    });
  }, [products, appliedSearch, appliedMin, appliedMax, appliedHasBuyNow]);

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setMinPrice("");
    setMaxPrice("");
    setHasBuyNow(false);
    setAppliedSearch("");
    setAppliedMin("");
    setAppliedMax("");
    setAppliedHasBuyNow(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay (shown when sidebar is open) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full w-[320px] md:w-[260px] p-6 bg-white border-r z-50 transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Bộ lọc</h3>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="text-md font-semibold px-2 py-1">Đóng</button>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Giá tối thiểu</label>
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="VNĐ" />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Giá tối đa</label>
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="VNĐ" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input id="hasBuyNow" type="checkbox" checked={hasBuyNow} onChange={(e) => setHasBuyNow(e.target.checked)} />
          <label htmlFor="hasBuyNow" className="text-sm">Chỉ hiển thị có "Mua ngay"</label>
        </div>
        <div className="flex gap-2">
          <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 rounded-md">Khôi phục</button>
            <button
              onClick={() => {
                // Apply current pending inputs (use debouncedSearch when available)
                setAppliedSearch(debouncedSearch || search);
                setAppliedMin(minPrice);
                setAppliedMax(maxPrice);
                setAppliedHasBuyNow(hasBuyNow);
                setSidebarOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >Áp dụng</button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {/* Mobile: show filter toggle */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="px-3 py-2 font-semibold border rounded">Bộ lọc</button>
        </div>

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

        {/* Search bar (press Enter to apply) */}
        <div className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedSearch(debouncedSearch || search);
            }}
            className="w-10/12"
          >
            <label htmlFor="category-search" className="sr-only">Tìm kiếm</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                id="category-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên sản phẩm..."
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product, _) => (
            <div key={product.id} className="max-w-[380px] mx-auto">
              <ProductCardP product={product} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}