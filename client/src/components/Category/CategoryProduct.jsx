import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ProductCardP from "../Product/ProductCardP";
import { getCategoryBySlug } from "../../api/systemService";
import { getProductsByCategory } from "../../api/productService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function CategoryProduct() {
  const { breadcrumb } = useParams();

  const params = useParams();
  const [category, setCategory] = useState(null);
  const [subIndex, setSubIndex] = useState(-1);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  // params['*'] chứa toàn bộ phần sau /category/
  const slugPath = params["*"] || breadcrumb;

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!slugPath) return;

      try {
        setLoading(true);
        setError(null);

        const parts = slugPath.split("/");
        const mainSlug = parts[0];
        if (!mainSlug) return;

        const cat = await getCategoryBySlug(axiosPrivate, mainSlug);
        setCategory(cat);

        const subSlug = parts[1];
        let index = -1;
        if (subSlug && cat?.subCategories) {
          index = cat.subCategories.findIndex((sc) => sc.slug === subSlug);
          setSubIndex(index);
        } else {
          setSubIndex(-1); // Khong co subcategory
        }

        const crumbs = [
          { name: "Trang chủ", to: "/" },
          { name: cat.categoryName, to: `/category/${cat.slug}` },
        ];

        if (index >= 0) {
          const sub = cat.subCategories[index];
          crumbs.push({
            name: sub.subCategoryName,
            to: `/category/${cat.slug}/${sub.slug}`,
          });
        }

        setBreadcrumbs(crumbs);

        // Fetch products by category or subcategory
        const categoryName = cat.categoryName;
        const subcategoryName =
          index >= 0 ? cat.subCategories[index].subCategoryName : null;

        console.log(
          "Fetching products for category:",
          categoryName,
          "subcategory:",
          subcategoryName
        );

        const productsData = await getProductsByCategory(
          categoryName,
          subcategoryName,
          axiosPrivate
        );
        // Ensure products is always an array
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else if (productsData && Array.isArray(productsData.data)) {
          setProducts(productsData.data);
        } else if (productsData && Array.isArray(productsData.products)) {
          setProducts(productsData.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching category or products:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slugPath]);

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

  // Products are now fetched from API in useEffect

  // Apply search and simple filters to products (client-side) — memoized
  const filteredProducts = useMemo(() => {
    const s = (appliedSearch || "").toLowerCase();
    const min = appliedMin === "" ? null : Number(appliedMin);
    const max = appliedMax === "" ? null : Number(appliedMax);
    return products.filter((p) => {
      const productName = p.detail?.name || p.name || "";
      const matchesSearch = !s || productName.toLowerCase().includes(s);
      const price = Number(p.auction?.currentPrice || p.currentPrice || 0);
      const minOk = min === null || price >= min;
      const maxOk = max === null || price <= max;
      const buyNowPrice = p.auction?.buyNowPrice || p.buyNowPrice;
      const buyNowOk = !appliedHasBuyNow || buyNowPrice != null;
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
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[320px] md:w-[260px] p-6 bg-white border-r z-50 transform transition-transform duration-300 
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Bộ lọc</h3>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-md font-semibold px-2 py-1">
              Đóng
            </button>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Giá tối thiểu</label>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="VNĐ"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Giá tối đa</label>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="VNĐ"
          />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            id="hasBuyNow"
            type="checkbox"
            checked={hasBuyNow}
            onChange={(e) => setHasBuyNow(e.target.checked)}
          />
          <label htmlFor="hasBuyNow" className="text-sm">
            Chỉ hiển thị có "Mua ngay"
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 rounded-md">
            Khôi phục
          </button>
          <button
            onClick={() => {
              // Apply current pending inputs (use debouncedSearch when available)
              setAppliedSearch(debouncedSearch || search);
              setAppliedMin(minPrice);
              setAppliedMax(maxPrice);
              setAppliedHasBuyNow(hasBuyNow);
              setSidebarOpen(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Áp dụng
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {/* Mobile: show filter toggle */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-3 py-2 font-semibold border rounded">
            Bộ lọc
          </button>
        </div>

        <nav className="mb-4 flex items-center gap-3">
          <div className="breadcrumb flex items-center gap-2">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-300">/</span>}
                  {isLast ? (
                    <span className="text-sm font-semibold">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.to}
                      className="text-sm text-gray-500 hover:underline">
                      {crumb.name}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        </nav>
        <h1 className="text-2xl font-bold mb-4">
          {subIndex >= 0
            ? category.subCategories[subIndex].subCategoryName
            : category?.categoryName || ""}
        </h1>
        {/* Search bar (press Enter to apply) */}
        <div className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAppliedSearch(debouncedSearch || search);
            }}
            className="w-10/12">
            <label htmlFor="category-search" className="sr-only">
              Tìm kiếm
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào trong danh mục này.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="max-w-[380px] mx-auto">
                <ProductCardP product={product} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
