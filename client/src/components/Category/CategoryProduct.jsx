import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getCategoryBySlug, getCategories } from "../../api/systemService";
import {
  getProductsByCategory,
  getFirstProducts,
} from "../../api/productService";

import ProductCardP from "../Product/ProductCardP";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Category from "./Category";

export default function CategoryProduct({ searchLandingPage = "" }) {
  const { breadcrumb } = useParams();

  const params = useParams();
  const [category, setCategory] = useState(null);
  const [subIndex, setSubIndex] = useState(-1);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // UI state: search + simple filters
  const [search, setSearch] = useState(searchLandingPage);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("filter"); // "filter" | "category"
  const [sortBy, setSortBy] = useState(""); // "" | "endTime" | "priceAsc"
  // Applied filters (only used when user clicks "Áp dụng")
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedSortBy, setAppliedSortBy] = useState("");

  // params['*'] chứa toàn bộ phần sau /category/
  const slugPath = params["*"] || breadcrumb;

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slugPath) {
          // No category specified - show all products
          const crumbs = [
            { name: "Trang chủ", to: "/" },
            { name: "Sản phẩm", to: "/category" },
          ];
          setBreadcrumbs(crumbs);
          setCategory(null);
          setSubIndex(-1);

          // Fetch all products with no limit
          const result = await getFirstProducts(
            {
              page: currentPage,
              limit: 8,
              sortBy: appliedSortBy,
              search: appliedSearch,
            },
            axiosPrivate
          );

          // Ensure products is always an array
          if (Array.isArray(result)) {
            setProducts(result);
          } else if (result && Array.isArray(result.data)) {
            setProducts(result.data);
          } else if (result && Array.isArray(result.products)) {
            setProducts(result.products);
          } else {
            setProducts([]);
          }
          setTotalPages(result.pagination?.totalPages || 0);
          setTotalItems(result.pagination?.totalItems || products.length);
        } else {
          const parts = slugPath.split("/");
          const mainSlug = parts[0];
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
            { name: "Sản phẩm", to: "/category" },
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

          const result = await getProductsByCategory(
            {
              category: categoryName,
              subcategory: subcategoryName,
              page: currentPage,
              limit: 8,
              sortBy: appliedSortBy,
              search: appliedSearch,
            },
            axiosPrivate
          );

          // Ensure products is always an array
          if (Array.isArray(result)) {
            setProducts(result);
          } else if (result && Array.isArray(result.data)) {
            setProducts(result.data);
          } else if (result && Array.isArray(result.products)) {
            setProducts(result.products);
          } else {
            setProducts([]);
          }
          setTotalPages(result.pagination?.totalPages || 0);
          setTotalItems(result.pagination?.totalItems || products.length);
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
  }, [axiosPrivate, slugPath, currentPage, appliedSortBy, appliedSearch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build pagination list with ellipsis when pages are many
  const buildPageList = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) pages.push("...");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  const pageList = useMemo(
    () => buildPageList(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(axiosPrivate);
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Products are now fetched from API with server-side filtering and sorting
  const filteredProducts = products;

  useEffect(() => {
    setCurrentPage(1);
  }, [slugPath, appliedSortBy, appliedSearch]);

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSortBy("");
    setAppliedSearch("");
    setAppliedSortBy("");
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
        className={`fixed top-0 left-0 h-full w-[280px] md:w-[260px] p-6 bg-white border-r z-50 transform transition-transform duration-300 
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}>
        {/* Desktop: Toggle buttons between Filter and Category */}
        <div className="hidden md:flex md:flex-nowrap gap-2 pb-4 border-b font-medium">
          <button
            onClick={() => setActiveSidebar("filter")}
            className={`flex-1 px-3 py-2 rounded transition-colors whitespace-nowrap ${
              activeSidebar === "filter"
                ? "bg-[#19528F] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            Bộ lọc
          </button>
          <button
            onClick={() => setActiveSidebar("category")}
            className={`flex-1 px-3 py-2 rounded transition-colors whitespace-nowrap ${
              activeSidebar === "category"
                ? "bg-[#19528F] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            Danh mục
          </button>
        </div>
        {activeSidebar === "filter" && (
          <div className="mt-3">
            <div className="md:hidden flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bộ lọc</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-md font-semibold px-2 py-1">
                Đóng
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2 font-medium">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded">
                <option value="">Mặc định</option>
                <option value="endTime">Thời gian kết thúc giảm dần</option>
                <option value="priceAsc">Giá tăng dần</option>
              </select>
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
                  setAppliedSortBy(sortBy);
                  setSidebarOpen(false);
                }}
                className="px-4 py-2 bg-[#19528F] text-white rounded-md">
                Áp dụng
              </button>
            </div>
          </div>
        )}
        {activeSidebar === "category" && (
          <div className="mt-3">
            <div className="md:hidden flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Danh mục</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-md font-semibold px-2 py-1">
                Đóng
              </button>
            </div>
            <div className="w-full mx-auto my-2">
              {categories &&
                categories.map((category) => (
                  <Category
                    key={category.categoryId}
                    category={category}
                    selectedCategory={
                      breadcrumbs.length >= 3 ? breadcrumbs[2].name : null
                    }
                    selectedsubCategory={
                      breadcrumbs.length >= 4 ? breadcrumbs[3].name : null
                    }
                  />
                ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 p-6">
        {/* Mobile: show filter toggle */}
        <div className="flex md:hidden">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button
              onClick={() => {
                setSidebarOpen(true);
                setActiveSidebar("filter");
              }}
              className="px-3 py-2 font-semibold border rounded">
              Bộ lọc
            </button>
          </div>
          <div className="mb-4 ml-4 flex items-center justify-between md:hidden">
            <button
              onClick={() => {
                setSidebarOpen(true);
                setActiveSidebar("category");
              }}
              className="px-3 py-2 font-semibold border rounded">
              Danh mục
            </button>
          </div>
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
          <div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="max-w-[380px] mx-auto">
                  <ProductCardP product={product} />
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm text-gray-600 hidden md:block">
                    Trang {Math.min(currentPage, totalPages)} / {totalPages}
                  </div>

                  {/* Desktop pagination */}
                  <div className="hidden md:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage <= 1}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        currentPage <= 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}>
                      Trước
                    </button>
                    {pageList.map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                            currentPage === p
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        currentPage >= totalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}>
                      Sau
                    </button>
                  </div>

                  {/* Mobile pagination */}
                  <div className="flex md:hidden items-center gap-2">
                    <button
                      type="button"
                      aria-label="Trang trước"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage <= 1}
                      className={`px-2 py-2 rounded-md border text-sm transition-colors ${
                        currentPage <= 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}>
                      Trước
                    </button>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="my-products-page-select"
                        className="sr-only">
                        Chọn trang
                      </label>
                      <select
                        id="my-products-page-select"
                        value={currentPage}
                        onChange={(e) =>
                          handlePageChange(Number(e.target.value))
                        }
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm bg-white">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Trang {i + 1}/{totalPages}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      aria-label="Trang sau"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className={`px-2 py-2 rounded-md border text-sm transition-colors ${
                        currentPage >= totalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}>
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
